const EXPIRED_TOKEN = 2 * 1000 * 60 * 60 * 24;

import express from "express";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Md5Generate } from "./../../GN-common/helper/Md5Generate";
import { nanoid } from 'nanoid';

export class ApiMiddleware {
	private authInfoDic: { [k: string]: AuthInfo };

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
		// authTokenCollection.insertOne(authInfo);

		return authInfo;
	}

	public getAuthInfoByUserId(userId: string) {
		let authInfoLst = Object.values(this.authInfoDic);
		return authInfoLst.find((x) => x.getUserId() == userId);
	}

	public updateAuthInfo(authInfo: AuthInfo) {
		let authToken = authInfo.getAuthToken();

		this.authInfoDic[authToken] = authInfo;
		// authTokenCollection.updateOne({"AuthInfo": authInfo}, {"$set": authInfo});
	}

	public async authenticateToken(req: express.Request, res: express.Response, next: Function) {
		let headers = req.headers;
		let authToken = headers["authtoken"] as string;

		let reqAny = req as any;

		if (!authToken) {
			reqAny.isAuthenticated = false;
		} else {
			let authInfo = this.authInfoDic[authToken];
			if (authInfo == null) {
				// authInfo = await authTokenCollection.findOne({"AuthToken": authToken});

				if (authInfo != null) {
					authInfo.setOtherData("RoomId", null);
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

	constructor() {
		this.authInfoDic = {};
	}
}
