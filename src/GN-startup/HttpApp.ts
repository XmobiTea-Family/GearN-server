import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";

import cors from "cors";
import express from "express";
import { Express } from "express";
import { GameApplication } from "./../GN-app-api/handler/GameApplication";
import { ReturnCode } from "./../GN-common/constant/ReturnCode";
import bodyParser from "body-parser-with-msgpack";

export class HttpApp {
	private appSettings: HttpAppSettings;
	private app: Express;

	public setApp(app: Express): void {
		this.app = app;
	}

	public setAppSettings(appSettings: HttpAppSettings): void {
		this.appSettings = appSettings;
	}

	public run(): void {
		// this.app.use(express.json());
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
		this.app.use(bodyParser.msgpack());

		this.app.get("/info", (req: express.Request, res: express.Response) => {
			return res.json([ReturnCode.Ok, "GN Server - Copyright XmobiTea 2022\nVersion: 1.0.0"]);
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

		if (this.appSettings.getEnable()) {
			let gameApplication = GameApplication.getInstance();

			let httpAppHandler = new HttpAppHandler();
			httpAppHandler.setRouter(this.app);
			httpAppHandler.setGameApplication(gameApplication);

			httpAppHandler.run();

			// this.app.get('/ahihi', (req, res) => {
			//     res.send('GN Server - ahihi');
			// });
		}
	}

	constructor() {}
}
