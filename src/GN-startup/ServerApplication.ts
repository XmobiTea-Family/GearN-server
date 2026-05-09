import { IBuilder } from "./../GN-library/xbuilder/lib/IBuilder";
import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";

import { HttpApp } from "./HttpApp";
import { SocketApp } from "./SocketApp";

import express from "express";
import { Express } from "express";
import http from "http";
import https from "https";
import fs from "fs";
import { GNServer } from "./../GNServer";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { OtherSettings } from "./settings/OtherSettings";
import { AppleService } from "./../GN-app-api/service/AppleService";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { Debug } from "./../GN-library/xdebug/lib/xDebug";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { UploadFileMiddleware } from "./middleware/UploadFileMiddleware";
import { Md5Generate } from "./../GN-common/helper/Md5Generate";
import { DdosSettings } from "./settings/DDosSettings";
import { ClusterSettings } from "./settings/ClusterSettings";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { GoogleService } from "./../GN-app-api/service/GoogleService";
import { PushNotificationService } from "./../GN-app-api/service/PushNotificationService";
import { CloudScriptService } from "./../GN-app-api/service/CloudScriptService";
import { CloudScriptEventService } from "./../GN-app-api/service/CloudScriptEventService";
import { GooglePlayGameService } from "./../GN-app-api/service/GooglePlayGameService";
import { GameCenterService } from "./../GN-app-api/service/GameCenterService";
import { CountryIPDetailService } from "./../GN-app-api/service/CountryIPDetailService";
import { EmailService } from "./../GN-app-api/service/EmailService";
import { CacheService, ICacheServiceController, MemoryCacheServiceController, MongoDbCacheServiceController } from "./../GN-app-api/service/CacheService";
import { ConfigService } from "./../GN-app-api/service/ConfigService";
import { StringUtility } from "./../GN-common/helper/StringUtility";

import bcrypt from "bcrypt";
import { SecretInfo, SecretRole } from "./../GN-common/entity/SecretInfo";
import { SecretInfoItem } from "./../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { MasterGameSettings } from "./../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterGameSettings";
import { FacebookService } from "./../GN-app-api/service/FacebookService";
import { GameItem } from "./../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";
import { CreateSecretInfoRequestHandler } from "./../GN-app-api/handler/controller/handler/dashboard/CreateSecretInfoRequestHandler";
import { xDatetime } from "./../GN-library/xdatetime/lib/xDatetime";
import { EventCallbackCloudScriptService, PostEventCallbackService, PreEventCallbackService } from "./../GN-app-api/service/EventCallbackService";
import { GNServerSettingsOptions, LogType, MessageType } from "@xmobitea/gearn-typescript-client-sdk";

abstract class BuilderBase {
	// Stores the application settings value used by this instance.
	protected applicationSettings: ApplicationSettings;
	// Stores the HTTP app settings value used by this instance.
	protected httpAppSettings: HttpAppSettings;
	// Stores the socket app settings value used by this instance.
	protected socketAppSettings: SocketAppSettings;
	// Stores the database settings value used by this instance.
	protected databaseSettings: DatabaseSettings;
	// Stores the other settings value used by this instance.
	protected otherSettings: OtherSettings;
	// Stores the log settings value used by this instance.
	protected logSettings: LogSettings;
	// Stores the upload file settings value used by this instance.
	protected uploadFileSettings: UploadFileSettings;
	// Stores the DDoS settings value used by this instance.
	protected ddosSettings: DdosSettings;
	// Stores the cluster settings value used by this instance.
	protected clusterSettings: ClusterSettings;

	/**
	 * Returns the application settings.
	 * @returns Returns the application settings.
	 */
	public getApplicationSettings(): ApplicationSettings {
		return this.applicationSettings;
	}

	/**
	 * Returns the HTTP app settings.
	 * @returns Returns the HTTP app settings.
	 */
	public getHttpAppSettings(): HttpAppSettings {
		return this.httpAppSettings;
	}

	/**
	 * Returns the socket app settings.
	 * @returns Returns the socket app settings.
	 */
	public getSocketAppSettings(): SocketAppSettings {
		return this.socketAppSettings;
	}

	/**
	 * Returns the database settings.
	 * @returns Returns the database settings.
	 */
	public getDatabaseSettings(): DatabaseSettings {
		return this.databaseSettings;
	}

	/**
	 * Returns the other settings.
	 * @returns Returns the other settings.
	 */
	public getOtherSettings(): OtherSettings {
		return this.otherSettings;
	}

	/**
	 * Returns the log settings.
	 * @returns Returns the log settings.
	 */
	public getLogSettings(): LogSettings {
		return this.logSettings;
	}

	/**
	 * Returns the upload file settings.
	 * @returns Returns the upload file settings.
	 */
	public getUploadFileSettings(): UploadFileSettings {
		return this.uploadFileSettings;
	}

	/**
	 * Returns the DDoS settings.
	 * @returns Returns the DDoS settings.
	 */
	public getDdosSettings(): DdosSettings {
		return this.ddosSettings;
	}

	/**
	 * Returns the cluster settings.
	 * @returns Returns the cluster settings.
	 */
	public getClusterSettings(): ClusterSettings {
		return this.clusterSettings;
	}

	/**
	 * Initializes a new builder base instance.
	 */
	constructor() { }
}

class Builder extends BuilderBase implements IBuilder<ServerApplication> {
	/**
	 * Sets the application settings.
	 * @param applicationSettings Provides the application settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setApplicationSettings(applicationSettings: ApplicationSettings): Builder {
		this.applicationSettings = applicationSettings;
		return this;
	}

	/**
	 * Sets the HTTP app settings.
	 * @param httpAppSettings Provides the HTTP app settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setHttpAppSettings(httpAppSettings: HttpAppSettings): Builder {
		this.httpAppSettings = httpAppSettings;
		return this;
	}

	/**
	 * Sets the socket app settings.
	 * @param socketAppSettings Provides the socket app settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSocketAppSettings(socketAppSettings: SocketAppSettings): Builder {
		this.socketAppSettings = socketAppSettings;
		return this;
	}

	/**
	 * Sets the database settings.
	 * @param databaseSettings Provides the database settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setDatabaseSettings(databaseSettings: DatabaseSettings): Builder {
		this.databaseSettings = databaseSettings;
		return this;
	}

	/**
	 * Sets the other settings.
	 * @param otherSettings Provides the other settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setOtherSettings(otherSettings: OtherSettings): Builder {
		this.otherSettings = otherSettings;
		return this;
	}

	/**
	 * Sets the log settings.
	 * @param logSettings Provides the log settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setLogSettings(logSettings: LogSettings): Builder {
		this.logSettings = logSettings;
		return this;
	}

	/**
	 * Sets the upload file settings.
	 * @param uploadFileSettings Provides the upload file settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setUploadFileSettings(uploadFileSettings: UploadFileSettings): Builder {
		this.uploadFileSettings = uploadFileSettings;
		return this;
	}

	/**
	 * Sets the DDoS settings.
	 * @param ddosSettings Provides the DDoS settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setDdosSettings(ddosSettings: DdosSettings): Builder {
		this.ddosSettings = ddosSettings;
		return this;
	}

	/**
	 * Sets the cluster settings.
	 * @param clusterSettings Provides the cluster settings value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setClusterSettings(clusterSettings: ClusterSettings): Builder {
		this.clusterSettings = clusterSettings;
		return this;
	}

	/**
	 * Builds the configured instance.
	 */
	public build() {
		return new ServerApplication(this);
	}

	/**
	 * Initializes a new builder instance.
	 */
	constructor() {
		super();
	}
}

/**
 * Owns the full startup pipeline after settings have been materialized by `ServerApplicationStartup`.
 */
export class ServerApplication extends BuilderBase {
	// Stores the HTTP app value used by this instance.
	private httpApp: HttpApp;
	// Stores the socket app value used by this instance.
	private socketApp: SocketApp;
	// Stores the GearN server value used by this instance.
	private gnServer: GNServer;
	// Stores the API middleware value used by this instance.
	private apiMiddleware: ApiMiddleware;
	// Stores the anti DDoS middleware value used by this instance.
	private antiDdosMiddleware: AntiDdosMiddleware;
	// Stores the upload file middleware value used by this instance.
	private uploadFileMiddleware: UploadFileMiddleware;

	// Stores the session ID value used by this instance.
	private sessionId: string;
	// Stores the secretkey value used by this instance.
	private secretkey: string;
	// Stores the secret ID value used by this instance.
	private secretId: string;

