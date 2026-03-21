// Stores the GearN VERSION value used by this module.
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
import { ServerDetail } from "./GN-library/xdatabase/lib/entity/pro/ServerDetail";
import { Debug } from "./GN-library/xdebug/lib/xDebug";
import * as mongoDB from "mongodb";
import { GNHashtable } from "./GN-common/common/GNData";
import { RequestControllerUtils } from "./RequestControllerUtils";
import { AuthInfo } from "./GN-common/entity/AuthInfo";

interface CreateIndexesOptions {
	// Indicates whether unique.
	unique?: boolean;
	// Indicates whether sparse.
	sparse?: boolean;
	// Stores the expire after seconds value used by this contract.
	expireAfterSeconds?: number;
}

export class GNServer {
	/**
	 * Returns the server version.
	 * @returns Returns the server version.
	 */
	public static getServerVersion(): string {
		return GN_VERSION;
	}

	// Stores the socket app value used by this instance.
	private socketApp: SocketApp;
	// Stores the HTTP app value used by this instance.
	private httpApp: HttpApp;
	// Stores the API middleware value used by this instance.
	private apiMiddleware: ApiMiddleware;

	// Stores the request controller value used by this instance.
	private requestController: RequestController;

	// Stores the ID type case value used by this instance.
	private idTypeCase: number;
	// Stores the restore root password value used by this instance.
	private restoreRootPassword: string;
	// Stores the x GearN settings value used by this instance.
	private xGNSettings: xGNSettings;
	// Stores the x database value used by this instance.
	private xDatabase: xDatabase;

	// Stores the facebook service value used by this instance.
	private facebookService: IFacebookService;
	// Stores the apple service value used by this instance.
	private appleService: IAppleService;
	// Stores the google service value used by this instance.
	private googleService: IGoogleService;
	// Stores the google play game service value used by this instance.
	private googlePlayGameService: IGooglePlayGameService;
	// Stores the game center service value used by this instance.
	private gameCenterService: IGameCenterService;
	// Stores the timer service value used by this instance.
	private timerService: ITimerService;
	// Stores the request converter service value used by this instance.
	private requestConverterService: IRequestConverterService;
	// Stores the analytics service value used by this instance.
	private analyticsService: IAnalyticsService;
	// Stores the post event callback service value used by this instance.
	private postEventCallbackService: IPostEventCallbackService;
	// Stores the pre event callback service value used by this instance.
	private preEventCallbackService: IPreEventCallbackService;
	// Stores the cloud script service dictionary collection used by this instance.
	private cloudScriptServiceDic: Map<string, ICloudScriptService>;
	// Stores the event callback cloud script service value used by this instance.
	private eventCallbackCloudScriptService: IEventCallbackCloudScriptService;
	// Stores the cloud script event service value used by this instance.
	private cloudScriptEventService: ICloudScriptEventService;

	// Stores the country IP detail service value used by this instance.
	private countryIPDetailService: ICountryIPDetailService;
	// Stores the push notification service value used by this instance.
	private pushNotificationService: IPushNotificationService;
	// Stores the email service value used by this instance.
	private emailService: IEmailService;
	// Stores the cache service dictionary collection used by this instance.
	private cacheServiceDic: Map<string, ICacheService>;
	// Stores the configuration service dictionary collection used by this instance.
	private configServiceDic: Map<string, IConfigService>;

	// Stores the game IDs list used by this instance.
	private gameIds: string[];
	// Stores the matchmaking service value used by this instance.
	private matchmakingService: IMatchmakingService;
	// Stores the waiting server detail dict collection used by this instance.
	private waitingServerDetailDict: Map<string, NodeJS.Timeout>;
	// Stores the post event callback collection value used by this instance.
	private postEventCallbackCollection: mongoDB.Collection<mongoDB.Document>;

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

