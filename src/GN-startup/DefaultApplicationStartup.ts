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
	// Stores the server application value used by this instance.
	protected serverApplication: ServerApplication;

	/**
	 * Runs the current workflow.
	 * @param onRunSuccess Provides the callback executed after a successful startup.
	 */
	public run(onRunSuccess?: OnRunSuccess): void {
		// Stores the resolved application settings instance for the current execution flow.
		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(false)
			.setCertFilePath("")
			.setKeyFilePath("")
			.setPort(2202)
			.setSocketPort(2901)
			.setExpiredToken(2 * 24 * 60 * 60 * 1000)
			.setPrivateKeyToken("defaultApplicationStartup")
			.setInitRootUsername("gearnadmin")
			.setInitRootPassword("gearnpassword")
			.setRestoreRootPassword("")
			.build();

		// Stores the resolved HTTP app settings instance for the current execution flow.
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

		// Stores the resolved socket app settings instance for the current execution flow.
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

		// Stores the resolved other settings instance for the current execution flow.
		let otherSettings = OtherSettings.Builder()
			.setHeaderIP("X-Real-IP")
			.setIdTypeCase(0)
			.setIPApiUrl("http://127.0.0.1:2555/json")
			.build();

		// Stores the resolved database settings instance for the current execution flow.
		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString("mongodb://rootuser:rootpass@127.0.10.21:27017,127.0.10.22:27017,127.0.10.23:27017/?retryWrites=false&replicaSet=rs0&readPreference=primaryPreferred&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256")
			.setLogConnectionString(null)
			.setDatabaseName("XmobiTea")
			.setOptions({
				"minPoolSize": 5,
				"maxPoolSize": 100
			})
			.build();

		// Stores the resolved log settings instance for the current execution flow.
		let logSettings = LogSettings.Builder()
			.setLogToFileEnable(true)
			.setLogToConsoleEnable(true)
			.setLogPath("./log/Server.log")
			.build();

		// Stores the resolved upload file settings instance for the current execution flow.
		let uploadFileSettings = UploadFileSettings.Builder()
			.setEnable(true)
			.setMaxSizeUpload(1024 * 1024 * 50)
			.setUploadPath("./file-upload")
			.setMimeTypeAccepts(["image/png"])
			.build();

		// Stores the resolved DDoS settings instance for the current execution flow.
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

		// Stores the resolved cluster settings instance for the current execution flow.
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

	/**
	 * Executes the new server application workflow.
	 * @param applicationSettings Provides the application settings value used by this operation.
	 * @param httpAppSettings Provides the HTTP app settings value used by this operation.
	 * @param socketAppSettings Provides the socket app settings value used by this operation.
	 * @param otherSettings Provides the other settings value used by this operation.
	 * @param databaseSettings Provides the database settings value used by this operation.
	 * @param logSettings Provides the log settings value used by this operation.
	 * @param uploadFileSettings Provides the upload file settings value used by this operation.
	 * @param ddosSettings Provides the DDoS settings value used by this operation.
	 * @param clusterSettings Provides the cluster settings value used by this operation.
	 */
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

	/**
	 * Returns the GearN server.
	 * @returns Returns the GearN server.
	 */
	public getGNServer(): GNServer {
		return this.serverApplication.getGNServer();
	}

}
