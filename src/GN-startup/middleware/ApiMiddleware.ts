import express from "express";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import * as mongoDB from "mongodb";
import { Socket } from "socket.io";
import { encode } from "@msgpack/msgpack";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Commands } from "./../../GN-common/constant/Commands";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { SecretInfo, SecretPermissionItem, SecretRole } from "./../../GN-common/entity/SecretInfo";
import { CreateSecretInfoRequestHandler } from "./../../GN-app-api/handler/controller/handler/dashboard/CreateSecretInfoRequestHandler";
import jwt from "jsonwebtoken";
import { TokenPayload } from "./../../GN-common/entity/TokenPayload";

/**
 * Central auth/secret middleware shared by HTTP and socket transports.
 */
export class ApiMiddleware {
	// Interval used to refresh lightweight auth caches and housekeeping tasks.
	private static readonly FIVE_MINUTE_TS: number = 5 * 60 * 1000;
	// In-memory auth entries older than this threshold are evicted from the local cache.
	private static readonly TS_REMOVE_AUTH_INFO_DIC: number = 1000 * 60 * 60 * 12;
	// Fallback game id when a secret is global and the caller does not specify one.
	private static readonly DEFAULT_GAME_ID: string = "dev";

	// Hot auth-token cache keyed by `gnToken`.
	private authInfoDict: Map<string, AuthInfo>;
	// Persistent auth-token storage in MongoDB.
	private authInfoCollection: mongoDB.Collection<mongoDB.Document>;

	// Hot secret cache keyed by secret key.
	private secretInfoDict: Map<string, SecretInfo>;
	// Persistent secret storage in MongoDB.
	private secretInfoCollection: mongoDB.Collection<mongoDB.Document>;

	// Backing collection for global player/account lookups used by analytics-oriented auth gates.
	private playerGameCollection: mongoDB.Collection<mongoDB.Document>;

	// Token lifetime in milliseconds. `-1` means "effectively never expire".
	private expiredToken: number = 2 * 1000 * 60 * 60 * 24;

	// HMAC secret used to sign and verify JWT auth tokens.
	private privateKeyToken: string;

	// Preferred proxy header used to resolve the caller IP.
	private headerIP: string;

	// Sliding window of recent user ids used when enforcing max-CCU style rejections.
	private dauLast30Min: Array<string>;

	// Optional global CCU ceiling. `-1` disables the gate.
	private maxCCU: number;

	// Known game ids loaded at startup. Used to validate global secrets against explicit game ids.
	private gameIds: string[];

	/**
	 * Sets the secret info collection.
	 * @param secretInfoCollection Provides the secret info collection used by this operation.
	 */
	public setSecretInfoCollection(secretInfoCollection: mongoDB.Collection<mongoDB.Document>) {
		this.secretInfoCollection = secretInfoCollection;
	}

	/**
	 * Sets the auth info collection.
	 * @param authInfoCollection Provides the auth info collection used by this operation.
	 */
	public setAuthInfoCollection(authInfoCollection: mongoDB.Collection<mongoDB.Document>) {
		this.authInfoCollection = authInfoCollection;
	}

	/**
	 * Sets the player game collection.
	 * @param playerGameCollection Provides the player game collection used by this operation.
	 */
	public setPlayerGameCollection(playerGameCollection: mongoDB.Collection<mongoDB.Document>) {
		this.playerGameCollection = playerGameCollection;
	}

	/**
	 * Sets the expired token.
	 * @param expiredToken Provides the expired token value used by this operation.
	 */
	public setExpiredToken(expiredToken: number) {
		this.expiredToken = expiredToken;
	}

	/**
	 * Sets the private key token.
	 * @param privateKeyToken Provides the private key token value used by this operation.
	 */
	public setPrivateKeyToken(privateKeyToken: string) {
		this.privateKeyToken = privateKeyToken;
	}