		// Stores the thiz value used in the current execution flow.
		let thiz = this;
		this.timerService.subscriberEverySecond(() => {
			// Stores the current date value used in the current execution flow.
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getSeconds() % 10 == 0)
				thiz.handleMatchmaking();
		});

		this.timerService.subscriberEveryMinute(() => {
			// Stores the current date value used in the current execution flow.
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getMinutes() % 10 == 0)
				thiz.handleRemoveCacheInvalidData();
		});
	}

	/**
	 * Executes the init workflow.
	 */
	public init(): void {
		RequestControllerUtils.addAllHandler(this);
	}

	/**
	 * Runs the current workflow.
	 * @param onRunSuccess Provides the callback executed after a successful startup.
	 */
	public run(onRunSuccess?: OnRunSuccess) {
		// Stores the thiz value used in the current execution flow.
		let thiz = this;

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

		// Stores the temp analytics service value used in the current execution flow.
		let tempAnalyticsService = new AnalyticsService();
		tempAnalyticsService.setGNServer(this);
		tempAnalyticsService.run();
		this.analyticsService = tempAnalyticsService;

		this.postEventCallbackCollection = this.xDatabase.logRuntimeCollection("EventCallback.PostLog");

		this.getHttpApp().getClusterHandler().onEvent("sendEventTo", data => {
			thiz.executeSendEventTo(data);
		});

		this.getHttpApp().getClusterHandler().onEvent("sendEventToRoom", data => {
			thiz.executeSendEventToRoom(data);
		});

		this.getHttpApp().getClusterHandler().onEvent("sendEventToMoreUser", data => {
			thiz.executeSendEventToMoreUser(data);
		});

		this.getHttpApp().getClusterHandler().onEvent("executeSendEventToAllPlayer", data => {
			thiz.executeSendEventToAllPlayer(data);
		});

		if (onRunSuccess != null) onRunSuccess();
	}

	/**
	 * Sets the socket app.
	 * @param socketApp Provides the socket app value used by this operation.
	 */
	public setSocketApp(socketApp: SocketApp): void {
		this.socketApp = socketApp;
	}

	/**
	 * Sets the HTTP app.
	 * @param httpApp Provides the HTTP app value used by this operation.
	 */
	public setHttpApp(httpApp: HttpApp): void {
		this.httpApp = httpApp;
	}

	/**
	 * Sets the API middleware.
	 * @param apiMiddleware Provides the API middleware value used by this operation.
	 */
	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	/**
	 * Returns the API middleware.
	 * @returns Returns the API middleware.
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
	 * Adds the custom handler.
	 * @param requestHandler Provides the request handler used by this operation.
	 * @param onlyAuthenticated Indicates whether only authenticated access is allowed.
	 */
	public addCustomHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true): void {
		this.requestController.addHandler(RequestType.Custom, requestHandler, onlyAuthenticated);
	}

	/**
	 * Returns the custom handler.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @returns Returns the custom handler.
	 */
	public getCustomHandler(operationCode: string): IRequestHandler {
		return this.requestController.getHandler(RequestType.Custom, operationCode);
	}

	/**
	 * Removes the custom handler.
	 * @param operationCode Provides the operation code value used by this operation.
	 */
	public removeCustomHandler(operationCode: string): void {
		return this.requestController.removeHandler(RequestType.Custom, operationCode);
	}

	/**
	 * Creates the index.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param index Provides the index value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public createIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.createIndex(collectionName, index, options);
	}

	/**
	 * Executes the log create index workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param index Provides the index value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public logCreateIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.logCreateIndex(collectionName, index, options);
	}

	/**
	 * Returns the configuration service.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the configuration service.
	 */
	public getConfigService(gameId: string): IConfigService {
		return this.configServiceDic.get(gameId);
	}

	/**
	 * Sets the configuration game.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param configService Provides the configuration service used by this operation.
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
	 * Returns the ID type case.
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
	 * Returns the restore root password.
	 */
	public getRestoreRootPassword() {
		return this.restoreRootPassword;
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
	 * Returns the cloud script service.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the cloud script service.
	 */
	public getCloudScriptService(gameId: string): ICloudScriptService {
		return this.cloudScriptServiceDic.get(gameId);
	}

	/**
	 * Sets the cloud script service.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param cloudScriptService Provides the cloud script service used by this operation.
	 */
	public setCloudScriptService(gameId: string, cloudScriptService: ICloudScriptService) {
		return this.cloudScriptServiceDic.set(gameId, cloudScriptService);
	}

	/**
	 * Sends the event to.
	 * @param userId Indicates whether r ID should be used.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventTo", { userId: userId }, operationEvent);

		// Stores the operation event to data value used in the current execution flow.
		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "event_SendEventTo",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {
				userId: userId
			},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventTo", {
			userId: userId,
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	/**
	 * Executes the send event to.
	 * @param data Provides the data value used by this operation.
	 */
	private executeSendEventTo(data: {
		// Indicates whether r ID should be used.
		userId: string,
		// Stores the operation event value used by this contract.
		operationEvent: {
			// Stores the event code value used by this contract.
			eventCode: string,
			// Stores the parameters value used by this contract.
			parameters: {}
		},
		// Indicates whether msg pack should be used.
		useMsgPack: boolean
	}) {
		// Stores the operation event value used in the current execution flow.
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventTo(data.userId, operationEvent, data.useMsgPack);
	}

	/**
	 * Sends the event to room.
	 * @param roomId Provides the room ID value used by this operation.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToRoom", { roomId: roomId }, operationEvent);

		// Stores the operation event to data value used in the current execution flow.
		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "event_SendEventToRoom",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {
				roomId: roomId
			},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventToRoom", {
			roomId: roomId,
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	/**
	 * Executes the send event to room.
	 * @param data Provides the data value used by this operation.
	 */
	private executeSendEventToRoom(data: {
		// Stores the room ID value used by this contract.
		roomId: string,
		// Stores the operation event value used by this contract.
		operationEvent: {
			// Stores the event code value used by this contract.
			eventCode: string,
			// Stores the parameters value used by this contract.
			parameters: {}
		},
		// Indicates whether msg pack should be used.
		useMsgPack: boolean
	}) {
		// Stores the operation event value used in the current execution flow.
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToRoom(data.roomId, operationEvent, data.useMsgPack);
	}

	/**
	 * Sends the event to more user.
	 * @param userIds Indicates whether r IDs should be used.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToMoreUser", { userIds: userIds }, operationEvent);

		// Stores the operation event to data value used in the current execution flow.
		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "event_SendEventToMoreUser",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {
				userIds: userIds
			},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8") * userIds.length,
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventToMoreUser", {
			userIds: userIds,
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	/**
	 * Executes the send event to more user.
	 * @param data Provides the data value used by this operation.
	 */
	private executeSendEventToMoreUser(data: {
		// Indicates whether r IDs should be used.
		userIds: string[],
		// Stores the operation event value used by this contract.
		operationEvent: {
			// Stores the event code value used by this contract.
			eventCode: string,
			// Stores the parameters value used by this contract.
			parameters: {}
		},
		// Indicates whether msg pack should be used.
		useMsgPack: boolean,
	}) {
		// Stores the operation event value used in the current execution flow.
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToMoreUser(data.userIds, operationEvent, data.useMsgPack);
	}

	/**
	 * Sends the event to all player.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToAllPlayer", {}, operationEvent);

		// Stores the operation event to data value used in the current execution flow.
		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "event_SendEventToAllPlayer",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventToAllPlayer", {
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	/**
	 * Executes the send event to all player.
	 * @param data Provides the data value used by this operation.
	 */
	private executeSendEventToAllPlayer(data: {
		// Stores the operation event value used by this contract.
		operationEvent: {
			// Stores the event code value used by this contract.
			eventCode: string,
			// Stores the parameters value used by this contract.
			parameters: {}
		},
		// Indicates whether msg pack should be used.
		useMsgPack: boolean,
	}) {
		// Stores the operation event value used in the current execution flow.
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToAllPlayer(operationEvent, data.useMsgPack);
	}

	// public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
	// 	return await this.socketApp.getSocketAppHandler().sendEventToNamespace(namespace, operationEvent);
	// }

	public joinRoom(userId: string, roomId: string): void {
		return this.socketApp.getSocketAppHandler().joinRoom(userId, roomId);
	}

	/**
	 * Executes the leave room workflow.
	 * @param userId Indicates whether r ID should be used.
	 * @param roomId Provides the room ID value used by this operation.
	 */
	public leaveRoom(userId: string, roomId: string): void {
		return this.socketApp.getSocketAppHandler().leaveRoom(userId, roomId);
	}

	/**
	 * Returns the rooms.
	 * @param userId Indicates whether r ID should be used.
	 * @returns Returns the rooms.
	 */
	public async getRooms(userId: string): Promise<string[]> {
		return await this.socketApp.getSocketAppHandler().getRooms(userId);
	}

	/**
	 * Handles the socket disconnect.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 */
	private handleSocketDisconnect(socket: Socket, data: string) {
		if (socket.data.isAuthenticated) {
			socket.data.isAuthenticated = false;

			// Stores the auth info value used in the current execution flow.
			let authInfo = socket.data.authInfo as AuthInfo;
			// authInfo.removeOtherData("SocketId");

			if (authInfo) {
				this.eventCallbackCloudScriptService.executeSocket("socket_OnSocketDisconnected", {
					socketId: socket.id,
					userId: authInfo.getUserId(),
				});
			}
		}

		if (socket.data.userId != null) {
			socket.leave(socket.data.userId);
		}
	}

	/**
	 * Handles the socket authenticate.
	 * @param socket Provides the socket value used by this operation.
	 * @param authInfo Provides the auth info value used by this operation.
	 */
	private handleSocketAuthenticate(socket: Socket, authInfo: AuthInfo) {
		if (socket.data.isAuthenticated) {
			this.eventCallbackCloudScriptService.executeSocket("socket_OnSocketConnected", {
				socketId: socket.id,
				userId: authInfo.getUserId(),
			});
		}
	}

	/**
	 * Handles the on request.
	 * @param request Provides the request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private handleOnRequest(request: Request): Promise<OperationResponse> {
		return this.requestController.handleRequest(request);
	}

	/**
	 * Handles the matchmaking.
	 */
	private handleMatchmaking() {
		for (let i = 0; i < this.gameIds.length; i++) {
			// Stores the game ID value used in the current execution flow.
			let gameId = this.gameIds[i];
			this.handleMatchmakingForGame(gameId);
		}
	}

	/**
	 * Handles the remove cache invalid data.
	 */
	private handleRemoveCacheInvalidData() {
		for (let i = 0; i < this.gameIds.length; i++) {
			// Stores the game ID value used in the current execution flow.
			let gameId = this.gameIds[i];
			this.getCacheService(gameId).removeInvalidData();
		}
	}

	/**
	 * Handles the matchmaking for game.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	private async handleMatchmakingForGame(gameId: string) {
		// Stores the matchmaking ticket can matchs value used in the current execution flow.
		let matchmakingTicketCanMatchs = await this.matchmakingService.handle(gameId);

		if (matchmakingTicketCanMatchs != null) {
			// o day can lam gi do
			for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
				// Stores the matchmaking ticket can match value used in the current execution flow.
				let matchmakingTicketCanMatch = matchmakingTicketCanMatchs[i];

				if (matchmakingTicketCanMatch.status == <number>MatchmakingTicketStatus.WaitingForServer) {
					this.requestMatchServerDetail(gameId, matchmakingTicketCanMatch);
					// this.eventCallbackCloudScriptService.executeSystem
					// Goi ham de tao server o day
				}
				else {
					// Da ok san roi khong can lam gi nua
				}
			}
		}
	}

	/**
	 * Requests the match server detail.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param matchmakingTicketCanMatch Provides the matchmaking ticket can match value used by this operation.
	 */
	private async requestMatchServerDetail(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<void> {
		// Stores the match ID value used in the current execution flow.
		let matchId = matchmakingTicketCanMatch.matchId;
		Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " to set serverDetail on gameId " + gameId);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;
		// Stores the timeout value used in the current execution flow.
		let timeout = setTimeout(async () => {
			thiz.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "Timeout");
		}, 15 * 60 * 1000);

		this.waitingServerDetailDict.set(matchId, timeout);

		// Stores the response value used in the current execution flow.
		let response = await this.eventCallbackCloudScriptService.executeRequestServerDetailSystem(gameId, matchmakingTicketCanMatch);
		if (!response.success) {
			this.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "SystemMatchmakingCallback not have return success ok.");
		}
	}

	/**
	 * Sets the match server detail.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param matchId Provides the match ID value used by this operation.
	 * @param serverDetail Provides the server detail value used by this operation.
	 * @param ticketIds Provides the ticket IDs value used by this operation.
	 */
	public setMatchServerDetail(gameId: string, matchId: string, serverDetail: ServerDetail, ticketIds: string[]) {
		// Stores the timeout value used in the current execution flow.
		let timeout = this.waitingServerDetailDict.get(matchId);
		if (timeout) {
			clearTimeout(timeout);
			this.waitingServerDetailDict.delete(matchId);
		}

		// Stores the match collection value used in the current execution flow.
		let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
		matchCollection.updateOne({ matchId: matchId }, { $set: { serverDetail: serverDetail } });

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
		matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: <number>MatchmakingTicketStatus.Matched } });
	}

	/**
	 * Sets the match server detail failed.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param matchId Provides the match ID value used by this operation.
	 * @param ticketIds Provides the ticket IDs value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setMatchServerDetailFailed(gameId: string, matchId: string, ticketIds: string[], reason: string) {
		// Stores the timeout value used in the current execution flow.
		let timeout = this.waitingServerDetailDict.get(matchId);
		if (timeout) {
			clearTimeout(timeout);
			this.waitingServerDetailDict.delete(matchId);
		}

		Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " failed on " + gameId + ", with reason " + reason);

		// Stores the match collection value used in the current execution flow.
		let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
		matchCollection.updateOne({ matchId: matchId }, { $set: {} });

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
		matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: <number>MatchmakingTicketStatus.Canceled } });
	}

	/**
	 * Returns the game IDs.
	 * @returns Returns the game IDs.
	 */
	public getGameIds(): string[] {
		return this.gameIds;
	}

	/**
	 * Checks whether primary.
	 * @returns Returns the operation result.
	 */
	public isPrimary(): boolean {
		return this.httpApp.getClusterHandler().getIsPrimary();
	}

}
