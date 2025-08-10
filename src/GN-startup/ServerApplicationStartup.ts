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
	private gnConfig: { [k: string]: any };

	public config(gnConfig: {}): void {
		this.gnConfig = gnConfig;
	}

	public run(onRunSuccess?: OnRunSuccess): void {

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

		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(gnApplicationSettings["useSsl"] ?? false)
			.setCertFilePath(gnApplicationSettings["keyFilePath"] ?? "")
			.setKeyFilePath(gnApplicationSettings["certFilePath"] ?? "")
			.setPort(gnApplicationSettings["port"] ?? 2202)
			.setSocketPort(gnApplicationSettings["socketPort"] ?? 2901)
			.setExpiredToken(gnApplicationSettings["expiredTokenInMs"] ?? 172800000)
			.setPrivateKeyToken(gnApplicationSettings["privateKeyToken"] ?? "privateKeyToken")
			.setInitRootUsername(gnApplicationSettings["initRootUsername"] ?? "admin")
			.setInitRootPassword(gnApplicationSettings["initRootPassword"] ?? "password")
			.setRestoreRootUsername(gnApplicationSettings["restoreRootPassword"] ?? "")
			.build();

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
			.build();

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

		let gnOtherSettings = this.gnConfig["otherSettings"];
		if (gnOtherSettings == null) gnOtherSettings = {
			"headerIP": "X-Real-IP",
		}
		let otherSettings = OtherSettings.Builder()
			.setHeaderIP(gnOtherSettings["headerIP"] ?? "X-Real-IP")
			.setIdTypeCase(gnOtherSettings["idTypeCase"] ?? 0)
			.setIPApiUrl(gnOtherSettings["ipApiUrl"])
			.build();

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
			.setLogConnectionString(gnDatabaseSettings["logConnectionString"] ?? "mongodb://127.0.0.1:27017/")
			.setDatabaseName(gnDatabaseSettings["databaseName"] ?? "XmobiTea")
			.setOptions(gnDatabaseSettings["options"] ?? {})
			.build();

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
