// Persisted server version used during bootstrap and future database compatibility checks.
const GN_VERSION = "2.6";

import { RequestController } from "./GN-app-api/handler/controller/RequestController";
import { OperationEvent } from "./GN-common/entity/operationEvent/OperationEvent";
import { Socket } from "socket.io";
import { xDatabase } from "./GN-library/xdatabase/lib/xDatabase";
import { FacebookService } from "./GN-app-api/service/FacebookService";
import { SocketApp } from "./GN-startup/SocketApp";
import { HttpApp } from "./GN-startup/HttpApp";
import { IRequestHandler } from "./GN-app-api/handler/controller/handler/base/IRequestHandler";
// import { AuthInfo } from "./GN-common/entity/AuthInfo";
import { OperationResponse } from "./GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./GN-common/entity/operationRequest/base/Request";

import { AppleService } from "./GN-app-api/service/AppleService";
import { TimerService } from "./GN-app-api/service/TimerService";
import { IFacebookService } from "./GN-app-api/service/IFacebookService";
import { IAppleService } from "./GN-app-api/service/IAppleService";
import { ICloudScriptService } from "./GN-app-api/service/ICloudScriptService";
import { ITimerService } from "./GN-app-api/service/ITimerService";
import { OnRunSuccess } from "./GN-library/xbuilder/lib/OnRunSuccess";
import { ApiMiddleware } from "./GN-startup/middleware/ApiMiddleware";
import { IRequestConverterService } from "./GN-app-api/service/IRequestConverterService";
import { RequestConverterService } from "./GN-app-api/service/RequestConverterService";
import { IGoogleService } from "./GN-app-api/service/IGoogleService";
import { GoogleService } from "./GN-app-api/service/GoogleService";
import { CodeHelper } from "./GN-common/helper/CodeHelper";
import { IAnalyticsService } from "./GN-app-api/service/IAnalyticsService";
import { AnalyticsService } from "./GN-app-api/service/AnalyticsService";
import { IPushNotificationService } from "./GN-app-api/service/IPushNotificationService";
import { PushNotificationService } from "./GN-app-api/service/PushNotificationService";
import { IEmailService } from "./GN-app-api/service/IEmailService";
import { EmailService } from "./GN-app-api/service/EmailService";
import { ICacheService } from "./GN-app-api/service/ICacheService";
import { IConfigService } from "./GN-app-api/service/IConfigService";

import { RequestType } from "./GN-common/constant/enumType/RequestType";
import { xGNSettings } from "./GN-library/xsettings/lib/xGNSettings";
import { IPostEventCallbackService, IPreEventCallbackService } from "./GN-app-api/service/IEventCallbackService";
import { EventCallbackCloudScriptService, IEventCallbackCloudScriptService, PostEventCallbackService, PreEventCallbackService } from "./GN-app-api/service/EventCallbackService";
import { ICloudScriptEventService, CloudScriptEventService } from "./GN-app-api/service/CloudScriptEventService";

import { IMatchmakingService, MatchmakingTicketCanMatch } from "./GN-app-api/service/IMatchmakingService";
import { MatchmakingService } from "./GN-app-api/service/MatchmakingService";
import { xDatetime } from "./GN-library/xdatetime/lib/xDatetime";
import { IGameCenterService } from "./GN-app-api/service/IGameCenterService";
import { IGooglePlayGameService } from "./GN-app-api/service/IGooglePlayGameService";
import { GooglePlayGameService } from "./GN-app-api/service/GooglePlayGameService";
import { GameCenterService } from "./GN-app-api/service/GameCenterService";
import { ICountryIPDetailService } from "./GN-app-api/service/ICountryIPDetailService";
import { CountryIPDetailService } from "./GN-app-api/service/CountryIPDetailService";
import { MatchmakingTicketStatus } from "./GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchStatus } from "./GN-common/constant/enumType/MatchStatus";
import { ServerDetail } from "./GN-library/xdatabase/lib/entity/pro/ServerDetail";
import { Debug } from "./GN-library/xdebug/lib/xDebug";
import * as mongodb from "mongodb";
import { GNHashtable } from "./GN-common/common/GNData";
import { RequestControllerUtils } from "./RequestControllerUtils";
import { AuthInfo } from "./GN-common/entity/AuthInfo";
import { SecretInfo } from "./GN-common/entity/SecretInfo";
import { GroupStatus } from "./GN-common/constant/enumType/GroupStatus";

