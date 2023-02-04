import http from "http";
import { GNServer } from "./../GNServer";
import express from "express";
import { wrap } from "async-middleware";
import { Debug } from "./../GN-library/xdebug/lib/xDebug";
import fs from "fs";
import { Md5Generate } from "./../GN-common/helper/Md5Generate";
import { ParameterCode } from "./../GN-common/constant/parameterCode/ParameterCode";
import { OperationCodeExtensions } from "./../GN-client-custom/common/constant/OperationCode.ext";
import { VerifyServerApplicationParameterCode } from "./../GN-client-custom/common/constant/parameterCode/VerifyServerApplicationParameterCode";
import { VerifyServerApplicationErrorCode } from "./../GN-client-custom/common/constant/errorCode/VerifyServerApplicationErrorCode";

import { GNNetwork, GNServerSettings, OperationRequest, GNHashtable, OperationResponse, LoginOperationResponse } from "@xmobitea/gn-typescript-client";
import { ReturnCode } from "./../GN-common/constant/ReturnCode";
import { decode } from "@msgpack/msgpack";

interface LicenseKeyInfo {
	ProjectName?: string;
	ProductId: string;
	UnformattedLicenseKey: string;
	LicenseKey: string;
}

export class LicenseKeyApplication {
	private static readonly VERIFY_MINUTE: number = 5;

	private sessionId: string;
	private secretId: string;
	private secretkey: string;
	private salt: string;

	private licenseKeyFilePath: string;
	private server: http.Server;
	private gnServer: GNServer;
	private app: express.Express;

	private static maxCCU: number = 20;

	private licenseKeyInfo: LicenseKeyInfo;
	private port: number;

	private verifyMinute: number;

	public setLicenseKeyFilePath(licenseKeyFilePath: string): void {
		this.licenseKeyFilePath = licenseKeyFilePath;
	}

	public setServer(server: http.Server): void {
		this.server = server;
	}

	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	public setApp(app: express.Express): void {
		this.app = app;
	}

	public setSessionId(sessionId: string): void {
		this.sessionId = sessionId;
	}

	public setSecretId(secretId: string): void {
		this.secretId = secretId;
	}

	public setSecretkey(secretkey: string): void {
		this.secretkey = secretkey;
	}

	public setSalt(salt: string): void {
		this.salt = salt;
	}

	public setPort(port: number): void {
		this.port = port;
	}

	public static getMaxCCU(): number {
		return this.maxCCU;
	}

	public run(): void {
		const verifyRouter = express.Router();
		verifyRouter.use(express.json());

		this.verifyMinute = 0;
		this.app.use(
			"/manager",
			wrap((req, res, next) => {
				let secretId = req.headers[this.sessionId];

				if (this.secretId === secretId) return next();
				return res.sendStatus(403);
			}),
			verifyRouter
		);

		verifyRouter.post("/forcestop", (req: express.Request, res: express.Response) => {
			this.server.emit("close");
			this.server.close(() => {
				Debug.log("[GN] Server force stopped");
			});

			return res.sendStatus(200);
		});

		if (!this.server) {
			throw new Error("Server null");
		}

		if (!this.gnServer) {
			throw new Error("Game Application null");
		}

		this.initGNClientSdk();

		if (!this.licenseKeyFilePath) {
			// this is no license key
			LicenseKeyApplication.maxCCU = 20;

			setTimeout(() => {
				this.debug(VerifyServerApplicationErrorCode.NoLicenseKey, LicenseKeyApplication.maxCCU);
			}, 500);

			setInterval(() => {
				let newMaxCCU = 20;
				if (LicenseKeyApplication.maxCCU != newMaxCCU) {
					this.debug(VerifyServerApplicationErrorCode.NoLicenseKey, LicenseKeyApplication.maxCCU);
				}
			}, 30000);
		} else {
			LicenseKeyApplication.maxCCU = 50;

			//let allLines = fs.readFileSync("D:/GN_GN-Dashboard.license", 'utf-8').split(/\r?\n/);
			let allLines = fs.readFileSync(this.licenseKeyFilePath, 'utf-8').split(/\r?\n/);

			this.licenseKeyInfo = {
				ProjectName: allLines[0],
				ProductId: allLines[1],
				UnformattedLicenseKey: allLines[2],
				LicenseKey: allLines[3],
			};

			setTimeout(() => {
				this.validateApp(false);

				this.gnServer.getTimerService().subscriberEveryMinute(() => {
					this.validateApp(false);
				});
			}, 500);
		}
	}