	/**
	 * Sets the header IP.
	 * @param headerIP Provides the header IP value used by this operation.
	 */
	public setHeaderIP(headerIP: string) {
		this.headerIP = headerIP;
	}

	/**
	 * Returns the header IP.
	 */
	public getHeaderIP() {
		return this.headerIP;
	}

	/**
	 * Sets the game IDs.
	 * @param gameIds Provides the game IDs value used by this operation.
	 */
	public setGameIds(gameIds: string[]) {
		this.gameIds = gameIds;
	}

	/**
	 * Starts periodic maintenance for the auth cache and DAU/CCU helper state.
	 */
	public run() {
		this.dauLast30Min = [];
		this.maxCCU = -1;

		setInterval(() => {
			this.getDAULast30Min();
			this.checkAndRemoveDict();
		}, ApiMiddleware.FIVE_MINUTE_TS);
	}

	/**
	 * Refreshes the recent-user cache consulted by the optional CCU gate.
	 */
	private async getDAULast30Min() {
		this.maxCCU = -1;

		if (this.maxCCU != -1) {

			try {
				// Pull only the newest users because the CCU gate only needs a small rolling window.
				let playerLast30Mins = await this.playerGameCollection.find({}, {
					projection: {
						userId: true
					}
				}).sort({ tsLastSeen: -1 }).limit(50).toArray();

				this.dauLast30Min.length = 0;

				for (let i = 0; i < playerLast30Mins.length; i++) {
					let playerLast30Min = playerLast30Mins[i];
					this.dauLast30Min.push(playerLast30Min.userId);
				}
			}
			catch (err) {
				Debug.logException(err);
			}
		}
	}

	/**
	 * Evicts stale auth entries from the in-memory cache without touching MongoDB.
	 */
	private async checkAndRemoveDict(): Promise<void> {
		try {
			let removeCount = 0;

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			let tsRemove = currentMilliseconds - ApiMiddleware.TS_REMOVE_AUTH_INFO_DIC;

			let startSize = this.authInfoDict.size;

			let entries = this.authInfoDict.entries();

			let keysNeedRemove: string[] = [];

			for (let [key, authInfo] of entries) {
				if (authInfo == null || authInfo.getTsLastUpdate() < tsRemove) {
					keysNeedRemove.push(key);

					removeCount++;
				}
			}

			for (let key of keysNeedRemove) {
				this.authInfoDict.delete(key);
			}

			Debug.log("[GearN] ApiMiddleware remove " + removeCount + "/" + startSize);
		}
		catch (err) {
			Debug.logException(err);
		}
	}

	/**
	 * Mints a signed auth token, mirrors it to MongoDB, and caches the resolved `AuthInfo`.
	 * @param payload Provides the payload value used by this operation.
	 * @returns Returns the operation result.
	 */
	public async generateAuthInfo(payload: TokenPayload): Promise<AuthInfo> {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		payload.gnToken = payload.gnToken ?? "gn.a_" + StringUtility.generateRandomString(10, 0);

		let tsExpire = this.expiredToken == -1 ? -1 : (currentMilliseconds + this.expiredToken);

		let authToken = jwt.sign(payload, this.privateKeyToken, {
			expiresIn: this.expiredToken == -1 ? "1y" : this.expiredToken,
			algorithm: "HS512"
		});

		let authInfo = AuthInfo.Builder()
			.setGNToken(payload.gnToken)
			.setAuthToken(authToken)
			.setUserId(payload.userId)
			.setIsRemove(false)
			.setTsExpire(tsExpire)
			.setTsLastUpdate(currentMilliseconds)
			.setTsCreate(currentMilliseconds)
			.setSecretKey(payload.secretKey)
			.build();

		this.authInfoDict.set(payload.gnToken, authInfo);

		await this.authInfoCollection.insertOne(authInfo.toDocumentData());

		return authInfo;
	}

