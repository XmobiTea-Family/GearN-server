import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ServerApplication } from "./ServerApplication";

export class ApplicationStartup {
	public run(): void {
		let applicationSettings = ApplicationSettings.Builder().setPort(2202).build();

		let httpAppSettings = HttpAppSettings.Builder().setEnable(true).setOrigin("*").addMethods("GET").setCredentials(true).addAllowedHeaders("authtoken").build();

		let socketAppSettings = SocketAppSettings.Builder().setEnable(true).setPingInterval(50000).setPingTimeout(5000).build();

		let serverApplication = ServerApplication.Builder()
			.setApplicationSettings(applicationSettings)
			.setHttpAppSettings(httpAppSettings)
			.setSocketAppSettings(socketAppSettings)
			.build();

		console.log("GN Server init");

		serverApplication.run((port) => {
			console.log("GN Server is running on port " + port);
		});
	}
}

process.on("uncaughtException", (uncaughtException: Error) => {
	console.log("Uncaught Exception at: %s - message: %s", uncaughtException.stack, uncaughtException.message);
});

process.on("uncaughtError", (uncaughtException: Error) => {
	console.log("Uncaught Error at: %s - message: %s", uncaughtException.stack, uncaughtException.message);
});

process.on("unhandledRejection", (reason: Error) => {
	console.log("Unhandled Rejection at: %s - message: %s", reason.stack, reason.message);
});
