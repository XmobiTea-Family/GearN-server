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
import { Md5Generate } from "./../GN-common/helper/Md5Generate";
import { DdosSettings } from "./settings/DDosSettings";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { GoogleService } from "./../GN-app-api/service/GoogleService";
import { StringUtility } from "./../GN-common/helper/StringUtility";

import bcrypt from "bcrypt";
import { SecretInfo, SecretRole } from "./../GN-common/entity/SecretInfo";
import { SecretInfoItem } from "./../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { MasterGameSettings } from "./../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterGameSettings";
import { FacebookService } from "./../GN-app-api/service/FacebookService";
import { GameItem } from "./../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";
import { GrantSecretInfoRequestHandler } from "./../GN-app-api/handler/controller/handler/dashboard/GrantSecretInfoRequestHandler";
import { xDatetime } from "./../GN-library/xdatetime/lib/xDatetime";
import { EventCallbackCloudScriptService, PostEventCallbackService, PreEventCallbackService } from "./../GN-app-api/service/EventCallbackService";
import { GNServerSettingsOptions, LogType } from "@xmobitea/gn-typescript-client";
import { CloudScriptService } from "./../GN-app-api/service/CloudScriptService";
import { GooglePlayGameService } from "../GN-app-api/service/GooglePlayGameService";
import { GameCenterService } from "../GN-app-api/service/GameCenterService";
import { xConfig } from "../GN-library/xconfig/lib/xConfig";
import { CountryIPDetailService } from "../GN-app-api/service/CountryIPDetailService";

abstract class BuilderBase {
	protected applicationSettings: ApplicationSettings;
	protected httpAppSettings: HttpAppSettings;
	protected socketAppSettings: SocketAppSettings;
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

	private sessionId: string;
	private secretkey: string;
	private secretId: string;

