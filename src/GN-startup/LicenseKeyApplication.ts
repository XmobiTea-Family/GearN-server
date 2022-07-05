const VERIFY_MINUTE = 5;

import http from "http";
import { GameApplication } from "./../GameApplication";
import { Express } from "express";
import express from "express";
import axios from "axios";
import { wrap } from "async-middleware";
import { Debug } from "./../GN-library/xdebug/lib/xDebug";
import fs from "fs";
import { OperationCode } from "./../GN-common/constant/OperationCode";
import { GNHashtable } from "./../GN-common/common/GNData";
import { LoginParameterCode } from "./../GN-common/constant/parameterCode/LoginParameterCode";
import { LoginType } from "./../GN-common/constant/enumType/LoginType";
import { Md5Generate } from "./../GN-common/helper/Md5Generate";
import { ReturnCode } from "./../GN-common/constant/ReturnCode";
import { ParameterCode } from "./../GN-common/constant/parameterCode/ParameterCode";

class VerifyApi {
	private static readonly BaseUrl: string = "https://dev.xmobitea.com/gnserver";

	private static authToken: string;

	private static async send(subUri: string, postData: any): Promise<{ [k: string]: any }> {
		let headers: any = {
			"Content-Type": "application/json",
		};

		if (this.authToken) {
			headers["a"] = this.authToken as string;
		}

		let answer: { [k: string]: any } = {};

		try {
			let result = await axios.post(this.BaseUrl + "/" + subUri, postData, {
				headers: headers,
			});
			answer = result.data;
		} catch (error) {
			answer["error"] = error;
		}

		return answer;
	}

	private static async sendRequestViaJson(code: number, postData: any): Promise<{ [k: string]: any }> {
		return await this.send("0/" + code, postData);
	}

	public static async authentication(licenseKeyInfo: LicenseKeyInfo, callback: (authenticationSuccess: boolean) => void) {
		let postData = new GNHashtable();
		postData.add(LoginParameterCode.LoginType, LoginType.Account);
		postData.add(LoginParameterCode.Username, licenseKeyInfo.ProductId);
		postData.add(
			LoginParameterCode.Password,
			Md5Generate.getMd5(licenseKeyInfo.LicenseKey + licenseKeyInfo.UnformattedLicenseKey + "_" + licenseKeyInfo.ProductId)
		);

		let answer = await this.sendRequestViaJson(OperationCode.Login, postData.toData());
		if (answer.error) {
			callback(false);
		} else {
			try {
				let returnData = JSON.parse(answer as any);
				let returnCode = returnData[0] as number;
				if (returnCode == ReturnCode.Ok) {
					let parameters = JSON.parse(returnData[1]);

					this.authToken = parameters[ParameterCode.AuthToken.toString()];
					callback(true);
				} else {
					callback(false);
				}
			} catch (err) {
				Debug.logError("authentication ", err);
				callback(false);
			}
		}
	}

	public static async verifyServerApplication(
		licenseKeyInfo: LicenseKeyInfo,
		sessionId: string,
		secretkey: string,
		salt: string,
		port: string,
		callback: (gnHashtable: GNHashtable) => void
	) {
		let postData = new GNHashtable();

		postData.add(1, sessionId);
		postData.add(2, licenseKeyInfo.ProductId);
		postData.add(3, licenseKeyInfo.UnformattedLicenseKey);
		postData.add(4, licenseKeyInfo.LicenseKey);
		postData.add(6, secretkey);
		postData.add(7, salt);
		postData.add(8, port);

		let answer = await this.sendRequestViaJson(12, postData.toData());
		if (answer.error) {
			callback(null);
		} else {
			try {
				let gnHashtable = new GNHashtable();

				let returnData = JSON.parse(answer as any);
				let returnCode = returnData[0] as number;
				if (returnCode == ReturnCode.Ok) {
					let parameters = JSON.parse(returnData[1]);

					let keys = Object.keys(parameters);
					for (let i = 0; i < keys.length; i++) {
						let key = keys[i];
						if (isNaN(key as any)) continue;

						let keyInt = Number.parseInt(key);
						gnHashtable.add(keyInt, parameters[key]);
					}

					callback(gnHashtable);
				} else {
					callback(gnHashtable);
				}
			} catch (err) {
				Debug.logError("authentication ", err);
				callback(null);
			}
		}
	}
}