	/**
	 * Executes the verify auth token workflow.
	 * @param authToken Provides the auth token value used by this operation.
	 * @returns Returns the operation result.
	 */
	public verifyAuthToken(authToken: string): jwt.JwtPayload {
		try {
			return jwt.verify(authToken, this.privateKeyToken, { algorithms: ["HS512"] }) as jwt.JwtPayload;
		}
		catch (err) {
			return null;
		}
	}

	/**
	 * Returns the secret info by secret key in database.
	 * @param secretKey Provides the secret key value used by this operation.
	 * @returns Returns the secret info by secret key in database.
	 */
	public async getSecretInfoBySecretKeyInDatabase(secretKey: string): Promise<SecretInfo> {
		// Stores the secret info value used in the current execution flow.
		let secretInfo = this.secretInfoDict.get(secretKey);
		if (secretInfo == null) {
			// Stores the secret info result value used in the current execution flow.
			let secretInfoResult = await this.secretInfoCollection.findOne({ secretKey: secretKey });

			if (secretInfoResult != null) {
				// let secretRole = <SecretRole>secretInfoResult["role"];

				let defaultSecretPermissionItem = CreateSecretInfoRequestHandler.generateDefaultPermission(false, false, false, false) as any;

				// Stores the data secret permission item value used in the current execution flow.
				let dataSecretPermissionItem = secretInfoResult.permission as any;
				// Stores the key layer 0 s value used in the current execution flow.
				let keyLayer0s = Object.keys(dataSecretPermissionItem);		// authenticate, masterPlayer, ...

				for (let i = 0; i < keyLayer0s.length; i++) {
					// Stores the key layer 0 value used in the current execution flow.
					let keyLayer0 = keyLayer0s[i];		// authenticate
					let thisLayer0Any = dataSecretPermissionItem[keyLayer0];	// { loginByAccount : { seft enable: false } }
					let defaultThisLayer0Any = defaultSecretPermissionItem[keyLayer0];

					// Stores the key layer 1 s value used in the current execution flow.
					let keyLayer1s = Object.keys(thisLayer0Any);	// [ loginByAccount, registerAccount]

					for (let j = 0; j < keyLayer1s.length; j++) {
						// Stores the key layer 1 value used in the current execution flow.
						let keyLayer1 = keyLayer1s[j];		// loginByAccount

						let dataPermissionAnyForLayer1Any = thisLayer0Any[keyLayer1];
						// Stores the default permission any for layer 1 any value used in the current execution flow.
						let defaultPermissionAnyForLayer1Any = defaultThisLayer0Any[keyLayer1];

						if (dataPermissionAnyForLayer1Any != null) {

							// Stores the self enable value used in the current execution flow.
							let selfEnable: boolean = dataPermissionAnyForLayer1Any.selfEnable;
							// Stores the other self enable value used in the current execution flow.
							let otherSelfEnable: boolean = dataPermissionAnyForLayer1Any.otherSelfEnable;
							// Stores the admin self enable value used in the current execution flow.
							let adminSelfEnable: boolean = dataPermissionAnyForLayer1Any.adminSelfEnable;
							// Stores the server self enable value used in the current execution flow.
							let serverSelfEnable: boolean = dataPermissionAnyForLayer1Any.serverSelfEnable;

							defaultPermissionAnyForLayer1Any.selfEnable = selfEnable != null && selfEnable;
							defaultPermissionAnyForLayer1Any.otherSelfEnable = otherSelfEnable != null && otherSelfEnable;
							defaultPermissionAnyForLayer1Any.adminSelfEnable = adminSelfEnable != null && adminSelfEnable;
							defaultPermissionAnyForLayer1Any.serverSelfEnable = serverSelfEnable != null && serverSelfEnable;

							if (defaultPermissionAnyForLayer1Any.otherSelfEnable) {
								defaultPermissionAnyForLayer1Any.selfEnable = true;
							}

							// if (secretRole == SecretRole.Player) {
							// 	defaultPermissionAnyForLayer1Any.serverSelfEnable = false;
							// 	defaultPermissionAnyForLayer1Any.adminSelfEnable = false;

							// 	if (defaultPermissionAnyForLayer1Any.otherSelfEnable) {
							// 		defaultPermissionAnyForLayer1Any.selfEnable = true;
							// 	}
							// }
							// else if (secretRole == SecretRole.Server) {
							// 	defaultPermissionAnyForLayer1Any.selfEnable = false;
							// 	defaultPermissionAnyForLayer1Any.otherSelfEnable = false;
							// 	defaultPermissionAnyForLayer1Any.adminSelfEnable = false;
							// }
							// else if (secretRole == SecretRole.Admin) {
							// 	defaultPermissionAnyForLayer1Any.selfEnable = false;
							// 	defaultPermissionAnyForLayer1Any.otherSelfEnable = false;
							// 	defaultPermissionAnyForLayer1Any.serverSelfEnable = false;
							// }

						}
					}

				}

				secretInfo = SecretInfo.Builder()
					.setSecretKey(secretInfoResult["secretKey"])
					.setIsRemove(secretInfoResult["isRemove"])
					.setRole(secretInfoResult["role"])
					.setTsExpire(secretInfoResult["tsExpire"])
					.setGameId(secretInfoResult["gameId"])
					.setPermission(defaultSecretPermissionItem)
					.setIsOnlyMasterAdmin(secretInfoResult["onlyMasterAdmin"] == true)
					.setIsDefault(secretInfoResult["isDefault"] == true)
					.setDescription(secretInfoResult["description"])
					.build();

				this.secretInfoDict.set(secretKey, secretInfo);
			}
		}

		return secretInfo;
	}

