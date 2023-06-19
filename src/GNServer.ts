const GN_VERSION = "1.0.9";

import { RequestController } from "./GN-app-api/handler/controller/RequestController";
import { OperationEvent } from "./GN-common/entity/operationEvent/OperationEvent";
import { Socket } from "socket.io";
import { xConfig } from "./GN-library/xconfig/lib/xConfig";
import { xDatabase } from "./GN-library/xdatabase/lib/xDatabase";
import { FacebookService } from "./GN-app-api/service/FacebookService";
import { SocketApp } from "./GN-startup/SocketApp";
import { HttpApp } from "./GN-startup/HttpApp";
import { IRequestHandler } from "./GN-app-api/handler/controller/handler/base/IRequestHandler";
// import { AuthInfo } from "./GN-common/entity/AuthInfo";
import { OperationResponse } from "./GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./GN-common/entity/operationRequest/base/Request";

import { AppleService } from "./GN-app-api/service/AppleService";
import { xMail } from "./GN-library/xmail/lib/xMail";
import { TimerService } from "./GN-app-api/service/TimerService";
import { IFacebookService } from "./GN-app-api/service/IFacebookService";
import { IAppleService } from "./GN-app-api/service/IAppleService";
import { ITimerService } from "./GN-app-api/service/ITimerService";
import { OnRunSuccess } from "./GN-library/xbuilder/lib/OnRunSuccess";
import { ILockService } from "./GN-app-api/service/ILockService";
import { LockService } from "./GN-app-api/service/LockService";
import { xCacheData } from "./GN-library/xcachedata/lib/xCacheData";
import { ApiMiddleware } from "./GN-startup/middleware/ApiMiddleware";
import { IRequestConverterService } from "./GN-app-api/service/IRequestConverterService";
import { RequestConverterService } from "./GN-app-api/service/RequestConverterService";
import { IWeb3Service } from "./GN-app-api/service/IWeb3Service";
import { Web3Service } from "./GN-app-api/service/Web3Service";
import { IGoogleService } from "./GN-app-api/service/IGoogleService";
import { GoogleService } from "./GN-app-api/service/GoogleService";
import { CodeHelper } from "./GN-common/helper/CodeHelper";
import { IAnalyticsService } from "./GN-app-api/service/IAnalyticsService";
import { AnalyticsService } from "./GN-app-api/service/AnalyticsService";
import { Debug } from "./GN-library/xdebug/lib/xDebug";

import { LoginByAccountRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByAccountRequestHandler";
import { LoginByAndroidDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByAndroidDeviceIdRequestHandler";
import { LoginByAppleRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByAppleRequestHandler";
import { LoginByCustomDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByCustomDeviceIdRequestHandler";
import { LoginByCustomIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByCustomIdRequestHandler";
import { LoginByEditorDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByEditorDeviceIdRequestHandler";
import { LoginByFacebookRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByFacebookRequestHandler";
import { LoginByGenericServiceRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByGenericServiceRequestHandler";
import { LoginByGoogleRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByGoogleRequestHandler";
import { LoginByiOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByiOSDeviceIdRequestHandler";
import { LoginByMacOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByMacOSDeviceIdRequestHandler";
import { LoginByWindowsDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByWindowsDeviceIdRequestHandler";
import { LoginByWindowsPhoneDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByWindowsPhoneDeviceIdRequestHandler";
import { RegisterAccountRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/RegisterAccountRequestHandler";

import { AddSegmentRequestHandler as AddSegmentRequestHandlerMasterPlayer } from "./GN-app-api/handler/controller/handler/masterPlayer/AddSegmentRequestHandler";
import { ChangeAccountPasswordRequestHandler as ChangeAccountPasswordRequestHandlerMasterPlayer } from "./GN-app-api/handler/controller/handler/masterPlayer/ChangeAccountPasswordRequestHandler";
import { GetAvatarRequestHandler as GetAvatarRequestHandlerMasterPlayer } from "./GN-app-api/handler/controller/handler/masterPlayer/GetAvatarRequestHandler";
import { AddSegmentRequestHandler as AddSegmentRequestHandlerMasterPlayer } from "./GN-app-api/handler/controller/handler/masterPlayer/AddSegmentRequestHandler";
import { AddSegmentRequestHandler as AddSegmentRequestHandlerMasterPlayer } from "./GN-app-api/handler/controller/handler/masterPlayer/AddSegmentRequestHandler";



import { RequestType } from "./GN-common/constant/enumType/RequestType";

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

	private xConfig: xConfig;
	private xDatabase: xDatabase;
	private xMail: xMail;
	private xCacheData: xCacheData;

	private facebookService: IFacebookService;
	private appleService: IAppleService;
	private web3Service: IWeb3Service;
	private googleService: IGoogleService;
	private timerService: ITimerService;
	private lockService: ILockService;
	private requestConverterService: IRequestConverterService;
	private analyticsService: IAnalyticsService;

	constructor() {
		this.facebookService = new FacebookService();
		this.appleService = new AppleService();
		this.web3Service = new Web3Service();
		this.googleService = new GoogleService();

		this.timerService = new TimerService();
		this.lockService = new LockService();
		this.requestConverterService = new RequestConverterService();

		this.xConfig = new xConfig();
		this.xDatabase = new xDatabase();
		this.xMail = new xMail();
		this.xCacheData = new xCacheData();

		this.requestController = new RequestController();
		this.requestController.setRequestConverterService(this.requestConverterService);

		(this.timerService as TimerService).run();

		CodeHelper.init();
	}

	public init(): void {
		{
			let requestTypeValue = <number>RequestType.Authenticate;

			this.requestController.addHandler(requestTypeValue, new LoginByAccountRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByAndroidDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByAppleRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByCustomDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByCustomIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByEditorDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByFacebookRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByGenericServiceRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByGoogleRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByiOSDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByMacOSDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByWindowsDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByWindowsPhoneDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new RegisterAccountRequestHandler(this), false);
		}

		{
			let requestTypeValue = <number>RequestType.MasterPlayer;

			this.requestController.addHandler(requestTypeValue, new LoginByAccountRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByAndroidDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByAppleRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByCustomDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByCustomIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByEditorDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByFacebookRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByGenericServiceRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByGoogleRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByiOSDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByMacOSDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByWindowsDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new LoginByWindowsPhoneDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new RegisterAccountRequestHandler(this), false);
		}

	}

	public run(onRunSuccess?: OnRunSuccess) {
		this.httpApp.getHttpAppHandler().setOnHttpRequest((request: Request) => {
			return this.handleOnRequest(request);
		});

		this.socketApp.getSocketAppHandler().setOnSocketDisconnect((socket: Socket, data) => {
			this.handleSocketDisconnect(socket, data);
		});

		this.socketApp.getSocketAppHandler().setOnSocketRequest((request: Request) => {
			return this.handleOnRequest(request);
		});

		let tempAnalyticsService = new AnalyticsService();
		tempAnalyticsService.setGNServer(this);
		tempAnalyticsService.run();
		this.analyticsService = tempAnalyticsService;

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

	public addHandler(type: number, requestHandler: IRequestHandler, onlyAuthenticated: boolean = true): void {
		this.requestController.addHandler(type, requestHandler, onlyAuthenticated);
	}

	public createIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.createIndex(collectionName, index, options, (error?: Error, result?: string) => {
			if (error != null) Debug.logError("Create index FAILED at collection " + collectionName + ", index: " + JSON.stringify(index) + ", error: " + error);
			else Debug.log("Create index success at collection " + collectionName + ", index: " + JSON.stringify(index) + ", name: " + result);
		});
	}

	public getHandler(type: number, code: number): IRequestHandler {
		return this.requestController.getHandler(type, code);
	}

	public removeHandler(type: number, code: number): void {
		return this.requestController.removeHandler(type, code);
	}

	public getConfigGame(): xConfig {
		return this.xConfig;
	}

	public getDatabase(): xDatabase {
		return this.xDatabase;
	}

	public getMail(): xMail {
		return this.xMail;
	}

	public getCacheData(): xCacheData {
		return this.xCacheData;
	}

	public getFacebookService(): IFacebookService {
		return this.facebookService;
	}

	public getAppleService(): IAppleService {
		return this.appleService;
	}

	public getWeb3Service(): IWeb3Service {
		return this.web3Service;
	}

	public getGoogleService(): IGoogleService {
		return this.googleService;
	}

	public getTimerService(): ITimerService {
		return this.timerService;
	}

	public getLockService(): ILockService {
		return this.lockService;
	}

	public getAnalyticsService(): IAnalyticsService {
		return this.analyticsService;
	}

	public getRequestConverterService(): IRequestConverterService {
		return this.requestConverterService;
	}

	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventTo(userId, operationEvent);
	}

	public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventToRoom(roomId, operationEvent);
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventToMoreUser(userIds, operationEvent);
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventToAllPlayer(operationEvent);
	}

	// public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
	// 	return await this.socketApp.getSocketAppHandler().sendEventToNamespace(namespace, operationEvent);
	// }

	public async joinRoom(userId: string, roomId: string): Promise<void> {
		return await this.socketApp.getSocketAppHandler().joinRoom(userId, roomId);
	}

	public async leaveRoom(userId: string, roomId: string): Promise<void> {
		return await this.socketApp.getSocketAppHandler().leaveRoom(userId, roomId);
	}

	public getRooms(userId: string): Set<string> {
		return this.socketApp.getSocketAppHandler().getRooms(userId);
	}

	private handleSocketDisconnect(socket: Socket, data: string) {
		if (socket.data.isAuthenticated) {
			socket.data.isAuthenticated = false;
			// let authInfo = socket.data.authInfo as AuthInfo;
			// authInfo.removeOtherData("SocketId");
		}

		if (socket.data.userId != null) {
			socket.leave(socket.data.userId);
		}
	}

	private handleOnRequest(request: Request): Promise<OperationResponse> {
		return this.requestController.handleRequest(request);
	}

}