interface CreateIndexesOptions {
    // Create the index as unique.
    unique?: boolean;
    // Skip documents that do not contain the indexed field.
    sparse?: boolean;
    // Turn the index into a TTL index when provided.
    expireAfterSeconds?: number;
}

/**
 * Runtime coordinator that connects transports, request dispatch, cross-cutting services, and scheduled jobs.
 */
export class GNServer {
    /**
     * Returns the persisted server version string used during bootstrap and compatibility checks.
     */
    public static getServerVersion(): string {
        return GN_VERSION;
    }

    // Transport layers injected by `ServerApplication`.
    private socketApp: SocketApp;
    private httpApp: HttpApp;
    private apiMiddleware: ApiMiddleware;

    // Central request dispatcher shared by HTTP and socket transports.
    private requestController: RequestController;

    // Runtime identity/config flags resolved at startup.
    private idTypeCase: number;
    private initRootUsername: string;
    private restoreRootPassword: string;
    private xGNSettings: xGNSettings;
    private xDatabase: xDatabase;

    // Cross-cutting services used by handlers and scheduled jobs.
    private facebookService: IFacebookService;
    private appleService: IAppleService;
    private googleService: IGoogleService;
    private googlePlayGameService: IGooglePlayGameService;
    private gameCenterService: IGameCenterService;
    private timerService: ITimerService;
    private requestConverterService: IRequestConverterService;
    private analyticsService: IAnalyticsService;
    private postEventCallbackService: IPostEventCallbackService;
    private preEventCallbackService: IPreEventCallbackService;
    private cloudScriptServiceDic: Map<string, ICloudScriptService>;
    private eventCallbackCloudScriptService: IEventCallbackCloudScriptService;
    private cloudScriptEventService: ICloudScriptEventService;

    // Auxiliary services and per-game service registries.
    private countryIPDetailService: ICountryIPDetailService;
    private pushNotificationService: IPushNotificationService;
    private emailService: IEmailService;
    private cacheServiceDic: Map<string, ICacheService>;
    private configServiceDic: Map<string, IConfigService>;

    // Loaded game ids plus matchmaking/event state tracked in memory.
    private gameIds: string[];
    private matchmakingService: IMatchmakingService;
    private waitingServerDetailDict: Map<string, NodeJS.Timeout>;
    private postEventCallbackCollection: mongodb.Collection<mongodb.Document>;

    /**
     * Initializes a new GearN server instance.
     */
    constructor() {
        this.facebookService = new FacebookService();
        this.postEventCallbackService = new PostEventCallbackService();
        this.preEventCallbackService = new PreEventCallbackService();

        this.appleService = new AppleService();
        this.googleService = new GoogleService();

        this.googlePlayGameService = new GooglePlayGameService();
        this.gameCenterService = new GameCenterService();

        this.timerService = new TimerService();
        this.requestConverterService = new RequestConverterService();
        this.pushNotificationService = new PushNotificationService();
        this.emailService = new EmailService();

        this.idTypeCase = 0;
        this.restoreRootPassword = "";
        this.configServiceDic = new Map();
        this.xGNSettings = new xGNSettings();
        this.xDatabase = new xDatabase();
        this.cacheServiceDic = new Map();

        this.requestController = new RequestController();
        this.requestController.setRequestConverterService(this.requestConverterService);

        (this.timerService as TimerService).run();

        this.gameIds = [];
        this.matchmakingService = new MatchmakingService();
        (this.matchmakingService as MatchmakingService).setGNServer(this);
        this.waitingServerDetailDict = new Map();

        this.cloudScriptServiceDic = new Map();
        this.eventCallbackCloudScriptService = new EventCallbackCloudScriptService();
        this.cloudScriptEventService = new CloudScriptEventService();

        this.countryIPDetailService = new CountryIPDetailService();

        CodeHelper.init();

        // Poll global maintenance tasks because they span every loaded game id.
        let thiz = this;
        this.timerService.subscriberEverySecond(() => {
            let currentDate = xDatetime.getCurrentDate();
            if (currentDate.getUTCSeconds() % 10 == 0) thiz.handleMatchmaking();
        });

        this.timerService.subscriberEveryMinute(() => {
            let currentDate = xDatetime.getCurrentDate();
            if (currentDate.getUTCMinutes() % 10 == 0) thiz.handleRemoveCacheInvalidData();
        });
    }