	public async run(onRunSuccess?: OnRunSuccess): Promise<void> {
		let salt = StringUtility.generateRandomString(10, 0);
		this.sessionId = StringUtility.generateRandomString(15, 0);
		this.secretkey = StringUtility.generateRandomString(20, 0);
		this.secretId = Md5Generate.getMd5(this.secretkey + salt + this.secretkey + salt + this.sessionId);

		let configFullLogPath = this.getLogSettings().getLogPath();
		let fullLogPath = configFullLogPath;
		if (fullLogPath) {
			if (!fs.existsSync(fullLogPath)) {
				fullLogPath = process.cwd() + configFullLogPath;
			}
		}

		console.log("[GN] FullLogPath at: " + fullLogPath);

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
		this.socketApp.setGNServer(this.gnServer);
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

		let authInfoCollection = this.gnServer.getDatabase().systemCollection("AuthInfo");
		this.apiMiddleware.setAuthInfoCollection(authInfoCollection);

		let playerGameCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");
		this.apiMiddleware.setPlayerGameCollection(playerGameCollection);

		let secretInfoCollection = this.gnServer.getDatabase().systemCollection("SecretInfo");
		this.apiMiddleware.setSecretInfoCollection(secretInfoCollection);

		this.apiMiddleware.setExpiredToken(this.getApplicationSettings().getExpiredToken());
		this.apiMiddleware.setPrivateKeyToken(this.getApplicationSettings().getPrivateKeyToken());

		this.apiMiddleware.setHeaderIP(this.getOtherSettings().getHeaderIP());
		this.gnServer.setIdTypeCase(this.getOtherSettings().getIdTypeCase());

		let reportDdosCollection = this.gnServer.getDatabase().systemCollection("ReportDdos");
		this.antiDdosMiddleware.setReportDdosCollection(reportDdosCollection);

		let banDdosCollection = this.gnServer.getDatabase().systemCollection("BanDdos");
		this.antiDdosMiddleware.setBanDdosCollection(banDdosCollection);

		await this.setupDatabase();

		let gameIds = await this.applySettingsGame();

		let adapterEventCollection = this.gnServer.getDatabase().systemCollection("AdapterEvent");
		this.socketApp.setEmitter(adapterEventCollection);

		if (this.mailSettings.getEnable()) {
			this.gnServer.getMail().run(() => {
				Debug.log("[GN] Send Grid Mail run success");
			});
		}

		let uploadFileInfoCollection = this.gnServer.getDatabase().systemCollection("UploadFileInfo");
		let downloadFileSessionCollection = this.gnServer.getDatabase().systemCollection("DownloadFileSession");
		this.httpApp.getUploadFileHandler().setUploadFileInfoCollection(uploadFileInfoCollection);
		this.httpApp.getUploadFileHandler().setDownloadFileSessionCollection(downloadFileSessionCollection);
		this.uploadFileMiddleware.setUploadFileInfoCollection(uploadFileInfoCollection);

		this.gnServer.init();
		this.gnServer.run(() => {
			Debug.log("[GN] Game Application run success");
		});

		let secretInfoResults = await secretInfoCollection.find({ isDefault: true }).toArray();
		let secretInfo = secretInfoResults.at(0);
		let secretKey = secretInfo == null ? "" : secretInfo["secretKey"];

		let gnServerSettingsOptions: GNServerSettingsOptions = {
			serverAddress: "127.0.0.1",
			serverPort: this.applicationSettings.getPort(),
			useSsl: false,
			useSocket: true,
			useHttp: true,

			sendRate: 20,
			reconnectDelay: 5000,
			pingInterval: 20000,
			pingTimeout: 20000,

			gnServerSourcePath: "",
			logType: <number>LogType.Off,
			adminSecretKey: secretKey,
			serverSecretKey: secretKey,
			clientSecretKey: secretKey,
		}

		let dbConnection = {
			dbName: this.databaseSettings.getDatabaseName(),
			url: this.databaseSettings.getConnectionString(),
			options: this.databaseSettings.getOptions(),
		}

		{
			let eventCallbackCloudScriptService = (<EventCallbackCloudScriptService>this.gnServer.getEventCallbackCloudScriptService());

			let backupCloudScriptFunctionCollection = this.gnServer.getDatabase().systemCollection("EventCallback.CloudScriptBackup");
			eventCallbackCloudScriptService.setBackupCloudScriptFunctionCollection(backupCloudScriptFunctionCollection);
			
			let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemCollection("EventCallback.CloudScript");
			eventCallbackCloudScriptService.setCloudScriptFunctionCollection(cloudScriptFunctionCollection);

			eventCallbackCloudScriptService.init(gnServerSettingsOptions, dbConnection, this.gnServer);
			eventCallbackCloudScriptService.run();
		}
		
		let postEventCallbackCollection = this.gnServer.getDatabase().systemCollection("EventCallback.Post");
		(<PostEventCallbackService>this.gnServer.getPostEventCallbackService()).setEventCallbackCollection(postEventCallbackCollection);

		(<PostEventCallbackService>this.gnServer.getPostEventCallbackService()).setCloudScriptService(this.gnServer.getEventCallbackCloudScriptService());
		(<PreEventCallbackService>this.gnServer.getPreEventCallbackService()).setCloudScriptService(this.gnServer.getEventCallbackCloudScriptService());

		server.listen(port, () => {
			Debug.log("[GN XmobiTea] -->>==>>>--<<<==<<-- [GN XmobiTea]");
			Debug.log("[GN] Server Application running on port " + port + " with id: " + this.sessionId);

			if (onRunSuccess != null) onRunSuccess();
		});
		
		{
			for (let i = 0; i < gameIds.length; i++)
			{
				let gameId = gameIds[i];
	
				let gnServerSettingsOptions: GNServerSettingsOptions = {
					serverAddress: "127.0.0.1",
					serverPort: this.applicationSettings.getPort(),
					useSsl: false,
					useSocket: true,
					useHttp: true,
	
					sendRate: 20,
					reconnectDelay: 5000,
					pingInterval: 20000,
					pingTimeout: 20000,
	
					gnServerSourcePath: "",
					logType: <number>LogType.All,
					adminSecretKey: secretKey,
					serverSecretKey: secretKey,
					clientSecretKey: secretKey,
				}

				{
					let cloudScriptService = <CloudScriptService>this.gnServer.getCloudScriptService(gameId);
					cloudScriptService.init(gameId, gnServerSettingsOptions, dbConnection, this.gnServer);
					cloudScriptService.run();
				}

				{
					let configGame = this.gnServer.getConfigGame(gameId);
					configGame.run(() => {
						Debug.log("[GN] Config Game sync success for gameId " + gameId);
					});
				}
			}
		}

		{
			let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");
			let userIPAddressCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer.IPAddress");

			(this.gnServer.getCountryIPDetailService() as CountryIPDetailService).init(this.otherSettings.getIPApiUrl(), countryRegionCollection, userIPAddressCollection);
		}
		
	}

