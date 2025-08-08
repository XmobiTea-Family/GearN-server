import { SocketAppSettings } from "./settings/SocketAppSettings";

import { Server } from "socket.io";
import http from "http";
import { SocketAppHandler } from "./routes/SocketAppHandler";
import { createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import * as mongoDB from "mongodb";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { GNServer } from "./../GNServer";

export class SocketApp {
	private appSettings: SocketAppSettings;
	private server: http.Server;
	private socketAppHandler: SocketAppHandler;
	private apiMiddleware: ApiMiddleware;
	private antiDdosMiddleware: AntiDdosMiddleware;
	private io: Server;

	private gnServer: GNServer;

	private emitter: Emitter;

	public setServer(server: http.Server): void {
		this.server = server;
	}

	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
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

	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	public setAppSettings(appSettings: SocketAppSettings): void {
		this.appSettings = appSettings;
	}

	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	public run(): void {
		this.io = new Server(this.server, {
			pingInterval: this.appSettings.getPingInterval(),
			pingTimeout: this.appSettings.getPingTimeout(),

			cors: {
				origin: this.appSettings.getOrigin(),
				allowedHeaders: this.appSettings.getAllowedHeaders(),
				credentials: this.appSettings.getCredentials(),
				methods: this.appSettings.getMethods(),
			}
		});

		this.socketAppHandler = new SocketAppHandler();
		if (this.appSettings.getUseEmitter()) {
			this.socketAppHandler.setEmitter(this.emitter);
		}

		this.socketAppHandler.setServer(this.io);
		this.socketAppHandler.setApiMiddleware(this.apiMiddleware);
		this.socketAppHandler.setAntiDdosMiddleware(this.antiDdosMiddleware);
		this.socketAppHandler.setEnableSendAndReceiveDebug(this.appSettings.getEnableSendAndReceiveDebug());
		this.socketAppHandler.setEnablePostViaMsgPack(this.appSettings.getEnablePostViaMsgPack());
		this.socketAppHandler.setEnablePostViaJson(this.appSettings.getEnablePostViaJson());
		this.socketAppHandler.setDatabase(this.gnServer.getDatabase());

		if (this.appSettings.getEnable()) {
			this.socketAppHandler.run();
		}
	}

	public setEmitter(adapterEventCollection: mongoDB.Collection<mongoDB.Document>) {
		this.emitter = new Emitter(adapterEventCollection);

		if (this.appSettings.getUseEmitter() && this.socketAppHandler != null) {
			this.socketAppHandler.setEmitter(this.emitter);
		}

		this.io.adapter(createAdapter(adapterEventCollection, {

		}) as any);

	}

	constructor() { }

}