	/**
	 * Wires middleware, transports, database bootstrap, and runtime services, then starts listening.
	 * @param onRunSuccess Provides the callback executed after a successful startup.
	 */
	public async run(onRunSuccess?: OnRunSuccess): Promise<void> {
		// Generate per-process identifiers used by the transport layer and default secret bootstrap.
		let salt = StringUtility.generateRandomString(10, 0);
		this.sessionId = StringUtility.generateRandomString(15, 0);
		this.secretkey = StringUtility.generateRandomString(20, 0);
		this.secretId = Md5Generate.getMd5(this.secretkey + salt + this.secretkey + salt + this.sessionId);

		// Accept either an absolute log path or a path relative to the current working directory.
		let configFullLogPath = this.getLogSettings().getLogPath();
		let fullLogPath = configFullLogPath;
		if (fullLogPath) {
			if (!fs.existsSync(fullLogPath)) {
				fullLogPath = process.cwd() + "/" + configFullLogPath;
			}
		}

		console.log("[GearN] FullLogPath at: " + fullLogPath);

		Debug.init({
			isLogToConsoleEnable: this.getLogSettings().getLogToConsoleEnable(),
			isLogToFileEnable: this.getLogSettings().getLogToFileEnable(),
			logPath: fullLogPath,
		});
		Debug.run();

		Debug.log("[GearN XmobiTea] -->>==>>>--<<<==<<-- [GN XmobiTea]");

		const port = this.getApplicationSettings().getPort();
		Debug.log("[GearN] Try run server on the port " + port);

		const socketPort = this.getApplicationSettings().getSocketPort();
		Debug.log("[GearN] Try run socket server on the port " + socketPort);

		const app = express();
		const server = this.getServer(app, this.getApplicationSettings());

		// Reuse the HTTP server when both transports share a port; otherwise spin up a dedicated socket server.
		const useOtherSocketServer = this.getApplicationSettings().getPort() != this.getApplicationSettings().getSocketPort() && this.getSocketAppSettings().getEnable();
		const socketServer = useOtherSocketServer ? http.createServer() : server;

		// Initialize shared middleware first so HTTP and socket transports read the same runtime rules.
		this.uploadFileMiddleware = this.newUploadMiddleware();
		this.uploadFileMiddleware.setMaxSizeUpload(this.getUploadFileSettings().getMaxSizeUpload());
		this.uploadFileMiddleware.setMimeTypeAccepts(this.getUploadFileSettings().getMimeTypeAccepts());
		this.uploadFileMiddleware.setUploadPath(this.getUploadFileSettings().getUploadPath());
		this.uploadFileMiddleware.run();

		this.apiMiddleware = this.newApiMiddleware();
		this.apiMiddleware.run();

		this.antiDdosMiddleware = this.newAntiDdosMiddleware();
		this.antiDdosMiddleware.setSocketMaxRequestPerSecondPerIp(this.getDdosSettings().getSocketMaxRequestPerSecondPerIp());
		this.antiDdosMiddleware.setSocketMaxRequestPerSecondPerPeer(this.getDdosSettings().getSocketMaxRequestPerSecondPerPeer());
		this.antiDdosMiddleware.setSocketMaxPendingRequest(this.getDdosSettings().getSocketMaxPendingRequest());
		this.antiDdosMiddleware.setSocketMaxRequestSize(this.getDdosSettings().getSocketMaxRequestSize());
		this.antiDdosMiddleware.setHttpMaxRequestPerSecondPerIp(this.getDdosSettings().getHttpMaxRequestPerSecondPerIp());
		this.antiDdosMiddleware.setHttpMaxRequestPerSecondPerPeer(this.getDdosSettings().getHttpMaxRequestPerSecondPerPeer());
		this.antiDdosMiddleware.setHttpMaxPendingRequest(this.getDdosSettings().getHttpMaxPendingRequest());
		this.antiDdosMiddleware.setHttpMaxRequestSize(this.getDdosSettings().getHttpMaxRequestSize());
		this.antiDdosMiddleware.setMaxUploadPendingRequest(this.getDdosSettings().getMaxUploadPendingRequest());
		this.antiDdosMiddleware.setMaxDownloadPendingRequest(this.getDdosSettings().getMaxDownloadPendingRequest());
		this.antiDdosMiddleware.setIPWhiteList(this.getDdosSettings().getIPWhiteList());
		this.antiDdosMiddleware.run();

		this.gnServer = this.newGNServer();
		this.gnServer.setApiMiddleware(this.apiMiddleware);
		this.apiMiddleware.setGameIds(this.gnServer.getGameIds());

		this.httpApp = this.newHttpApp();
		this.httpApp.setApiMiddleware(this.apiMiddleware);
		this.httpApp.setUploadFileMiddleware(this.uploadFileMiddleware);
		this.httpApp.setApplicationSettings(this.applicationSettings);
		this.httpApp.setAppSettings(this.getHttpAppSettings());
		this.httpApp.setSocketAppSettings(this.getSocketAppSettings());
		this.httpApp.setUploadFileSettings(this.getUploadFileSettings());
		this.httpApp.setClusterSettings(this.getClusterSettings());
		this.httpApp.setApp(app);
		this.httpApp.setGNServer(this.gnServer);
		this.httpApp.setSessionId(this.sessionId);
		this.httpApp.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.httpApp.setLogSettings(this.logSettings);
		this.httpApp.run();

		this.socketApp = this.newSocketApp();
		this.socketApp.setApiMiddleware(this.apiMiddleware);
		this.socketApp.setAppSettings(this.getSocketAppSettings());
		this.socketApp.setServer(socketServer);
		this.socketApp.setGNServer(this.gnServer);
		this.socketApp.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.socketApp.run();

		this.gnServer.setHttpApp(this.httpApp);
		this.gnServer.setSocketApp(this.socketApp);

		this.gnServer.getDatabase().run(
			() => {
				Debug.log("[GearN] Database run success");
			},
			(err) => {
				Debug.logError("[GearN] Database connect error " + err);
			}
		);

		// Core middleware depends on a few system collections before any request is dispatched.
		let authInfoCollection = this.gnServer.getDatabase().systemCollection("AuthInfo");
		this.apiMiddleware.setAuthInfoCollection(authInfoCollection);

		// Despite the old variable name, authentication resolves against the global `MasterPlayer` account collection.
		let playerGameCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");
		this.apiMiddleware.setPlayerGameCollection(playerGameCollection);

		let secretInfoCollection = this.gnServer.getDatabase().systemCollection("SecretInfo");
		this.apiMiddleware.setSecretInfoCollection(secretInfoCollection);

		this.apiMiddleware.setExpiredToken(this.getApplicationSettings().getExpiredToken());
		this.apiMiddleware.setPrivateKeyToken(this.getApplicationSettings().getPrivateKeyToken());

		this.apiMiddleware.setHeaderIP(this.getOtherSettings().getHeaderIP());
		this.gnServer.setIdTypeCase(this.getOtherSettings().getIdTypeCase());
		this.gnServer.setRestoreRootPassword(this.getApplicationSettings().getRestoreRootPassword());
		this.gnServer.setInitRootUsername(this.getApplicationSettings().getInitRootUsername());
		// Stores the report DDoS collection value used in the current execution flow.
		let reportDdosCollection = this.gnServer.getDatabase().systemCollection("ReportDdos");
		this.antiDdosMiddleware.setReportDdosCollection(reportDdosCollection);

		// Stores the ban DDoS collection value used in the current execution flow.
		let banDdosCollection = this.gnServer.getDatabase().systemCollection("BanDdos");
		this.antiDdosMiddleware.setBanDdosCollection(banDdosCollection);

		// Ensure schema/index bootstrap is complete before loading per-game settings into memory.
		await this.setupDatabase();

		let gameIds = await this.applySettingsGame();

		// Clustered socket emission is backed by the capped `AdapterEvent` system collection.
		let adapterEventCollection = this.gnServer.getDatabase().systemCollection("AdapterEvent");
		this.socketApp.setEmitter(adapterEventCollection);

		// if (this.mailSettings.getEnable()) {
		// 	this.gnServer.getMail().run(() => {
		// 		Debug.log("[GearN] Send Grid Mail run success");
		// 	});
		// }

		let uploadFileInfoCollection = this.gnServer.getDatabase().systemCollection("UploadFileInfo");
		// Stores the download file session collection value used in the current execution flow.
		let downloadFileSessionCollection = this.gnServer.getDatabase().systemCollection("DownloadFileSession");
		this.httpApp.getUploadFileHandler().setUploadFileInfoCollection(uploadFileInfoCollection);
		this.httpApp.getUploadFileHandler().setDownloadFileSessionCollection(downloadFileSessionCollection);
		this.uploadFileMiddleware.setUploadFileInfoCollection(uploadFileInfoCollection);

		// Register built-in handlers only after storage, secrets, and game settings have been prepared.
		this.gnServer.init();
		this.gnServer.run(() => {
			Debug.log("[GearN] Game Application run success");
		});

		// CloudScript workers reuse the default admin secret so internal callbacks can call back into the server.
		let secretInfo = await secretInfoCollection.findOne({ isDefault: true, onlyMasterAdmin: false });
		let secretKey = secretInfo == null ? "" : secretInfo["secretKey"];

		let gnServerSettingsOptions: GNServerSettingsOptions = {
			serverAddress: "127.0.0.1",
			serverPort: this.applicationSettings.getPort(),
			serverSocketPort: this.applicationSettings.getSocketPort(),
			useSsl: false,
			useSocket: false,
			useHttp: true,

			defaultTimeoutInSeconds: (this.getOtherSettings().getCloudScriptExecuteTimeoutInMs() / 1000 + 5),
			messageType: MessageType.MsgPack,

			sendRate: 2000,
			reconnectDelay: 5000,
			pingInterval: 20000,
			pingTimeout: 20000,

			logType: <number>LogType.Off,
			secretKey: secretKey,
			gameId: "",
		}

		// Worker processes receive the same DB connection metadata instead of opening a separate config source.
		let dbConnection = {
			url: this.databaseSettings.getConnectionString(),
			dbName: this.databaseSettings.getDatabaseName(),
			logUrl: this.databaseSettings.getLogConnectionString(),
			logDbName: this.databaseSettings.getLogDatabaseName(),
			options: this.databaseSettings.getOptions(),
		}

		{
			// Event callback scripts are global and run before/after several request families.
			let eventCallbackCloudScriptService = (<EventCallbackCloudScriptService>this.gnServer.getEventCallbackCloudScriptService());

			let backupCloudScriptFunctionCollection = this.gnServer.getDatabase().systemCollection("EventCallback.CloudScriptBackup");
			eventCallbackCloudScriptService.setBackupCloudScriptFunctionCollection(backupCloudScriptFunctionCollection);

			let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemCollection("EventCallback.CloudScript");
			eventCallbackCloudScriptService.setCloudScriptFunctionCollection(cloudScriptFunctionCollection);

			eventCallbackCloudScriptService.init(structuredClone(gnServerSettingsOptions), dbConnection, this.gnServer, this.getOtherSettings().getCloudScriptExecuteTimeoutInMs());
			eventCallbackCloudScriptService.run();
		}

		{
			// CloudScript event helpers need the fully wired `GNServer` instance but do not spawn their own worker.
			let cloudScriptEventService = <CloudScriptEventService>this.gnServer.getCloudScriptEventService();

			cloudScriptEventService.init(this.gnServer);
		}

		// Pre/post callback services share the same worker service and post-log collection.
		let postEventCallbackLogCollection = this.gnServer.getDatabase().logRuntimeCollection("EventCallback.PostLog");
		(<PostEventCallbackService>this.gnServer.getPostEventCallbackService()).setEventCallbackLogCollection(postEventCallbackLogCollection);

		(<PostEventCallbackService>this.gnServer.getPostEventCallbackService()).setCloudScriptService(this.gnServer.getEventCallbackCloudScriptService());
		(<PreEventCallbackService>this.gnServer.getPreEventCallbackService()).setCloudScriptService(this.gnServer.getEventCallbackCloudScriptService());

		// Start listening only after every runtime dependency has been initialized and the bootstrap data is ready.
		server.listen(port, "0.0.0.0", () => {
			let bannerPath = __dirname + "/./GN-startup/cloudScript/banner.txt";
			let bannerTxt = fs.readFileSync(bannerPath, "utf8");
			console.log('\n\n' + bannerTxt + '\n\n');

			Debug.log("[GearN XmobiTea] -->>==>>>--<<<==<<-- [GearN XmobiTea]");

			Debug.log("[GearN] Server Application running on 0.0.0.0 the port " + port + " with sessionId: " + this.sessionId);

			if (useOtherSocketServer) {
				socketServer.listen(socketPort, "0.0.0.0", () => {
					Debug.log("[GearN] Socket Server running on 0.0.0.0 the port " + socketPort);
				});
			}

			if (onRunSuccess != null) onRunSuccess();

		});

		{
			for (let i = 0; i < gameIds.length; i++) {
				let gameId = gameIds[i];

				{
					// Every loaded game gets its own CloudScript worker bound to game-specific collections.
					let cloudScriptService = <CloudScriptService>this.gnServer.getCloudScriptService(gameId);
					cloudScriptService.init(gameId, structuredClone(gnServerSettingsOptions), dbConnection, this.gnServer, this.getOtherSettings().getCloudScriptExecuteTimeoutInMs());
					cloudScriptService.run();
				}

				{
					// Config data is loaded after the game context exists because it depends on `gameId`.
					let configService = this.gnServer.getConfigService(gameId);
					(<ConfigService>configService).run();
				}
			}
		}

		{
			// Country/IP enrichment reads shared system collections plus the optional external IP lookup endpoint.
			let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");
			let userIPAddressCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer.IPAddress");

			(this.gnServer.getCountryIPDetailService() as CountryIPDetailService).init(this.getOtherSettings().getIPApiUrl(), countryRegionCollection, userIPAddressCollection);
		}

	}

