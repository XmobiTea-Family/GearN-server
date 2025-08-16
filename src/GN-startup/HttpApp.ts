import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";
import { UploadFileHandler } from "./routes/UploadFileHandler";
import { ClusterHandler } from "./routes/ClusterHandler";

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
import { ClusterSettings } from "./settings/ClusterSettings";

export class HttpApp {
	private applicationSettings: ApplicationSettings;
	private uploadFileSettings: UploadFileSettings;
	private appSettings: HttpAppSettings;
	private socketAppSettings: SocketAppSettings;
	private clusterSettings: ClusterSettings;

	private app: Express;
	private httpAppHandler: HttpAppHandler;
	private uploadFileHandler: UploadFileHandler;
	private clusterHandler: ClusterHandler;

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

	public getClusterHandler(): ClusterHandler {
		return this.clusterHandler;
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

	public setClusterSettings(clusterSettings: ClusterSettings): void {
		this.clusterSettings = clusterSettings;
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

		this.app.get("/", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(403);
		});

		this.app.post("/", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(403);
		});

		this.app.post("/ping", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(200);
		});

		this.app.get("/ping", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(200);
		});

		this.app.get("/healthCheck", (req: express.Request, res: express.Response): any => {

			let thisInstance = this.clusterHandler.getInstanceInfoStatus();
			let otherInstances = this.clusterHandler.getInstanceInfos();

			let thisInstanceResponseData: {
				instanceId: string,
				isPrimary: boolean,
				currentInstanceIdPrimary: string,
				currentTsPrimary: number,
				currentTsPrimaryToDate: string,
				tsPrimary: number,
				tsPrimaryToDate: string,
			} = {
				instanceId: thisInstance.instanceId,
				isPrimary: thisInstance.isPrimary,
				currentInstanceIdPrimary: thisInstance.currentInstanceIdPrimary,
				currentTsPrimary: thisInstance.currentTsPrimary,
				currentTsPrimaryToDate: new Date(thisInstance.currentTsPrimary).toLocaleString(),
				tsPrimary: thisInstance.tsPrimary,
				tsPrimaryToDate: new Date(thisInstance.tsPrimary).toLocaleString(),
			};

			let otherInstancesResponseData: {
				instanceId: string,
				isPrimary: boolean,
				currentInstanceIdPrimary: string,
				currentTsPrimary: number,
				currentTsPrimaryToDate: string,
				tsPrimary: number,
				tsPrimaryToDate: string,
				lostPing: number,
			}[] = [];

			for (let i = 0; i < otherInstances.length; i++) {
				let otherInstance = otherInstances[i];

				otherInstancesResponseData.push({
					instanceId: otherInstance.instanceId,
					isPrimary: otherInstance.isPrimary,
					currentInstanceIdPrimary: otherInstance.currentInstanceIdPrimary,
					currentTsPrimary: otherInstance.currentTsPrimary,
					currentTsPrimaryToDate: new Date(otherInstance.currentTsPrimary).toLocaleString(),
					tsPrimary: otherInstance.tsPrimary,
					tsPrimaryToDate: new Date(otherInstance.tsPrimary).toLocaleString(),
					lostPing: otherInstance.lostPing,
				});
			}

			return res.status(200).json({
				data: {
					thisInstance: thisInstanceResponseData,
					otherInstances: otherInstancesResponseData,
				}
			});
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

		this.clusterHandler = new ClusterHandler();
		this.clusterHandler.setRouter(this.app);
		this.clusterHandler.setInstanceId(this.clusterSettings.getInstanceId());
		this.clusterHandler.setIsPrimary(this.clusterSettings.getIsPrimary());
		this.clusterHandler.setPrivateKeyToken(this.clusterSettings.getPrivateKeyToken());
		this.clusterHandler.setAllNodes(this.clusterSettings.getAllNodes());

		this.clusterHandler.init();
		this.clusterHandler.run();
	}

	constructor() { }
}
