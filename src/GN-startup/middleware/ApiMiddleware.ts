const AUTH_TOKEN = "a";
const FIVE_MINUTE_TS = 5 * 60 * 1000;

import express from "express";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Md5Generate } from "./../../GN-common/helper/Md5Generate";
import { nanoid } from "nanoid";
import * as mongoDB from "mongodb";
import { Socket } from "socket.io";
import { encode } from "@msgpack/msgpack";
import { LicenseKeyApplication } from "./../LicenseKeyApplication";

export class ApiMiddleware {
	private authInfoDic: { [k: string]: AuthInfo };

	private authTokenCollection: mongoDB.Collection<mongoDB.Document>;

	private playerGameCollection: mongoDB.Collection<mongoDB.Document>

	private expiredToken: number = 2 * 1000 * 60 * 60 * 24;

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

	public run() {
		this.dauLast30Min = [];
		this.maxCCU = -1;

		setInterval(() => {
			this.getDAULast30Min();
		}, FIVE_MINUTE_TS);
	}

	private async getDAULast30Min() {
		this.maxCCU = LicenseKeyApplication.GetMaxCCU();
		
		if (this.maxCCU != -1) {
			this.dauLast30Min = [];

			let playerLast30Mins = await this.playerGameCollection.find({}).sort({TsLastSeen: -1}).limit(50).toArray();

			for (let i = 0; i < playerLast30Mins.length; i++) {
				let playerLast30Min = playerLast30Mins[i];
				this.dauLast30Min.push(playerLast30Min.UserId);
			}
		}
	}

	public generateAuthToken(info: AuthInfo) {
		let authToken = Md5Generate.getMd5(nanoid());
		let tsExpire = this.expiredToken == -1 ? -1 : (new Date().getTime() + this.expiredToken);

		let authInfo = AuthInfo.Builder()
			.setAuthToken(authToken)
			.setUserId(info.getUserId())
			.setRole(info.getRole())
			.setIsRemove(false)
			.setTsExpire(tsExpire)
			.setOtherUserLogin(false)
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
		this.authTokenCollection.updateOne({ AuthInfo: authInfo }, { $set: authInfo.toDocumentData() });
	}

	public async authenticateTokenViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getRetturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async authenticateTokenViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getRetturnCodeAuthenticate(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
	}

	private async getRetturnCodeAuthenticate(req: express.Request): Promise<number> {
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
				if (authInfo.getOtherUserLogin()) {
					delete this.authInfoDic[authToken];
					
					return ReturnCode.OperationNotAuthorized;
				} else if (authInfo.isRemove()) {
					delete this.authInfoDic[authToken];

					reqAny.isAuthenticated = false;
				} else if (authInfo.getTsExpire() != -1 && authInfo.getTsExpire() < new Date().getTime()) {
					delete this.authInfoDic[authToken];

					reqAny.isAuthenticated = false;
				} else {
					reqAny.isAuthenticated = true;
					reqAny.authInfo = authInfo;

					this.authInfoDic[authToken] = authInfo;
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
			let authInfo = socket.data.authInfo as AuthInfo;
			let authToken = authInfo.getAuthToken();

			if (authInfo.getOtherUserLogin()) {
				delete this.authInfoDic[authToken];

				socket.leave((socket.data.authInfo as AuthInfo).getUserId());

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;

				return next(ReturnCode.OperationNotAuthorized);
			} else if (authInfo.isRemove()) {
				delete this.authInfoDic[authToken];

				socket.leave((socket.data.authInfo as AuthInfo).getUserId());

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			} else if (authInfo.getTsExpire() < new Date().getTime()) {
				delete this.authInfoDic[authToken];

				socket.leave((socket.data.authInfo as AuthInfo).getUserId());

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
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

	constructor() {
		this.authInfoDic = {};
	}
}
