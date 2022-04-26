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
import { GameApplication } from "./../GameApplication";
import { MailSettings } from "./settings/MailSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { OtherSettings } from "./settings/OtherSettings";
import { AppleService } from "./../GN-app-api/service/AppleService";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { Debug } from "./../GN-library/xdebug/lib/xDebug";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { UploadFileMiddleware } from "./middleware/UploadFileMiddleware";
import { LicenseKeyApplication } from "./LicenseKeyApplication";

abstract class BuilderBase {
	protected applicationSettings: ApplicationSettings;
	protected httpAppSettings: HttpAppSettings;
	protected socketAppSettings: SocketAppSettings;
	protected mailSettings: MailSettings;
	protected databaseSettings: DatabaseSettings;
	protected otherSettings: OtherSettings;
	protected logSettings: LogSettings;
	protected uploadFileSettings: UploadFileSettings;

	public getApplicationSettings(): ApplicationSettings {
		return this.applicationSettings;
	}

	public getHttpAppSettings(): HttpAppSettings {
		return this.httpAppSettings;
	}

	public getSocketAppSettings(): SocketAppSettings {
		return this.socketAppSettings;
	}

	public getDatabaseSettings(): DatabaseSettings {
		return this.databaseSettings;
	}

	public getMailSettings(): MailSettings {
		return this.mailSettings;
	}

	public getOtherSettings(): OtherSettings {
		return this.otherSettings;
	}

	public getLogSettings(): LogSettings {
		return this.logSettings;
	}