interface LicenseKeyInfo {
	ProjectName?: string;
	ProductId: string;
	UnformattedLicenseKey: string;
	LicenseKey: string;
}

export class LicenseKeyApplication {
	private sessionId: string;
	private secretId: string;
	private secretkey: string;
	private salt: string;

	private licenseKeyFilePath: string;
	private server: http.Server;
	private gameApplication: GameApplication;
	private app: Express;

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

	public setGameApplication(gameApplication: GameApplication): void {
		this.gameApplication = gameApplication;
	}

	public setApp(app: Express): void {
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

	public static GetMaxCCU(): number {
		return this.maxCCU;
	}

	public run(): void {
		const verifyRouter = express.Router();
		verifyRouter.use(express.json());

		this.app.use(
			"/manager",
			wrap((req, res, next) => {
				let secretId = req.headers[this.sessionId];

				if (this.secretId === secretId) return next();
				return res.status(403);
			}),
			verifyRouter
		);

		verifyRouter.post("/forcestop", async (req: express.Request, res: express.Response) => {
			this.server.emit("close");
			this.server.close(() => {
				Debug.log("[GN] Server force stopped");
			});

			res.sendStatus(200);
		});

		if (!this.server) {
			throw new Error("Server null");
		}

		if (!this.gameApplication) {
			throw new Error("Game Application null");
		}

		if (!this.licenseKeyFilePath) {
			// this is no license key
			LicenseKeyApplication.maxCCU = 20;

			setTimeout(() => {
				this.debug(-1, LicenseKeyApplication.maxCCU);
			}, 500);
		} else {
			let allLines = fs.readFileSync(this.licenseKeyFilePath).toString("utf-8");

			this.licenseKeyInfo = {
				ProjectName: allLines[0],
				ProductId: allLines[1],
				UnformattedLicenseKey: allLines[2],
				LicenseKey: allLines[3],
			};

			setTimeout(() => {
				this.authenticationApp();
			}, 500);
		}
	}

	private authenticationApp() {
		VerifyApi.authentication(this.licenseKeyInfo, (authenticationSuccess) => {
			if (authenticationSuccess) {
				LicenseKeyApplication.maxCCU = 50;

				this.validateApp();

				this.gameApplication.getTimerService().subscriberEveryMinute(() => {
					this.validateApp();
				});
			}
			else {
				setTimeout(() => {
					this.debug(4, LicenseKeyApplication.maxCCU);
				}, 500);

				setTimeout(() => {
					this.authenticationApp();
				}, 5000);
			}
		});
	}

	private validateApp() {
		this.verifyMinute -= 1;
		if (this.verifyMinute > 0) return;

		this.verifyMinute = VERIFY_MINUTE;

		VerifyApi.verifyServerApplication(this.licenseKeyInfo, this.sessionId, this.secretkey, this.salt, this.port.toString(), (gnHashtable) => {
			if (gnHashtable) {
				let newMaxCCU = gnHashtable.getNumber(5, LicenseKeyApplication.maxCCU);

				if (LicenseKeyApplication.maxCCU != newMaxCCU) {
					let errorCode = gnHashtable.getNumber(0);
					setTimeout(() => {
						this.debug(errorCode, LicenseKeyApplication.maxCCU);
					}, 500);
				}

				LicenseKeyApplication.maxCCU = newMaxCCU;
			}
		});
	}

	private debug(errorCode: number, ccu: number) {
		if (errorCode == -1) {
			Debug.log("[GN] No license Key found, maxCCU is " + ccu, "please try go https://gn.xmobitea.com to get free license key");
		} else if (errorCode == 1) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " verify success, maxCCU is " + ccu);
		} else if (errorCode == 2) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " invalid, maxCCU is " + ccu);
		} else if (errorCode == 3) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " expired, maxCCU is " + ccu);
		} else if (errorCode == 4) {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " does authentication error, resend after 5 seconds, maxCCU is " + ccu);
		} else {
			Debug.log("[GN] License Key with id " + this.licenseKeyInfo.ProductId + " unknown error, maxCCU is " + ccu);
		}
	}
}
