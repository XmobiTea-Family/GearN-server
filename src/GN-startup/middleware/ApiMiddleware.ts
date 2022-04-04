const AUTH_TOKEN = "a";
const EXPIRED_TOKEN = 2 * 1000 * 60 * 60 * 24;

import express from "express";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Md5Generate } from "./../../GN-common/helper/Md5Generate";
import { nanoid } from "nanoid";
import * as mongoDB from "mongodb";
import { Socket } from "socket.io";

export class ApiMiddleware {
	private authInfoDic: { [k: string]: AuthInfo };

	private authTokenCollection: mongoDB.Collection<mongoDB.Document>;

	public setAuthTokenCollection(authTokenCollection: mongoDB.Collection<mongoDB.Document>) {
		this.authTokenCollection = authTokenCollection;
	}

	public run() {}

	public generateAuthToken(info: AuthInfo) {
		let authToken = Md5Generate.getMd5(nanoid());
		let authInfo = AuthInfo.Builder()
			.setAuthToken(authToken)
			.setUserId(info.getUserId())
			.setRole(info.getRole())
			.setIsRemove(false)
			.setTsExpire(new Date().getTime() + EXPIRED_TOKEN)
			.setOtherUserLogin(false)
			.build();

		this.authInfoDic[authToken] = authInfo;
		this.authTokenCollection.insertOne(authInfo);

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
		this.authTokenCollection.updateOne({ AuthInfo: authInfo }, { $set: authInfo });
	}

	public async authenticateToken(req: express.Request, res: express.Response, next: Function) {
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
						.setIsRemove(false)
						.setOtherUserLogin(false)
						.setRole(authInfoTemp["Role"])
						.setTsExpire(authInfoTemp["TsExpire"])
						.setUserId(authInfoTemp["UserId"])
						.build();
				}
			}

			if (authInfo == null) {
				reqAny.isAuthenticated = false;
			} else {
				if (authInfo.getOtherUserLogin()) {
					delete this.authInfoDic[authToken];

					return res.send([ReturnCode.OperationNotAuthorized]);
				} else if (authInfo.isRemove()) {
					delete this.authInfoDic[authToken];

					reqAny.isAuthenticated = false;
				} else if (authInfo.getTsExpire() < new Date().getTime()) {
					delete this.authInfoDic[authToken];

					reqAny.isAuthenticated = false;
				} else {
					reqAny.isAuthenticated = true;
					reqAny.authInfo = authInfo;

					this.authInfoDic[authToken] = authInfo;
				}
			}
		}

		return next();
	}

	public async socketAuthenticateToken(socket: Socket, next: Function) {
		if (socket.data.isAuthenticated === true) {
			let authInfo = socket.data.authInfo as AuthInfo;
			let authToken = authInfo.getAuthToken();

			if (authInfo.getOtherUserLogin()) {
				delete this.authInfoDic[authToken];

				socket.data.isAuthenticated = false;
			} else if (authInfo.isRemove()) {
				delete this.authInfoDic[authToken];

				socket.data.isAuthenticated = false;
			} else if (authInfo.getTsExpire() < new Date().getTime()) {
				delete this.authInfoDic[authToken];

				socket.data.isAuthenticated = false;
			}
		}

		return next();
	}

	constructor() {
		this.authInfoDic = {};
	}
}