	public getUploadFileSettings(): UploadFileSettings {
		return this.uploadFileSettings;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<ServerApplication> {
	public setApplicationSettings(applicationSettings: ApplicationSettings): Builder {
		this.applicationSettings = applicationSettings;
		return this;
	}

	public setHttpAppSettings(httpAppSettings: HttpAppSettings): Builder {
		this.httpAppSettings = httpAppSettings;
		return this;
	}

	public setSocketAppSettings(socketAppSettings: SocketAppSettings): Builder {
		this.socketAppSettings = socketAppSettings;
		return this;
	}

	public setDatabaseSettings(databaseSettings: DatabaseSettings): Builder {
		this.databaseSettings = databaseSettings;
		return this;
	}

	public setMailSettings(mailSettings: MailSettings): Builder {
		this.mailSettings = mailSettings;
		return this;
	}

	public setOtherSettings(otherSettings: OtherSettings): Builder {
		this.otherSettings = otherSettings;
		return this;
	}

	public setLogSettings(logSettings: LogSettings): Builder {
		this.logSettings = logSettings;
		return this;
	}

	public setUploadFileSettings(uploadFileSettings: UploadFileSettings): Builder {
		this.uploadFileSettings = uploadFileSettings;
		return this;
	}

	public build() {
		return new ServerApplication(this);
	}

	constructor() {
		super();
	}
}

export class ServerApplication extends BuilderBase {
	private httpApp: HttpApp;
	private socketApp: SocketApp;
	private gameApplication: GameApplication;
	private apiMiddleware: ApiMiddleware;
	private uploadFileMiddleware: UploadFileMiddleware;
	private licenseKeyApplication: LicenseKeyApplication;

	public run(onRunSuccess?: OnRunSuccess): void {
		let fullLogPath = __dirname + "/../../../../" + this.getLogSettings().getLogPath();
		console.log("[GN] FullLogPath at: " + fullLogPath);

		let licenseKeyFilePath = __dirname + "/../../../../" + this.getApplicationSettings().getLicenseKeyFilePath();
		if (licenseKeyFilePath) console.log("[GN] Found LicenseKeyFilePath at: " + licenseKeyFilePath);

		Debug.init({
			isLogToConsoleEnable: this.getLogSettings().getLogToConsoleEnable(),
			isLogToFileEnable: this.getLogSettings().getLogToFileEnable(),
			logPath: fullLogPath,
		});
		Debug.run();

		Debug.log("[GN XmobiTea] -->>==>>>--<<<==<<-- [GN XmobiTea]");

		const port = this.applicationSettings.getPort();
		Debug.log("[GN] Try run server on the port " + port);

		const app = express();
		const server = this.getServer(app, this.getApplicationSettings());

		this.uploadFileMiddleware = this.newUploadMiddleware();
		this.uploadFileMiddleware.setMaxSizeUpload(this.uploadFileSettings.getMaxSizeUpload());
		this.uploadFileMiddleware.setMimeTypeAccepts(this.uploadFileSettings.getMimeTypeAccepts());
		this.uploadFileMiddleware.setUploadPath(this.uploadFileSettings.getUploadPath());
		this.uploadFileMiddleware.run();

		this.apiMiddleware = this.newApiMiddleware();
		this.apiMiddleware.run();

		this.gameApplication = this.newGameApplication();
		this.gameApplication.setApiMiddleware(this.apiMiddleware);

		this.httpApp = this.newHttpApp();
		this.httpApp.setApiMiddleware(this.apiMiddleware);
		this.httpApp.setUploadFileMiddleware(this.uploadFileMiddleware);
		this.httpApp.setAppSettings(this.getHttpAppSettings());
		this.httpApp.setUploadFileSettings(this.getUploadFileSettings());
		this.httpApp.setApp(app);
		this.httpApp.setGameApplication(this.gameApplication);
		this.httpApp.run();

		this.socketApp = this.newSocketApp();
		this.socketApp.setApiMiddleware(this.apiMiddleware);
		this.socketApp.setAppSettings(this.getSocketAppSettings());
		this.socketApp.setServer(server);
		this.socketApp.run();

		this.gameApplication.setHttpApp(this.httpApp);
		this.gameApplication.setSocketApp(this.socketApp);

		this.gameApplication.getDatabase().run(
			() => {
				Debug.log("[GN] Database run success");
			},
			(err) => {
				Debug.logError("[GN] Database connect error " + err);
			}
		);

		if (this.mailSettings.getEnable()) {
			this.gameApplication.getMail().run(() => {
				Debug.log("[GN] Send Grid Mail run success");
			});
		}

		let authTokenCollection = this.gameApplication.getDatabase().systemCollection(this.getOtherSettings().getAuthTokenCollectionName());
		this.apiMiddleware.setAuthTokenCollection(authTokenCollection);
		this.apiMiddleware.setExpiredToken(this.applicationSettings.getExpiredToken());

		let adapterEventCollection = this.gameApplication.getDatabase().systemGameCollection(this.getOtherSettings().getAdapterEventCollectionName());
		this.socketApp.setEmitter(adapterEventCollection);

		(this.gameApplication.getAppleService() as AppleService).setMainPackageName(this.getOtherSettings().getPackageName());

		let configCollection = this.gameApplication.getDatabase().systemGameCollection(this.getOtherSettings().getConfigGameCollectionName());
		this.gameApplication.getConfigGame().setConfigCollection(configCollection);
		this.gameApplication.getConfigGame().run(() => {
			Debug.log("[GN] Config Game run success");
		});

		let uploadFileInfoCollection = this.gameApplication.getDatabase().systemGameCollection("UploadFileInfo");
		this.gameApplication.getDatabase().createIndex("System." + this.gameApplication.getDatabase().getGameName() + "UploadFileInfo", { FileId: 1 });
		this.gameApplication.getDatabase().createIndex("System." + this.gameApplication.getDatabase().getGameName() + "UploadFileInfo", { UserId: 1 });

		this.httpApp.getUploadFileHandler().setUploadFileInfoCollection(uploadFileInfoCollection);
		this.uploadFileMiddleware.setUploadFileInfoCollection(uploadFileInfoCollection);

		this.gameApplication.init();
		this.gameApplication.run(() => {
			Debug.log("[GN] Game Application run success");
		});

		try {
			this.licenseKeyApplication = new LicenseKeyApplication();
			this.licenseKeyApplication.setLicenseKeyFilePath(licenseKeyFilePath);
			this.licenseKeyApplication.setServer(server);
			this.licenseKeyApplication.setApp(app);
			this.licenseKeyApplication.setGameApplication(this.gameApplication);
			this.licenseKeyApplication.run();
		}
		catch (exception: Error) {
			Debug.logException(exception);

			return;
		}

		server.listen(port, () => {
			Debug.log("[GN XmobiTea] -->>==>>>--<<<==<<-- [GN XmobiTea]");
			Debug.log("[GN] Server Application running on port " + port);

			if (onRunSuccess != null) onRunSuccess();
		});
	}

	private newGameApplication(): GameApplication {
		let gameApplication = new GameApplication();

		// settings database
		{
			let connectionString = this.databaseSettings.getConnectionString();
			let databaseName = this.databaseSettings.getDatabaseName();
			let gameName = this.databaseSettings.getGameName();

			let minPoolSize = this.databaseSettings.getMinPoolSize();
			let maxPoolSize = this.databaseSettings.getMaxPoolSize();

			let options = {
				maxPoolSize: maxPoolSize,
				minPoolSize: minPoolSize,
			};
			gameApplication.getDatabase().init(connectionString, databaseName, gameName, options);
		}

		// setting mail
		{
			let sendGridApiKey = this.mailSettings.getSendGridApiKey();
			let fromEmail = this.mailSettings.getFromEmail();

			gameApplication.getMail().init(sendGridApiKey, fromEmail);
		}

		return gameApplication;
	}

	private newApiMiddleware(): ApiMiddleware {
		let apiMiddleware = new ApiMiddleware();
		return apiMiddleware;
	}

	private newUploadMiddleware(): UploadFileMiddleware {
		let uploadFileMiddleware = new UploadFileMiddleware();
		return uploadFileMiddleware;
	}

	public getGameApplication(): GameApplication {
		return this.gameApplication;
	}

	private newHttpApp(): HttpApp {
		return new HttpApp();
	}

	private newSocketApp(): SocketApp {
		return new SocketApp();
	}

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

	constructor(builder: BuilderBase) {
		super();

		this.applicationSettings = builder.getApplicationSettings();
		this.httpAppSettings = builder.getHttpAppSettings();
		this.socketAppSettings = builder.getSocketAppSettings();
		this.databaseSettings = builder.getDatabaseSettings();
		this.mailSettings = builder.getMailSettings();
		this.otherSettings = builder.getOtherSettings();
		this.logSettings = builder.getLogSettings();
		this.uploadFileSettings = builder.getUploadFileSettings();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