	/**
	 * Returns the auth info by GearN token in database.
	 * @param gnToken Provides the GearN token value used by this operation.
	 * @returns Returns the auth info by GearN token in database.
	 */
	public async getAuthInfoByGNTokenInDatabase(gnToken: string): Promise<AuthInfo> {
		// Stores the auth info value used in the current execution flow.
		let authInfo = this.authInfoDict.get(gnToken);
		if (authInfo == null) {
			// Stores the auth info temp value used in the current execution flow.
			let authInfoTemp = await this.authInfoCollection.findOne({ gnToken: gnToken });

			if (authInfoTemp != null) {
				// Tracks whether r ID should be used.
				let userId = authInfoTemp["userId"];
				authInfo = AuthInfo.Builder()
					.setGNToken(authInfoTemp["gnToken"])
					.setAuthToken(authInfoTemp["authToken"])
					.setIsRemove(authInfoTemp["isRemove"])
					.setTsExpire(authInfoTemp["tsExpire"])
					.setUserId(userId)
					.setOtherDatas(authInfoTemp["otherDatas"])
					.setTsCreate(authInfoTemp["tsCreate"])
					.setSecretKey(authInfoTemp["secretKey"])
					.build();

				this.authInfoDict.set(gnToken, authInfo);
			}
		}

		return authInfo;
	}

	/**
	 * Returns the auth infos by user ID in mem cache.
	 * @param userId Indicates whether r ID should be used.
	 * @returns Returns the auth infos by user ID in mem cache.
	 */
	public getAuthInfosByUserIdInMemCache(userId: string): AuthInfo[] {
		// Stores the answer value used in the current execution flow.
		let answer: AuthInfo[] = [];

		for (const authInfo of this.authInfoDict.values()) {
			if (authInfo != null && authInfo.getUserId() == userId) {
				answer.push(authInfo);
			}
		}

		return answer;
	}

