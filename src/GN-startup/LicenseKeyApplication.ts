import http from "http";
import { GameApplication } from "./../GameApplication";
import { Express } from "express";
import express from "express";
import axios from "axios";
import { wrap } from "async-middleware";
import { nanoid } from "nanoid";
import { Debug } from "./../GN-library/xdebug/lib/xDebug";

class VerifyApi {
    private static readonly BaseUrl: string = "https://xmobitea.com";

    private static authToken: string;

    public static setAuthToken(authToken: string): void {
        this.authToken = authToken;
    }

    private static async send(subUri: string, postData: any): Promise<{ [k: string]: any }> {
        let headers = {
            'Content-Type': 'application/json',
            'a': this.authToken as string
        }

		let answer: { [k: string]: any } = {};

		try {
			let result = await axios.post(this.BaseUrl + "/" + subUri, postData, {
                headers: headers
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

    private static async makeSureStopApp(stopCode: string): Promise<{ [k: string]: any } {
        return await this.sendRequestViaJson(0, { 0: stopCode });
    }
}

export class LicenseKeyApplication {
    private sessionId: string;
    private secondId: string;

    private licenseKeyFilePath: string;
    private server: http.Server;
    private gameApplication: GameApplication;
	private app: Express;

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

    public run(): void {
        this.sessionId = nanoid(10);
        this.secondId = nanoid(15);
        
        Debug.log("[GN] SessionId is " + this.sessionId);

        const verifyRouter = express.Router();
        verifyRouter.use(express.json());

        this.app.use(
            "/verify",
            wrap((req, res, next) => {
                return this.apiMiddleware.authenticateTokenViaJson(req, res, next);
            }),
            verifyRouter
        );

        verifyRouter.post("/stop", async (req: express.Request, res: express.Response) => {

        });

        if (!this.licenseKeyFilePath) {
            // this is free
        }
        
        if (!this.server) {
            throw new Error("Server null");
        }

        if (!this.gameApplication) {
            throw new Error("Game Application null");
        }

        this.gameApplication.getTimerService().subscriberEveryMinute(() => {
            this.validateApp();
        });
    }

    private validateApp() {
        
    }
}