	private initGNClientSdk(): void {
		let gnServerSettings = new GNServerSettings();
		gnServerSettings.setServerAddress(decode([185, 100, 101, 118, 46, 120, 109, 111, 98, 105, 116, 101, 97, 46, 99, 111, 109, 47, 103, 110, 115, 101, 114, 118, 101, 114]) as string);
		gnServerSettings.setServerPort(decode([255]) as number);
		gnServerSettings.setUseSsl(true);
		gnServerSettings.setUseHttp(true);
		gnServerSettings.setCodeCanSendNotAuthorized(decode([145, 2]) as []);
		gnServerSettings.setLogType(0);

		GNNetwork.init(gnServerSettings);
	}

	private totalServerRequestFailure = 0;
	private validateApp(forceUse: boolean): void {
		if (!forceUse) {
			this.verifyMinute -= 1;
			if (this.verifyMinute > 0) return;
		}

		this.verifyMinute = LicenseKeyApplication.VERIFY_MINUTE;

		if (this.totalServerRequestFailure > 10) {
			let newMaxCCU = 20;
			if (LicenseKeyApplication.maxCCU != newMaxCCU) {
				this.debug(VerifyServerApplicationErrorCode.NoLicenseKey, LicenseKeyApplication.maxCCU);
			}
		}
		let thiz = this;

		let authToken = GNNetwork.getAuthToken();
		if (!authToken) {
			let username = this.licenseKeyInfo.ProductId;
			let password = Md5Generate.getMd5(this.licenseKeyInfo.LicenseKey + this.licenseKeyInfo.UnformattedLicenseKey + "_" + this.licenseKeyInfo.ProductId);
			GNNetwork.accountLogin(username, password, (loginOperationResponse: LoginOperationResponse) => {
				if (!loginOperationResponse.hasError()) {
					thiz.validateApp(true);

					thiz.totalServerRequestFailure = 0;
				}
				else {
					setTimeout(() => {
						thiz.debug(VerifyServerApplicationErrorCode.LicenseKeyExpire, LicenseKeyApplication.maxCCU);
					}, 500);

					setTimeout(() => {
						thiz.validateApp(true);
					}, 5000);

					thiz.totalServerRequestFailure += 1;
				}
			});

			return;
		}

		let parameters = new GNHashtable();
		parameters.add(VerifyServerApplicationParameterCode.SessionId, this.sessionId);
		parameters.add(VerifyServerApplicationParameterCode.ProductId, this.licenseKeyInfo.ProductId);
		parameters.add(VerifyServerApplicationParameterCode.UnformattedLicenseKey, this.licenseKeyInfo.UnformattedLicenseKey);
		parameters.add(VerifyServerApplicationParameterCode.LicenseKey, this.licenseKeyInfo.LicenseKey);
		parameters.add(VerifyServerApplicationParameterCode.Secretkey, this.secretkey);
		parameters.add(VerifyServerApplicationParameterCode.Salt, this.salt);
		parameters.add(VerifyServerApplicationParameterCode.Port, this.port.toString());

		let request = new OperationRequest(OperationCodeExtensions.VerifyServerApplication, true);
		request.setParameters(parameters);

		GNNetwork.sendViaHttp(request, (operationResponse: OperationResponse) => {
			if (!operationResponse.hasError()) {
				let parameters = operationResponse.getParameters();

				let newMaxCCU = parameters.getNumber(VerifyServerApplicationParameterCode.MaxCCU, LicenseKeyApplication.maxCCU);

				if (LicenseKeyApplication.maxCCU != newMaxCCU) {
					let errorCode = parameters.getNumber(ParameterCode.ErrorCode);
					setTimeout(() => {
						thiz.debug(errorCode, LicenseKeyApplication.maxCCU);
					}, 500);
				}

				LicenseKeyApplication.maxCCU = newMaxCCU;

				thiz.totalServerRequestFailure = 0;
			}
			else {
				if (operationResponse.getReturnCode() == ReturnCode.OperationNotAuthorized) {
					setTimeout(() => {
						thiz.validateApp(true);
					}, 5000);
				}

				thiz.totalServerRequestFailure += 1;
			}
		});
	}

	private debug(errorCode: number, ccu: number): void {
		if (errorCode == VerifyServerApplicationErrorCode.NoLicenseKey) {
			Debug.log("[GN] No license Key found, maxCCU is " + ccu, "please try go https://gn.xmobitea.com to get free license key");
		} else if (errorCode == VerifyServerApplicationErrorCode.Ok) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " verify success, maxCCU is " + ((ccu == -1) ? "unlimited" : ccu));
		} else if (errorCode == VerifyServerApplicationErrorCode.OtherServerUseLicenseKey) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " invalid, maxCCU is " + ccu);
		} else if (errorCode == VerifyServerApplicationErrorCode.LicenseKeyInvalid) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " expired, maxCCU is " + ccu);
		} else if (errorCode == VerifyServerApplicationErrorCode.LicenseKeyExpire) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " does authentication error, resend after 5 seconds, maxCCU is " + ccu);
		} else {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " unknown error, maxCCU is " + ccu);
		}
	}

}
