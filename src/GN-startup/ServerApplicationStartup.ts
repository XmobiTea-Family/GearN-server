import { DefaultApplicationStartup } from "./DefaultApplicationStartup";

import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { MailSettings } from "./settings/MailSettings";
import { OnRunSuccess } from "./../GN-library/xbuilder/lib/OnRunSuccess";

import dotenv from "dotenv";

export class ServerApplicationStartup extends DefaultApplicationStartup {
	public configPathEnv(pathEnv: string): void {
		dotenv.config({
			path: __dirname + pathEnv,
		});
	}

	public run(onRunSuccess?: OnRunSuccess): void {
		let applicationSettings = ApplicationSettings.Builder()
			.setUseSSL(process.env.USE_SSL === "TRUE")
			.setCertFilePath(process.env.CERT_FILE_PATH)
			.setKeyFilePath(process.env.KEY_FILE_PATH)
			.setPort(Number.parseInt(process.env.PORT))
			.build();

		let httpAppSettings = HttpAppSettings.Builder()
			.setEnable(process.env.HTTP_APP_ENABLE === "TRUE")
			.setOrigin(process.env.HTTP_APP_ALLOW_ORIGIN)
			.addMethods("GET", "POST")
			.setCredentials(process.env.HTTP_APP_CREDENTIALS === "TRUE")
			.addAllowedHeaders(process.env.HTTP_APP_ALLOW_HEADERS)
			.build();

		let socketAppSettings = SocketAppSettings.Builder()
			.setEnable(process.env.SOCKET_APP_ENABLE === "TRUE")
			.setPingInterval(Number.parseInt(process.env.SOCKET_APP_PING_INTERVAL))
			.setPingTimeout(Number.parseInt(process.env.SOCKET_APP_PING_TIMEOUT))
			.build();

		let otherSettings = OtherSettings.Builder()
			.setAdapterEventCollectionName(process.env.ADAPTER_EVENT_COLLECTION_NAME)
			.setAuthTokenCollectionName(process.env.AUTH_INFO_COLLECTION_NAME)
			.setConfigGameCollectionName(process.env.CONFIG_COLLECTION_NAME)
			.setPackageName(process.env.PACKAGE_NAME)
			.build();

		let databaseSettings = DatabaseSettings.Builder()
			.setConnectionString(process.env.DATABASE_CONNECTION_STRING)
			.setDatabaseName(process.env.DATABASE_NAME)
			.setGameName(process.env.DATABASE_GAME_NAME)
			.setMinPoolSize(Number.parseInt(process.env.DATABASE_MIN_POOL_SIZE))
			.setMaxPoolSize(Number.parseInt(process.env.DATABASE_MAX_POOL_SIZE))
			.build();

		let mailSettings = MailSettings.Builder()
			.setEnable(process.env.MAIL_ENABLE === "TRUE")
			.setFromEmail(process.env.MAIL_SEND_FROM)
			.setSendGridApiKey(process.env.MAIL_SG_API_KEY)
			.build();

		this.serverApplication = this.newServerApplication(applicationSettings, httpAppSettings, socketAppSettings, otherSettings, databaseSettings, mailSettings);

		this.serverApplication.run(() => {
			if (onRunSuccess != null) onRunSuccess();
		});
	}
}