	/**
	 * Ensures required system collections exist and seeds a fresh installation when no version document is found.
	 */
	private async setupDatabase(): Promise<void> {
		Debug.log("setupDatabase");

		let masterAdminCollection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// `System.MasterAdmin.type=version` is the bootstrap marker that distinguishes fresh installs from upgrades.
		let versionResult = await masterAdminCollection.findOne({ type: "version" });

		if (versionResult == null) {
			await this.setupNewGNDatabase();
		}
		else if ((versionResult as any).gnVersion < GNServer.getServerVersion()) {
			await this.reSetupGNDatabase((versionResult as any).gnVersion);
		}
	}

	/**
	 * Creates indexes, default secrets, root admin, and baseline game documents for a brand-new installation.
	 */
	private async setupNewGNDatabase() {
		Debug.log("The GN Server is installing some new information on Database...");

		let masterAdminCollection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		{
			// `type` is the primary discriminator for documents stored in `System.MasterAdmin`.
			await masterAdminCollection.createIndex({ type: 1 }, { background: true, name: "type_1" });
		}

		{
			// Persist the installed server version so later startups can decide whether migrations are required.
			await masterAdminCollection.insertOne({ type: "version", gnVersion: GNServer.getServerVersion() });
		}

		Debug.log("create some indexes on System.MasterAdmin success.");

		// Seeded records use one generated creator id because no authenticated admin exists yet.
		let userId = StringUtility.generateRandomString(10, 0);
		{
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			// Seed a recommended sub-admin template, then explicitly remove root-only capabilities.
			{
				let permission = CreateSecretInfoRequestHandler.generateRecommendAdminPermission();

				{
					permission.dashboard.setMasterGameSettings = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.createAdminAccount = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.removeAdminAccount = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.setPasswordAdminAccount = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.setSecretKeyAdminAccount = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.setGameInformation = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.createGame = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.changePasswordAdminAccount = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getAdminAccountList = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getGameInformation = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getGameList = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getMasterGameSettings = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getSecretInfoInformation = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getSecretInfoList = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.createSecretInfo = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.setSecretInfoInformation = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.getEventCallbackCloudScript = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};

					permission.dashboard.setEventCallbackCloudScript = {
						selfEnable: false,
						adminSelfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
					};
				}

				let adminPermission = structuredClone(permission);
				// adminPermission.dashboard.createAdminAccount.selfEnable = false;
				// adminPermission.dashboard.removeAdminAccount.selfEnable = false;
				// adminPermission.dashboard.setPasswordAdminAccount.selfEnable = false;
				// adminPermission.dashboard.setSecretKeyAdminAccount.selfEnable = false;
				// adminPermission.dashboard.createGame.selfEnable = false;

				let result = {
					type: "secretInfo",
					secretKey: "admin_" + StringUtility.generateRandomString(26, 0),
					gameId: "",
					permission: adminPermission,
					creatorId: userId,
					remove: false,
					tsExpire: -1,
					description: "default recommend sub admin secret info",
					tsCreate: currentMilliseconds,
				} as any;

				await masterAdminCollection.insertOne(result);

				let secretInfoItem = new SecretInfoItem(result, masterAdminCollection);

				let newSecretInfo = SecretInfo.Builder()
					.setGameId(secretInfoItem.getGameId())
					.setIsRemove(secretInfoItem.getRemove())
					.setPermission(secretInfoItem.getPermission())
					.setSecretKey(secretInfoItem.getSecretKey())
					.setTsExpire(secretInfoItem.getTsExpire())
					.setDescription(secretInfoItem.getDescription())
					.build();

				this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

				Debug.log("create SecretInfo Permission for sub admin success.");
			}

			{
				// Seed player-level secret keys for the built-in `dev` and `live` game ids used by the repo.
				let permission = CreateSecretInfoRequestHandler.generateRecommendPlayerPermission();

				{
					let result = {
						type: "secretInfo",
						secretKey: "game_" + StringUtility.generateRandomString(27, 0),
						gameId: "dev",
						permission: permission,
						creatorId: userId,
						remove: false,
						tsExpire: -1,
						description: "default recommend player secret info for gameId dev",
						tsCreate: currentMilliseconds,
					} as any;

					await masterAdminCollection.insertOne(result);

					let secretInfoItem = new SecretInfoItem(result, masterAdminCollection);

					let newSecretInfo = SecretInfo.Builder()
						.setGameId(secretInfoItem.getGameId())
						.setIsRemove(secretInfoItem.getRemove())
						.setPermission(secretInfoItem.getPermission())
						.setSecretKey(secretInfoItem.getSecretKey())
						.setTsExpire(secretInfoItem.getTsExpire())
						.setDescription(secretInfoItem.getDescription())
						.build();

					this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

					Debug.log("create SecretInfo Permission for player gameId dev success.");
				}

				{
					let result = {
						type: "secretInfo",
						secretKey: "game_" + StringUtility.generateRandomString(27, 0),
						gameId: "live",
						permission: permission,
						creatorId: userId,
						remove: false,
						tsExpire: -1,
						description: "default recommend player secret info for gameId live",
						tsCreate: currentMilliseconds,
					} as any;

					await masterAdminCollection.insertOne(result);

					let secretInfoItem = new SecretInfoItem(result, masterAdminCollection);

					let newSecretInfo = SecretInfo.Builder()
						.setGameId(secretInfoItem.getGameId())
						.setIsRemove(secretInfoItem.getRemove())
						.setPermission(secretInfoItem.getPermission())
						.setSecretKey(secretInfoItem.getSecretKey())
						.setTsExpire(secretInfoItem.getTsExpire())
						.setDescription(secretInfoItem.getDescription())
						.build();

					this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

					Debug.log("create SecretInfo Permission for player gameId live success.");
				}
			}

			// Bootstrap root credentials come from application settings because no DB state exists yet.
			let rootUsername = this.applicationSettings.getInitRootUsername() ?? "gearnadmin";
			let rootPassword = this.applicationSettings.getInitRootPassword() ?? "gearnpassword";

			// Create the only master-admin secret separately so the first root account can log in immediately.
			{
				let permission = CreateSecretInfoRequestHandler.generateDefaultPermission(true, true, true, true);
				let secretKey = StringUtility.generateRandomString(32, 0);

				let newSecretInfo = SecretInfo.Builder()
					.setGameId("")
					.setIsRemove(false)
					.setPermission(permission)
					.setSecretKey(secretKey)
					.setTsExpire(-1)
					.setDescription("default root admin secret info")
					.setIsDefault(true)
					.setIsOnlyMasterAdmin(true)
					.build();

				await this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

				// Store the bootstrap root admin account linked to the default master-admin secret key.
				let result = {
					type: "account",
					userId: userId,
					username: rootUsername,
					password: await bcrypt.hash(rootPassword, 10),
					secretKey: secretKey,
				} as any;

				await masterAdminCollection.insertOne(result);

				Debug.log("create SecretInfo Permission for root admin success.");
			}

			Debug.log("creating some indexes on System.MasterPlayer...");

			// Stores the master player collection value used in the current execution flow.
			let masterPlayerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");

			await masterPlayerCollection.createIndex({ userId: 1 }, { background: true, name: "userId_1" });
			await masterPlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
			await masterPlayerCollection.createIndex({ tsCreate: -1 }, { background: true, name: "tsCreate_-1" });
			await masterPlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
			await masterPlayerCollection.createIndex({ countryCode: -1 }, { background: true, name: "countryCode_-1" });
			await masterPlayerCollection.createIndex({ tsLastLogin: -1 }, { background: true, name: "tsLastLogin_-1" });
			await masterPlayerCollection.createIndex({ ipAddressCreate: 1 }, { background: true, name: "ipAddressCreate_1" });
			await masterPlayerCollection.createIndex({ "playerBan.tsExpire": -1 }, { background: true, name: "playerBan.tsExpire_-1" });

			await masterPlayerCollection.createIndex(
				{ "external.device.customDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.customDeviceId_1" }
			);
			await masterPlayerCollection.createIndex(
				{ "external.device.androidDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.androidDeviceId_1" }
			);
			await masterPlayerCollection.createIndex({ "external.device.iOSDeviceId": 1 }, { background: true, sparse: true, name: "external.device.iOSDeviceId_1" });
			await masterPlayerCollection.createIndex(
				{ "external.device.windowsPhoneDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.windowsPhoneDeviceId_1" }
			);
			await masterPlayerCollection.createIndex(
				{ "external.device.windowsDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.windowsDeviceId_1" }
			);
			await masterPlayerCollection.createIndex(
				{ "external.device.linuxDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.linuxDeviceId_1" }
			);
			await masterPlayerCollection.createIndex(
				{ "external.device.macOSDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.macOSDeviceId_1" }
			);
			await masterPlayerCollection.createIndex(
				{ "external.device.customDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.customDeviceId_1" }
			);
			await masterPlayerCollection.createIndex(
				{ "external.device.editorDeviceId": 1 },
				{ background: true, sparse: true, name: "external.device.editorDeviceId_1" }
			);
			await masterPlayerCollection.createIndex({ "external.account.username": 1 }, { background: true, sparse: true, name: "external.account.username_1" });
			await masterPlayerCollection.createIndex({ "external.custom.customId": 1 }, { background: true, sparse: true, name: "external.custom.customId_1" });
			await masterPlayerCollection.createIndex({ "external.apple.appleId": 1 }, { background: true, sparse: true, name: "external.apple.appleId_1" });
			await masterPlayerCollection.createIndex({ "external.google.googleId": 1 }, { background: true, sparse: true, name: "external.google.googleId_1" });
			await masterPlayerCollection.createIndex({ "external.facebook.facebookId": 1 }, { background: true, sparse: true, name: "external.facebook.facebookId_1" });

			await masterPlayerCollection.createIndex({ "external.googlePlayGameService.playerId": 1 }, { background: true, sparse: true, name: "external.googlePlayGameService.playerId_1" });
			await masterPlayerCollection.createIndex({ "external.gameCenter.playerId": 1 }, { background: true, sparse: true, name: "external.gameCenter.playerId_1" });

			Debug.log("create some indexes on System.MasterPlayer success.");
			Debug.log("[Security] Please login dashboard via account with username '" + rootUsername + "' and password is '" + rootPassword + "' and change new password");
		}

