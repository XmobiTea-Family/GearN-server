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
import { Md5Generate } from "./../GN-common/helper/Md5Generate";
import { DdosSettings } from "./settings/DDosSettings";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { GoogleService } from "./../GN-app-api/service/GoogleService";
import { StringUtility } from "./../GN-common/helper/StringUtility";
import { AdminViewSettings } from "./settings/AdminViewSettings";

abstract class BuilderBase {
	protected applicationSettings: ApplicationSettings;
	protected httpAppSettings: HttpAppSettings;
	protected socketAppSettings: SocketAppSettings;
	protected debugViewSettings: AdminViewSettings;
	protected mailSettings: MailSettings;
	protected databaseSettings: DatabaseSettings;
	protected otherSettings: OtherSettings;
	protected logSettings: LogSettings;
	protected uploadFileSettings: UploadFileSettings;
	protected ddosSettings: DdosSettings;

	public getApplicationSettings(): ApplicationSettings {
		return this.applicationSettings;
	}

	public getHttpAppSettings(): HttpAppSettings {
		return this.httpAppSettings;
	}

	public getSocketAppSettings(): SocketAppSettings {
		return this.socketAppSettings;
	}

	public getDebugViewSettings(): AdminViewSettings {
		return this.debugViewSettings;
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

	public getDdosSettings(): DdosSettings {
		return this.ddosSettings;
	}

	constructor() { }
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

	public setDebugViewSettings(debugViewSettings: AdminViewSettings): Builder {
		this.debugViewSettings = debugViewSettings;
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

	public setDdosSettings(ddosSettings: DdosSettings): Builder {
		this.ddosSettings = ddosSettings;
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
	private gnServer: GNServer;
	private apiMiddleware: ApiMiddleware;
	private antiDdosMiddleware: AntiDdosMiddleware;
	private uploadFileMiddleware: UploadFileMiddleware;
	private licenseKeyApplication: LicenseKeyApplication;

	private sessionId: string;
	private secretkey: string;
	private secretId: string;

	public run(onRunSuccess?: OnRunSuccess): void {
		let salt = StringUtility.generateRandomString(10);
		this.sessionId = StringUtility.generateRandomString(15);
		this.secretkey = StringUtility.generateRandomString(20);
		this.secretId = Md5Generate.getMd5(this.secretkey + salt + this.secretkey + salt + this.sessionId);

		let configFullLogPath = this.getLogSettings().getLogPath();
		let fullLogPath = configFullLogPath;
		if (fullLogPath) {
			if (!fs.existsSync(fullLogPath)) {
				fullLogPath = __dirname + "/../../../../" + configFullLogPath;
			}
		}

		console.log("[GN] FullLogPath at: " + fullLogPath);

		let configLicenseKeyFilePath = this.getApplicationSettings().getLicenseKeyFilePath();
		let licenseKeyFilePath = configLicenseKeyFilePath;
		if (licenseKeyFilePath) {
			if (!fs.existsSync(licenseKeyFilePath)) {
				licenseKeyFilePath = __dirname + "/../../../../" + configLicenseKeyFilePath;

				if (!fs.existsSync(licenseKeyFilePath)) {
					licenseKeyFilePath = null;
				}
			}
		}

		if (licenseKeyFilePath) console.log("[GN] Found LicenseKeyFilePath at: " + licenseKeyFilePath);
		else {
			if (configLicenseKeyFilePath) console.log("[GN] LicenseKeyFilePath invalid, please recheck.");
		}

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
		this.antiDdosMiddleware.run();

		this.gnServer = this.newGNServer();
		this.gnServer.setApiMiddleware(this.apiMiddleware);

		this.httpApp = this.newHttpApp();
		this.httpApp.setApiMiddleware(this.apiMiddleware);
		this.httpApp.setUploadFileMiddleware(this.uploadFileMiddleware);
		this.httpApp.setApplicationSettings(this.applicationSettings);
		this.httpApp.setAppSettings(this.getHttpAppSettings());
		this.httpApp.setSocketAppSettings(this.getSocketAppSettings());
		this.httpApp.setDebugViewSettings(this.getDebugViewSettings());
		this.httpApp.setUploadFileSettings(this.getUploadFileSettings());
		this.httpApp.setApp(app);
		this.httpApp.setGNServer(this.gnServer);
		this.httpApp.setSessionId(this.sessionId);
		this.httpApp.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.httpApp.setLogSettings(this.logSettings);
		this.httpApp.run();

		this.socketApp = this.newSocketApp();
		this.socketApp.setApiMiddleware(this.apiMiddleware);
		this.socketApp.setAppSettings(this.getSocketAppSettings());
		this.socketApp.setServer(server);
		this.socketApp.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.socketApp.run();

		this.gnServer.setHttpApp(this.httpApp);
		this.gnServer.setSocketApp(this.socketApp);

		this.gnServer.getDatabase().run(
			() => {
				Debug.log("[GN] Database run success");
			},
			(err) => {
				Debug.logError("[GN] Database connect error " + err);
			}
		);

		this.createEnsureIndex();

		if (this.mailSettings.getEnable()) {
			this.gnServer.getMail().run(() => {
				Debug.log("[GN] Send Grid Mail run success");
			});
		}

		let authTokenCollection = this.gnServer.getDatabase().systemCollection(this.getOtherSettings().getAuthTokenCollectionName());
		this.apiMiddleware.setAuthTokenCollection(authTokenCollection);

		let playerGameCollection = this.gnServer.getDatabase().systemGameCollection("Player");
		this.apiMiddleware.setPlayerGameCollection(playerGameCollection);
		this.apiMiddleware.setExpiredToken(this.getApplicationSettings().getExpiredToken());
		this.apiMiddleware.setHeaderIP(this.getOtherSettings().getHeaderIP());

		let reportDdosCollection = this.gnServer.getDatabase().systemCollection(this.getDdosSettings().getReportDdosCollectionName());
		this.antiDdosMiddleware.setReportDdosCollection(reportDdosCollection);

		let banDdosCollection = this.gnServer.getDatabase().systemCollection(this.getDdosSettings().getBanDdosCollectionName());
		this.antiDdosMiddleware.setBanDdosCollection(banDdosCollection);

		let adapterEventCollection = this.gnServer.getDatabase().systemGameCollection(this.getOtherSettings().getAdapterEventCollectionName());
		this.socketApp.setEmitter(adapterEventCollection);

		(this.gnServer.getAppleService() as AppleService).setAppleClientId(this.getOtherSettings().getAppleClientId());
		(this.gnServer.getGoogleService() as GoogleService).setGoogleClientId(this.getOtherSettings().getGoogleClientId());

		let configCollection = this.gnServer.getDatabase().systemGameCollection(this.getOtherSettings().getConfigGameCollectionName());
		this.gnServer.getConfigGame().setConfigCollection(configCollection);
		this.gnServer.getConfigGame().run(() => {
			Debug.log("[GN] Config Game run success");
		});

		let uploadFileInfoCollection = this.gnServer.getDatabase().systemGameCollection("UploadFileInfo");
		this.httpApp.getUploadFileHandler().setUploadFileInfoCollection(uploadFileInfoCollection);
		this.uploadFileMiddleware.setUploadFileInfoCollection(uploadFileInfoCollection);

		this.gnServer.init();
		this.gnServer.run(() => {
			Debug.log("[GN] Game Application run success");
		});

		this.licenseKeyApplication = new LicenseKeyApplication();
		this.licenseKeyApplication.setLicenseKeyFilePath(licenseKeyFilePath);
		this.licenseKeyApplication.setServer(server);
		this.licenseKeyApplication.setApp(app);
		this.licenseKeyApplication.setGNServer(this.gnServer);
		this.licenseKeyApplication.setSessionId(this.sessionId);
		this.licenseKeyApplication.setSecretkey(this.secretkey);
		this.licenseKeyApplication.setSecretId(this.secretId);
		this.licenseKeyApplication.setSalt(salt);
		this.licenseKeyApplication.setPort(port);
		this.licenseKeyApplication.run();

		server.listen(port, () => {
			Debug.log("[GN XmobiTea] -->>==>>>--<<<==<<-- [GN XmobiTea]");
			Debug.log("[GN] Server Application running on port " + port + " with id: " + this.sessionId);

			if (onRunSuccess != null) onRunSuccess();
		});
	}

	private newGNServer(): GNServer {
		let gnServer = new GNServer();

		// settings database
		{
			let connectionString = this.databaseSettings.getConnectionString();
			let databaseName = this.databaseSettings.getDatabaseName();
			let gameName = this.databaseSettings.getGameName();

			let options = this.databaseSettings.getOptions();
			gnServer.getDatabase().init(connectionString, databaseName, gameName, options);
		}

		// setting mail
		{
			let sendGridApiKey = this.mailSettings.getSendGridApiKey();
			let fromEmail = this.mailSettings.getFromEmail();

			gnServer.getMail().init(sendGridApiKey, fromEmail);
		}

		return gnServer;
	}

	private newApiMiddleware(): ApiMiddleware {
		let apiMiddleware = new ApiMiddleware();
		return apiMiddleware;
	}

	private newAntiDdosMiddleware(): AntiDdosMiddleware {
		let antiDdosMiddleware = new AntiDdosMiddleware();
		return antiDdosMiddleware;
	}

	private newUploadMiddleware(): UploadFileMiddleware {
		let uploadFileMiddleware = new UploadFileMiddleware();
		return uploadFileMiddleware;
	}

	public getGNServer(): GNServer {
		return this.gnServer;
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

	private createEnsureIndex(): void {
		let database = this.gnServer.getDatabase();

		database.createIndex("System." + this.otherSettings.getAuthTokenCollectionName(), {
			AuthToken: 1,
		});
		database.createIndex(
			"System." + database.getGameName() + "." + this.otherSettings.getConfigGameCollectionName(),
			{ ConfigName: 1 }
		);

		database.createIndex("System.Player", { Username: 1 });
		database.createIndex("System.Player", { Username: 1, Password: 1 });
		database.createIndex("System.Player", { TsCreate: -1 });
		database.createIndex("System.Player", { TsLastSeen: -1 });

		database.createIndex(
			"System.Player",
			{ "UserEmail.Value": 1, "UserEmail.IsConfirm": -1 },
			{
				sparse: true
			}
		);

		database.createIndex(
			"System.Player",
			{ "UserExternal.FacebookId": 1 },
			{
				sparse: true
			}
		);
		database.createIndex(
			"System.Player",
			{ "UserExternal.DeviceInfo": 1 },
			{
				sparse: true
			}
		);
		database.createIndex(
			"System.Player",
			{ "UserExternal.CustomId": 1 },
			{
				sparse: true
			}
		);
		database.createIndex(
			"System.Player",
			{ "UserExternal.PublicAddress": 1 },
			{
				sparse: true
			}
		);
		database.createIndex(
			"System.Player",
			{ "UserExternal.AppleUserId": 1 },
			{
				sparse: true
			}
		);
		database.createIndex(
			"System.Player",
			{ "UserExternal.GoogleUserId": 1 },
			{
				sparse: true
			}
		);

		database.createIndex("System.ExternalFBAuthentication", { UserId: 1 });
		database.createIndex("System.ExternalFBAuthentication", {
			ExternalId: 1,
			IsRemove: -1,
		});

		database.createIndex("System.ExternalAppleAuthentication", {
			UserId: 1,
		});
		database.createIndex("System.ExternalAppleAuthentication", {
			ExternalId: 1,
			IsRemove: -1,
		});

		database.createIndex("System.ExternalGoogleAuthentication", {
			UserId: 1,
		});
		database.createIndex("System.ExternalGoogleAuthentication", {
			ExternalId: 1,
			IsRemove: -1,
		});

		database.createIndex("System.Friend", { UserId: 1 });
		database.createIndex(
			"System." + database.getGameName() + ".Player",
			{ UserId: 1 }
		);
		database.createIndex(
			"System." + database.getGameName() + ".Player",
			{ TsCreate: -1 }
		);
		database.createIndex(
			"System." + database.getGameName() + ".Player",
			{ TsLastSeen: -1 }
		);

		database.createIndex("System." + database.getGameName() + ".UploadFileInfo", { FileId: 1 });
		database.createIndex("System." + database.getGameName() + ".UploadFileInfo", { UserId: 1 });
	}

	constructor(builder: BuilderBase) {
		super();

		this.applicationSettings = builder.getApplicationSettings();
		this.httpAppSettings = builder.getHttpAppSettings();
		this.socketAppSettings = builder.getSocketAppSettings();
		this.debugViewSettings = builder.getDebugViewSettings();
		this.databaseSettings = builder.getDatabaseSettings();
		this.mailSettings = builder.getMailSettings();
		this.otherSettings = builder.getOtherSettings();
		this.logSettings = builder.getLogSettings();
		this.uploadFileSettings = builder.getUploadFileSettings();
		this.ddosSettings = builder.getDdosSettings();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
