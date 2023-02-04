import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ServerApplication } from "./ServerApplication";
import { GNServer } from "./../GNServer";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { MailSettings } from "./settings/MailSettings";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { DdosSettings } from "./settings/DDosSettings";
import { AdminViewSettings } from "./settings/AdminViewSettings";

export class DefaultApplicationStartup {
	protected serverApplication: ServerApplication;

	public run(onRunSuccess?: OnRunSuccess): void {
		let applicationSettings = ApplicationSettings.Builder().setUseSSL(false).setCertFilePath("").setKeyFilePath("").setPort(2202).setExpiredToken(2 * 24 * 60 * 60 * 1000).setLicenseKeyFilePath("./gnserver.licensekey").build();

		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(true)
			.setOrigins("*")
			.addMethods(["GET", "POST"])
			.setCredentials(true)
			.addAllowedHeaders(["a", "content-type"])
			.setEnableSendAndReceiveDebug(true)
			.setEnablePostViaJson(true)
			.setEnablePostViaMsgPack(true)
			.build();

		let socketAppSettings = SocketAppSettings.Builder()
			.setEnable(true)
			.setOrigins("*")
			.addMethods([])
			.setCredentials(true)
			.addAllowedHeaders([])
			.setEnableSendAndReceiveDebug(true)
			.setEnablePostViaJson(true)
			.setEnablePostViaMsgPack(true)
			.setPingInterval(50000)
			.setPingTimeout(5000)
			.build();

		let debugViewSettings = AdminViewSettings.Builder()
			.setDebugHashs([])
			.setEnable(true)
			.build();
			
		let otherSettings = OtherSettings.Builder()
			.setAdapterEventCollectionName("AdapterEventCollection")
			.setAuthTokenCollectionName("AuthInfoCollection")
			.setConfigGameCollectionName("ConfigGame")
			.setPackageName("com.xmobitea.GNServer")
			.setAppleClientId("com.xmobitea.GNServer")
			.setGoogleClientId("gn-server")
			.setHeaderIP("x-ip")
			.build();

		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString("mongodb://admin:assmin@127.0.0.1:27017/?replicaSet=rs0")
			.setDatabaseName("XmobiTea")
			.setGameName("GN.")
			.setOptions({
				"minPoolSize": 5,
				"maxPoolSize": 100
			})
			.build();

		let mailSettings = MailSettings.Builder()
			.setFromEmail("changx@xmobitea.com")
			.setSendGridApiKey("SG.")
			.build();

		let logSettings = LogSettings.Builder()
			.setLogToFileEnable(true)
			.setLogToConsoleEnable(true)
			.setLogPath("./log/Server.log")
			.build();

		let uploadFileSettings = UploadFileSettings.Builder()
			.setEnable(true)
			.setMaxSizeUpload(1024 * 1024 * 50)
			.setUploadPath("./file-upload")
			.setMimeTypeAccepts(["image/png"])
			.build();

		let ddosSettings = DdosSettings.Builder()
			.setSocketMaxRequestPerSecondPerIp(50)
			.setSocketMaxRequestPerSecondPerPeer(20)
			.setSocketMaxPendingRequest(100)
			.setSocketMaxRequestSize(1024)
			.setHttpMaxRequestPerSecondPerIp(50)
			.setHttpMaxRequestPerSecondPerPeer(20)
			.setHttpMaxPendingRequest(100)
			.setHttpMaxRequestSize(1024)
			.setMaxUploadPendingRequest(50)
			.setMaxDownloadPendingRequest(50)
			.setReportDdosCollectionName("ReportDdosCollection")
			.setBanDdosCollectionName("BanDdosCollection")
			.build();

		this.serverApplication = this.newServerApplication(
			applicationSettings,
			httpAppSettings,
			socketAppSettings,
			debugViewSettings,
			otherSettings,
			databaseSettings,
			mailSettings,
			logSettings,
			uploadFileSettings,
			ddosSettings
		);

		this.serverApplication.run(() => {
			if (onRunSuccess != null) onRunSuccess();
		});
	}

	protected newServerApplication(
		applicationSettings: ApplicationSettings,
		httpAppSettings: HttpAppSettings,
		socketAppSettings: SocketAppSettings,
		debugViewSettings: AdminViewSettings,
		otherSettings: OtherSettings,
		databaseSettings: DatabaseSettings,
		mailSettings: MailSettings,
		logSettings: LogSettings,
		uploadFileSettings: UploadFileSettings,
		ddosSettings: DdosSettings
	) {
		return ServerApplication.Builder()
			.setApplicationSettings(applicationSettings)
			.setHttpAppSettings(httpAppSettings)
			.setSocketAppSettings(socketAppSettings)
			.setDebugViewSettings(debugViewSettings)
			.setOtherSettings(otherSettings)
			.setDatabaseSettings(databaseSettings)
			.setMailSettings(mailSettings)
			.setLogSettings(logSettings)
			.setUploadFileSettings(uploadFileSettings)
			.setDdosSettings(ddosSettings)
			.build();
	}

	public getGNServer(): GNServer {
		return this.serverApplication.getGNServer();
	}

}