		{
			// create masterGameSettings
			let masterGameSettingsResult = {
				type: "masterGameSettings",
				thirtPartySettings: {
					googleSettings: {
						googleClientId: "",
						packageId: "",
						publicRSAKey: "",
					},
					appleSettings: {
						appleClientId: "",
						sandboxEnable: false,
						issuerId: "",
						keyId: "",
						p8Content: "",
					},
					facebookSettings: {
						facebookAppId: "",
						packageId: "",
						facebookInappSecret: "",
						facebookAppToken: "",
					},
					googlePlayGameSettings: {
						applicationId: "",
						clientId: "",
						clientSecret: "",
						redirectUri: "",
					},
					gameCenterSettings: {
						packageId: "",
					},
				},
				masterPlayerSettings: {
					genericServiceSettings: [],

					playerCurrenciesSettings: [],
					playerStatisticsSettings: [],
					playerDatasSettings: [],
					customDatasSettings: [],
					tagsSettings: [],
				},
				pushNotificationSettings: {
					projectId: "",
					clientEmail: "",
					privateKey: "",
				},
				emailSettings: {
					sendFrom: "",
					secure: false,
					host: "",
					port: 0,
					username: "",
					password: "",
				}
			} as any;

			await masterAdminCollection.insertOne(masterGameSettingsResult);

			Debug.log("create default MasterGameSettingsResult success.");
		}

		{
			{
				await this.gnServer.getDatabase().logCreateCollection("Runtime.MasterPlayer.CurrencyLog", {
					capped: true,
					size: 5120000000,
					max: 100000000
				});

				// Stores the currency log collection value used in the current execution flow.
				let currencyLogCollection = this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.CurrencyLog");
				await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
				await currencyLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });

