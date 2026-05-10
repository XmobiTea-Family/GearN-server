import { SocketAppSettings } from "./settings/SocketAppSettings";

import { Server } from "socket.io";
import http from "http";
import { SocketAppHandler } from "./routes/SocketAppHandler";
import { createAdapter } from "@socket.io/mongo-adapter";
import { Emitter } from "@socket.io/mongo-emitter";
import * as mongodb from "mongodb";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { GNServer } from "./../GNServer";

export class SocketApp {
    // Stores the app settings value used by this instance.
    private appSettings: SocketAppSettings;
    // Stores the server value used by this instance.
    private server: http.Server;
    // Stores the socket app handler value used by this instance.
    private socketAppHandler: SocketAppHandler;
    // Stores the API middleware value used by this instance.
    private apiMiddleware: ApiMiddleware;
    // Stores the anti DDoS middleware value used by this instance.
    private antiDdosMiddleware: AntiDdosMiddleware;
    // Stores the io value used by this instance.
    private io: Server;

    // Stores the GearN server value used by this instance.
    private gnServer: GNServer;

    // Stores the emitter value used by this instance.
    private emitter: Emitter;

    /**
     * Sets the server.
     * @param server Provides the server value used by this operation.
     */
    public setServer(server: http.Server): void {
        this.server = server;
    }

    /**
     * Sets the GearN server.
     * @param gnServer Provides the GearN server value used by this operation.
     */
    public setGNServer(gnServer: GNServer): void {
        this.gnServer = gnServer;
    }

    /**
     * Returns the HTTP server.
     * @returns Returns the HTTP server.
     */
    public getHttpServer(): http.Server {
        return this.server;
    }

    /**
     * Returns the IO.
     * @returns Returns the IO.
     */
    public getIO(): Server {
        return this.io;
    }

    /**
     * Returns the emitter.
     * @returns Returns the emitter.
     */
    public getEmitter(): Emitter {
        return this.emitter;
    }

    /**
     * Returns the socket app handler.
     * @returns Returns the socket app handler.
     */
    public getSocketAppHandler(): SocketAppHandler {
        return this.socketAppHandler;
    }

    /**
     * Sets the API middleware.
     * @param apiMiddleware Provides the API middleware value used by this operation.
     */
    public setApiMiddleware(apiMiddleware: ApiMiddleware) {
        this.apiMiddleware = apiMiddleware;
    }

    /**
     * Sets the app settings.
     * @param appSettings Provides the app settings value used by this operation.
     */
    public setAppSettings(appSettings: SocketAppSettings): void {
        this.appSettings = appSettings;
    }

    /**
     * Sets the anti DDoS middleware.
     * @param antiDdosMiddleware Provides the anti DDoS middleware value used by this operation.
     */
    public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
        this.antiDdosMiddleware = antiDdosMiddleware;
    }

    /**
     * Runs the current workflow.
     */
    public run(): void {
        this.io = new Server(this.server, {
            pingInterval: this.appSettings.getPingInterval(),
            pingTimeout: this.appSettings.getPingTimeout(),

            cors: {
                origin: this.appSettings.getOrigin(),
                allowedHeaders: this.appSettings.getAllowedHeaders(),
                credentials: this.appSettings.getCredentials(),
                methods: this.appSettings.getMethods(),
            },
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

    /**
     * Sets the emitter.
     * @param adapterEventCollection Provides the adapter event collection used by this operation.
     */
    public setEmitter(adapterEventCollection: mongodb.Collection<mongodb.Document>) {
        this.emitter = new Emitter(adapterEventCollection);

        if (this.appSettings.getUseEmitter() && this.socketAppHandler != null) {
            this.socketAppHandler.setEmitter(this.emitter);
        }

        this.io.adapter(createAdapter(adapterEventCollection, {}) as any);
    }

    /**
     * Initializes a new socket app instance.
     */
    constructor() {}
}
