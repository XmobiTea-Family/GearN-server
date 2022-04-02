import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";

import cors from "cors";
import express from "express";
import { Express } from "express";
import { ReturnCode } from "./../GN-common/constant/ReturnCode";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { GameApplication } from "../GameApplication";

export class HttpApp {
	private appSettings: HttpAppSettings;
	private app: Express;
	private httpAppHandler: HttpAppHandler;
	private apiMiddleware: ApiMiddleware;
	private gameApplication: GameApplication;

	public setApp(app: Express): void {
		this.app = app;
	}

	public getApp(): Express {
		return this.app;
	}

	public getHttpAppHandler(): HttpAppHandler {
		return this.httpAppHandler;
	}

	public getApiMiddleware(): ApiMiddleware {
		return this.apiMiddleware;
	}

	public setAppSettings(appSettings: HttpAppSettings): void {
		this.appSettings = appSettings;
	}

	public setGameApplication(gameApplication: GameApplication): void {
		this.gameApplication = gameApplication;
	}

	public run(): void {
		this.app.use(express.json());

		this.app.get("/info", (req: express.Request, res: express.Response) => {
			return res.json([ReturnCode.Ok, {0: "GN Server - Copyright XmobiTea 2022\nVersion: 1.0.0"}]);
		});

		this.app.get("/ping", async function (req: express.Request, res: express.Response) {
			return res.sendStatus(200);
		});

		this.app.get("/", (req: express.Request, res: express.Response) => {
			return res.sendStatus(403);
		});

		this.app.post("/", (req: express.Request, res: express.Response) => {
			return res.sendStatus(403);
		});

		this.app.use(
			cors({
				origin: this.appSettings.getOrigin(),
				allowedHeaders: this.appSettings.getAllowedHeaders(),
				credentials: this.appSettings.getCredentials(),
				methods: this.appSettings.getMethods(),
			})
		);

		this.apiMiddleware = new ApiMiddleware();
		this.apiMiddleware.run();

		this.httpAppHandler = new HttpAppHandler();
		this.httpAppHandler.setRouter(this.app);
		this.httpAppHandler.setApiMiddleware(this.apiMiddleware);
		this.httpAppHandler.setGameApplication(this.gameApplication);
		
		if (this.appSettings.getEnable()) {
			this.httpAppHandler.run();
		}
	}

	constructor() {}
}
