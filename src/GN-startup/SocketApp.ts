import { SocketAppSettings } from "./settings/SocketAppSettings";

import { Server } from "socket.io";
import http from "http";
import { SocketAppHandler } from "./routes/SocketAppHandler";
import { GameApplication } from "./../GN-app-api/handler/GameApplication";

export class SocketApp {
	private appSettings: SocketAppSettings;
	private server: http.Server;

	public setServer(server: http.Server): void {
		this.server = server;
	}

	public getServer(): http.Server {
		return this.server;
	}

	public setAppSettings(appSettings: SocketAppSettings): void {
		this.appSettings = appSettings;
	}

	public run(): void {
		if (this.appSettings.getEnable()) {
			const io = new Server(this.server, {
				pingInterval: this.appSettings.getPingInterval(),
				pingTimeout: this.appSettings.getPingTimeout(),
			});

			let socketAppHandler = new SocketAppHandler();
			socketAppHandler.setServer(io);
			socketAppHandler.setGameApplication(GameApplication.getInstance());

			socketAppHandler.run();
		}
	}

	constructor() {}
}
