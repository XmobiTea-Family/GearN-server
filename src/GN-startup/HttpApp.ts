import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";

import cors from "cors";
import express from "express";
import { Express } from "express";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { GameApplication } from "./../GameApplication";

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

	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	public setAppSettings(appSettings: HttpAppSettings): void {
		this.appSettings = appSettings;
	}

	public setGameApplication(gameApplication: GameApplication): void {
		this.gameApplication = gameApplication;
	}

	public run(): void {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: false }));

		this.app.post("/", (req: express.Request, res: express.Response) => {
			return res.sendStatus(403);
		});

		this.app.get("/", (req: express.Request, res: express.Response) => {
			return res.send(
				'<a href="https://xmobitea.com"><h1 style="text-align:center;">XmobiTea</h1></a>' +
				'<h3 style="text-align:center;">-->==>>> [GN Server] <<<==<--</h3>' +
				'<h4 style="text-align:center;"> Version: ' + GameApplication.getServerVersion() + '</h4><br>' +
				'<h4 style="text-align:center;">©2022 <a href="https://xmobitea.com">XmobiTea Family</a></h4>'
				);
		});

		this.app.get("/ping", async function (req: express.Request, res: express.Response) {
			return res.sendStatus(200);
		});

		this.app.use(
			cors({
				origin: this.appSettings.getOrigin(),
				allowedHeaders: this.appSettings.getAllowedHeaders(),
				credentials: this.appSettings.getCredentials(),
				methods: this.appSettings.getMethods(),
			})
		);

		this.httpAppHandler = new HttpAppHandler();
		this.httpAppHandler.setRouter(this.app);
		this.httpAppHandler.setApiMiddleware(this.apiMiddleware);
		this.httpAppHandler.setGameApplication(this.gameApplication);
		this.httpAppHandler.setApiMiddleware(this.apiMiddleware);
		this.httpAppHandler.setEnableSendAndReceive(this.appSettings.getEnableSendAndReceive());

		if (this.appSettings.getEnable()) {
			this.httpAppHandler.run();
		}
	}

	constructor() {}
}