	/**
	 * Executes the update secret info workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param withoutSave If yes, no save to db.
	 */
	public async updateSecretInfo(secretInfo: SecretInfo, withoutSave: boolean = false): Promise<void> {
		// Stores the secret key value used in the current execution flow.
		let secretKey = secretInfo.getSecretKey();

		this.secretInfoDict.set(secretKey, secretInfo);

		if (!withoutSave)
			await this.secretInfoCollection.updateOne({ secretKey: secretKey }, { $set: secretInfo.toDocumentData() }, { upsert: true });
	}

	/**
	 * Executes the update auth info workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param withoutSave If yes, no save to db.
	 */
	public async updateAuthInfo(authInfo: AuthInfo, withoutSave: boolean = false): Promise<void> {
		// Stores the GearN token value used in the current execution flow.
		let gnToken = authInfo.getGNToken();

		this.authInfoDict.set(gnToken, authInfo);

		if (!withoutSave)
			await this.authInfoCollection.updateOne({ gnToken: gnToken }, { $set: authInfo.toDocumentData() });
	}

	public async removeAllAuthInfosInDb(userId: string): Promise<void> {
		await this.authInfoCollection.updateMany({ userId: userId }, {
			$set: {
				isRemove: true,
			}
		});
	}

	/**
	 * Executes the authenticate token via JSON workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async authenticateTokenViaJson(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
		}

		return next();
	}

	/**
	 * Executes the authenticate upload token workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async authenticateUploadToken(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(401);
		}

		return next();
	}

	/**
	 * Executes the authenticate token via msg pack workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async authenticateTokenViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			// Stores the content value used in the current execution flow.
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	/**
	 * Returns the IP.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async getIP(req: express.Request, res: express.Response, next: Function) {
		// Stores the IP value used in the current execution flow.
		let ip: string = null;

		if (this.headerIP != null) {
			ip = req.header(this.headerIP);
		}

		if (ip == null) {
			ip = req.header("x-forwarded-for")?.split(',')[0].trim();
		}

		if (ip == null) {
			ip = req.ip;
		}

		if (ip == null) {
			ip = req.socket.remoteAddress;
		}

		ip = this.createIP(ip);

		req.xip = ip;

		return next();
	}

	/**
	 * Resolves request auth state for HTTP, validates the active secret, and returns the final gate result.
	 * @param req Provides the req value used by this operation.
	 * @returns Returns the return code authenticate.
	 */
	public async getReturnCodeAuthenticate(req: express.Request): Promise<number> {
		let authToken: string = req.header(Commands.RequestAuthTokenCmd);

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (!authToken) {
			req.isAuthenticated = false;
		} else {
			let tokenPayload = this.verifyAuthToken(authToken);

			if (tokenPayload == null) {
				req.isAuthenticated = false;

				// return ReturnCode.OperationNotAuthorized;
			}
			else {
				let gnToken: string = tokenPayload.gnToken;

				let authInfo = await this.getAuthInfoByGNTokenInDatabase(gnToken);

				if (authInfo == null) {
					req.isAuthenticated = false;
				} else {
					if (authInfo.isRemove()) {
						this.authInfoDict.delete(gnToken);

						req.isAuthenticated = false;
					} else if (authInfo.getTsExpire() != -1 && authInfo.getTsExpire() < currentMilliseconds) {
						this.authInfoDict.delete(gnToken);

						req.isAuthenticated = false;
					} else {
						req.isAuthenticated = true;
						req.authInfo = authInfo;

						this.authInfoDict.set(gnToken, authInfo);

						authInfo.setTsLastUpdate(currentMilliseconds);
					}
				}
			}
		}

		if (this.maxCCU != -1) {
			let dauLast30Min = [...this.dauLast30Min];

			if (dauLast30Min.length >= this.maxCCU) {
				if (!req.isAuthenticated || !dauLast30Min.includes(req.authInfo.getUserId())) {
					return ReturnCode.MaxCCUReject;
				}
			}
		}

		// A client secret can come from the header or fall back to the authenticated account secret.
		let secretKey: string = req.header(Commands.RequestSecretCmd);

		if (!secretKey) {
			if (!req.isAuthenticated) {
				if (req.url != "/dashboard/client/loginByAdminAccount") {
					return ReturnCode.SecretInvalid;
				}
			}
			else {
				secretKey = req.authInfo.getSecretKey();
			}
		}

		if (secretKey) {
			let secretInfo = await this.getSecretInfoBySecretKeyInDatabase(secretKey);

			if (secretInfo != null && secretInfo.getIsOnlyMasterAdmin()) {
				if (!req.isAuthenticated || req.authInfo.getSecretKey() != secretKey) {
					secretInfo = null;
				}
			}

			if (secretInfo == null) {
				return ReturnCode.SecretInvalid;
			}

			if (secretInfo.getTsExpire() != -1 && secretInfo.getTsExpire() < currentMilliseconds) {
				return ReturnCode.SecretInvalid;
			}

			if (!secretInfo.getGameId()) {
				// Global secrets are cloned per-request so a concrete game id can be injected safely.
				let gameId: string = req.header(Commands.RequestGameIdCmd);
				if (!gameId) gameId = ApiMiddleware.DEFAULT_GAME_ID;
				else {
					if (!this.gameIds.includes(gameId)) return ReturnCode.SecretInvalid;
				}

				let secretInfoAny = structuredClone(secretInfo) as any;
				secretInfoAny.getGameId = secretInfo.getGameId;
				secretInfoAny.getPermission = secretInfo.getPermission;
				secretInfoAny.getRole = secretInfo.getRole;
				secretInfoAny.getSecretKey = secretInfo.getSecretKey;
				secretInfoAny.getTsExpire = secretInfo.getTsExpire;
				secretInfoAny.isRemove = secretInfo.isRemove;
				secretInfoAny.setGameId = secretInfo.setGameId;
				secretInfoAny.setIsRemove = secretInfo.setIsRemove;
				secretInfoAny.setPermission = secretInfo.setPermission;
				secretInfoAny.setRole = secretInfo.setRole;
				secretInfoAny.setSecretKey = secretInfo.setSecretKey;
				secretInfoAny.setTsExpire = secretInfo.setTsExpire;
				secretInfoAny.getIsDefault = secretInfo.getIsDefault;
				secretInfoAny.setIsDefault = secretInfo.setIsDefault;
				secretInfoAny.getIsOnlyMasterAdmin = secretInfo.getIsOnlyMasterAdmin;
				secretInfoAny.setIsOnlyMasterAdmin = secretInfo.setIsOnlyMasterAdmin;
				secretInfoAny.toDocumentData = secretInfo.toDocumentData;
				secretInfoAny.setDescription = secretInfo.setDescription;
				secretInfoAny.getDescription = secretInfo.getDescription;

				secretInfo = secretInfoAny;
				secretInfo.setGameId(gameId);
			}

			req.secretInfo = secretInfo;
		}

		return ReturnCode.Ok;
	}

