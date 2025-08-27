import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ServerApplication } from "./ServerApplication";
import { GNServer } from "./../GNServer";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { DdosSettings } from "./settings/DDosSettings";
import { ClusterSettings } from "./settings/ClusterSettings";

export class DefaultApplicationStartup {
	protected serverApplication: ServerApplication;

	public run(onRunSuccess?: OnRunSuccess): void {
		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(false)
			.setCertFilePath("")
			.setKeyFilePath("")
			.setPort(2202)
			.setSocketPort(2901)
			.setExpiredToken(2 * 24 * 60 * 60 * 1000)
			.setPrivateKeyToken("defaultApplicationStartup")
			.setInitRootUsername("admin")
			.setInitRootPassword("password")
			.setRestoreRootUsername("")
			.build();

		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(true)
			.setOrigins("*")
			.addMethods(["GET", "POST"])
			.setCredentials(true)
			.addAllowedHeaders(["Auth-Token", "Content-Type", "Secret-Key", "Game-Id", "Content-Length", "User-Agent", "X-Real-IP"])
			.setEnableSendAndReceiveDebug(true)
			.setEnablePostViaJson(true)
			.setEnablePostViaMsgPack(true)
			.setTrustProxy(true)
			.build();

		let socketAppSettings = SocketAppSettings.Builder()
			.setEnable(true)
			.setUseEmitter(false)
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

		let otherSettings = OtherSettings.Builder()
			.setHeaderIP("X-Real-IP")
			.setIdTypeCase(0)
			.setIPApiUrl("http://127.0.0.1:2555/json")
			.build();

		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString("mongodb://rootuser:rootpass@127.0.10.21:27017,127.0.10.22:27017,127.0.10.23:27017/?retryWrites=false&replicaSet=rs0&readPreference=primaryPreferred&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256")
			.setLogConnectionString(null)
			.setDatabaseName("XmobiTea")
			.setOptions({
				"minPoolSize": 5,
				"maxPoolSize": 100
			})
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
			.setIPWhiteList(["127.0.0.1"])
			.build();

		let clusterSettings = ClusterSettings.Builder()
			.setInstanceId("node_0")
			.setIsPrimary(true)
			.setPrivateKeyToken("defaultApplicationStartup")
			.setAllNodes([{
				instanceId: "node_0",
				fullUrl: "http://127.0.0.1:2202"
			}])
			.build();

		this.serverApplication = this.newServerApplication(
			applicationSettings,
			httpAppSettings,
			socketAppSettings,
			otherSettings,
			databaseSettings,
			logSettings,
			uploadFileSettings,
			ddosSettings,
			clusterSettings,
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
		logSettings: LogSettings,
		uploadFileSettings: UploadFileSettings,
		ddosSettings: DdosSettings,
		clusterSettings: ClusterSettings,
	) {
		return ServerApplication.Builder()
			.setApplicationSettings(applicationSettings)
			.setHttpAppSettings(httpAppSettings)
			.setSocketAppSettings(socketAppSettings)
			.setOtherSettings(otherSettings)
			.setDatabaseSettings(databaseSettings)
			.setLogSettings(logSettings)
			.setUploadFileSettings(uploadFileSettings)
			.setDdosSettings(ddosSettings)
			.setClusterSettings(clusterSettings)
			.build();
	}

	public getGNServer(): GNServer {
		return this.serverApplication.getGNServer();
	}

}