    /**
     * Registers the built-in handler graph into the request controller.
     */
    public init(): void {
        RequestControllerUtils.addAllHandler(this);
    }

    /**
     * Binds HTTP/socket callbacks, analytics, and cluster event forwarding after transports are injected.
     * @param onRunSuccess Provides the callback executed after a successful startup.
     */
    public run(onRunSuccess?: OnRunSuccess) {
        const thiz = this;

        this.httpApp.getHttpAppHandler().setOnHttpRequest((request: Request) => {
            return thiz.handleOnRequest(request);
        });

        this.socketApp.getSocketAppHandler().setOnSocketAuthenticate((socket: Socket, authInfo: AuthInfo) => {
            thiz.handleSocketAuthenticate(socket, authInfo);
        });

        this.socketApp.getSocketAppHandler().setOnSocketDisconnect((socket: Socket, data) => {
            thiz.handleSocketDisconnect(socket, data);
        });

        this.socketApp.getSocketAppHandler().setOnSocketRequest((request: Request) => {
            return thiz.handleOnRequest(request);
        });

        // AnalyticsService depends on the fully wired runtime before it can start consuming events.
        let tempAnalyticsService = new AnalyticsService();
        tempAnalyticsService.setGNServer(this);
        tempAnalyticsService.run();
        this.analyticsService = tempAnalyticsService;

        this.postEventCallbackCollection = this.xDatabase.logRuntimeCollection("EventCallback.PostLog");

        if (onRunSuccess != null) onRunSuccess();
    }

    /**
     * Injects the socket transport after it has been bootstrapped by `ServerApplication`.
     */
    public setSocketApp(socketApp: SocketApp): void {
        this.socketApp = socketApp;
    }

    /**
     * Injects the HTTP transport after it has been bootstrapped by `ServerApplication`.
     */
    public setHttpApp(httpApp: HttpApp): void {
        this.httpApp = httpApp;
    }

    /**
     * Injects the shared API middleware used by both transports.
     */
    public setApiMiddleware(apiMiddleware: ApiMiddleware) {
        this.apiMiddleware = apiMiddleware;
    }

    /**
     * Returns the shared API middleware instance.
     */
    public getApiMiddleware(): ApiMiddleware {
        return this.apiMiddleware;
    }

    /**
     * Returns the socket app.
     * @returns Returns the socket app.
     */
    public getSocketApp(): SocketApp {
        return this.socketApp;
    }

    /**
     * Returns the HTTP app.
     * @returns Returns the HTTP app.
     */
    public getHttpApp(): HttpApp {
        return this.httpApp;
    }

    /**
     * Returns the request controller.
     * @returns Returns the request controller.
     */
    public getRequestController(): RequestController {
        return this.requestController;
    }