				Debug.log("create some indexes on Runtime.MasterPlayer.CurrencyLog success.");
			}

			{
				await this.gnServer.getDatabase().logCreateCollection("Runtime.MasterPlayer.StatisticsLog", {
					capped: true,
					size: 5120000000,
					max: 100000000
				});

				// Stores the statistics log collection value used in the current execution flow.
				let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.StatisticsLog");
				await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
				await statisticsLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });

				Debug.log("create some indexes on Runtime.MasterPlayer.StatisticsLog success.");
			}

			{
				// Tracks whether r IP address collection should be used.
				let userIPAddressCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer.IPAddress");
				await userIPAddressCollection.createIndex({ userId: 1 }, { background: true, name: "userId_1" });

				Debug.log("create some indexes on System.MasterPlayer.IPAddress success.");
			}

			{
				// Stores the country region collection value used in the current execution flow.
				let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");
				await countryRegionCollection.createIndex({ countryCode: 1 }, { background: true, name: "countryCode_1" });

				Debug.log("create some indexes on System.MasterPlayer.CountryRegion success.");
			}

			{
				// Stores the backup statistics leaderboard collection value used in the current execution flow.
				let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");
				await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });

				Debug.log("create some indexes on Runtime.MasterPlayer.StatisticsBackup success.");
			}

			{
				await this.gnServer.getDatabase().createCollection("System.Analytics", {
					capped: true,
					size: 5120000,
					max: 105120
				});

				// Stores the analytics collection value used in the current execution flow.
				let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");
				await analyticsCollection.createIndex({ tsCreate: -1 }, { background: true, name: "tsCreate_-1" });

				Debug.log("create some indexes on System.Analytics success.");
			}

			{
				await this.gnServer.getDatabase().createCollection("System.StoreAnalytics", {
					capped: true,
					size: 51200,
					max: 100000
				});

				// Stores the store analytics value used in the current execution flow.
				let storeAnalytics = this.gnServer.getDatabase().systemCollection("StoreAnalytics");
				await storeAnalytics.createIndex({ tsCreate: -1 }, { background: true, name: "tsCreate_-1" });

				Debug.log("create some indexes on System.StoreAnalytics success.");
			}
		}

		{
			// create live game settings
			{
				Debug.log("creating some indexes for gameId live...");

				// Stores the game ID value used in the current execution flow.
				let gameId = "live";
				// Stores the game settings result value used in the current execution flow.
				let gameSettingsResult = {
					type: "gameSettings",
					gameId: gameId,
					gameName: "default production game",
					gameDescription: "",
					gameIconUrl: "",
					gameSettings: {
						gamePlayerSettings: {
							customDatasSettings: [],
							playerCurrenciesSettings: [],
							playerDatasSettings: [],
							playerFriendCatalogSettings: [],
							playerGroupCatalogSettings: [],
							playerItemCatalogSettings: [],
							playerStatisticsSettings: [],
							tagsSettings: [],
							playerCharacterCatalogSettings: [],
						},
						characterPlayerSettings: {
							customDatasSettings: [],
							playerCurrenciesSettings: [],
							playerDatasSettings: [],
							playerFriendCatalogSettings: [],
							playerGroupCatalogSettings: [],
							playerItemCatalogSettings: [],
							playerStatisticsSettings: [],
							tagsSettings: [],
						},
						groupSettings: {
							customDatasSettings: [],
							groupCurrenciesSettings: [],
							groupDatasSettings: [],
							groupItemCatalogSettings: [],
							groupStatisticsSettings: [],
							tagsSettings: [],
						},
						inventorySettings: {
							customDatasSettings: [],
							itemDatasSettings: [],
							itemStatisticsSettings: [],
							tagsSettings: []
						}
					},
					matchmakingQueueSettings: [],
					tsCreate: xDatetime.getCurrentMilliseconds(),
					creatorId: userId
				} as any;

				await masterAdminCollection.insertOne(gameSettingsResult);

				{
					// Stores the game player collection value used in the current execution flow.
					let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);

					await gamePlayerCollection.createIndex({ userId: 1 }, { background: true, name: "userId_1" });
					await gamePlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await gamePlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
					await gamePlayerCollection.createIndex({ tsLastLogin: -1 }, { background: true, name: "tsLastLogin_-1" });

					Debug.log("create some indexes on System." + gameId + ".GamePlayer success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".GamePlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the currency log collection value used in the current execution flow.
					let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".GamePlayer.CurrencyLog success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".GamePlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".GamePlayer.StatisticsLog success.");
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });

					Debug.log("create some indexes on Runtime." + gameId + ".GamePlayer.StatisticsBackup success.");
				}

				{
					// Stores the character player collection value used in the current execution flow.
					let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);

					await characterPlayerCollection.createIndex({ characterId: 1 }, { background: true, name: "characterId_1" });
					await characterPlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await characterPlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
					await characterPlayerCollection.createIndex({ tsLastLogin: -1 }, { background: true, name: "tsLastLogin_-1" });

					Debug.log("create some indexes on System." + gameId + ".CharacterPlayer success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CharacterPlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the currency log collection value used in the current execution flow.
					let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ characterId: 1, key: 1, _id: -1 }, { background: true, name: "characterId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".CharacterPlayer.CurrencyLog success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CharacterPlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ characterId: 1, key: 1, _id: -1 }, { background: true, name: "characterId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".CharacterPlayer.StatisticsLog success.");
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });

					Debug.log("create some indexes on Runtime." + gameId + ".CharacterPlayer.StatisticsBackup success.");
				}

				{
					// Stores the group collection value used in the current execution flow.
					let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);

					await groupCollection.createIndex({ groupId: 1 }, { background: true, name: "groupId_1" });
					await groupCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await groupCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });

					Debug.log("create some indexes on System." + gameId + ".Group success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Group.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the currency log collection value used in the current execution flow.
					let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ groupId: 1, key: 1, _id: -1 }, { background: true, name: "groupId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Group.CurrencyLog success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Group.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ groupId: 1, key: 1, _id: -1 }, { background: true, name: "groupId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Group.StatisticsLog success.");
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Group.StatisticsBackup success.");
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.Message", {
						capped: true,
						size: 51200000000,
						max: 100000000
					});

					// Stores the group message collection value used in the current execution flow.
					let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);
					await groupMessageCollection.createIndex({ groupId: 1, _id: -1 }, { background: true, name: "groupId_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Group.Message success.");
				}

				{
					// Stores the inventory collection value used in the current execution flow.
					let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);

					await inventoryCollection.createIndex({ itemId: 1 }, { background: true, name: "itemId_1" });
					await inventoryCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await inventoryCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });

					Debug.log("create some indexes on System." + gameId + ".Inventory success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Inventory.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ itemId: 1, key: 1, _id: -1 }, { background: true, name: "itemId_1_key_1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Inventory.StatisticsLog success.");
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Inventory.StatisticsBackup success.");
				}

				{
					// Stores the store inventory collection value used in the current execution flow.
					let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);

					await storeInventoryCollection.createIndex({ storeId: 1 }, { background: true, name: "storeId_1" });
					await storeInventoryCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
					await storeInventoryCollection.createIndex({ tags: 1 }, { background: true, sparse: true, name: "tags_1" });

					Debug.log("create some indexes on System." + gameId + ".StoreInventory success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".StoreInventory.StoreLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the store inventory log collection value used in the current execution flow.
					let storeInventoryLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
					await storeInventoryLogCollection.createIndex({ storeId: 1, id: 1, storeReceiveType: -1, _id: -1 }, { background: true, name: "storeId_1_id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ id: 1, storeReceiveType: -1, _id: -1 }, { background: true, name: "id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ storeReceiveType: -1, _id: -1 }, { background: true, name: "storeReceiveType_-1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".StoreInventory.StoreLog success.");
				}

				{
					// Stores the store inventory used collection value used in the current execution flow.
					let storeInventoryUsedCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory.StoreUsed", gameId);
					await storeInventoryUsedCollection.createIndex({ storeId: 1 }, { background: true, name: "storeId_1" });

					Debug.log("create some indexes on System." + gameId + ".StoreInventory.StoreUsed success.");
				}

				{
					// Stores the receipt IAP collection value used in the current execution flow.
					let receiptIAPCollection = this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", gameId);
					receiptIAPCollection.createIndex({ payloadMd5: 1 }, { background: true, name: "payloadMd5_1" });
					receiptIAPCollection.createIndex({ transactionId: 1 }, { background: true, name: "transactionId_1" });

					Debug.log("create some indexes on System." + gameId + ".ReceiptIAP success.");
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".MatchmakingTicket", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					// Stores the matchmaking ticket collection value used in the current execution flow.
					let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);

					await matchmakingTicketCollection.createIndex({ userIds: 1, "queueName": 1, "status": -1 }, { background: true, name: "userIds_1_queueName_1_status_-1" });
					await matchmakingTicketCollection.createIndex({ queueName: 1, "status": -1, "tsCreate": -1 }, { background: true, name: "queueName_1_status_-1_tsCreate_-1" });
					await matchmakingTicketCollection.createIndex({ ticketId: 1 }, { background: true, name: "ticketId_1" });
					await matchmakingTicketCollection.createIndex({ status: -1, _id: -1 }, { background: true, name: "status_-1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".MatchmakingTicket success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CloudScript.Log", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					// Stores the cloud script function log collection value used in the current execution flow.
					let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CloudScript.Log", gameId);
					await cloudScriptFunctionLogCollection.createIndex({ tsCreate: -1 }, { background: true, name: "tsCreate-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".CloudScript.Log success.");
				}

				{
					// Stores the match collection value used in the current execution flow.
					let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);

					await matchCollection.createIndex({ matchId: 1 }, { background: true, name: "matchId_1" });
					await matchCollection.createIndex({ queueName: 1, tsCreate: -1 }, { background: true, name: "queueName_1_tsCreate_-1" });
					await matchCollection.createIndex({ status: -1, tsCreate: -1 }, { background: true, name: "status_-1_tsCreate_-1" });

					Debug.log("create some indexes on System." + gameId + ".Match success.");
				}

				{
					// Stores the configuration collection value used in the current execution flow.
					let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
					await configCollection.createIndex({ configName: 1, label: 1 }, { background: true, unique: true, name: "configName_1_label_1" });

					Debug.log("create some indexes on System." + gameId + ".Config success.");
				}

				{
					// Stores the cache collection value used in the current execution flow.
					let cacheCollection = this.gnServer.getDatabase().runtimeGameCollection("Cache", gameId);
					await cacheCollection.createIndex({ key: 1 }, { background: true, name: "key_1" });

					Debug.log("create some indexes on System." + gameId + ".Cache success.");
				}

				Debug.log("create some indexes for gameId live success.");
			}

			// create dev game settings
			{
				Debug.log("creating some indexes for gameId dev...");

				// Stores the game ID value used in the current execution flow.
				let gameId = "dev";
				// Stores the game settings result value used in the current execution flow.
				let gameSettingsResult = {
					type: "gameSettings",
					gameId: gameId,
					gameName: "default development game",
					gameDescription: "",
					gameIconUrl: "",
					gameSettings: {
						gamePlayerSettings: {
							customDatasSettings: [],
							playerCurrenciesSettings: [],
							playerDatasSettings: [],
							playerFriendCatalogSettings: [],
							playerGroupCatalogSettings: [],
							playerItemCatalogSettings: [],
							playerStatisticsSettings: [],
							tagsSettings: [],
							playerCharacterCatalogSettings: [],
						},
						characterPlayerSettings: {
							customDatasSettings: [],
							playerCurrenciesSettings: [],
							playerDatasSettings: [],
							playerFriendCatalogSettings: [],
							playerGroupCatalogSettings: [],
							playerItemCatalogSettings: [],
							playerStatisticsSettings: [],
							tagsSettings: [],
						},
						groupSettings: {
							customDatasSettings: [],
							groupCurrenciesSettings: [],
							groupDatasSettings: [],
							groupItemCatalogSettings: [],
							groupStatisticsSettings: [],
							tagsSettings: [],
						},
						inventorySettings: {
							customDatasSettings: [],
							itemDatasSettings: [],
							itemStatisticsSettings: [],
							tagsSettings: []
						}
					},
					matchmakingQueueSettings: [],
					tsCreate: xDatetime.getCurrentMilliseconds(),
					creatorId: userId
				} as any;

				await masterAdminCollection.insertOne(gameSettingsResult);

				{
					// Stores the game player collection value used in the current execution flow.
					let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);

					await gamePlayerCollection.createIndex({ userId: 1 }, { background: true, name: "userId_1" });
					await gamePlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await gamePlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
					await gamePlayerCollection.createIndex({ tsLastLogin: -1 }, { background: true, name: "tsLastLogin_-1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".GamePlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the currency log collection value used in the current execution flow.
					let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".GamePlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
				}

				Debug.log("create some indexes on GamePlayer for gameId " + gameId + " success.");

				{
					// Stores the character player collection value used in the current execution flow.
					let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);

					await characterPlayerCollection.createIndex({ characterId: 1 }, { background: true, name: "characterId_1" });
					await characterPlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await characterPlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
					await characterPlayerCollection.createIndex({ tsLastLogin: -1 }, { background: true, name: "tsLastLogin_-1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CharacterPlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the currency log collection value used in the current execution flow.
					let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ characterId: 1, key: 1, _id: -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CharacterPlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ characterId: 1, key: 1, _id: -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
				}

				Debug.log("create some indexes on CharacterPlayer for gameId " + gameId + " success.");

				{
					// Stores the group collection value used in the current execution flow.
					let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);

					await groupCollection.createIndex({ groupId: 1 }, { background: true, name: "groupId_1" });
					await groupCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await groupCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Group.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the currency log collection value used in the current execution flow.
					let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ groupId: 1, key: 1, _id: -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Group.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ groupId: 1, key: 1, _id: -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.Message", {
						capped: true,
						size: 51200000000,
						max: 100000000
					});

					// Stores the group message collection value used in the current execution flow.
					let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);
					await groupMessageCollection.createIndex({ groupId: 1, _id: -1 }, { background: true, name: "groupId_1_id_-1" });
				}

				Debug.log("create some indexes on Group for gameId " + gameId + " success.");

				{
					// Stores the inventory collection value used in the current execution flow.
					let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);

					await inventoryCollection.createIndex({ itemId: 1 }, { background: true, name: "itemId_1" });
					await inventoryCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
					await inventoryCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Inventory.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the statistics log collection value used in the current execution flow.
					let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ itemId: 1, key: 1, _id: -1 }, { background: true, name: "itemId_1_key_1_id_-1" });
				}

				{
					// Stores the backup statistics leaderboard collection value used in the current execution flow.
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
				}

				Debug.log("create some indexes on Inventory for gameId " + gameId + " success.");

				{
					// Stores the store inventory collection value used in the current execution flow.
					let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);

					await storeInventoryCollection.createIndex({ storeId: 1 }, { background: true, name: "storeId_1" });
					await storeInventoryCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
					await storeInventoryCollection.createIndex({ tags: 1 }, { background: true, sparse: true, name: "tags_1" });
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".StoreInventory.StoreLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					// Stores the store inventory log collection value used in the current execution flow.
					let storeInventoryLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
					await storeInventoryLogCollection.createIndex({ storeId: 1, id: 1, storeReceiveType: -1, _id: -1 }, { background: true, name: "storeId_1_id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ id: 1, storeReceiveType: -1, _id: -1 }, { background: true, name: "id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ storeReceiveType: -1, _id: -1 }, { background: true, name: "storeReceiveType_-1_id_-1" });
				}

				{
					// Stores the store inventory used collection value used in the current execution flow.
					let storeInventoryUsedCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory.StoreUsed", gameId);
					await storeInventoryUsedCollection.createIndex({ storeId: 1 }, { background: true, name: "storeId_1" });
				}

				Debug.log("create some indexes on StoreInventory for gameId " + gameId + " success.");

				{
					// Stores the receipt IAP collection value used in the current execution flow.
					let receiptIAPCollection = this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", gameId);
					receiptIAPCollection.createIndex({ payloadMd5: 1 }, { background: true, name: "payloadMd5_1" });
					receiptIAPCollection.createIndex({ transactionId: 1 }, { background: true, name: "transactionId_1" });
				}

				Debug.log("create some indexes on ReceiptIAP for gameId " + gameId + " success.");

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".MatchmakingTicket", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					// Stores the matchmaking ticket collection value used in the current execution flow.
					let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);

					await matchmakingTicketCollection.createIndex({ userIds: 1, queueName: 1, status: -1 }, { background: true, name: "userIds_1_queueName_1_status_-1" });
					await matchmakingTicketCollection.createIndex({ queueName: 1, status: -1, tsCreate: -1 }, { background: true, name: "queueName_1_status_-1_tsCreate_-1" });
					await matchmakingTicketCollection.createIndex({ ticketId: 1 }, { background: true, name: "ticketId_1" });
					await matchmakingTicketCollection.createIndex({ status: -1, "_id": -1 }, { background: true, name: "status_-1_id_-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".MatchmakingTicket success.");
				}

				{
					await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CloudScript.Log", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					// Stores the cloud script function log collection value used in the current execution flow.
					let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CloudScript.Log", gameId);
					await cloudScriptFunctionLogCollection.createIndex({ tsCreate: -1 }, { background: true, name: "tsCreate-1" });

					Debug.log("create some indexes on Runtime." + gameId + ".CloudScript.Log success.");
				}

				{
					// Stores the match collection value used in the current execution flow.
					let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);

					await matchCollection.createIndex({ matchId: 1 }, { background: true, name: "matchId_1" });
					await matchCollection.createIndex({ queueName: 1, tsCreate: -1 }, { background: true, name: "queueName_1_tsCreate_-1" });
					await matchCollection.createIndex({ status: -1, tsCreate: -1 }, { background: true, name: "status_-1_tsCreate_-1" });

					Debug.log("create some indexes on System." + gameId + ".Match success.");
				}

				{
					// Stores the configuration collection value used in the current execution flow.
					let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
					await configCollection.createIndex({ configName: 1, label: 1 }, { background: true, unique: true, name: "configName_1_label_1" });

					Debug.log("create some indexes on System." + gameId + ".Config success.");
				}

				{
					// Stores the cache collection value used in the current execution flow.
					let cacheCollection = this.gnServer.getDatabase().runtimeGameCollection("Cache", gameId);
					await cacheCollection.createIndex({ key: 1 }, { background: true, name: "key_1" });

					Debug.log("create some indexes on Runtime." + gameId + ".Cache success.");
				}

				Debug.log("create some indexes for gameId dev success.");
			}
		}

		{
			await this.gnServer.getDatabase().createCollection("System.AuthInfo", {
				capped: true,
				size: 51200000000,
				max: 100000000
			});

			// Stores the auth info collection value used in the current execution flow.
			let authInfoCollection = this.gnServer.getDatabase().systemCollection("AuthInfo");
			await authInfoCollection.createIndex({ gnToken: 1 }, { background: true, name: "gnToken_1" });

			Debug.log("create some indexes for System.AuthInfo success.");
		}

		{
			// Stores the download file session collection value used in the current execution flow.
			let downloadFileSessionCollection = this.gnServer.getDatabase().systemCollection("DownloadFileSession");

			await downloadFileSessionCollection.createIndex({ downloadToken: 1 }, { background: true, name: "downloadToken_1" });
			await downloadFileSessionCollection.createIndex({ createdAt: 1 }, { background: true, name: "createdAt_1", expireAfterSeconds: 3600 });

			Debug.log("create some indexes for System.DownloadFileSession success.");
		}

		{
			// Stores the upload file info collection value used in the current execution flow.
			let uploadFileInfoCollection = this.gnServer.getDatabase().systemCollection("UploadFileInfo");

			await uploadFileInfoCollection.createIndex({ fileId: 1 }, { background: true, name: "fileId_1" });
			await uploadFileInfoCollection.createIndex({ gameId: 1, _id: -1 }, { background: true, name: "gameId_1_id_-1" });

			Debug.log("create some indexes for System.UploadFileInfo success.");
		}

		{
			await this.gnServer.getDatabase().createCollection("System.AdapterEvent", {
				capped: true,
				size: 5120000,
				max: 50000
			});

			// let adapterEventCollection = this.gnServer.getDatabase().systemCollection("AdapterEvent");

			// await adapterEventCollection.createIndex(
			// 	{ "createdAt": 1 },
			// 	{ expireAfterSeconds: 60, background: true, name: "createdAt_1" }
			// );

			Debug.log("create some indexes for System.AdapterEvent success.");
		}

		{
			// await this.gnServer.getDatabase().systemCollection("SecretInfo").createIndex({ secretKey": 1 }, { background: true, unique: true, name: "secretKey_1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime.EventCallback.PostLog", {
				capped: true,
				size: 512000000,
				max: 100000
			});

			// let postEventCallbackPostCollection = this.gnServer.getDatabase().logRuntimeCollection("EventCallback.PostLog");
			// await postEventCallbackPostCollection.createIndex({ eventName: 1, _id: -1 }, { background: true, name: "eventName_1_id_-1" });

			Debug.log("create some indexes for System.EventCallback.PostLog success.");
		}

		{
			// Stores the cloud script function collection value used in the current execution flow.
			let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemCollection("EventCallback.CloudScript");

			// Stores the path value used in the current execution flow.
			let path = __dirname + "/./GN-startup/cloudScript/eventCallbackCloudScriptData.json";

			await cloudScriptFunctionCollection.insertMany(JSON.parse(fs.readFileSync(path).toString()));

			Debug.log("create some indexes for EventCallback.CloudScript success.");
		}

	}

	/**
	 * Placeholder for future schema migrations when the persisted database version lags the server version.
	 * @param oldVersion Provides the old version value used by this operation.
	 */
	private async reSetupGNDatabase(oldVersion: string) {
		Debug.log("re setup Database from version " + oldVersion);
	}

	/**
	 * Loads master settings plus every game definition from MongoDB into the in-memory runtime graph.
	 * @returns Resolves with the operation result.
	 */
	private async applySettingsGame(): Promise<string[]> {
		// Collect the game ids that were successfully materialized into runtime services.
		let answer: string[] = [];

		let masterAdminCollection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		{
			// Shared cross-game settings are loaded once before any per-game services are initialized.
			let masterGameSettingsResult = await masterAdminCollection.findOne({ type: "masterGameSettings" });

			let masterGameSettings = new MasterGameSettings(masterGameSettingsResult, masterAdminCollection);

			{
				// Third-party identity and payment integrations are configured from master settings.
				let thirtPartySettings = masterGameSettings.getThirtPartySettings();

				if (thirtPartySettings.appleSettings != null) {
					(<AppleService>this.gnServer.getAppleService()).init({
						appleClientId: thirtPartySettings.appleSettings.appleClientId,
						sandboxEnable: thirtPartySettings.appleSettings.sandboxEnable,
						issuerId: thirtPartySettings.appleSettings.issuerId,
						keyId: thirtPartySettings.appleSettings.keyId,
						p8Content: thirtPartySettings.appleSettings.p8Content,
					});
				}

				if (thirtPartySettings.googleSettings != null) {
					(<GoogleService>this.gnServer.getGoogleService()).init({
						googleClientId: thirtPartySettings.googleSettings.googleClientId,
						packageId: thirtPartySettings.googleSettings.packageId,
						publicRSAKey: thirtPartySettings.googleSettings.publicRSAKey,
					});
				}

				if (thirtPartySettings.facebookSettings != null) {
					(<FacebookService>this.gnServer.getFacebookService()).init({
						facebookAppId: thirtPartySettings.facebookSettings.facebookAppId,
						facebookAppToken: thirtPartySettings.facebookSettings.facebookAppToken,
						facebookInappSecret: thirtPartySettings.facebookSettings.facebookInappSecret,
					});
				}

				if (thirtPartySettings.googlePlayGameSettings != null) {
					(<GooglePlayGameService>this.gnServer.getGooglePlayGameService()).init({
						applicationId: thirtPartySettings.googlePlayGameSettings.applicationId,
						clientId: thirtPartySettings.googlePlayGameSettings.clientId,
						clientSecret: thirtPartySettings.googlePlayGameSettings.clientSecret,
						redirectUri: thirtPartySettings.googlePlayGameSettings.redirectUri,
					});
				}

				if (thirtPartySettings.gameCenterSettings != null) {
					(<GameCenterService>this.gnServer.getGameCenterService()).init({
						bundleId: thirtPartySettings.gameCenterSettings.packageId,
					});
				}
			}

			{
				// Copy master-player schema settings into the runtime cache read by handlers and services.
				let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();

				let currentMasterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

				currentMasterPlayerSettings.genericServiceSettings = masterPlayerSettings.genericServiceSettings;
				currentMasterPlayerSettings.playerCurrenciesSettings = masterPlayerSettings.playerCurrenciesSettings;
				currentMasterPlayerSettings.playerStatisticsSettings = masterPlayerSettings.playerStatisticsSettings;
				currentMasterPlayerSettings.playerDatasSettings = masterPlayerSettings.playerDatasSettings;
				currentMasterPlayerSettings.customDatasSettings = masterPlayerSettings.customDatasSettings;
				currentMasterPlayerSettings.tagsSettings = masterPlayerSettings.tagsSettings;
			}

			{
				// EmailService is global because account recovery and operational mail are not game-scoped.
				let emailSettings = masterGameSettings.getEmailSettings();

				(<EmailService>this.gnServer.getEmailService()).init(emailSettings.host, emailSettings.port, emailSettings.secure, emailSettings.username, emailSettings.password, emailSettings.sendFrom);
				(<EmailService>this.gnServer.getEmailService()).run();
			}

			{
				// Push credentials are also shared globally and loaded once from master settings.
				let pushNotificationSettings = masterGameSettings.getPushNotificationSettings();

				(<PushNotificationService>this.gnServer.getPushNotificationService()).init(pushNotificationSettings.projectId, pushNotificationSettings.clientEmail, pushNotificationSettings.privateKey);
				(<PushNotificationService>this.gnServer.getPushNotificationService()).run();
			}
		}

		{
			// Each `gameSettings` document becomes one runtime context keyed by `gameId`.
			let gameSettingsResults = await masterAdminCollection.find({ type: "gameSettings" });

			while (await gameSettingsResults.hasNext()) {
				let gameSettingsResult = await gameSettingsResults.next();

				let gameItem = new GameItem(gameSettingsResult, masterAdminCollection);

				let gameSettings = gameItem.getGameSettings();
				let matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings();

				let gameId = gameItem.getGameId();

				// Register the game once so schedulers and runtime services can iterate over active game ids.
				let gameIds = this.gnServer.getGameIds();
				if (!gameIds.includes(gameId)) gameIds.push(gameId);
				answer.push(gameId);

				{
					// Stores the resolved game player settings instance for the current execution flow.
					let gamePlayerSettings = gameSettings.gamePlayerSettings;

					// Stores the resolved current game player settings instance for the current execution flow.
					let currentGamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

					currentGamePlayerSettings.playerCurrenciesSettings = gamePlayerSettings.playerCurrenciesSettings;
					currentGamePlayerSettings.playerStatisticsSettings = gamePlayerSettings.playerStatisticsSettings;
					currentGamePlayerSettings.playerDatasSettings = gamePlayerSettings.playerDatasSettings;
					currentGamePlayerSettings.customDatasSettings = gamePlayerSettings.customDatasSettings;
					currentGamePlayerSettings.tagsSettings = gamePlayerSettings.tagsSettings;

					currentGamePlayerSettings.playerCharacterCatalogSettings = gamePlayerSettings.playerCharacterCatalogSettings;
					currentGamePlayerSettings.playerGroupCatalogSettings = gamePlayerSettings.playerGroupCatalogSettings;
					currentGamePlayerSettings.playerItemCatalogSettings = gamePlayerSettings.playerItemCatalogSettings;
					currentGamePlayerSettings.playerFriendCatalogSettings = gamePlayerSettings.playerFriendCatalogSettings;
				}

				{
					// Stores the resolved character player settings instance for the current execution flow.
					let characterPlayerSettings = gameSettings.characterPlayerSettings;

					// Stores the resolved current character player settings instance for the current execution flow.
					let currentCharacterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

					currentCharacterPlayerSettings.playerCurrenciesSettings = characterPlayerSettings.playerCurrenciesSettings;
					currentCharacterPlayerSettings.playerStatisticsSettings = characterPlayerSettings.playerStatisticsSettings;
					currentCharacterPlayerSettings.playerDatasSettings = characterPlayerSettings.playerDatasSettings;
					currentCharacterPlayerSettings.customDatasSettings = characterPlayerSettings.customDatasSettings;
					currentCharacterPlayerSettings.tagsSettings = characterPlayerSettings.tagsSettings;

					currentCharacterPlayerSettings.playerGroupCatalogSettings = characterPlayerSettings.playerGroupCatalogSettings;
					currentCharacterPlayerSettings.playerItemCatalogSettings = characterPlayerSettings.playerItemCatalogSettings;
					currentCharacterPlayerSettings.playerFriendCatalogSettings = characterPlayerSettings.playerFriendCatalogSettings;
				}

				{
					// Stores the resolved group settings instance for the current execution flow.
					let groupSettings = gameSettings.groupSettings;

					// Stores the resolved current group settings instance for the current execution flow.
					let currentGroupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

					currentGroupSettings.groupCurrenciesSettings = groupSettings.groupCurrenciesSettings;
					currentGroupSettings.groupStatisticsSettings = groupSettings.groupStatisticsSettings;
					currentGroupSettings.groupDatasSettings = groupSettings.groupDatasSettings;
					currentGroupSettings.customDatasSettings = groupSettings.customDatasSettings;
					currentGroupSettings.tagsSettings = groupSettings.tagsSettings;
					currentGroupSettings.groupItemCatalogSettings = groupSettings.groupItemCatalogSettings;
				}

				{
					// Stores the resolved inventory settings instance for the current execution flow.
					let inventorySettings = gameSettings.inventorySettings;

					// Stores the resolved current inventory settings instance for the current execution flow.
					let currentInventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

					currentInventorySettings.itemStatisticsSettings = inventorySettings.itemStatisticsSettings;
					currentInventorySettings.itemDatasSettings = inventorySettings.itemDatasSettings;
					currentInventorySettings.customDatasSettings = inventorySettings.customDatasSettings;
					currentInventorySettings.tagsSettings = inventorySettings.tagsSettings;
				}

				{
					// Queue settings are additive: append every configured queue for the current game.
					let currentMatchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);

					if (matchmakingQueueSettings != null) {
						matchmakingQueueSettings.forEach(matchmakingQueueSetting => {
							currentMatchmakingQueueSettings.push(matchmakingQueueSetting);
						});
					}
				}

				{
					// Each game gets its own CloudScript storage pair for functions and execution logs.
					let cloudScriptService = new CloudScriptService();

					let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemGameCollection("CloudScript.Function", gameId);
					let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CloudScript.Log", gameId);

					cloudScriptService.setCloudScriptFunctionCollection(cloudScriptFunctionCollection);
					cloudScriptService.setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection);

					this.gnServer.setCloudScriptService(gameId, cloudScriptService);
				}

				{
					// ConfigService exposes per-game config documents through the runtime API surface.
					let configService = new ConfigService();

					let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
					configService.setConfigCollection(gameId, configCollection);

					this.gnServer.setConfigGame(gameId, configService);
				}

				{
					// Single-node deployments can keep cache in memory; clustered nodes need a shared Mongo-backed cache.
					let isSingleNode = this.gnServer.getHttpApp().getClusterHandler().getIsSingleNode();

					let cacheServiceController: ICacheServiceController;
					if (isSingleNode) cacheServiceController = new MemoryCacheServiceController();
					else cacheServiceController = new MongoDbCacheServiceController(this.gnServer.getDatabase().runtimeGameCollection("Cache", gameId), this.gnServer.getDatabase());

					let cacheService = new CacheService(cacheServiceController);
					this.gnServer.setCacheService(gameId, cacheService);
				}

				Debug.log("Init success for game id " + gameItem.getGameName() + " (" + gameId + ")");
			}

		}

		return answer;
	}

	/**
	 * Creates the runtime coordinator and primes its database connections before transports start listening.
	 * @returns Returns the operation result.
	 */
	private newGNServer(): GNServer {
		let gnServer = new GNServer();

		// Database handles are configured here so every later startup step uses the same connection source.
		{
			let connectionString = this.databaseSettings.getConnectionString();
			let databaseName = this.databaseSettings.getDatabaseName();
			let logConnectionString = this.databaseSettings.getLogConnectionString();
			let logDatabaseName = this.databaseSettings.getLogDatabaseName();

			let options = this.databaseSettings.getOptions();
			gnServer.getDatabase().init(connectionString, databaseName, logConnectionString, logDatabaseName, options);
		}

		return gnServer;
	}

	/**
	 * Factory method kept overridable for custom startup implementations.
	 * @returns Returns the operation result.
	 */
	private newApiMiddleware(): ApiMiddleware {
		let apiMiddleware = new ApiMiddleware();
		return apiMiddleware;
	}

	/**
	 * Factory method kept overridable for custom startup implementations.
	 * @returns Returns the operation result.
	 */
	private newAntiDdosMiddleware(): AntiDdosMiddleware {
		let antiDdosMiddleware = new AntiDdosMiddleware();
		return antiDdosMiddleware;
	}

	/**
	 * Factory method kept overridable for custom startup implementations.
	 * @returns Returns the operation result.
	 */
	private newUploadMiddleware(): UploadFileMiddleware {
		let uploadFileMiddleware = new UploadFileMiddleware();
		return uploadFileMiddleware;
	}

	/**
	 * Returns the GearN server.
	 * @returns Returns the GearN server.
	 */
	public getGNServer(): GNServer {
		return this.gnServer;
	}

	/**
	 * Executes the new HTTP app workflow.
	 * @returns Returns the operation result.
	 */
	private newHttpApp(): HttpApp {
		return new HttpApp();
	}

	/**
	 * Executes the new socket app workflow.
	 * @returns Returns the operation result.
	 */
	private newSocketApp(): SocketApp {
		return new SocketApp();
	}

	/**
	 * Creates the underlying HTTP/HTTPS server used by Express and, when ports match, by Socket.IO as well.
	 * @param app Provides the app value used by this operation.
	 * @param settings Provides the settings value used by this operation.
	 * @returns Returns the server.
	 */
	private getServer(app: Express, settings: ApplicationSettings): http.Server {
		if (settings.getUseSSL()) {
			const options = {
				key: fs.readFileSync(__dirname + "/../" + settings.getKeyFilePath()),
				cert: fs.readFileSync(__dirname + "/../" + settings.getCertFilePath()),
			};

			return https.createServer(options, app);
		} else {
			return http.createServer(app);
		}
	}

	/**
	 * Initializes a new server application instance.
	 * @param builder Provides the builder state copied into this instance.
	 */
	constructor(builder: BuilderBase) {
		super();

		this.applicationSettings = builder.getApplicationSettings();
		this.httpAppSettings = builder.getHttpAppSettings();
		this.socketAppSettings = builder.getSocketAppSettings();
		this.databaseSettings = builder.getDatabaseSettings();
		this.otherSettings = builder.getOtherSettings();
		this.logSettings = builder.getLogSettings();
		this.uploadFileSettings = builder.getUploadFileSettings();
		this.ddosSettings = builder.getDdosSettings();
		this.clusterSettings = builder.getClusterSettings();
	}

	/**
	 * Creates a new builder instance.
	 * @returns Returns a new builder instance.
	 */
	public static Builder(): Builder {
		return new Builder();
	}

}