	private async setupDatabase(): Promise<void> {
		Debug.log("setupDatabase");

		let masterAdminCollection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let versionResult = await masterAdminCollection.findOne({ type: "version" });

		if (versionResult == null) {
			await this.setupNewGNDatabase();
		}
		else if ((versionResult as any).gnVersion < GNServer.getServerVersion()) {
			await this.reSetupGNDatabase((versionResult as any).gnVersion);
		}
	}

	private async setupNewGNDatabase() {
		Debug.log("The GN Server is installing some information.");

		//let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let masterAdminCollection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		{
			// create index
			await masterAdminCollection.createIndex({ type: 1 }, { background: true, name: "type_1" });
		}

		{
			// create version 
			await masterAdminCollection.insertOne({ type: "version", gnVersion: GNServer.getServerVersion() });
		}

		let userId = StringUtility.generateRandomString(10, 0);
		{
			let permission = GrantSecretInfoRequestHandler.generateDefaultPermission(true, true, true, true);

			{
				let newSecretInfo = SecretInfo.Builder()
					.setGameId("")
					.setIsRemove(false)
					.setPermission(permission)
					.setRole(<number>SecretRole.Admin)
					.setSecretKey(StringUtility.generateRandomString(20, 0))
					.setTsExpire(-1)
					.setIsDefault(true)
					.build();

				await this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);
			}

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			// create secretInfo for admin account
			{
				let adminPermission = structuredClone(permission);
				adminPermission.masterAdmin.setSecretKeyAdminAccount.selfEnable = false;
				adminPermission.masterAdmin.setSecretKeyAdminAccount.selfEnable = false;
				adminPermission.masterAdmin.grantAdminAccount.selfEnable = false;
				adminPermission.masterAdmin.removeAdminAccount.selfEnable = false;
				adminPermission.masterAdmin.setPasswordAdminAccount.selfEnable = false;
				adminPermission.masterAdmin.setSecretKeyAdminAccount.selfEnable = false;
				adminPermission.masterAdmin.grantGame.selfEnable = false;

				let result = {
					type: "secretInfo",
					secretKey: "admin_" + StringUtility.generateRandomString(14, 0),
					gameId: "",
					role: <number>SecretRole.Admin,
					permission: adminPermission,
					creatorId: userId,
					remove: false,
					tsExpire: -1,
					tsCreate: currentMilliseconds,
				} as any;
		
				await masterAdminCollection.insertOne(result);
		
				let secretInfoItem = new SecretInfoItem(result, masterAdminCollection);
		
				let newSecretInfo = SecretInfo.Builder()
					.setGameId(secretInfoItem.getGameId())
					.setIsRemove(secretInfoItem.getRemove())
					.setPermission(secretInfoItem.getPermission())
					.setRole(secretInfoItem.getRole())
					.setSecretKey(secretInfoItem.getSecretKey())
					.setTsExpire(secretInfoItem.getTsExpire())
					.build();
		
				this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);
			}

			{
				let permission = GrantSecretInfoRequestHandler.generateRecommendPlayerPermission();

				{
					let result = {
						type: "secretInfo",
						secretKey: "game_" + StringUtility.generateRandomString(15, 0),
						gameId: "dev",
						role: <number>SecretRole.Player,
						permission: permission,
						creatorId: userId,
						remove: false,
						tsExpire: -1,
						tsCreate: currentMilliseconds,
					} as any;
			
					await masterAdminCollection.insertOne(result);
			
					let secretInfoItem = new SecretInfoItem(result, masterAdminCollection);
			
					let newSecretInfo = SecretInfo.Builder()
						.setGameId(secretInfoItem.getGameId())
						.setIsRemove(secretInfoItem.getRemove())
						.setPermission(secretInfoItem.getPermission())
						.setRole(secretInfoItem.getRole())
						.setSecretKey(secretInfoItem.getSecretKey())
						.setTsExpire(secretInfoItem.getTsExpire())
						.build();
			
					this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);
				}
				
				{
					let result = {
						type: "secretInfo",
						secretKey: "game_" + StringUtility.generateRandomString(15, 0),
						gameId: "main",
						role: <number>SecretRole.Player,
						permission: permission,
						creatorId: userId,
						remove: false,
						tsExpire: -1,
						tsCreate: currentMilliseconds,
					} as any;
			
					await masterAdminCollection.insertOne(result);
			
					let secretInfoItem = new SecretInfoItem(result, masterAdminCollection);
			
					let newSecretInfo = SecretInfo.Builder()
						.setGameId(secretInfoItem.getGameId())
						.setIsRemove(secretInfoItem.getRemove())
						.setPermission(secretInfoItem.getPermission())
						.setRole(secretInfoItem.getRole())
						.setSecretKey(secretInfoItem.getSecretKey())
						.setTsExpire(secretInfoItem.getTsExpire())
						.build();
			
					this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);
				}
			}

			let password = process.env["defaultPassword"] ?? "gnpassword";
			let username = process.env["defaultUsername"] ?? "gnadmin";

			// create secretInfo for admin account
			{
				let secretKey = "admin_" + StringUtility.generateRandomString(14, 0);

				let newSecretInfo = SecretInfo.Builder()
					.setGameId("")
					.setIsRemove(false)
					.setPermission(permission)
					.setRole(<number>SecretRole.Admin)
					.setSecretKey(secretKey)
					.setTsExpire(-1)
					.setIsDefault(true)
					.setIsOnlyMasterAdmin(true)
					.build();

				await this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

				// create admin account
				let result = {
					type: "account",
					userId: userId,
					username: username,
					password: await bcrypt.hash(password, 10),
					secretKey: secretKey,
				} as any;

				await masterAdminCollection.insertOne(result);
			}

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

			Debug.log("[Security] Please login via account with username '" + username + "' and password is '" + password + "' to change new password");
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

					playerCurrencySettings: [],
					playerStatisticsSettings: [],
					playerDatasSettings: [],
					customDatasSettings: [],
					tagsSettings: [],
				}
			} as any;

			await masterAdminCollection.insertOne(masterGameSettingsResult);
		}

		{
			{
				await this.gnServer.getDatabase().createCollection("Runtime.MasterPlayer.CurrencyLog", {
					capped: true,
					size: 5120000000,
					max: 100000000
				});

				let currencyLogCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.CurrencyLog");
				await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
				await currencyLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
			}

			{
				await this.gnServer.getDatabase().createCollection("Runtime.MasterPlayer.StatisticsLog", {
					capped: true,
					size: 5120000000,
					max: 100000000
				});

				let statisticsLogCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsLog");
				await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
				await statisticsLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
			}

			{
				let userIPAddressCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer.IPAddress");
				await userIPAddressCollection.createIndex({ "userId": 1 }, { background: true, name: "userId_1" });
			}

			{
				let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");
				await countryRegionCollection.createIndex({ "countryCode": 1 }, { background: true, name: "countryCode_1" });
			}
				
			{
				let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer.StatisticsBackup");
				await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
			}

			{
				await this.gnServer.getDatabase().createCollection("System.Analytics", {
					capped: true,
					size: 5120000,
					max: 100000
				});

				let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");
				await analyticsCollection.createIndex({ "tsCreate": -1 }, { background: true, name: "tsCreate_-1" });
			}

			{
				await this.gnServer.getDatabase().createCollection("System.StoreAnalytics", {
					capped: true,
					size: 51200,
					max: 100000
				});

				let storeAnalytics = this.gnServer.getDatabase().systemCollection("StoreAnalytics");
				await storeAnalytics.createIndex({ "tsCreate": -1 }, { background: true, name: "tsCreate_-1" });
			}
		}

		{
			// create main game settings
			{
				let gameId = "main";
				let gameSettingsResult = {
					type: "gameSettings",
					gameId: gameId,
					gameName: "default production game",
					gameDescription: "",
					gameIconUrl: "",
					gameSettings: {
						gamePlayerSettings: {
							customDatasSettings: [],
							playerCurrencySettings: [],
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
							playerCurrencySettings: [],
							playerDatasSettings: [],
							playerFriendCatalogSettings: [],
							playerGroupCatalogSettings: [],
							playerItemCatalogSettings: [],
							playerStatisticsSettings: [],
							tagsSettings: [],
						},
						groupSettings: {
							customDatasSettings: [],
							groupCurrencySettings: [],
							groupDatasSettings: [],
							groupItemCatalogSettings: [],
							groupStatisticsSettings: [],
							tagsSettings: [],
						},
						inventorySettings: {
							customDatasSettings: [],
							inventoryDatasSettings: [],
							inventoryStatisticsSettings: [],
							tagsSettings: []
						}
					},
					matchmakingQueueSettings: [],
					tsCreate: xDatetime.getCurrentMilliseconds(),
					creatorId: userId
				} as any;
	
				await masterAdminCollection.insertOne(gameSettingsResult);
	
				{
					let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
	
					await gamePlayerCollection.createIndex({ "userId": 1 }, { background: true, name: "userId_1" });
					await gamePlayerCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await gamePlayerCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".GamePlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".GamePlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
	
					await characterPlayerCollection.createIndex({ "characterId": 1 }, { background: true, name: "characterId_1" });
					await characterPlayerCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await characterPlayerCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CharacterPlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ "characterId": 1, "key": 1, "_id": -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CharacterPlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "characterId": 1, "key": 1, "_id": -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);
	
					await groupCollection.createIndex({ "groupId": 1 }, { background: true, name: "groupId_1" });
					await groupCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await groupCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ "groupId": 1, "key": 1, "_id": -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "groupId": 1, "key": 1, "_id": -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.Message", {
						capped: true,
						size: 51200000000,
						max: 100000000
					});

					let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);
					await groupMessageCollection.createIndex({ "groupId": 1, "_id": -1 }, { background: true, name: "groupId_1_id_-1" });
				}

				{
					let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
	
					await inventoryCollection.createIndex({ "itemId": 1 }, { background: true, name: "itemId_1" });
					await inventoryCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await inventoryCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Inventory.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "itemId": 1, "key": 1, "_id": -1 }, { background: true, name: "itemId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);
	
					await storeInventoryCollection.createIndex({ "storeId": 1 }, { background: true, name: "storeId_1" });
					await storeInventoryCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
					await storeInventoryCollection.createIndex({ "tags": 1 }, { background: true, sparse: true, name: "tags_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".StoreInventory.StoreLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let storeInventoryLogCollection = this.gnServer.getDatabase().runtimeGameCollection("StoreInventory.StoreLog", gameId);
					await storeInventoryLogCollection.createIndex({ "storeId" : 1, "id": 1, "storeReceiveType": -1, "_id": -1 }, { background: true, name: "storeId_1_id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ "id": 1, "storeReceiveType": -1, "_id": -1 }, { background: true, name: "id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ "storeReceiveType": -1, "_id": -1 }, { background: true, name: "storeReceiveType_-1_id_-1" });
				}

				{
					let receiptIAPCollection = this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", gameId);
					receiptIAPCollection.createIndex({ "payloadMd5": 1 }, { background: true, name: "payloadMd5_1" });
					receiptIAPCollection.createIndex({ "transactionId": 1 }, { background: true, name: "transactionId_1" });
				}
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".MatchmakingTicket", {
						capped: true,
						size: 5120000,
						max: 100000
					});
					
					let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
	
					await matchmakingTicketCollection.createIndex({ "userIds": 1, "queueName": 1, "status": -1 }, { background: true, name: "userIds_1_queueName_1_status_-1" });
					await matchmakingTicketCollection.createIndex({ "queueName": 1, "status": -1, "tsCreate": -1 }, { background: true, name: "queueName_1_status_-1_tsCreate_-1" });
					await matchmakingTicketCollection.createIndex({ "ticketId": 1 }, { background: true, name: "ticketId_1" });
					await matchmakingTicketCollection.createIndex({ "status": -1, "_id": -1 }, { background: true, name: "status_-1_id_-1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CloudScript.Log", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CloudScript.Log", gameId);
					await cloudScriptFunctionLogCollection.createIndex({ "tsCreate": -1 }, { background: true, name: "tsCreate-1" });
				}

				{
					let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);
	
					await matchCollection.createIndex({ "matchId": 1 }, { background: true, name: "matchId_1" });
					await matchCollection.createIndex({ "queueName": 1, "tsCreate": -1 }, { background: true, name: "queueName_1_tsCreate_-1" });
					await matchCollection.createIndex({ "status": -1, "tsCreate": -1 }, { background: true, name: "status_-1_tsCreate_-1" });
				}

				{
					let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
					await configCollection.createIndex({ "configName": 1, "label": 1 }, { background: true, unique: true, name: "configName_1_label_1" });
				}
				
			}
			
			// create dev game settings
			{
				let gameId = "dev";
				let gameSettingsResult = {
					type: "gameSettings",
					gameId: gameId,
					gameName: "default development game",
					gameDescription: "",
					gameIconUrl: "",
					gameSettings: {
						gamePlayerSettings: {
							customDatasSettings: [],
							playerCurrencySettings: [],
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
							playerCurrencySettings: [],
							playerDatasSettings: [],
							playerFriendCatalogSettings: [],
							playerGroupCatalogSettings: [],
							playerItemCatalogSettings: [],
							playerStatisticsSettings: [],
							tagsSettings: [],
						},
						groupSettings: {
							customDatasSettings: [],
							groupCurrencySettings: [],
							groupDatasSettings: [],
							groupItemCatalogSettings: [],
							groupStatisticsSettings: [],
							tagsSettings: [],
						},
						inventorySettings: {
							customDatasSettings: [],
							inventoryDatasSettings: [],
							inventoryStatisticsSettings: [],
							tagsSettings: []
						}
					},
					matchmakingQueueSettings: [],
					tsCreate: xDatetime.getCurrentMilliseconds(),
					creatorId: userId
				} as any;
	
				await masterAdminCollection.insertOne(gameSettingsResult);
	
				{
					let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
	
					await gamePlayerCollection.createIndex({ "userId": 1 }, { background: true, name: "userId_1" });
					await gamePlayerCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await gamePlayerCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".GamePlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".GamePlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
	
					await characterPlayerCollection.createIndex({ "characterId": 1 }, { background: true, name: "characterId_1" });
					await characterPlayerCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await characterPlayerCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CharacterPlayer.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ "characterId": 1, "key": 1, "_id": -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CharacterPlayer.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "characterId": 1, "key": 1, "_id": -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);
	
					await groupCollection.createIndex({ "groupId": 1 }, { background: true, name: "groupId_1" });
					await groupCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await groupCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.CurrencyLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.CurrencyLog", gameId);
					await currencyLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await currencyLogCollection.createIndex({ "groupId": 1, "key": 1, "_id": -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "groupId": 1, "key": 1, "_id": -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.Message", {
						capped: true,
						size: 51200000000,
						max: 100000000
					});

					let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);
					await groupMessageCollection.createIndex({ "groupId": 1, "_id": -1 }, { background: true, name: "groupId_1_id_-1" });
				}

				{
					let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
	
					await inventoryCollection.createIndex({ "itemId": 1 }, { background: true, name: "itemId_1" });
					await inventoryCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
					await inventoryCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Inventory.StatisticsLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsLog", gameId);
					await statisticsLogCollection.createIndex({ "key" : 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
					await statisticsLogCollection.createIndex({ "itemId": 1, "key": 1, "_id": -1 }, { background: true, name: "itemId_1_key_1_id_-1" });
				}

				{
					let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
					await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
				}

				{
					let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);
	
					await storeInventoryCollection.createIndex({ "storeId": 1 }, { background: true, name: "storeId_1" });
					await storeInventoryCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
					await storeInventoryCollection.createIndex({ "tags": 1 }, { background: true, sparse: true, name: "tags_1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".StoreInventory.StoreLog", {
						capped: true,
						size: 5120000000,
						max: 100000000
					});

					let storeInventoryLogCollection = this.gnServer.getDatabase().runtimeGameCollection("StoreInventory.StoreLog", gameId);
					await storeInventoryLogCollection.createIndex({ "storeId" : 1, "id": 1, "storeReceiveType": -1, "_id": -1 }, { background: true, name: "storeId_1_id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ "id": 1, "storeReceiveType": -1, "_id": -1 }, { background: true, name: "id_1_storeReceiveType_-1_id_-1" });
					await storeInventoryLogCollection.createIndex({ "storeReceiveType": -1, "_id": -1 }, { background: true, name: "storeReceiveType_-1_id_-1" });
				}

				{
					let receiptIAPCollection = this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", gameId);
					receiptIAPCollection.createIndex({ "payloadMd5": 1 }, { background: true, name: "payloadMd5_1" });
					receiptIAPCollection.createIndex({ "transactionId": 1 }, { background: true, name: "transactionId_1" });
				}

				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".MatchmakingTicket", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
	
					await matchmakingTicketCollection.createIndex({ "userIds": 1, "queueName": 1, "status": -1 }, { background: true, name: "userIds_1_queueName_1_status_-1" });
					await matchmakingTicketCollection.createIndex({ "queueName": 1, "status": -1, "tsCreate": -1 }, { background: true, name: "queueName_1_status_-1_tsCreate_-1" });
					await matchmakingTicketCollection.createIndex({ "ticketId": 1 }, { background: true, name: "ticketId_1" });
					await matchmakingTicketCollection.createIndex({ "status": -1, "_id": -1 }, { background: true, name: "status_-1_id_-1" });
				}
	
				{
					await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CloudScript.Log", {
						capped: true,
						size: 5120000,
						max: 100000
					});

					let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CloudScript.Log", gameId);
					await cloudScriptFunctionLogCollection.createIndex({ "tsCreate": -1 }, { background: true, name: "tsCreate-1" });
				}

				{
					let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);
	
					await matchCollection.createIndex({ "matchId": 1 }, { background: true, name: "matchId_1" });
					await matchCollection.createIndex({ "queueName": 1, "tsCreate": -1 }, { background: true, name: "queueName_1_tsCreate_-1" });
					await matchCollection.createIndex({ "status": -1, "tsCreate": -1 }, { background: true, name: "status_-1_tsCreate_-1" });
				}

				{
					let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
					await configCollection.createIndex({ "configName": 1, "label": 1 }, { background: true, unique: true, name: "configName_1_label_1" });
				}
			}
		}

		{
			await this.gnServer.getDatabase().createCollection("System.AuthInfo", {
				capped: true,
				size: 51200000000,
				max: 100000000
			});

			let authInfoCollection = this.gnServer.getDatabase().systemCollection("AuthInfo");
			await authInfoCollection.createIndex({ "gnToken": 1 }, { background: true, name: "gnToken_1" });
		}

		{
			let downloadFileSessionCollection = this.gnServer.getDatabase().systemCollection("DownloadFileSession");

			await downloadFileSessionCollection.createIndex({ "downloadToken": 1, "isValid": -1 }, { background: true, name: "downloadToken_1_isValid_-1" });
			await downloadFileSessionCollection.createIndex({ "createdAt": 1 }, { background: true, name: "createdAt_1", expireAfterSeconds: xDatetime.ONE_MINUTE_MILLISECOND * 10 });

		}

		{
			let uploadFileInfoCollection = this.gnServer.getDatabase().systemCollection("UploadFileInfo");

			await uploadFileInfoCollection.createIndex({ "fileId": 1 }, { background: true, name: "fileId_1" });
			await uploadFileInfoCollection.createIndex({ "gameId": 1, "_id": -1 }, { background: true, name: "gameId_1_id_-1" });
		}

		{
			await this.gnServer.getDatabase().createCollection("System.AdapterEvent", {
				capped: true,
				size: 5120000,
				max: 100000
			});

			let adapterEventCollection = this.gnServer.getDatabase().systemCollection("AdapterEvent");

			await adapterEventCollection.createIndex(
				{ "createdAt": 1 },
				{ expireAfterSeconds: 60, background: true, name: "createdAt_1" }
			);
		}

		{
			// await this.gnServer.getDatabase().systemCollection("SecretInfo").createIndex({ "secretKey": 1 }, { background: true, unique: true, name: "secretKey_1" });
		}

		{
			await this.gnServer.getDatabase().createCollection("System.EventCallback.Post", {
				capped: true,
				size: 51200000000,
				max: 100000000
			});

			let postEventCallbackPostCollection = this.gnServer.getDatabase().systemCollection("EventCallback.Post");
			await postEventCallbackPostCollection.createIndex({ "eventName": 1, "_id": -1 }, { background: true, name: "eventName_1_id_-1" });
		}

		{
			let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemCollection("EventCallback.CloudScriptBackup");
			
			let path = __dirname + "/./GN-startup/cloudScript/eventCallbackCloudScriptData.json";

			await cloudScriptFunctionCollection.insertMany(JSON.parse(fs.readFileSync(path).toString()));
		}

	}

	private async reSetupGNDatabase(oldVersion: string) {

	}

	private async applySettingsGame(): Promise<string[]> {
		let answer: string[] = [];

		let masterAdminCollection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		{
			let masterGameSettingsResult = await masterAdminCollection.findOne({ type: "masterGameSettings" });

			let masterGameSettings = new MasterGameSettings(masterGameSettingsResult, masterAdminCollection);

			{
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
				let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();

				let currentMasterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

				currentMasterPlayerSettings.genericServiceSettings = masterPlayerSettings.genericServiceSettings;
				currentMasterPlayerSettings.playerCurrencySettings = masterPlayerSettings.playerCurrencySettings;
				currentMasterPlayerSettings.playerStatisticsSettings = masterPlayerSettings.playerStatisticsSettings;
				currentMasterPlayerSettings.playerDatasSettings = masterPlayerSettings.playerDatasSettings;
				currentMasterPlayerSettings.customDatasSettings = masterPlayerSettings.customDatasSettings;
				currentMasterPlayerSettings.tagsSettings = masterPlayerSettings.tagsSettings;
			}

		}

		{
			let gameSettingsResults = await masterAdminCollection.find({ type: "gameSettings" });

			while (await gameSettingsResults.hasNext()) {
				let gameSettingsResult = await gameSettingsResults.next();

				let gameItem = new GameItem(gameSettingsResult, masterAdminCollection);

				let gameSettings = gameItem.getGameSettings();
				let matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings();

				let gameId = gameItem.getGameId();
				
				let gameIds = this.gnServer.getGameIds();
				if (!gameIds.includes(gameId)) gameIds.push(gameId);
				answer.push(gameId);

				{
					let gamePlayerSettings = gameSettings.gamePlayerSettings;

					let currentGamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

					currentGamePlayerSettings.playerCurrencySettings = gamePlayerSettings.playerCurrencySettings;
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
					let characterPlayerSettings = gameSettings.characterPlayerSettings;

					let currentCharacterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

					currentCharacterPlayerSettings.playerCurrencySettings = characterPlayerSettings.playerCurrencySettings;
					currentCharacterPlayerSettings.playerStatisticsSettings = characterPlayerSettings.playerStatisticsSettings;
					currentCharacterPlayerSettings.playerDatasSettings = characterPlayerSettings.playerDatasSettings;
					currentCharacterPlayerSettings.customDatasSettings = characterPlayerSettings.customDatasSettings;
					currentCharacterPlayerSettings.tagsSettings = characterPlayerSettings.tagsSettings;

					currentCharacterPlayerSettings.playerGroupCatalogSettings = characterPlayerSettings.playerGroupCatalogSettings;
					currentCharacterPlayerSettings.playerItemCatalogSettings = characterPlayerSettings.playerItemCatalogSettings;
					currentCharacterPlayerSettings.playerFriendCatalogSettings = characterPlayerSettings.playerFriendCatalogSettings;
				}

				{
					let groupSettings = gameSettings.groupSettings;

					let currentGroupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

					currentGroupSettings.groupCurrencySettings = groupSettings.groupCurrencySettings;
					currentGroupSettings.groupStatisticsSettings = groupSettings.groupStatisticsSettings;
					currentGroupSettings.groupDatasSettings = groupSettings.groupDatasSettings;
					currentGroupSettings.customDatasSettings = groupSettings.customDatasSettings;
					currentGroupSettings.tagsSettings = groupSettings.tagsSettings;
					currentGroupSettings.groupItemCatalogSettings = groupSettings.groupItemCatalogSettings;
				}

				{
					let inventorySettings = gameSettings.inventorySettings;

					let currentInventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

					currentInventorySettings.inventoryStatisticsSettings = inventorySettings.inventoryStatisticsSettings;
					currentInventorySettings.inventoryDatasSettings = inventorySettings.inventoryDatasSettings;
					currentInventorySettings.customDatasSettings = inventorySettings.customDatasSettings;
					currentInventorySettings.tagsSettings = inventorySettings.tagsSettings;
				}

				{
					let currentMatchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);

					if (matchmakingQueueSettings != null) {
						matchmakingQueueSettings.forEach(matchmakingQueueSetting => {
							currentMatchmakingQueueSettings.push(matchmakingQueueSetting);
						});
					}
				}

				{
					let cloudScriptService = new CloudScriptService();
	
					let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemGameCollection("CloudScript.Function", gameId);
					let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CloudScript.Log", gameId);
		
					cloudScriptService.setCloudScriptFunctionCollection(cloudScriptFunctionCollection);
					cloudScriptService.setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection);
			
					this.gnServer.setCloudScriptService(gameId, cloudScriptService);
				}
	
				{
					let xConfigGame = new xConfig();
	
					let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
					xConfigGame.setConfigCollection(gameId, configCollection);
	
					this.gnServer.setConfigGame(gameId, xConfigGame);
				}

				Debug.log("Init success for game id " + gameItem.getGameName() + " (" + gameId + ")");
			}

		}

		return answer;
	}

	private newGNServer(): GNServer {
		let gnServer = new GNServer();

		// settings database
		{
			let connectionString = this.databaseSettings.getConnectionString();
			let databaseName = this.databaseSettings.getDatabaseName();

			let options = this.databaseSettings.getOptions();
			gnServer.getDatabase().init(connectionString, databaseName, options);
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
		this.ddosSettings = builder.getDdosSettings();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
