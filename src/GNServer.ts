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
	unique?: boolean;
	sparse?: boolean;
	expireAfterSeconds?: number;
}

export class GNServer {
	public static getServerVersion(): string {
		return GN_VERSION;
	}

	private socketApp: SocketApp;
	private httpApp: HttpApp;
	private apiMiddleware: ApiMiddleware;

	private requestController: RequestController;

	private idTypeCase: number;
	private restoreRootPassword: string;
	private xGNSettings: xGNSettings;
	private xDatabase: xDatabase;

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

	private countryIPDetailService: ICountryIPDetailService;
	private pushNotificationService: IPushNotificationService;
	private emailService: IEmailService;
	private cacheServiceDic: Map<string, ICacheService>;
	private configServiceDic: Map<string, IConfigService>;

	private gameIds: string[];
	private matchmakingService: IMatchmakingService;
	private waitingServerDetailDict: Map<string, NodeJS.Timeout>;
	private postEventCallbackCollection: mongoDB.Collection<mongoDB.Document>;

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

		let thiz = this;
		this.timerService.subscriberEverySecond(() => {
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getSeconds() % 10 == 0)
				thiz.handleMatchmaking();
		});

		this.timerService.subscriberEveryMinute(() => {
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getMinutes() % 10 == 0)
				thiz.handleRemoveCacheInvalidData();
		});
	}

	public init(): void {
		RequestControllerUtils.addAllHandler(this);
	}

	public run(onRunSuccess?: OnRunSuccess) {
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

	public setSocketApp(socketApp: SocketApp): void {
		this.socketApp = socketApp;
	}

	public setHttpApp(httpApp: HttpApp): void {
		this.httpApp = httpApp;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	public getApiMiddleware(): ApiMiddleware {
		return this.apiMiddleware;
	}

	public getSocketApp(): SocketApp {
		return this.socketApp;
	}

	public getHttpApp(): HttpApp {
		return this.httpApp;
	}

	public getRequestController(): RequestController {
		return this.requestController;
	}

	public addCustomHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true): void {
		this.requestController.addHandler(RequestType.Custom, requestHandler, onlyAuthenticated);
	}

	public getCustomHandler(operationCode: string): IRequestHandler {
		return this.requestController.getHandler(RequestType.Custom, operationCode);
	}

	public removeCustomHandler(operationCode: string): void {
		return this.requestController.removeHandler(RequestType.Custom, operationCode);
	}

	public createIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.createIndex(collectionName, index, options);
	}

	public logCreateIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.logCreateIndex(collectionName, index, options);
	}

	public getConfigService(gameId: string): IConfigService {
		return this.configServiceDic.get(gameId);
	}

	public setConfigGame(gameId: string, configService: IConfigService) {
		this.configServiceDic.set(gameId, configService);
	}

	public setIdTypeCase(idTypeCase: number) {
		this.idTypeCase = idTypeCase;
	}

	public getIdTypeCase() {
		return this.idTypeCase;
	}

	public setRestoreRootPassword(restoreRootPassword: string) {
		this.restoreRootPassword = restoreRootPassword;
	}

	public getRestoreRootPassword() {
		return this.restoreRootPassword;
	}

	public getGNSettings(): xGNSettings {
		return this.xGNSettings;
	}

	public getDatabase(): xDatabase {
		return this.xDatabase;
	}

	public getCacheService(gameId: string): ICacheService {
		return this.cacheServiceDic.get(gameId);
	}

	public setCacheService(gameId: string, cacheService: ICacheService) {
		this.cacheServiceDic.set(gameId, cacheService);
	}

	public getFacebookService(): IFacebookService {
		return this.facebookService;
	}

	public getPostEventCallbackService(): IPostEventCallbackService {
		return this.postEventCallbackService;
	}

	public getPreEventCallbackService(): IPreEventCallbackService {
		return this.preEventCallbackService;
	}

	public getEventCallbackCloudScriptService(): IEventCallbackCloudScriptService {
		return this.eventCallbackCloudScriptService;
	}

	public getCloudScriptEventService(): ICloudScriptEventService {
		return this.cloudScriptEventService;
	}

	public getCountryIPDetailService(): ICountryIPDetailService {
		return this.countryIPDetailService;
	}

	public getAppleService(): IAppleService {
		return this.appleService;
	}

	public getGoogleService(): IGoogleService {
		return this.googleService;
	}

	public getGooglePlayGameService(): IGooglePlayGameService {
		return this.googlePlayGameService;
	}

	public getGameCenterService(): IGameCenterService {
		return this.gameCenterService;
	}

	public getTimerService(): ITimerService {
		return this.timerService;
	}

	public getAnalyticsService(): IAnalyticsService {
		return this.analyticsService;
	}

	public getRequestConverterService(): IRequestConverterService {
		return this.requestConverterService;
	}

	public getEmailService(): IEmailService {
		return this.emailService;
	}

	public getPushNotificationService(): IPushNotificationService {
		return this.pushNotificationService;
	}

	public getCloudScriptService(gameId: string): ICloudScriptService {
		return this.cloudScriptServiceDic.get(gameId);
	}

	public setCloudScriptService(gameId: string, cloudScriptService: ICloudScriptService) {
		return this.cloudScriptServiceDic.set(gameId, cloudScriptService);
	}

	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventTo", { userId: userId }, operationEvent);

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

	private executeSendEventTo(data: {
		userId: string,
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventTo(data.userId, operationEvent, data.useMsgPack);
	}

	public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToRoom", { roomId: roomId }, operationEvent);

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

	private executeSendEventToRoom(data: {
		roomId: string,
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToRoom(data.roomId, operationEvent, data.useMsgPack);
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToMoreUser", { userIds: userIds }, operationEvent);

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

	private executeSendEventToMoreUser(data: {
		userIds: string[],
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean,
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToMoreUser(data.userIds, operationEvent, data.useMsgPack);
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("event_SendEventToAllPlayer", {}, operationEvent);

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

	private executeSendEventToAllPlayer(data: {
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean,
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToAllPlayer(operationEvent, data.useMsgPack);
	}

	// public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
	// 	return await this.socketApp.getSocketAppHandler().sendEventToNamespace(namespace, operationEvent);
	// }

	public joinRoom(userId: string, roomId: string): void {
		return this.socketApp.getSocketAppHandler().joinRoom(userId, roomId);
	}

	public leaveRoom(userId: string, roomId: string): void {
		return this.socketApp.getSocketAppHandler().leaveRoom(userId, roomId);
	}

	public async getRooms(userId: string): Promise<string[]> {
		return await this.socketApp.getSocketAppHandler().getRooms(userId);
	}

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
			}
		}

		if (socket.data.userId != null) {
			socket.leave(socket.data.userId);
		}
	}

	private handleSocketAuthenticate(socket: Socket, authInfo: AuthInfo) {
		if (socket.data.isAuthenticated) {
			this.eventCallbackCloudScriptService.executeSocket("socket_OnSocketConnected", {
				socketId: socket.id,
				userId: authInfo.getUserId(),
			});
		}
	}

	private handleOnRequest(request: Request): Promise<OperationResponse> {
		return this.requestController.handleRequest(request);
	}

	private handleMatchmaking() {
		for (let i = 0; i < this.gameIds.length; i++) {
			let gameId = this.gameIds[i];
			this.handleMatchmakingForGame(gameId);
		}
	}

	private handleRemoveCacheInvalidData() {
		for (let i = 0; i < this.gameIds.length; i++) {
			let gameId = this.gameIds[i];
			this.getCacheService(gameId).removeInvalidData();
		}
	}

	private async handleMatchmakingForGame(gameId: string) {
		let matchmakingTicketCanMatchs = await this.matchmakingService.handle(gameId);

		if (matchmakingTicketCanMatchs != null) {
			// o day can lam gi do
			for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
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

	private async requestMatchServerDetail(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<void> {
		let matchId = matchmakingTicketCanMatch.matchId;
		Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " to set serverDetail on gameId " + gameId);

		let thiz = this;
		let timeout = setTimeout(async () => {
			thiz.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "Timeout");
		}, 15 * 60 * 1000);

		this.waitingServerDetailDict.set(matchId, timeout);

		let response = await this.eventCallbackCloudScriptService.executeRequestServerDetailSystem(gameId, matchmakingTicketCanMatch);
		if (!response.success) {
			this.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "SystemMatchmakingCallback not have return success ok.");
		}
	}

	public setMatchServerDetail(gameId: string, matchId: string, serverDetail: ServerDetail, ticketIds: string[]) {
		let timeout = this.waitingServerDetailDict.get(matchId);
		if (timeout) {
			clearTimeout(timeout);
			this.waitingServerDetailDict.delete(matchId);
		}

		let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
		matchCollection.updateOne({ matchId: matchId }, { $set: { serverDetail: serverDetail } });

		let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
		matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: <number>MatchmakingTicketStatus.Matched } });
	}

	public setMatchServerDetailFailed(gameId: string, matchId: string, ticketIds: string[], reason: string) {
		let timeout = this.waitingServerDetailDict.get(matchId);
		if (timeout) {
			clearTimeout(timeout);
			this.waitingServerDetailDict.delete(matchId);
		}

		Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " failed on " + gameId + ", with reason " + reason);

		let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
		matchCollection.updateOne({ matchId: matchId }, { $set: {} });

		let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
		matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: <number>MatchmakingTicketStatus.Canceled } });
	}

	public getGameIds(): string[] {
		return this.gameIds;
	}

	public isPrimary(): boolean {
		return this.httpApp.getClusterHandler().getIsPrimary();
	}

}
