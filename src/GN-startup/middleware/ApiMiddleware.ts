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

export class ApiMiddleware {
	private static readonly FIVE_MINUTE_TS: number = 5 * 60 * 1000;
	private static readonly TS_REMOVE_AUTH_INFO_DIC: number = 1000 * 60 * 60 * 12;
	private static readonly DEFAULT_GAME_ID: string = "dev";

	private authInfoDict: Map<string, AuthInfo>;
	private authInfoCollection: mongoDB.Collection<mongoDB.Document>;

	private secretInfoDict: Map<string, SecretInfo>;
	private secretInfoCollection: mongoDB.Collection<mongoDB.Document>;

	private playerGameCollection: mongoDB.Collection<mongoDB.Document>;

	private expiredToken: number = 2 * 1000 * 60 * 60 * 24;

	private privateKeyToken: string;

	private headerIP: string;

	private dauLast30Min: Array<string>;

	private maxCCU: number;

    private gameIds: string[];

	public setSecretInfoCollection(secretInfoCollection: mongoDB.Collection<mongoDB.Document>) {
		this.secretInfoCollection = secretInfoCollection;
	}

	public setAuthInfoCollection(authInfoCollection: mongoDB.Collection<mongoDB.Document>) {
		this.authInfoCollection = authInfoCollection;
	}

	public setPlayerGameCollection(playerGameCollection: mongoDB.Collection<mongoDB.Document>) {
		this.playerGameCollection = playerGameCollection;
	}

	public setExpiredToken(expiredToken: number) {
		this.expiredToken = expiredToken;
	}

	public setPrivateKeyToken(privateKeyToken: string) {
		this.privateKeyToken = privateKeyToken;
	}

	public setHeaderIP(headerIP: string) {
		this.headerIP = headerIP;
	}

	public getHeaderIP() {
		return this.headerIP;
	}

    public setGameIds(gameIds: string[]) {
        this.gameIds = gameIds;
    }

	public run() {
		this.dauLast30Min = [];
		this.maxCCU = -1;

		setInterval(() => {
			this.getDAULast30Min();
			this.checkAndRemoveDict();
		}, ApiMiddleware.FIVE_MINUTE_TS);
	}

	private async getDAULast30Min() {
		this.maxCCU = -1;

		if (this.maxCCU != -1) {

			try {
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

	public generateAuthInfo(payload: TokenPayload): AuthInfo {
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

		this.authInfoCollection.insertOne(authInfo.toDocumentData());

		return authInfo;
	}

	public verifyAuthToken(authToken: string): jwt.JwtPayload {
		try {
			return jwt.verify(authToken, this.privateKeyToken, { algorithms: ["HS512"] }) as jwt.JwtPayload;
		}
		catch (err) {
			return null;
		}
	}

	public async getSecretInfoBySecretKeyInDatabase(secretKey: string): Promise<SecretInfo> {
		let secretInfo = this.secretInfoDict.get(secretKey);
		if (secretInfo == null) {
			let secretInfoResult = await this.secretInfoCollection.findOne({ secretKey: secretKey });

			if (secretInfoResult != null) {
				// let secretRole = <SecretRole>secretInfoResult["role"];

				let defaultSecretPermissionItem = CreateSecretInfoRequestHandler.generateDefaultPermission(false, false, false, false) as any;

				let dataSecretPermissionItem = secretInfoResult.permission as any;
				let keyLayer0s = Object.keys(dataSecretPermissionItem);		// authenticate, masterPlayer, ...

				for (let i = 0; i < keyLayer0s.length; i++) {
					let keyLayer0 = keyLayer0s[i];		// authenticate
					let thisLayer0Any = dataSecretPermissionItem[keyLayer0];	// { loginByAccount : { seft enable: false } }
					let defaultThisLayer0Any = defaultSecretPermissionItem[keyLayer0];

					let keyLayer1s = Object.keys(thisLayer0Any);	// [ loginByAccount, registerAccount]

					for (let j = 0; j < keyLayer1s.length; j++) {
						let keyLayer1 = keyLayer1s[j];		// loginByAccount

						let dataPermissionAnyForLayer1Any = thisLayer0Any[keyLayer1];
						let defaultPermissionAnyForLayer1Any = defaultThisLayer0Any[keyLayer1];

						if (dataPermissionAnyForLayer1Any != null) {

							let selfEnable: boolean = dataPermissionAnyForLayer1Any.selfEnable;
							let otherSelfEnable: boolean = dataPermissionAnyForLayer1Any.otherSelfEnable;
							let adminSelfEnable: boolean = dataPermissionAnyForLayer1Any.adminSelfEnable;
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

	public async getAuthInfoByGNTokenInDatabase(gnToken: string): Promise<AuthInfo> {
		let authInfo = this.authInfoDict.get(gnToken);
		if (authInfo == null) {
			let authInfoTemp = await this.authInfoCollection.findOne({ gnToken: gnToken });

			if (authInfoTemp != null) {
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

	public getAuthInfosByUserIdInMemCache(userId: string): AuthInfo[] {
		let answer: AuthInfo[] = [];

		for (const authInfo of this.authInfoDict.values()) {
			if (authInfo != null && authInfo.getUserId() == userId) {
				answer.push(authInfo);
			}
		}

		return answer;
	}

	public async updateSecretInfo(secretInfo: SecretInfo): Promise<void> {
		let secretKey = secretInfo.getSecretKey();

		this.secretInfoDict.set(secretKey, secretInfo);
		await this.secretInfoCollection.updateOne({ secretKey: secretKey }, { $set: secretInfo.toDocumentData() }, { upsert: true });
	}

	public async updateAuthInfo(authInfo: AuthInfo): Promise<void> {
		let gnToken = authInfo.getGNToken();

		this.authInfoDict.set(gnToken, authInfo);
		await this.authInfoCollection.updateOne({ gnToken: gnToken }, { $set: authInfo.toDocumentData() });
	}

	public async authenticateTokenViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
		}

		return next();
	}

	public async authenticateUploadToken(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(401);
		}

		return next();
	}

	public async authenticateTokenViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	public async getIP(req: express.Request, res: express.Response, next: Function) {
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

	public createIP(ip: string): string {
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		return ip;
	}

	constructor() {
		this.authInfoDict = new Map<string, AuthInfo>();
		this.secretInfoDict = new Map<string, SecretInfo>();
	}

}
