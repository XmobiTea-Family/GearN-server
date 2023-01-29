import { DefaultApplicationStartup } from "./DefaultApplicationStartup";

import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { MailSettings } from "./settings/MailSettings";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";
import { LogSettings } from "./settings/LogSettings";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { DdosSettings } from "./settings/DDosSettings";
import { AdminViewSettings } from "./settings/AdminViewSettings";

export class ServerApplicationStartup extends DefaultApplicationStartup {
	private gnConfig: { [k: string]: any };

	public config(gnConfig: {}): void {
		this.gnConfig = gnConfig;
	}

	public run(onRunSuccess?: OnRunSuccess): void {

		let gnApplicationSettings = this.gnConfig["applicationSettings"];
		if (gnApplicationSettings == null) gnApplicationSettings = {
			"port": 2202,
			"useSsl": false,
			"keyFilePath": "",
			"certFilePath": "",
			"licenseKeyFilePath": "",
			"expiredTokenInMs": 172800000
		}
		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(gnApplicationSettings["useSsl"] || false)
			.setCertFilePath(gnApplicationSettings["keyFilePath"] || "")
			.setKeyFilePath(gnApplicationSettings["certFilePath"] || "")
			.setPort(gnApplicationSettings["port"] || 2202)
			.setLicenseKeyFilePath(gnApplicationSettings["licenseKeyFilePath"] || "")
			.setExpiredToken(gnApplicationSettings["expiredTokenInMs"] || 172800000)
			.build();

		let gnHttpAppSettings = this.gnConfig["httpAppSettings"];
		if (gnHttpAppSettings == null) gnHttpAppSettings = {
			"enable": true,
			"allowOrigin": "*",
			"credentials": true,
			"allowMethods": ["GET", "POST"],
			"allowHeaders": ["a", "content-type"],
			"enableSendAndReceiveDebug": true,
			"enablePostViaMsgPack": true,
			"enablePostViaJson": true
		}
		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(gnHttpAppSettings["enable"] || true)
			.setOrigins(gnHttpAppSettings["allowOrigin"] || "*")
			.addMethods(gnHttpAppSettings["allowMethods"] || ["GET", "POST"])
			.setCredentials(gnHttpAppSettings["credentials"] || true)
			.addAllowedHeaders(gnHttpAppSettings["allowHeaders"] || ["a", "content-type"])
			.setEnableSendAndReceiveDebug(gnHttpAppSettings["enableSendAndReceiveDebug"] || true)
			.setEnablePostViaMsgPack(gnHttpAppSettings["enablePostViaMsgPack"] || true)
			.setEnablePostViaJson(gnHttpAppSettings["enablePostViaJson"] || true)
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
			"pingTimeout": 5000
		}
		let socketAppSettings = SocketAppSettings.Builder()
			.setEnable(gnSocketAppSettings["enable"] || true)
			.setOrigins(gnSocketAppSettings["allowOrigin"] || "*")
			.addMethods(gnSocketAppSettings["allowMethods"] || ["GET"])
			.setCredentials(gnSocketAppSettings["credentials"] || true)
			.setEnablePostViaMsgPack(gnSocketAppSettings["enablePostViaMsgPack"] || true)
			.setEnablePostViaJson(gnSocketAppSettings["enablePostViaJson"] || true)
			.addAllowedHeaders(gnSocketAppSettings["allowHeaders"] || [])
			.setPingInterval(gnSocketAppSettings["pingInterval"] || 50000)
			.setPingTimeout(gnSocketAppSettings["pingTimeout"] || 5000)
			.setEnableSendAndReceiveDebug(gnSocketAppSettings["enableSendAndReceiveDebug"] || true)
			.build();

		let gnAdminViewSettings = this.gnConfig["adminViewSettings"];
		if (gnAdminViewSettings == null) gnAdminViewSettings = {
			"debugViewEnable": true,
			"logViewEnable": true,
			"debugHashs": ["hashhere"]
		}
		let adminViewSettings = AdminViewSettings.Builder()
			.setEnable(gnAdminViewSettings["enable"] || true)
			.setDebugViewEnable(gnAdminViewSettings["debugViewEnable"] || true)
			.setLogViewEnable(gnAdminViewSettings["logViewEnable"] || true)
			.setDebugHashs(gnAdminViewSettings["debugHashs"] || ["hashhere"])
			.build();

		let gnOtherSettings = this.gnConfig["otherSettings"];
		if (gnOtherSettings == null) gnOtherSettings = {
			"adapterEventCollectionName": "AdapterEventCollection",
			"authInfoCollectionName": "AuthInfoCollection",
			"configCollectionName": "Config",
			"packageName": "com.xmobitea.GNServer",
			"appleClientId": "com.xmobitea.GNServer",
			"googleClientId": "gn-server",
			"headerIP": "x-ip"
		}
		let otherSettings = OtherSettings.Builder()
			.setAdapterEventCollectionName(gnOtherSettings["adapterEventCollectionName"] || "AdapterEventCollection")
			.setAuthTokenCollectionName(gnOtherSettings["authInfoCollectionName"] || "AuthInfoCollection")
			.setConfigGameCollectionName(gnOtherSettings["configCollectionName"] || "Config")
			.setPackageName(gnOtherSettings["packageName"] || "com.xmobitea.GNServer")
			.setAppleClientId(gnOtherSettings["appleClientId"] || "com.xmobitea.GNServer")
			.setGoogleClientId(gnOtherSettings["googleClientId"] || "gn-server")
			.setHeaderIP(gnOtherSettings["headerIP"] || "x-ip")
			.build();

