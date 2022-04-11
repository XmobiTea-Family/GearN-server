import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";
import { UploadFileHandler } from "./routes/UploadFileHandler";

import cors from "cors";
import express from "express";
import { Express } from "express";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { UploadFileMiddleware } from "./middleware/UploadFileMiddleware";
import { GameApplication } from "./../GameApplication";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { CreateNewFileUploadInfoRequestHandler } from "./../GN-app-api/handler/controller/handler/CreateNewFileUploadInfoRequestHandler";
import { GetFileUploadInfoRequestHandler } from "./../GN-app-api/handler/controller/handler/GetFileUploadInfoRequestHandler";

export class HttpApp {
	private uploadFileSettings: UploadFileSettings;
	private appSettings: HttpAppSettings;
	private app: Express;
	private httpAppHandler: HttpAppHandler;
	private uploadFileHandler: UploadFileHandler;

	private apiMiddleware: ApiMiddleware;
	private uploadFileMiddleware: UploadFileMiddleware;
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

	public getUploadFileHandler(): UploadFileHandler {
		return this.uploadFileHandler;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	public setUploadFileMiddleware(uploadFileMiddleware: UploadFileMiddleware) {
		this.uploadFileMiddleware = uploadFileMiddleware;
	}

	public setAppSettings(appSettings: HttpAppSettings): void {
		this.appSettings = appSettings;
	}

	public setUploadFileSettings(uploadFileSettings: UploadFileSettings): void {
		this.uploadFileSettings = uploadFileSettings;
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
					'<h4 style="text-align:center;"> Version: ' +
					GameApplication.getServerVersion() +
					"</h4><br>" +
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
		this.httpAppHandler.setEnableSendAndReceiveDebug(this.appSettings.getEnableSendAndReceiveDebug());

		if (this.appSettings.getEnable()) {
			this.httpAppHandler.run();
		}

		this.uploadFileHandler = new UploadFileHandler();
		this.uploadFileHandler.setRouter(this.app);
		this.uploadFileHandler.setApiMiddleware(this.apiMiddleware);
		this.uploadFileHandler.setUploadFileMiddleware(this.uploadFileMiddleware);
		this.uploadFileHandler.setUploadPath(this.uploadFileSettings.getUploadPath());

		this.uploadFileHandler.init();
		if (this.uploadFileSettings.getEnable()) {
			this.uploadFileHandler.run();

			this.gameApplication.addHandler(new CreateNewFileUploadInfoRequestHandler(this.gameApplication));
			this.gameApplication.addHandler(new GetFileUploadInfoRequestHandler(this.gameApplication));
		}
	}

	constructor() {}
}
