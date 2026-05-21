import { HttpAppSettings } from "./settings/HttpAppSettings";
import { HttpAppHandler } from "./routes/HttpAppHandler";
import { UploadFileHandler } from "./routes/UploadFileHandler";
import { ClusterHandler } from "./routes/ClusterHandler";

import cors from "cors";
import express, { Express } from "express";
import { ApiMiddleware } from "./middleware/ApiMiddleware";
import { UploadFileMiddleware } from "./middleware/UploadFileMiddleware";
import { GNServer } from "./../GNServer";
import { UploadFileSettings } from "./settings/UploadFileSettings";
import { AntiDdosMiddleware } from "./middleware/AntiDdosMiddleware";
import { SocketAppSettings } from "./settings/SocketAppSettings";
import { ApplicationSettings } from "./settings/ApplicationSettings";
import { LogSettings } from "./settings/LogSettings";
import { ClusterSettings } from "./settings/ClusterSettings";

export class HttpApp {
    // Startup configuration injected before routes are registered.
    private applicationSettings: ApplicationSettings;
    private uploadFileSettings: UploadFileSettings;
    private appSettings: HttpAppSettings;
    private socketAppSettings: SocketAppSettings;
    private clusterSettings: ClusterSettings;

    // Express objects and route handlers created during HTTP bootstrap.
    private app: Express;
    private httpAppHandler: HttpAppHandler;
    private uploadFileHandler: UploadFileHandler;
    private clusterHandler: ClusterHandler;

    // Shared runtime services consumed by HTTP routes.
    private antiDdosMiddleware: AntiDdosMiddleware;
    private logSettings: LogSettings;
    private apiMiddleware: ApiMiddleware;
    private uploadFileMiddleware: UploadFileMiddleware;
    private gnServer: GNServer;

    // Per-process header name used by the transport/session handshake.
    private sessionId: string;

    public setApp(app: Express): void {
        this.app = app;
    }

    public getApp(): Express {
        return this.app;
    }

    public getHttpAppHandler(): HttpAppHandler {
        return this.httpAppHandler;
    }

    public getUploadFileHandler(): UploadFileHandler {
        return this.uploadFileHandler;
    }

    public getClusterHandler(): ClusterHandler {
        return this.clusterHandler;
    }

    public setApiMiddleware(apiMiddleware: ApiMiddleware) {
        this.apiMiddleware = apiMiddleware;
    }

    public setUploadFileMiddleware(uploadFileMiddleware: UploadFileMiddleware) {
        this.uploadFileMiddleware = uploadFileMiddleware;
    }

    public setApplicationSettings(applicationSettings: ApplicationSettings): void {
        this.applicationSettings = applicationSettings;
    }

    public setAppSettings(appSettings: HttpAppSettings): void {
        this.appSettings = appSettings;
    }

    public setSocketAppSettings(socketAppSettings: SocketAppSettings): void {
        this.socketAppSettings = socketAppSettings;
    }

    public setClusterSettings(clusterSettings: ClusterSettings): void {
        this.clusterSettings = clusterSettings;
    }

    public setUploadFileSettings(uploadFileSettings: UploadFileSettings): void {
        this.uploadFileSettings = uploadFileSettings;
    }

    public setGNServer(gnServer: GNServer): void {
        this.gnServer = gnServer;
    }

    public setSessionId(sessionId: string): void {
        this.sessionId = sessionId;
    }

