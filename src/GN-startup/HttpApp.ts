import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";

import cors from "cors";
import express from "express";
import { Express } from "express";
import { ReturnCode } from "./../GN-common/constant/ReturnCode";
import bodyParser from "body-parser-with-msgpack";
import { ApiMiddleware } from "./middleware/ApiMiddleware";

export class HttpApp {
	private appSettings: HttpAppSettings;
	private app: Express;
	private httpAppHandler: HttpAppHandler;
	private apiMiddleware: ApiMiddleware;

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

		this.app.get("/ts", (req: express.Request, res: express.Response) => {
			return res.json([ReturnCode.Ok, new Date().getTime()]);
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

		if (this.appSettings.getEnable()) {
			this.httpAppHandler.run();
		}
	}

	constructor() {}
}
