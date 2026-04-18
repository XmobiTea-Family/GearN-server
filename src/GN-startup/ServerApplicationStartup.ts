import { DefaultApplicationStartup } from "./DefaultApplicationStartup";

import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { DdosSettings } from "./settings/DDosSettings";
import { ClusterSettings } from "./settings/ClusterSettings";

export class ServerApplicationStartup extends DefaultApplicationStartup {
	// Raw bootstrap config loaded from JSON before it is normalized into typed settings objects.
	private gnConfig: { [k: string]: any };

	/**
	 * Applies the provided configuration.
	 * @param gnConfig Provides the GearN configuration value used by this operation.
	 */
	public config(gnConfig: {}): void {
		this.gnConfig = gnConfig;
	}

	/**
	 * Normalizes bootstrap config, applies local defaults, and starts the runtime application.
	 * @param onRunSuccess Provides the callback executed after a successful startup.
	 */
	public run(onRunSuccess?: OnRunSuccess): void {
		// Each block below tolerates missing config keys so `index.js` can boot from a minimal debug file.
		// These defaults keep local startup working; production should override them explicitly.
		let gnApplicationSettings = this.gnConfig["applicationSettings"];
		if (gnApplicationSettings == null) gnApplicationSettings = {
			"port": 2202,
			"socketPort": 2901,
			"useSsl": false,
			"keyFilePath": "",
			"certFilePath": "",
			"expiredTokenInMs": 172800000,
			"privateKeyToken": "",
			"initRootUsername": "admin",
			"initRootPassword": "password",
			"restoreRootPassword": "",
		}

		// Convert raw config into the strongly typed settings object consumed by the runtime.
		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(gnApplicationSettings["useSsl"] ?? false)
			.setCertFilePath(gnApplicationSettings["certFilePath"] ?? "")
			.setKeyFilePath(gnApplicationSettings["keyFilePath"] ?? "")
			.setPort(gnApplicationSettings["port"] ?? 2202)
			.setSocketPort(gnApplicationSettings["socketPort"] ?? 2901)
			.setExpiredToken(gnApplicationSettings["expiredTokenInMs"] ?? 172800000)
			.setPrivateKeyToken(gnApplicationSettings["privateKeyToken"] ?? "privateKeyToken")
			.setInitRootUsername(gnApplicationSettings["initRootUsername"] ?? "gearnadmin")
			.setInitRootPassword(gnApplicationSettings["initRootPassword"] ?? "gearnpassword")
			.setRestoreRootPassword(gnApplicationSettings["restoreRootPassword"] ?? "")
			.build();

		// Resolve HTTP transport settings with safe debug defaults.
		let gnHttpAppSettings = this.gnConfig["httpAppSettings"];
		if (gnHttpAppSettings == null) gnHttpAppSettings = {
			"enable": true,
			"allowOrigin": "*",
			"credentials": true,
			"allowMethods": ["GET", "POST"],
			"allowHeaders": ["Auth-Token", "Content-Type", "Secret-Key", "Game-Id", "Content-Length", "User-Agent", "X-Real-IP"],
			"enableSendAndReceiveDebug": true,
			"enablePostViaMsgPack": true,
			"enablePostViaJson": true,
			"trustProxy": true,
		}
		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(gnHttpAppSettings["enable"] ?? true)
			.setOrigins(gnHttpAppSettings["allowOrigin"] ?? "*")
			.addMethods(gnHttpAppSettings["allowMethods"] ?? ["GET", "POST"])
			.setCredentials(gnHttpAppSettings["credentials"] ?? true)
			.addAllowedHeaders(gnHttpAppSettings["allowHeaders"] ?? ["Auth-Token", "Content-Type", "Secret-Key", "Game-Id", "Content-Length", "User-Agent", "X-Real-IP"])
			.setEnableSendAndReceiveDebug(gnHttpAppSettings["enableSendAndReceiveDebug"] ?? true)
			.setEnablePostViaMsgPack(gnHttpAppSettings["enablePostViaMsgPack"] ?? true)
			.setEnablePostViaJson(gnHttpAppSettings["enablePostViaJson"] ?? true)
			.setTrustProxy(gnHttpAppSettings["trustProxy"] ?? true)
			.build();

		// Resolve socket transport settings independently because HTTP and socket can run on different ports.
		let gnSocketAppSettings = this.gnConfig["socketAppSettings"];
		if (gnSocketAppSettings == null) gnSocketAppSettings = {
			"enable": true,
			"allowOrigin": "*",
			"credentials": true,
			"allowMethods": ["GET"],
			"allowHeaders": [],
			"enableSendAndReceiveDebug": true,
			"enablePostViaMsgPack": true,
			"enablePostViaJson": true,
			"pingInterval": 50000,
			"pingTimeout": 5000,
		}
		let socketAppSettings = SocketAppSettings.Builder()
			.setEnable(gnSocketAppSettings["enable"] ?? true)
			.setUseEmitter(gnSocketAppSettings["useEmitter"] ?? false)
			.setOrigins(gnSocketAppSettings["allowOrigin"] ?? "*")
			.addMethods(gnSocketAppSettings["allowMethods"] ?? ["GET"])
			.setCredentials(gnSocketAppSettings["credentials"] ?? true)
			.setEnablePostViaMsgPack(gnSocketAppSettings["enablePostViaMsgPack"] ?? true)
			.setEnablePostViaJson(gnSocketAppSettings["enablePostViaJson"] ?? true)
			.addAllowedHeaders(gnSocketAppSettings["allowHeaders"] ?? [])
			.setPingInterval(gnSocketAppSettings["pingInterval"] ?? 50000)
			.setPingTimeout(gnSocketAppSettings["pingTimeout"] ?? 5000)
			.setEnableSendAndReceiveDebug(gnSocketAppSettings["enableSendAndReceiveDebug"] ?? true)
			.build();

		// Resolve transport-adjacent settings that do not belong to a specific subsystem builder.
		let gnOtherSettings = this.gnConfig["otherSettings"];
		if (gnOtherSettings == null) gnOtherSettings = {
			"headerIP": "X-Real-IP",
		}
		let otherSettings = OtherSettings.Builder()
			.setHeaderIP(gnOtherSettings["headerIP"] ?? "X-Real-IP")
			.setIdTypeCase(gnOtherSettings["idTypeCase"] ?? 0)
			.setIPApiUrl(gnOtherSettings["ipApiUrl"])
			.build();

		// Resolve database connection settings for both main and log databases.
		let gnDatabaseSettings = this.gnConfig["databaseSettings"];
		if (gnDatabaseSettings == null) gnDatabaseSettings = {
			"connectionString": "mongodb://127.0.0.1:27017/",
			"databaseName": "XmobiTea",
			"logConnectionString": null,
			"logDatabaseName": "XmobiTea",
			"options": {
			},
		}

		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString(gnDatabaseSettings["connectionString"] ?? "mongodb://127.0.0.1:27017/")
			.setDatabaseName(gnDatabaseSettings["databaseName"] ?? "XmobiTea")
			.setLogConnectionString(gnDatabaseSettings["logConnectionString"] ?? "")
			.setDatabaseName(gnDatabaseSettings["databaseName"] ?? "")
			.setOptions(gnDatabaseSettings["options"] ?? {})
			.build();

		// Resolve logging output settings before the runtime starts writing logs.
		let gnLogSettings = this.gnConfig["logSettings"];
		if (gnLogSettings == null) gnLogSettings = {
			"logToConsoleEnable": true,
			"logToFileEnable": true,
			"logPath": "./log/debug/Server.log",
		}
		let logSettings = LogSettings.Builder()
			.setLogToFileEnable(gnLogSettings["logToFileEnable"] ?? true)
			.setLogToConsoleEnable(gnLogSettings["logToConsoleEnable"] ?? true)
			.setLogPath(gnLogSettings["logPath"] ?? "./log/debug/Server.log")
			.build();

		// Resolve upload constraints before the HTTP upload middleware is initialized.
		let gnUploadFileSettings = this.gnConfig["uploadFileSettings"];
		if (gnUploadFileSettings == null) gnUploadFileSettings = {
			"enable": true,
			"uploadPath": "./file-upload",
			"maxSizeUpload": 52428800,
			"mimeTypeAccepts": ["image/png"],
		}
		let uploadFileSettings = UploadFileSettings.Builder()
			.setEnable(gnUploadFileSettings["enable"] ?? true)
			.setUploadPath(gnUploadFileSettings["uploadPath"] ?? "./file-upload")
			.setMaxSizeUpload(gnUploadFileSettings["maxSizeUpload"] ?? 52428800)
			.setMimeTypeAccepts(gnUploadFileSettings["mimeTypeAccepts"] ?? ["image/png"])
			.build();

		// Resolve request-throttling limits shared by both HTTP and socket transports.
		let gnDdosSettings = this.gnConfig["ddosSettings"];
		if (gnDdosSettings == null) gnDdosSettings = {
			"socketMaxRequestPerSecondPerIp": 50,
			"socketMaxRequestPerSecondPerPeer": 20,
			"socketMaxPendingRequest": 1000,
			"socketMaxRequestSize": 1024,
			"httpMaxRequestPerSecondPerIp": 50,
			"httpMaxRequestPerSecondPerPeer": 20,
			"httpMaxPendingRequest": 1000,
			"httpMaxRequestSize": 1024,
			"maxUploadPendingRequest": 200,
			"maxDownloadPendingRequest": 200,
		}
		let ddosSettings = DdosSettings.Builder()
			.setSocketMaxRequestPerSecondPerIp(gnDdosSettings["socketMaxRequestPerSecondPerIp"] ?? 50)
			.setSocketMaxRequestPerSecondPerPeer(gnDdosSettings["socketMaxRequestPerSecondPerPeer"] ?? 20)
			.setSocketMaxPendingRequest(gnDdosSettings["socketMaxPendingRequest"] ?? 1000)
			.setSocketMaxRequestSize(gnDdosSettings["socketMaxRequestSize"] ?? 1024)
			.setHttpMaxRequestPerSecondPerIp(gnDdosSettings["httpMaxRequestPerSecondPerIp"] ?? 50)
			.setHttpMaxRequestPerSecondPerPeer(gnDdosSettings["httpMaxRequestPerSecondPerPeer"] ?? 20)
			.setHttpMaxPendingRequest(gnDdosSettings["httpMaxPendingRequest"] ?? 1000)
			.setHttpMaxRequestSize(gnDdosSettings["httpMaxRequestSize"] ?? 1024)
			.setMaxUploadPendingRequest(gnDdosSettings["maxUploadPendingRequest"] ?? 200)
			.setMaxDownloadPendingRequest(gnDdosSettings["maxDownloadPendingRequest"] ?? 200)
			.setIPWhiteList(gnDdosSettings["ipWhiteList"] ?? [])
			.build();

		// Default cluster config represents a single primary node so local startup does not require clustering.
		let gnClusterSettings = this.gnConfig["clusterSettings"];
		if (gnClusterSettings == null) gnClusterSettings = {
			"instanceId": "node_0",
			"isPrimary": true,
			"privateKeyToken": "privateKeyDefault",
			"allNodes": [
				{
					"instanceId": "node_0",
					"fullUrl": "http://127.0.0.1:2202"
				}
			]
		}
		let clusterSettings = ClusterSettings.Builder()
			.setInstanceId(gnClusterSettings["instanceId"] ?? "node_0")
			.setIsPrimary(gnClusterSettings["isPrimary"] ?? true)
			.setPrivateKeyToken(gnClusterSettings["privateKeyToken"] ?? "privateKeyDefault")
			.setAllNodes(gnClusterSettings["allNodes"] ?? [{ instanceId: "node_0", fullUrl: "http://127.0.0.1:2202" }])

		// Hand off to the concrete runtime once every settings object has been materialized.
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

}
