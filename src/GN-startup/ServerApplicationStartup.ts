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

export class ServerApplicationStartup extends DefaultApplicationStartup {
	private gnConfig: { [k: string]: any };

	public config(gnConfig: {}): void {
		this.gnConfig = gnConfig;
	}

	public run(onRunSuccess?: OnRunSuccess): void {
		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(this.gnConfig["useSsl"])
			.setCertFilePath(this.gnConfig["keyFilePath"])
			.setKeyFilePath(this.gnConfig["certFilePath"])
			.setPort(this.gnConfig["port"])
			.build();

		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(this.gnConfig["httpAppEnable"])
			.setOrigin(this.gnConfig["httpAppAllowOrigin"])
			.addMethods(this.gnConfig["httpAppAllowMethods"])
			.setCredentials(this.gnConfig["httpAppCredentials"])
			.addAllowedHeaders(this.gnConfig["httpAppAllowHeaders"])
			.setEnableSendAndReceiveDebug(this.gnConfig["httpAppEnableSendAndReceiveDebug"])
			.setEnablePostViaMsgPack(this.gnConfig["httpAppEnablePostViaMsgPack"])
			.setEnablePostViaJson(this.gnConfig["httpAppEnablePostViaJson"])
			.build();

		let socketAppSettings = SocketAppSettings.Builder()
			.setEnable(this.gnConfig["socketAppEnable"])
			.setPingInterval(this.gnConfig["socketAppPingInterval"])
			.setPingTimeout(this.gnConfig["socketAppPingTimeout"])
			.setEnableSendAndReceiveDebug(this.gnConfig["socketAppEnableSendAndReceiveDebug"])
			.build();

		let otherSettings = OtherSettings.Builder()
			.setAdapterEventCollectionName(this.gnConfig["adapterEventCollectionName"])
			.setAuthTokenCollectionName(this.gnConfig["authInfoCollectionName"])
			.setConfigGameCollectionName(this.gnConfig["configCollectionName"])
			.setPackageName(this.gnConfig["packageName"])
			.build();

		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString(this.gnConfig["databaseConnectionString"])
			.setDatabaseName(this.gnConfig["databaseName"])
			.setGameName(this.gnConfig["databaseGameName"])
			.setMinPoolSize(this.gnConfig["databaseMinPoolSize"])
			.setMaxPoolSize(this.gnConfig["databaseMaxPoolSize"])
			.build();

		let mailSettings = MailSettings.Builder()
			.setEnable(this.gnConfig["mailEnable"])
			.setFromEmail(this.gnConfig["mailSendFrom"])
			.setSendGridApiKey(this.gnConfig["mailSendGridApiKey"])
			.build();

		let logSettings = LogSettings.Builder()
			.setLogToFileEnable(this.gnConfig["logToFileEnable"])
			.setLogToConsoleEnable(this.gnConfig["logToConsoleEnable"])
			.setLogPath(this.gnConfig["logPath"])
			.build();

		let uploadFileSettings = UploadFileSettings.Builder()
			.setEnable(this.gnConfig["uploadFileEnable"])
			.setUploadPath(this.gnConfig["uploadPath"])
			.setMaxSizeUpload(this.gnConfig["maxSizeUpload"])
			.setMimeTypeAccepts(this.gnConfig["mimeTypeAccepts"])
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
}