		let gnDatabaseSettings = this.gnConfig["databaseSettings"];
		if (gnDatabaseSettings == null) gnDatabaseSettings = {
			"connectionString": "mongodb://127.0.0.1:27017/",
			"databaseName": "XmobiTea",
			"databaseGameName": "GN.",
			"options": {
			}
		}
		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString(gnDatabaseSettings["connectionString"] || "mongodb://127.0.0.1:27017/")
			.setDatabaseName(gnDatabaseSettings["databaseName"] || "XmobiTea")
			.setGameName(gnDatabaseSettings["databaseGameName"] || "GN.")
			.setOptions(gnDatabaseSettings["options"] || {})
			.build();

		let gnMailSettings = this.gnConfig["mailSettings"];
		if (gnMailSettings == null) gnMailSettings = {
			"enable": false,
			"sendFrom": "changx@xmobitea.com",
			"sendGridApiKey": "SG."
		}
		let mailSettings = MailSettings.Builder()
			.setEnable(gnMailSettings["enable"] || false)
			.setFromEmail(gnMailSettings["sendFrom"] || "changx@xmobitea.com")
			.setSendGridApiKey(gnMailSettings["sendGridApiKey"] || "SG.")
			.build();

		let gnLogSettings = this.gnConfig["logSettings"];
		if (gnLogSettings == null) gnLogSettings = {
			"logToConsoleEnable": true,
			"logToFileEnable": true,
			"logPath": "./log/debug/Server.log"
		}
		let logSettings = LogSettings.Builder()
			.setLogToFileEnable(gnLogSettings["logToFileEnable"] || true)
			.setLogToConsoleEnable(gnLogSettings["logToConsoleEnable"] || true)
			.setLogPath(gnLogSettings["logPath"] || "./log/debug/Server.log")
			.build();

		let gnUploadFileSettings = this.gnConfig["uploadFileSettings"];
		if (gnUploadFileSettings == null) gnUploadFileSettings = {
			"enable": true,
			"uploadPath": "./file-upload",
			"maxSizeUpload": 52428800,
			"mimeTypeAccepts": ["image/png"]
		}
		let uploadFileSettings = UploadFileSettings.Builder()
			.setEnable(gnUploadFileSettings["enable"] || true)
			.setUploadPath(gnUploadFileSettings["uploadPath"] || "./file-upload")
			.setMaxSizeUpload(gnUploadFileSettings["maxSizeUpload"] || 52428800)
			.setMimeTypeAccepts(gnUploadFileSettings["mimeTypeAccepts"] || ["image/png"])
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
			"reportDdosCollectionName": "ReportDdosCollection",
			"banDdosCollectionName": "BanDdosCollection"
		}
		let ddosSettings = DdosSettings.Builder()
			.setSocketMaxRequestPerSecondPerIp(gnDdosSettings["socketMaxRequestPerSecondPerIp"] || 50)
			.setSocketMaxRequestPerSecondPerPeer(gnDdosSettings["socketMaxRequestPerSecondPerPeer"] || 20)
			.setSocketMaxPendingRequest(gnDdosSettings["socketMaxPendingRequest"] || 1000)
			.setSocketMaxRequestSize(gnDdosSettings["socketMaxRequestSize"] || 1024)
			.setHttpMaxRequestPerSecondPerIp(gnDdosSettings["httpMaxRequestPerSecondPerIp"] || 50)
			.setHttpMaxRequestPerSecondPerPeer(gnDdosSettings["httpMaxRequestPerSecondPerPeer"] || 20)
			.setHttpMaxPendingRequest(gnDdosSettings["httpMaxPendingRequest"] || 1000)
			.setHttpMaxRequestSize(gnDdosSettings["httpMaxRequestSize"] || 1024)
			.setMaxUploadPendingRequest(gnDdosSettings["maxUploadPendingRequest"] || 200)
			.setMaxDownloadPendingRequest(gnDdosSettings["maxDownloadPendingRequest"] || 200)
			.setReportDdosCollectionName(gnDdosSettings["reportDdosCollectionName"] || "ReportDdosCollection")
			.setBanDdosCollectionName(gnDdosSettings["banDdosCollectionName"] || "BanDdosCollection")
			.build();

		this.serverApplication = this.newServerApplication(
			applicationSettings,
			httpAppSettings,
			socketAppSettings,
			adminViewSettings,
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

}