	/**
	 * Performs the same auth/secret resolution for sockets, but keeps the result on `socket.data`.
	 * @param socket Provides the socket value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async socketAuthenticateToken(socket: Socket, next: (returnCode: number) => void): Promise<void> {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (socket.data.isAuthenticated === true) {
			let authInfo = socket.data.authInfo as AuthInfo;
			let gnToken = authInfo.getGNToken();

			if (authInfo.isRemove()) {
				this.authInfoDict.delete(gnToken);

				socket.rooms.forEach(room => socket.leave(room));

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;

			} else if (authInfo.getTsExpire() != -1 && authInfo.getTsExpire() < currentMilliseconds) {
				this.authInfoDict.delete(gnToken);

				socket.rooms.forEach(room => socket.leave(room));

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			}
			else {
				authInfo.setTsLastUpdate(currentMilliseconds);
			}
		}

		if (this.maxCCU != -1) {
			let dauLast30Min = [...this.dauLast30Min];

			if (dauLast30Min.length >= this.maxCCU) {
				if (!socket.data.isAuthenticated || !dauLast30Min.includes((socket.data.authInfo as AuthInfo).getUserId())) {
					return next(ReturnCode.MaxCCUReject);
				}
			}
		}

		let secretInfo: SecretInfo = null;

		if (socket.data.isSecreted) {
			secretInfo = socket.data.secretInfo;
		}
		else {
			let secretKey = socket.data.secretKey as string;
			if (!secretKey) {
				if (socket.data.isAuthenticated === false) {
					return next(ReturnCode.SecretInvalid);
				}

				secretKey = socket.data.authInfo.getSecretKey();
			}

			secretInfo = await this.getSecretInfoBySecretKeyInDatabase(secretKey);

			if (secretInfo != null && secretInfo.getIsOnlyMasterAdmin()) {
				if (!socket.data.isAuthenticated || socket.data.authInfo.getSecretKey() != secretKey) {
					secretInfo = null;
				}
			}

			if (secretInfo == null) {
				return next(ReturnCode.SecretInvalid);
			}

			if (!secretInfo.getGameId()) {
				// Global secrets are cloned per-socket so the resolved game id does not mutate the cached secret.
				let gameId = socket.data.gameId as string;
				if (!gameId) gameId = ApiMiddleware.DEFAULT_GAME_ID;
				else {
					if (!this.gameIds.includes(gameId)) return next(ReturnCode.SecretInvalid);
				}

				let secretInfoAny = structuredClone(secretInfo) as any;
				secretInfoAny.getGameId = secretInfo.getGameId;
				secretInfoAny.getPermission = secretInfo.getPermission;
				secretInfoAny.getRole = secretInfo.getRole;
				secretInfoAny.getSecretKey = secretInfo.getSecretKey;
				secretInfoAny.getTsExpire = secretInfo.getTsExpire;
				secretInfoAny.isRemove = secretInfo.isRemove;
				secretInfoAny.setGameId = secretInfo.setGameId;
				secretInfoAny.setIsRemove = secretInfo.setIsRemove;
				secretInfoAny.setPermission = secretInfo.setPermission;
				secretInfoAny.setRole = secretInfo.setRole;
				secretInfoAny.setSecretKey = secretInfo.setSecretKey;
				secretInfoAny.setTsExpire = secretInfo.setTsExpire;
				secretInfoAny.getIsDefault = secretInfo.getIsDefault;
				secretInfoAny.setIsDefault = secretInfo.setIsDefault;
				secretInfoAny.getIsOnlyMasterAdmin = secretInfo.getIsOnlyMasterAdmin;
				secretInfoAny.setIsOnlyMasterAdmin = secretInfo.setIsOnlyMasterAdmin;
				secretInfoAny.toDocumentData = secretInfo.toDocumentData;
				secretInfoAny.setDescription = secretInfo.setDescription;
				secretInfoAny.getDescription = secretInfo.getDescription;

				secretInfo = secretInfoAny;
				secretInfo.setGameId(gameId);
			}

			socket.data.isSecreted = true;
			socket.data.secretInfo = secretInfo;
		}

		if (secretInfo.getTsExpire() != -1 && secretInfo.getTsExpire() < currentMilliseconds) {

			socket.data.isSecreted = false;
			socket.data.secretInfo = null;

			return next(ReturnCode.SecretInvalid);
		}

		return next(ReturnCode.Ok);
	}

	/**
	 * Normalizes IPv6-mapped IPv4 addresses to the plain IPv4 string used across the codebase.
	 * @param ip Provides the IP value used by this operation.
	 * @returns Returns the operation result.
	 */
	public createIP(ip: string): string {
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		return ip;
	}

	/**
	 * Initializes a new API middleware instance.
	 */
	constructor() {
		this.authInfoDict = new Map<string, AuthInfo>();
		this.secretInfoDict = new Map<string, SecretInfo>();
	}

}