    /**
     * Registers a handler under the `RequestType.Custom` namespace.
     * @param onlyAuthenticated Indicates whether only authenticated access is allowed.
     */
    public addCustomHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true): void {
        this.requestController.addHandler(RequestType.Custom, requestHandler, onlyAuthenticated);
    }

    /**
     * Looks up a custom handler by operation code.
     */
    public getCustomHandler(operationCode: string): IRequestHandler {
        return this.requestController.getHandler(RequestType.Custom, operationCode);
    }

    /**
     * Unregisters a custom handler.
     */
    public removeCustomHandler(operationCode: string): void {
        return this.requestController.removeHandler(RequestType.Custom, operationCode);
    }

    /**
     * Creates an index in the main runtime database.
     */
    public createIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
        this.xDatabase.createIndex(collectionName, index, options);
    }

    /**
     * Creates an index in the log database.
     */
    public logCreateIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
        this.xDatabase.logCreateIndex(collectionName, index, options);
    }

    /**
     * Returns the per-game configuration service currently registered for a game id.
     */
    public getConfigService(gameId: string): IConfigService {
        return this.configServiceDic.get(gameId);
    }

    /**
     * Registers the per-game configuration service for a game id.
     */
    public setConfigGame(gameId: string, configService: IConfigService) {
        this.configServiceDic.set(gameId, configService);
    }

    /**
     * Sets the ID type case.
     * @param idTypeCase Provides the ID type case value used by this operation.
     */
    public setIdTypeCase(idTypeCase: number) {
        this.idTypeCase = idTypeCase;
    }

    /**
     * Returns the id-format mode applied when entities are created or parsed.
     */
    public getIdTypeCase() {
        return this.idTypeCase;
    }

    /**
     * Sets the restore root password.
     * @param restoreRootPassword Provides the restore root password value used by this operation.
     */
    public setRestoreRootPassword(restoreRootPassword: string) {
        this.restoreRootPassword = restoreRootPassword;
    }

    /**
     * Returns the optional emergency root-password reset value loaded at startup.
     */
    public getRestoreRootPassword() {
        return this.restoreRootPassword;
    }

    /**
     * Sets the root username.
     * @param initRootUsername Provides the root username value used by this operation.
     */
    public setInitRootUsername(initRootUsername: string) {
        this.initRootUsername = initRootUsername;
    }

    /**
     * Returns the bootstrap root username.
     */
    public getInitRootUsername() {
        return this.initRootUsername;
    }

    /**
     * Returns the GearN settings.
     * @returns Returns the GearN settings.
     */
    public getGNSettings(): xGNSettings {
        return this.xGNSettings;
    }

    /**
     * Returns the database.
     * @returns Returns the database.
     */
    public getDatabase(): xDatabase {
        return this.xDatabase;
    }

    /**
     * Returns the cache service.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Returns the cache service.
     */
    public getCacheService(gameId: string): ICacheService {
        return this.cacheServiceDic.get(gameId);
    }

    /**
     * Sets the cache service.
     * @param gameId Provides the game ID value used by this operation.
     * @param cacheService Provides the cache service used by this operation.
     */
    public setCacheService(gameId: string, cacheService: ICacheService) {
        this.cacheServiceDic.set(gameId, cacheService);
    }

    /**
     * Returns the facebook service.
     * @returns Returns the facebook service.
     */
    public getFacebookService(): IFacebookService {
        return this.facebookService;
    }

    /**
     * Returns the post event callback service.
     * @returns Returns the post event callback service.
     */
    public getPostEventCallbackService(): IPostEventCallbackService {
        return this.postEventCallbackService;
    }

    /**
     * Returns the pre event callback service.
     * @returns Returns the pre event callback service.
     */
    public getPreEventCallbackService(): IPreEventCallbackService {
        return this.preEventCallbackService;
    }

    /**
     * Returns the event callback cloud script service.
     * @returns Returns the event callback cloud script service.
     */
    public getEventCallbackCloudScriptService(): IEventCallbackCloudScriptService {
        return this.eventCallbackCloudScriptService;
    }

    /**
     * Returns the cloud script event service.
     * @returns Returns the cloud script event service.
     */
    public getCloudScriptEventService(): ICloudScriptEventService {
        return this.cloudScriptEventService;
    }

    /**
     * Returns the country IP detail service.
     * @returns Returns the country IP detail service.
     */
    public getCountryIPDetailService(): ICountryIPDetailService {
        return this.countryIPDetailService;
    }

    /**
     * Returns the apple service.
     * @returns Returns the apple service.
     */
    public getAppleService(): IAppleService {
        return this.appleService;
    }

    /**
     * Returns the google service.
     * @returns Returns the google service.
     */
    public getGoogleService(): IGoogleService {
        return this.googleService;
    }

    /**
     * Returns the google play game service.
     * @returns Returns the google play game service.
     */
    public getGooglePlayGameService(): IGooglePlayGameService {
        return this.googlePlayGameService;
    }

    /**
     * Returns the game center service.
     * @returns Returns the game center service.
     */
    public getGameCenterService(): IGameCenterService {
        return this.gameCenterService;
    }

    /**
     * Returns the timer service.
     * @returns Returns the timer service.
     */
    public getTimerService(): ITimerService {
        return this.timerService;
    }

    /**
     * Returns the analytics service.
     * @returns Returns the analytics service.
     */
    public getAnalyticsService(): IAnalyticsService {
        return this.analyticsService;
    }

    /**
     * Returns the request converter service.
     * @returns Returns the request converter service.
     */
    public getRequestConverterService(): IRequestConverterService {
        return this.requestConverterService;
    }

    /**
     * Returns the email service.
     * @returns Returns the email service.
     */
    public getEmailService(): IEmailService {
        return this.emailService;
    }

    /**
     * Returns the push notification service.
     * @returns Returns the push notification service.
     */
    public getPushNotificationService(): IPushNotificationService {
        return this.pushNotificationService;
    }

    /**
     * Returns the per-game CloudScript worker service registered for a game id.
     */
    public getCloudScriptService(gameId: string): ICloudScriptService {
        return this.cloudScriptServiceDic.get(gameId);
    }

    /**
     * Registers the per-game CloudScript worker service for a game id.
     */
    public setCloudScriptService(gameId: string, cloudScriptService: ICloudScriptService) {
        return this.cloudScriptServiceDic.set(gameId, cloudScriptService);
    }

    /**
     * Broadcasts an event to one user, logs the callback payload, then fans it out through the cluster handler.
     * @param userId Target user id.
     */
    public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
        await this.eventCallbackCloudScriptService.executeEvent("event_SendEventTo", { userId: userId }, operationEvent);

        // Serialize once so the exact same payload is logged and replayed across nodes.
        let operationEventToData = {
            eventCode: operationEvent.getEventCode(),
            parameters: operationEvent.getParameters()?.toData(),
        };

        this.postEventCallbackCollection.insertOne({
            eventName: "event_SendEventTo",
            tsCreate: xDatetime.getCurrentMilliseconds(),
            request: {
                userId: userId,
            },
            operationEvent: operationEventToData,
            responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
        });

        this.socketApp.getSocketAppHandler().sendEventTo(userId, operationEvent, true);
    }

    /**
     * Broadcasts an event to one room, logs the callback payload, then fans it out through the cluster handler.
     * @param roomId Target socket room id.
     */
    public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
        await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToRoom", { roomId: roomId }, operationEvent);

        // Serialize once so the exact same payload is logged and replayed across nodes.
        let operationEventToData = {
            eventCode: operationEvent.getEventCode(),
            parameters: operationEvent.getParameters()?.toData(),
        };

        this.postEventCallbackCollection.insertOne({
            eventName: "event_SendEventToRoom",
            tsCreate: xDatetime.getCurrentMilliseconds(),
            request: {
                roomId: roomId,
            },
            operationEvent: operationEventToData,
            responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
        });

        this.socketApp.getSocketAppHandler().sendEventToRoom(roomId, operationEvent, true);
    }

    /**
     * Broadcasts an event to multiple users, logs the callback payload, then fans it out through the cluster handler.
     * @param userIds Target user ids.
     */
    public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
        await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToMoreUser", { userIds: userIds }, operationEvent);

        // Serialize once so the exact same payload is logged and replayed across nodes.
        let operationEventToData = {
            eventCode: operationEvent.getEventCode(),
            parameters: operationEvent.getParameters()?.toData(),
        };

        this.postEventCallbackCollection.insertOne({
            eventName: "event_SendEventToMoreUser",
            tsCreate: xDatetime.getCurrentMilliseconds(),
            request: {
                userIds: userIds,
            },
            operationEvent: operationEventToData,
            responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8") * userIds.length,
        });

        this.socketApp.getSocketAppHandler().sendEventToMoreUser(userIds, operationEvent, true);
    }

    /**
     * Broadcasts an event to every connected player, logs the callback payload, then fans it out through the cluster handler.
     */
    public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
        await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToAllPlayer", {}, operationEvent);

        // Serialize once so the exact same payload is logged and replayed across nodes.
        let operationEventToData = {
            eventCode: operationEvent.getEventCode(),
            parameters: operationEvent.getParameters()?.toData(),
        };

        this.postEventCallbackCollection.insertOne({
            eventName: "event_SendEventToAllPlayer",
            tsCreate: xDatetime.getCurrentMilliseconds(),
            request: {},
            operationEvent: operationEventToData,
            responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
        });

        this.socketApp.getSocketAppHandler().sendEventToAllPlayer(operationEvent, true);
    }

    // public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
    //     return await this.socketApp.getSocketAppHandler().sendEventToNamespace(namespace, operationEvent);
    // }

    /**
     * Proxies room membership changes to the socket transport.
     */
    public joinRoom(userId: string, roomId: string): void {
        return this.socketApp.getSocketAppHandler().joinRoom(userId, roomId);
    }

    /**
     * Removes a user from a socket room on the local node.
     */
    public leaveRoom(userId: string, roomId: string): void {
        return this.socketApp.getSocketAppHandler().leaveRoom(userId, roomId);
    }

    /**
     * Returns the socket rooms the given user currently belongs to on this node.
     */
    public async getRooms(userId: string): Promise<string[]> {
        return await this.socketApp.getSocketAppHandler().getRooms(userId);
    }

    /**
     * Clears runtime socket auth state and emits disconnect callbacks for authenticated sockets.
     * @param socket Provides the socket value used by this operation.
     * @param data Provides the data value used by this operation.
     */
    private handleSocketDisconnect(socket: Socket, data: string) {
        if (socket.data.isAuthenticated) {
            socket.data.isAuthenticated = false;

            let authInfo = socket.data.authInfo as AuthInfo;
            // authInfo.removeOtherData("SocketId");

            if (authInfo) {
                this.eventCallbackCloudScriptService.executeSocket("socket_OnSocketDisconnected", {
                    socketId: socket.id,
                    userId: authInfo.getUserId(),
                });

                this.getDatabase().masterPlayerRepository.removeMasterPlayerSocketId(authInfo.getUserId());
            }
        }

        if (socket.data.userId != null) {
            socket.leave(socket.data.userId);
        }
    }

    /**
     * Emits the post-auth socket callback once middleware marks the connection as authenticated.
     * @param socket Provides the socket value used by this operation.
     * @param authInfo Provides the auth info value used by this operation.
     */
    private handleSocketAuthenticate(socket: Socket, authInfo: AuthInfo) {
        if (socket.data.isAuthenticated) {
            const userId = authInfo.getUserId();

            this.eventCallbackCloudScriptService.executeSocket("socket_OnSocketConnected", {
                socketId: socket.id,
                userId: userId,
            });

            this.getDatabase().masterPlayerRepository.setMasterPlayerSocketId(userId, socket.id);

            let secretInfo: SecretInfo = socket.data.secretInfo;
            if (secretInfo) {
                this.getDatabase()
                    .gamePlayerRepository.loadGamePlayerAsync(userId, secretInfo.getGameId(), {
                        playerGroups: true,
                        playerCharacters: true,
                    })
                    .then(async (gamePlayer) => {
                        if (gamePlayer != null) {
                            if (socket != null && socket.connected && gamePlayer) {
                                for (const playerGroup of gamePlayer.getAllPlayerGroups()) {
                                    if (playerGroup.status == GroupStatus.Member) {
                                        this.joinRoom(userId, playerGroup.groupId);
                                    }
                                }

                                for (const playerCharacter of gamePlayer.getAllPlayerCharacters()) {
                                    const characterPlayer = await this.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(playerCharacter.characterId, secretInfo.getGameId(), {
                                        playerGroups: true,
                                    });

                                    if (socket != null && socket.connected) {
                                        if (characterPlayer) {
                                            for (const playerGroup of characterPlayer.getAllPlayerGroups()) {
                                                if (playerGroup.status == GroupStatus.Member) {
                                                    this.joinRoom(userId, playerGroup.groupId);
                                                }
                                            }
                                        }
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    });
            }
        }
    }

    /**
     * Single dispatch point shared by both HTTP and socket transports.
     * @param request Provides the request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private handleOnRequest(request: Request): Promise<OperationResponse> {
        return this.requestController.handleRequest(request);
    }

    /**
     * Polls matchmaking queues for every loaded game.
     */
    private handleMatchmaking() {
        if (!this.isPrimary()) return;

        for (let i = 0; i < this.gameIds.length; i++) {
            let gameId = this.gameIds[i];
            this.handleMatchmakingForGame(gameId);
        }
    }

    /**
     * Periodically evicts expired cache entries for every loaded game.
     */
    private handleRemoveCacheInvalidData() {
        for (let i = 0; i < this.gameIds.length; i++) {
            let gameId = this.gameIds[i];
            this.getCacheService(gameId).removeInvalidData();
        }
    }

    /**
     * Handles the matchmaking for game.
     * @param gameId Game id whose queue should be processed in this polling cycle.
     */
    private async handleMatchmakingForGame(gameId: string) {
        // The matchmaking service returns tickets that are ready to transition to the next state.
        let matchmakingTicketCanMatchs = await this.matchmakingService.handle(gameId);

        if (matchmakingTicketCanMatchs != null) {
            for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
                let matchmakingTicketCanMatch = matchmakingTicketCanMatchs[i];

                if (matchmakingTicketCanMatch.status == MatchmakingTicketStatus.WaitingForServer) {
                    // Server allocation is delegated to callback/cloud-script infrastructure.
                    this.requestMatchServerDetail(gameId, matchmakingTicketCanMatch);
                } else {
                    // Already resolved tickets do not need additional work in this polling cycle.
                }
            }
        }
    }

    /**
     * Asks the callback/cloud-script layer to allocate runtime server detail for a pending match.
     */
    private async requestMatchServerDetail(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<void> {
        let matchId = matchmakingTicketCanMatch.matchId;
        Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " to set serverDetail on gameId " + gameId);

        let thiz = this;
        // Protect the queue from hanging forever when external server allocation never answers back.
        let timeout = setTimeout(
            async () => {
                thiz.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "Timeout");
            },
            15 * 60 * 1000,
        );

        this.waitingServerDetailDict.set(matchId, timeout);

        // The callback/cloud-script layer is expected to allocate a server and call back into this runtime.
        let response = await this.eventCallbackCloudScriptService.executeRequestServerDetailSystem(gameId, matchmakingTicketCanMatch);
        if (!response.success) {
            this.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "SystemMatchmakingCallback not have return success ok.");
        }
    }

    /**
     * Stores the allocated runtime server detail and marks every related ticket as matched.
     * @param gameId Provides the game ID value used by this operation.
     * @param matchId Provides the match ID value used by this operation.
     * @param serverDetail Provides the server detail value used by this operation.
     * @param ticketIds Provides the ticket IDs value used by this operation.
     */
    public async setMatchServerDetail(gameId: string, matchId: string, serverDetail: ServerDetail, ticketIds: string[]) {
        let timeout = this.waitingServerDetailDict.get(matchId);
        if (timeout) {
            clearTimeout(timeout);
            this.waitingServerDetailDict.delete(matchId);
        }

        const session = this.getDatabase().startSession();

        try {
            session.startTransaction();

            let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
            await matchCollection.updateOne({ matchId: matchId }, { $set: { serverDetail: serverDetail, status: MatchStatus.Matched } }, {
                session: session,
            });

            let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
            await matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: MatchmakingTicketStatus.Matched } }, {
                session: session,
            });

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();

            Debug.logError(err);

            throw err;
        } finally {
            await session.endSession();
        }
    }

    /**
     * Cancels waiting tickets when runtime server allocation fails or times out.
     * @param gameId Provides the game ID value used by this operation.
     * @param matchId Provides the match ID value used by this operation.
     * @param ticketIds Provides the ticket IDs value used by this operation.
     * @param reason Provides the reason value used by this operation.
     */
    public async setMatchServerDetailFailed(gameId: string, matchId: string, ticketIds: string[], reason: string) {
        let timeout = this.waitingServerDetailDict.get(matchId);
        if (timeout) {
            clearTimeout(timeout);
            this.waitingServerDetailDict.delete(matchId);
        }

        Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " failed on " + gameId + ", with reason " + reason);

        const session = this.getDatabase().startSession();

        try {
            session.startTransaction();

            let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
            await matchCollection.updateOne({ matchId: matchId }, { $set: { status: MatchStatus.Canceled } }, {
                session: session,
            });

            let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
            await matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: MatchmakingTicketStatus.Canceled } }, {
                session: session,
            });

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();

            Debug.logError(err);

            throw err;
        } finally {
            await session.endSession();
        }
    }

    /**
     * Returns the set of game ids currently loaded into memory.
     */
    public getGameIds(): string[] {
        return this.gameIds;
    }

    /**
     * Returns whether the current runtime is the primary cluster node.
     */
    public isPrimary(): boolean {
        return this.httpApp.getClusterHandler().getIsPrimary();
    }
}
