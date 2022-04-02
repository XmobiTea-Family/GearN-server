import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ServerApplication } from "./ServerApplication";
import { GameApplication } from "../GameApplication";
import { OtherSettings } from "./settings/OtherSettings";
import { DatabaseSettings } from "./settings/DatabaseSettings";
import { MailSettings } from "./settings/MailSettings";

export class DefaultApplicationStartup {
	protected serverApplication: ServerApplication;

	public run(): void {
		let applicationSettings = ApplicationSettings.Builder().setUseSSL(false).setCertFilePath("").setKeyFilePath("").setPort(2202).build();

		let httpAppSettings = HttpAppSettings.Builder().setEnable(true).setOrigin("*").addMethods("GET", "POST").setCredentials(true).addAllowedHeaders("authtoken").build();

		let socketAppSettings = SocketAppSettings.Builder().setEnable(true).setPingInterval(50000).setPingTimeout(5000).build();

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

		let mailSettings = MailSettings.Builder().setFromEmail("changx@xmobitea.com").setSendGridApiKey("SG.HtH0ZjTQTRqeHBARvEgktQ.f9vle8kPkWDVkqhmdNKZWYuGBFak!__rHVUGPicPlko").build();

		this.serverApplication = ServerApplication.Builder()
			.setApplicationSettings(applicationSettings)
			.setHttpAppSettings(httpAppSettings)
			.setSocketAppSettings(socketAppSettings)
			.setOtherSettings(otherSettings)
			.setDatabaseSettings(databaseSettings)
			.setMailSettings(mailSettings)
			.build();

		console.log("GN Server init");
		this.serverApplication.run(() => {
			console.log("GN Server now is running!");
		});
	}

	public getGameApplication(): GameApplication {
		return this.serverApplication.getGameApplication();
	}
}
