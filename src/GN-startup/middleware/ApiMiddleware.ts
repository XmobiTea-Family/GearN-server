const AUTH_TOKEN = "a";
const FIVE_MINUTE_TS = 5 * 60 * 1000;
const TS_REMOVE_AUTH_INFO_DIC = 1000 * 60 * 60 * 12;

import express from "express";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Md5Generate } from "./../../GN-common/helper/Md5Generate";
import { nanoid } from "nanoid";
import * as mongoDB from "mongodb";
import { Socket } from "socket.io";
import { encode } from "@msgpack/msgpack";
import { LicenseKeyApplication } from "./../LicenseKeyApplication";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class ApiMiddleware {
	private authInfoDic: { [k: string]: AuthInfo };

	private authTokenCollection: mongoDB.Collection<mongoDB.Document>;

	private playerGameCollection: mongoDB.Collection<mongoDB.Document>

	private expiredToken: number = 2 * 1000 * 60 * 60 * 24;

	private headerIP: string;

	private dauLast30Min: Array<string>;

	private maxCCU: number;

	public setAuthTokenCollection(authTokenCollection: mongoDB.Collection<mongoDB.Document>) {
		this.authTokenCollection = authTokenCollection;
	}

	public setPlayerGameCollection(playerGameCollection: mongoDB.Collection<mongoDB.Document>) {
		this.playerGameCollection = playerGameCollection;
	}

	public setExpiredToken(expiredToken: number) {
		this.expiredToken = expiredToken;
	}

	public setHeaderIP(headerIP: string) {
		this.headerIP = headerIP;
	}

	public getHeaderIP() {
		return this.headerIP;
	}

	public run() {
		this.dauLast30Min = [];
		this.maxCCU = -1;

		setInterval(() => {
			this.getDAULast30Min();
			this.checkAndRemoveDict();
		}, FIVE_MINUTE_TS);
	}

	private async getDAULast30Min() {
		this.maxCCU = LicenseKeyApplication.GetMaxCCU();
		
		if (this.maxCCU != -1) {
			this.dauLast30Min.length = 0;

			try {
				let playerLast30Mins = await this.playerGameCollection.find({}).sort({TsLastSeen: -1}).limit(50).toArray();

				for (let i = 0; i < playerLast30Mins.length; i++) {
					let playerLast30Min = playerLast30Mins[i];
					this.dauLast30Min.push(playerLast30Min.UserId);
				}
			}
			catch (err) {
				Debug.logException(err);
			}
		}
	}

	private async checkAndRemoveDict() {
		try {
			let removeCount = 0;

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			let tsRemove = currentMilliseconds - TS_REMOVE_AUTH_INFO_DIC;

			let authInfoLst = Object.values(this.authInfoDic);
			
			for (let i = 0; i < authInfoLst.length; i++) {
				let authInfo = authInfoLst[i];

				if (authInfo != null) {
					if (authInfo.getTsLastUpdate() < tsRemove) {
						delete this.authInfoDic[authInfo.getAuthToken()];
						removeCount++;
					}
				}
			}

			Debug.log("[GN] ApiMiddleware remove " + removeCount + "/" + authInfoLst.length);
		}
		catch (err) {
			Debug.logException(err);
		}
	}

	public generateAuthToken(info: AuthInfo) {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let authToken = Md5Generate.getMd5(nanoid());
		let tsExpire = this.expiredToken == -1 ? -1 : (currentMilliseconds + this.expiredToken);

		let authInfo = AuthInfo.Builder()
			.setAuthToken(authToken)
			.setUserId(info.getUserId())
			.setRole(info.getRole())
			.setIsRemove(false)
			.setTsExpire(tsExpire)
			.setOtherUserLogin(false)
			.setTsLastUpdate(currentMilliseconds)
			.setSocketId("")
			.build();

		this.authInfoDic[authToken] = authInfo;
		this.authTokenCollection.insertOne(authInfo.toDocumentData());

		return authInfo;
	}

	public getAuthInfoByUserId(userId: string) {
		let authInfoLst = Object.values(this.authInfoDic);
		return authInfoLst.find((x) => x.getUserId() == userId);
	}

	public getAuthInfoByAuthToken(authToken: string) {
		return this.authInfoDic[authToken];
	}

	public updateAuthInfo(authInfo: AuthInfo) {
		let authToken = authInfo.getAuthToken();

		this.authInfoDic[authToken] = authInfo;
		this.authTokenCollection.updateOne({ AuthToken: authToken }, { $set: authInfo.toDocumentData() });
	}

	public async authenticateTokenViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
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
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
	}

	public async getIP(req: express.Request, res: express.Response, next: Function) {
		let ip: string = null;

		if (this.headerIP != null) {
			ip = req.header(this.headerIP);
		}

		if (ip == null) {
			ip = req.socket.remoteAddress;
		}

		ip = this.createIP(ip);

		let reqAny = req as any;

		reqAny.xip = ip;

		return next();
	}

	private async getReturnCodeAuthenticate(req: express.Request): Promise<number> {
		let headers = req.headers;
		let authToken = headers[AUTH_TOKEN] as string;

		let reqAny = req as any;

		if (!authToken) {
			reqAny.isAuthenticated = false;
		} else {
			let authInfo = this.authInfoDic[authToken];
			if (authInfo == null) {
				let authInfoTemp = await this.authTokenCollection.findOne({ AuthToken: authToken });

				if (authInfoTemp != null) {
					authInfo = AuthInfo.Builder()
						.setAuthToken(authInfoTemp["AuthToken"])
						// .setOtherData("RoomId", null)
						.setIsRemove(authInfoTemp["IsRemove"])
						.setOtherUserLogin(authInfoTemp["OtherUserLogin"])
						.setRole(authInfoTemp["Role"])
						.setTsExpire(authInfoTemp["TsExpire"])
						.setUserId(authInfoTemp["UserId"])
						.setOtherDatas(authInfoTemp["OtherDatas"])
						.build();
				}
			}

			if (authInfo == null) {
				reqAny.isAuthenticated = false;
			} else {
				let currentMilliseconds = xDatetime.getCurrentMilliseconds();

				if (authInfo.getOtherUserLogin()) {
					delete this.authInfoDic[authToken];
					
					return ReturnCode.OperationNotAuthorized;
				} else if (authInfo.isRemove()) {
					delete this.authInfoDic[authToken];

					reqAny.isAuthenticated = false;
				} else if (authInfo.getTsExpire() != -1 && authInfo.getTsExpire() < currentMilliseconds) {
					delete this.authInfoDic[authToken];

					reqAny.isAuthenticated = false;
				} else {
					reqAny.isAuthenticated = true;
					reqAny.authInfo = authInfo;

					this.authInfoDic[authToken] = authInfo;
					authInfo.setTsLastUpdate(currentMilliseconds);
				}
			}
		}

		if (this.maxCCU != -1) {
			let dauLast30Min =  [...this.dauLast30Min];

			if (dauLast30Min.length >= this.maxCCU) {
				if (!reqAny.isAuthenticated || !dauLast30Min.includes((reqAny.authInfo as AuthInfo).getUserId())) {
					return ReturnCode.MaxCCUReject;
				}
			}
		}

		return ReturnCode.Ok;
	}

	public async socketAuthenticateToken(socket: Socket, next: (returnCode: number) => void) {
		if (socket.data.isAuthenticated === true) {
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			let authInfo = socket.data.authInfo as AuthInfo;
			let authToken = authInfo.getAuthToken();

			if (authInfo.getOtherUserLogin()) {
				delete this.authInfoDic[authToken];
				authInfo.setSocketId("");

				socket.leave(authInfo.getUserId());

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;

				return next(ReturnCode.OperationNotAuthorized);
			} else if (authInfo.isRemove()) {
				delete this.authInfoDic[authToken];
				authInfo.setSocketId("");

				socket.leave(authInfo.getUserId());

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			} else if (authInfo.getTsExpire() < currentMilliseconds) {
				delete this.authInfoDic[authToken];
				authInfo.setSocketId("");

				socket.leave(authInfo.getUserId());

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			}
			else {
				authInfo.setTsLastUpdate(currentMilliseconds);
				authInfo.setSocketId(socket.id);
			}
		}

		if (this.maxCCU != -1) {
			let dauLast30Min =  [...this.dauLast30Min];

			if (dauLast30Min.length >= this.maxCCU) {
				if (!socket.data.isAuthenticated || !dauLast30Min.includes((socket.data.authInfo as AuthInfo).getUserId())) {
					return next(ReturnCode.MaxCCUReject);
				}
			}
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
		this.authInfoDic = {};
	}
}
