import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ServerApplication } from "./ServerApplication";
import { GameApplication } from "./../GameApplication";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { MailSettings } from "./settings/MailSettings";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";

export class DefaultApplicationStartup {
	protected serverApplication: ServerApplication;

	public run(onRunSuccess?: OnRunSuccess): void {
		let applicationSettings = ApplicationSettings.Builder().setUseSSL(false).setCertFilePath("").setKeyFilePath("").setPort(2202).setExpiredToken(2 * 24 * 60 * 60 * 1000).setLicenseKeyFilePath("./gnserver.licensekey").build();

		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(true)
			.setOrigin("*")
			.addMethods(["GET", "POST"])
			.setCredentials(true)
			.addAllowedHeaders(["a", "content-type"])
			.setEnableSendAndReceiveDebug(true)
			.setEnablePostViaJson(true)
			.setEnablePostViaMsgPack(true)
			.build();

		let socketAppSettings = SocketAppSettings.Builder().setEnable(true).setPingInterval(50000).setPingTimeout(5000).setEnableSendAndReceiveDebug(true).build();

		let otherSettings = OtherSettings.Builder()
			.setAdapterEventCollectionName("AdapterEventCollection")
			.setAuthTokenCollectionName("AuthInfoCollection")
			.setConfigGameCollectionName("ConfigGame")
			.setPackageName("com.xmobitea.GNServer")
			.build();

		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString("mongodb://localhost:27017")
			.setDatabaseName("XmobiTea")
			.setGameName("GN.")
			.setMinPoolSize(5)
			.setMaxPoolSize(100)
			.build();

		let mailSettings = MailSettings.Builder().setFromEmail("changx@xmobitea.com").setSendGridApiKey("SG.").build();

		let logSettings = LogSettings.Builder().setLogToFileEnable(true).setLogToConsoleEnable(true).setLogPath("./log/Server.log").build();

		let uploadFileSettings = UploadFileSettings.Builder()
			.setEnable(true)
			.setMaxSizeUpload(1024 * 1024 * 50)
			.setUploadPath("./file-upload")
			.setMimeTypeAccepts(["image/png"])
			.build();

		this.serverApplication = this.newServerApplication(
			applicationSettings,
			httpAppSettings,
			socketAppSettings,
			otherSettings,
			databaseSettings,
			mailSettings,
			logSettings,
			uploadFileSettings
		);

		this.serverApplication.run(() => {
			if (onRunSuccess != null) onRunSuccess();
		});
	}

	protected newServerApplication(
		applicationSettings: ApplicationSettings,
		httpAppSettings: HttpAppSettings,
		socketAppSettings: SocketAppSettings,
		otherSettings: OtherSettings,
		databaseSettings: DatabaseSettings,
		mailSettings: MailSettings,
		logSettings: LogSettings,
		uploadFileSettings: UploadFileSettings
	) {
		return ServerApplication.Builder()
			.setApplicationSettings(applicationSettings)
			.setHttpAppSettings(httpAppSettings)
			.setSocketAppSettings(socketAppSettings)
			.setOtherSettings(otherSettings)
			.setDatabaseSettings(databaseSettings)
			.setMailSettings(mailSettings)
			.setLogSettings(logSettings)
			.setUploadFileSettings(uploadFileSettings)
			.build();
	}

	public getGameApplication(): GameApplication {
		return this.serverApplication.getGameApplication();
	}
}
