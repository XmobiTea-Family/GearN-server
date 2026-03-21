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
	// Stores the application settings value used by this instance.
	private applicationSettings: ApplicationSettings;
	// Stores the upload file settings value used by this instance.
	private uploadFileSettings: UploadFileSettings;
	// Stores the app settings value used by this instance.
	private appSettings: HttpAppSettings;
	// Stores the socket app settings value used by this instance.
	private socketAppSettings: SocketAppSettings;
	// Stores the cluster settings value used by this instance.
	private clusterSettings: ClusterSettings;

	// Stores the app value used by this instance.
	private app: Express;
	// Stores the HTTP app handler value used by this instance.
	private httpAppHandler: HttpAppHandler;
	// Stores the upload file handler value used by this instance.
	private uploadFileHandler: UploadFileHandler;
	// Stores the cluster handler value used by this instance.
	private clusterHandler: ClusterHandler;

	// Stores the anti DDoS middleware value used by this instance.
	private antiDdosMiddleware: AntiDdosMiddleware;
	// Stores the log settings value used by this instance.
	private logSettings: LogSettings;

	// Stores the API middleware value used by this instance.
	private apiMiddleware: ApiMiddleware;
	// Stores the upload file middleware value used by this instance.
	private uploadFileMiddleware: UploadFileMiddleware;
	// Stores the GearN server value used by this instance.
	private gnServer: GNServer;

	// Stores the session ID value used by this instance.
	private sessionId: string;

	/**
	 * Sets the app.
	 * @param app Provides the app value used by this operation.
	 */
	public setApp(app: Express): void {
		this.app = app;
	}

	/**
	 * Returns the app.
	 * @returns Returns the app.
	 */
	public getApp(): Express {
		return this.app;
	}

	/**
	 * Returns the HTTP app handler.
	 * @returns Returns the HTTP app handler.
	 */
	public getHttpAppHandler(): HttpAppHandler {
		return this.httpAppHandler;
	}

	/**
	 * Returns the upload file handler.
	 * @returns Returns the upload file handler.
	 */
	public getUploadFileHandler(): UploadFileHandler {
		return this.uploadFileHandler;
	}

	/**
	 * Returns the cluster handler.
	 * @returns Returns the cluster handler.
	 */
	public getClusterHandler(): ClusterHandler {
		return this.clusterHandler;
	}

	/**
	 * Sets the API middleware.
	 * @param apiMiddleware Provides the API middleware value used by this operation.
	 */
	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	/**
	 * Sets the upload file middleware.
	 * @param uploadFileMiddleware Provides the upload file middleware value used by this operation.
	 */
	public setUploadFileMiddleware(uploadFileMiddleware: UploadFileMiddleware) {
		this.uploadFileMiddleware = uploadFileMiddleware;
	}

	/**
	 * Sets the application settings.
	 * @param applicationSettings Provides the application settings value used by this operation.
	 */
	public setApplicationSettings(applicationSettings: ApplicationSettings): void {
		this.applicationSettings = applicationSettings;
	}

	/**
	 * Sets the app settings.
	 * @param appSettings Provides the app settings value used by this operation.
	 */
	public setAppSettings(appSettings: HttpAppSettings): void {
		this.appSettings = appSettings;
	}

	/**
	 * Sets the socket app settings.
	 * @param socketAppSettings Provides the socket app settings value used by this operation.
	 */
	public setSocketAppSettings(socketAppSettings: SocketAppSettings): void {
		this.socketAppSettings = socketAppSettings;
	}

	/**
	 * Sets the cluster settings.
	 * @param clusterSettings Provides the cluster settings value used by this operation.
	 */
	public setClusterSettings(clusterSettings: ClusterSettings): void {
		this.clusterSettings = clusterSettings;
	}

	/**
	 * Sets the upload file settings.
	 * @param uploadFileSettings Provides the upload file settings value used by this operation.
	 */
	public setUploadFileSettings(uploadFileSettings: UploadFileSettings): void {
		this.uploadFileSettings = uploadFileSettings;
	}

	/**
	 * Sets the GearN server.
	 * @param gnServer Provides the GearN server value used by this operation.
	 */
	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	/**
	 * Sets the session ID.
	 * @param sessionId Provides the session ID value used by this operation.
	 */
	public setSessionId(sessionId: string): void {
		this.sessionId = sessionId;
	}

	/**
	 * Sets the anti DDoS middleware.
	 * @param antiDdosMiddleware Provides the anti DDoS middleware value used by this operation.
	 */
	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	/**
	 * Sets the log settings.
	 * @param logSettings Provides the log settings value used by this operation.
	 */
	public setLogSettings(logSettings: LogSettings): void {
		this.logSettings = logSettings;
	}

	/**
	 * Runs the current workflow.
	 */
	public run(): void {
		if (this.appSettings.getTrustProxy())
			this.app.enable("trust proxy");

		this.app.use(express.urlencoded({ extended: false }));

		this.app.get("/", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(403);
		});

		this.app.post("/", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(403);
		});
		// Tracks whether ed headers is allowed.
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

		this.app.post("/ping", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(200);
		});

		this.app.get("/ping", (req: express.Request, res: express.Response): any => {
			return res.sendStatus(200);
		});

		this.app.get("/healthcheck", (req: express.Request, res: express.Response): any => {

			// Stores the this instance value used in the current execution flow.
			let thisInstance = this.clusterHandler.getInstanceInfoStatus();
			// Stores the other instances value used in the current execution flow.
			let otherInstances = this.clusterHandler.getInstanceInfos();

			// Stores the this instance response data value used in the current execution flow.
			let thisInstanceResponseData: {
				// Stores the instance ID value used by this contract.
				instanceId: string,
				// Indicates whether primary.
				isPrimary: boolean,
				// Stores the current instance ID primary value used by this contract.
				currentInstanceIdPrimary: string,
				// Stores the current timestamp primary value used by this contract.
				currentTsPrimary: number,
				// Stores the current timestamp primary to date value used by this contract.
				currentTsPrimaryToDate: string,
				// Stores the timestamp primary value used by this contract.
				tsPrimary: number,
				// Stores the timestamp primary to date value used by this contract.
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

			// Stores the other instances response data value used in the current execution flow.
			let otherInstancesResponseData: {
				// Stores the instance ID value used by this contract.
				instanceId: string,
				// Indicates whether primary.
				isPrimary: boolean,
				// Stores the current instance ID primary value used by this contract.
				currentInstanceIdPrimary: string,
				// Stores the current timestamp primary value used by this contract.
				currentTsPrimary: number,
				// Stores the current timestamp primary to date value used by this contract.
				currentTsPrimaryToDate: string,
				// Stores the timestamp primary value used by this contract.
				tsPrimary: number,
				// Stores the timestamp primary to date value used by this contract.
				tsPrimaryToDate: string,
				// Stores the lost ping value used by this contract.
				lostPing: number,
			}[] = [];

			for (let i = 0; i < otherInstances.length; i++) {
				// Stores the other instance value used in the current execution flow.
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

	/**
	 * Initializes a new HTTP app instance.
	 */
	constructor() { }
}
