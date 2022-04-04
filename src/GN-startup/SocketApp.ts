import { SocketAppSettings } from "./settings/SocketAppSettings";

import { Server } from "socket.io";
import http from "http";
import { SocketAppHandler } from "./routes/SocketAppHandler";
import { createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import * as mongoDB from "mongodb";

export class SocketApp {
	private appSettings: SocketAppSettings;
	private server: http.Server;
	private socketAppHandler: SocketAppHandler;
	private io: Server;

	private emitter: Emitter;

	public setServer(server: http.Server): void {
		this.server = server;
	}

	public getHttpServer(): http.Server {
		return this.server;
	}

	public getIO(): Server {
		return this.io;
	}

	public getEmitter(): Emitter {
		return this.emitter;
	}

	public getSocketAppHandler(): SocketAppHandler {
		return this.socketAppHandler;
	}

	public setAppSettings(appSettings: SocketAppSettings): void {
		this.appSettings = appSettings;
	}

	public run(): void {
		this.io = new Server(this.server, {
			pingInterval: this.appSettings.getPingInterval(),
			pingTimeout: this.appSettings.getPingTimeout(),
		});

		this.socketAppHandler = new SocketAppHandler();
		this.socketAppHandler.setEmitter(this.emitter);
		this.socketAppHandler.setServer(this.io);

		if (this.appSettings.getEnable()) {
			this.socketAppHandler.run();
		}
	}

	public setEmitter(adapterEventCollection: mongoDB.Collection<mongoDB.Document>) {
		this.emitter = new Emitter(adapterEventCollection);
		this.io.adapter(createAdapter(adapterEventCollection));
	}

	constructor() {}
}