    public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
        this.antiDdosMiddleware = antiDdosMiddleware;
    }

    public setLogSettings(logSettings: LogSettings): void {
        this.logSettings = logSettings;
    }

    /**
     * Registers the HTTP routes, upload endpoints, cluster endpoints, and health probes.
     */
    public run(): void {
        if (this.appSettings.getTrustProxy()) this.app.enable("trust proxy");

        this.app.use(express.urlencoded({ extended: false }));

        this.app.get("/", (req: express.Request, res: express.Response): any => {
            return res.sendStatus(403);
        });

        this.app.post("/", (req: express.Request, res: express.Response): any => {
            return res.sendStatus(403);
        });
        // Add the per-process session header so CORS allows clients to echo it back.
        let allowedHeaders = this.appSettings.getAllowedHeaders();
        allowedHeaders.push(this.sessionId);

        this.app.use(
            cors({
                origin: this.appSettings.getOrigin(),
                allowedHeaders: allowedHeaders,
                credentials: this.appSettings.getCredentials(),
                methods: this.appSettings.getMethods(),
            }),
        );

        this.app.post("/ping", (req: express.Request, res: express.Response): any => {
            return res.sendStatus(200);
        });

        this.app.get("/ping", (req: express.Request, res: express.Response): any => {
            return res.sendStatus(200);
        });

        this.app.get("/healthcheck", (req: express.Request, res: express.Response): any => {
            // Current node status plus the latest view of peer nodes in the cluster.
            let thisInstance = this.clusterHandler.getInstanceInfoStatus();
            let otherInstances = this.clusterHandler.getInstanceInfos();

            // Response shape for the current node, enriched with ISO timestamps for quick inspection.
            let thisInstanceResponseData: {
                // Stable cluster node identifier.
                instanceId: string;
                // Whether this node currently believes it is the primary node.
                isPrimary: boolean;
                // Node id currently recognized as primary.
                currentInstanceIdPrimary: string;
                // Last heartbeat timestamp seen for the current primary.
                currentTsPrimary: number;
                // ISO rendering of `currentTsPrimary`.
                currentTsPrimaryToDate: string;
                // Local timestamp for when this node became/observed primary.
                tsPrimary: number;
                // ISO rendering of `tsPrimary`.
                tsPrimaryToDate: string;
            } = {
                instanceId: thisInstance.instanceId,
                isPrimary: thisInstance.isPrimary,
                currentInstanceIdPrimary: thisInstance.currentInstanceIdPrimary,
                currentTsPrimary: thisInstance.currentTsPrimary,
                currentTsPrimaryToDate: new Date(thisInstance.currentTsPrimary).toISOString(),
                tsPrimary: thisInstance.tsPrimary,
                tsPrimaryToDate: new Date(thisInstance.tsPrimary).toISOString(),
            };

            // Response shape for peer nodes tracked by the cluster handler.
            let otherInstancesResponseData: {
                // Stable cluster node identifier.
                instanceId: string;
                // Whether that peer currently reports itself as primary.
                isPrimary: boolean;
                // Node id currently recognized as primary by that peer.
                currentInstanceIdPrimary: string;
                // Last heartbeat timestamp seen for the current primary.
                currentTsPrimary: number;
                // ISO rendering of `currentTsPrimary`.
                currentTsPrimaryToDate: string;
                // Peer-local timestamp for when it became/observed primary.
                tsPrimary: number;
                // ISO rendering of `tsPrimary`.
                tsPrimaryToDate: string;
                // Number of missed heartbeats detected for that peer.
                lostPing: number;
            }[] = [];

            for (let i = 0; i < otherInstances.length; i++) {
                let otherInstance = otherInstances[i];

                otherInstancesResponseData.push({
                    instanceId: otherInstance.instanceId,
                    isPrimary: otherInstance.isPrimary,
                    currentInstanceIdPrimary: otherInstance.currentInstanceIdPrimary,
                    currentTsPrimary: otherInstance.currentTsPrimary,
                    currentTsPrimaryToDate: new Date(otherInstance.currentTsPrimary).toISOString(),
                    tsPrimary: otherInstance.tsPrimary,
                    tsPrimaryToDate: new Date(otherInstance.tsPrimary).toISOString(),
                    lostPing: otherInstance.lostPing,
                });
            }

            return res.status(200).json({
                data: {
                    thisInstance: thisInstanceResponseData,
                    otherInstances: otherInstancesResponseData,
                },
            });
        });

        this.httpAppHandler = new HttpAppHandler();
        this.httpAppHandler.setRouter(this.app);
        this.httpAppHandler.setApiMiddleware(this.apiMiddleware);
        this.httpAppHandler.setAntiDdosMiddleware(this.antiDdosMiddleware);
        this.httpAppHandler.setGNServer(this.gnServer);
        this.httpAppHandler.setEnableSendAndReceiveDebug(this.appSettings.getEnableSendAndReceiveDebug());
        this.httpAppHandler.setEnablePostViaMsgPack(this.appSettings.getEnablePostViaMsgPack());
        this.httpAppHandler.setEnablePostViaJson(this.appSettings.getEnablePostViaJson());

        if (this.appSettings.getEnable()) {
            this.httpAppHandler.run();
        }

        this.uploadFileHandler = new UploadFileHandler();
        this.uploadFileHandler.setRouter(this.app);
        this.uploadFileHandler.setApiMiddleware(this.apiMiddleware);
        this.uploadFileHandler.setAntiDdosMiddleware(this.antiDdosMiddleware);
        this.uploadFileHandler.setUploadFileMiddleware(this.uploadFileMiddleware);
        this.uploadFileHandler.setUploadPath(this.uploadFileSettings.getUploadPath());

        this.uploadFileHandler.init();
        if (this.uploadFileSettings.getEnable()) {
            this.uploadFileHandler.run();
        }

        this.clusterHandler = new ClusterHandler();
        this.clusterHandler.setRouter(this.app);
        this.clusterHandler.setInstanceId(this.clusterSettings.getInstanceId());
        this.clusterHandler.setIsPrimary(this.clusterSettings.getIsPrimary());
        this.clusterHandler.setPrivateKeyToken(this.clusterSettings.getPrivateKeyToken());
        this.clusterHandler.setAllNodes(this.clusterSettings.getAllNodes());

        this.clusterHandler.init();
        this.clusterHandler.run();
    }
    constructor() {}
}
