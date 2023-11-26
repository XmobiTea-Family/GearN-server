import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";
import { UploadFileHandler } from "./routes/UploadFileHandler";

import cors from "cors";
import express, { Express } from "express";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { UploadFileMiddleware } from "./middleware/UploadFileMiddleware";
import { GNServer } from "./../GNServer";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ApplicationSettings } from "./settings/ApplicationSettings";
import { LogSettings } from "./settings/LogSettings";

export class HttpApp {
	private applicationSettings: ApplicationSettings;
	private uploadFileSettings: UploadFileSettings;
	private appSettings: HttpAppSettings;
	private socketAppSettings: SocketAppSettings;
	private app: Express;
	private httpAppHandler: HttpAppHandler;
	private uploadFileHandler: UploadFileHandler;

	private antiDdosMiddleware: AntiDdosMiddleware;
	private logSettings: LogSettings;

	private apiMiddleware: ApiMiddleware;
	private uploadFileMiddleware: UploadFileMiddleware;
	private gnServer: GNServer;

	private sessionId: string;

	public setApp(app: Express): void {
		this.app = app;
	}

	public getApp(): Express {
		return this.app;
	}

	public getHttpAppHandler(): HttpAppHandler {
		return this.httpAppHandler;
	}

	public getUploadFileHandler(): UploadFileHandler {
		return this.uploadFileHandler;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	public setUploadFileMiddleware(uploadFileMiddleware: UploadFileMiddleware) {
		this.uploadFileMiddleware = uploadFileMiddleware;
	}

	public setApplicationSettings(applicationSettings: ApplicationSettings): void {
		this.applicationSettings = applicationSettings;
	}

	public setAppSettings(appSettings: HttpAppSettings): void {
		this.appSettings = appSettings;
	}

	public setSocketAppSettings(socketAppSettings: SocketAppSettings): void {
		this.socketAppSettings = socketAppSettings;
	}

	public setUploadFileSettings(uploadFileSettings: UploadFileSettings): void {
		this.uploadFileSettings = uploadFileSettings;
	}

	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	public setSessionId(sessionId: string): void {
		this.sessionId = sessionId;
	}

	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	public setLogSettings(logSettings: LogSettings): void {
		this.logSettings = logSettings;
	}

	public run(): void {
		this.app.use(express.urlencoded({ extended: false }));

		this.app.post("/", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(403);
		});

		this.app.get("/", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(403);
		});

		this.app.get("/ping", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(200);
		});

		let allowedHeaders = this.appSettings.getAllowedHeaders();
		allowedHeaders.push(this.sessionId);

		this.app.use(
			cors({
				origin: this.appSettings.getOrigin(),
				allowedHeaders: allowedHeaders,
				credentials: this.appSettings.getCredentials(),
				methods: this.appSettings.getMethods(),
			})
		);

		this.httpAppHandler = new HttpAppHandler();
		this.httpAppHandler.setRouter(this.app);
		this.httpAppHandler.setApiMiddleware(this.apiMiddleware);
		this.httpAppHandler.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.httpAppHandler.setGNServer(this.gnServer);
		this.httpAppHandler.setEnableSendAndReceiveDebug(this.appSettings.getEnableSendAndReceiveDebug());
		this.httpAppHandler.setEnablePostViaMsgPack(this.appSettings.getEnablePostViaMsgPack());
		this.httpAppHandler.setEnablePostViaJson(this.appSettings.getEnablePostViaJson());

		if (this.appSettings.getEnable()) {
			this.httpAppHandler.run();
		}

		this.uploadFileHandler = new UploadFileHandler();
		this.uploadFileHandler.setRouter(this.app);
		this.uploadFileHandler.setApiMiddleware(this.apiMiddleware);
		this.uploadFileHandler.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.uploadFileHandler.setUploadFileMiddleware(this.uploadFileMiddleware);
		this.uploadFileHandler.setUploadPath(this.uploadFileSettings.getUploadPath());

		this.uploadFileHandler.init();
		if (this.uploadFileSettings.getEnable()) {
			this.uploadFileHandler.run();
		}
	}

	constructor() { }
}
