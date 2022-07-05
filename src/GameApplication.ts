const GN_VERSION = "0.5.1";

import { RequestController } from "./GN-app-api/handler/controller/RequestController";
import { OperationEvent } from "./GN-common/entity/operationEvent/OperationEvent";
import { DebugRequestHandler } from "./GN-app-api/handler/controller/handler/DebugRequestHandler";
import { Socket } from "socket.io";
import { xConfig } from "./GN-library/xconfig/lib/xConfig";
import { xDatabase } from "./GN-library/xdatabase/lib/xDatabase";
import { FacebookService } from "./GN-app-api/service/FacebookService";
import { SocketApp } from "./GN-startup/SocketApp";
import { HttpApp } from "./GN-startup/HttpApp";
import { IRequestHandler } from "./GN-app-api/handler/controller/handler/base/IRequestHandler";
import { AuthInfo } from "./GN-common/entity/AuthInfo";
import { OperationResponse } from "./GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./GN-common/entity/operationRequest/base/Request";
import { EnterDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/EnterDisplayNameRequestHandler";
import { FetchAllDataRequestHandler } from "./GN-app-api/handler/controller/handler/FetchAllDataRequestHandler";
import { GetAppConfigRequestHandler } from "./GN-app-api/handler/controller/handler/GetAppConfigRequestHandler";
import { LoginRequestHandler } from "./GN-app-api/handler/controller/handler/LoginRequestHandler";
import { RegisterAccountRequestHandler } from "./GN-app-api/handler/controller/handler/RegisterAccountRequestHandler";
import { RegisterSocketRequestHandler } from "./GN-app-api/handler/controller/handler/RegisterSocketRequestHandler";
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
import { LoginType } from "./GN-common/constant/enumType/LoginType";
import { ApiMiddleware } from "./GN-startup/middleware/ApiMiddleware";
import { Debug } from "./GN-library/xdebug/lib/xDebug";
import { IRequestConverterService } from "./GN-app-api/service/IRequestConverterService";
import { RequestConverterService } from "./GN-app-api/service/RequestConverterService";
import { IWeb3Service } from "./GN-app-api/service/IWeb3Service";
import { Web3Service } from "./GN-app-api/service/Web3Service";
import { IGoogleService } from "./GN-app-api/service/IGoogleService";
import { GoogleService } from "./GN-app-api/service/GoogleService";

interface CreateIndexesOptions {
	unique?: boolean;
	sparse?: boolean;
	expireAfterSeconds?: number;
}

export class GameApplication {
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

	private loginTypeEnables: LoginType[] = [];

	constructor() {
		this.loginTypeEnables = [
			LoginType.Account,
			LoginType.Device,
			LoginType.Facebook,
			LoginType.Google,
			LoginType.Apple,
			LoginType.UserId,
			LoginType.PublicAddress,
			LoginType.CustomId,
		];

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
	}

	public init(): void {
		this.requestController.addHandler(new DebugRequestHandler(this), false);
		this.requestController.addHandler(new GetAppConfigRequestHandler(this), false);
		this.requestController.addHandler(new LoginRequestHandler(this), false);
		this.requestController.addHandler(new RegisterAccountRequestHandler(this), false);
		this.requestController.addHandler(new EnterDisplayNameRequestHandler(this));
		this.requestController.addHandler(new RegisterSocketRequestHandler(this));
		this.requestController.addHandler(new FetchAllDataRequestHandler(this));
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

	public addHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true): void {
		this.requestController.addHandler(requestHandler, onlyAuthenticated);
	}

	public createIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.createIndex(collectionName, index, options, (error?: Error, result?: string) => {
			if (error != null) Debug.logError("Create index FAILED at collection " + collectionName + ", index: " + JSON.stringify(index) + ", error: " + error);
			else Debug.log("Create index success at collection " + collectionName + ", index: " + JSON.stringify(index) + ", name: " + result);
		});
	}

	public getHandler(code: number): IRequestHandler {
		return this.requestController.getHandler(code);
	}

	public removeHandler(code: number): void {
		return this.requestController.removeHandler(code);
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

	public getRequestConverterService(): IRequestConverterService {
		return this.requestConverterService;
	}

	public getLoginTypeEnables(): LoginType[] {
		return this.loginTypeEnables;
	}

	public setLoginTypeEnables(loginTypeEnables: LoginType[]): void {
		this.loginTypeEnables = loginTypeEnables;
	}

	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventTo(userId, operationEvent);
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventToMoreUser(userIds, operationEvent);
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventToAllPlayer(operationEvent);
	}

	public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
		return await this.socketApp.getSocketAppHandler().sendEventToNamespace(namespace, operationEvent);
	}

	private handleSocketDisconnect(socket: Socket, data: string) {
		if (socket.data.isAuthenticated) {
			socket.data.isAuthenticated = false;
			let authInfo = socket.data.authInfo as AuthInfo;
			authInfo.removeOtherData("SocketId");
		}

		if (socket.data.userId != null) {
			socket.leave(socket.data.userId);
		}
	}

	private handleOnRequest(request: Request): Promise<OperationResponse> {
		return this.requestController.handleRequest(request);
	}
}
