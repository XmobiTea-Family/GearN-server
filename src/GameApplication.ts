const EVENT_CMD = "e";

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

export class GameApplication {
	private socketApp: SocketApp;
	private httpApp: HttpApp;

	private requestController: RequestController;

	private xConfig: xConfig;
	private xDatabase: xDatabase;
	private xMail: xMail;
	private xCacheData: xCacheData;

	private facebookService: IFacebookService;
	private appleService: IAppleService;
	private timerService: ITimerService;
	private lockService: ILockService;

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
		this.timerService = new TimerService();
		this.lockService = new LockService();

		this.xConfig = new xConfig();
		this.xDatabase = new xDatabase();
		this.xMail = new xMail();
		this.xCacheData = new xCacheData();

		this.requestController = new RequestController();
	}

	public init(): void {
		// this.requestController.addHandler(new DebugRequestHandler(this), false);
		this.requestController.addHandler(new EnterDisplayNameRequestHandler(this));
		this.requestController.addHandler(new FetchAllDataRequestHandler(this));
		this.requestController.addHandler(new GetAppConfigRequestHandler(this), false);
		this.requestController.addHandler(new LoginRequestHandler(this), false);
		this.requestController.addHandler(new RegisterAccountRequestHandler(this), false);
		this.requestController.addHandler(new RegisterSocketRequestHandler(this));
	}

	public run(onRunSuccess?: OnRunSuccess) {
		this.httpApp.getHttpAppHandler().setOnHttpRequest(this.handleOnRequest);
		this.socketApp.getSocketAppHandler().setOnSocketDisconnect(this.handleSocketDisconnect);
		this.socketApp.getSocketAppHandler().setOnSocketRequest(this.handleOnRequest);

		if (onRunSuccess != null) onRunSuccess();
	}

	public setSocketApp(socketApp: SocketApp): void {
		this.socketApp = socketApp;
	}

	public setHttpApp(httpApp: HttpApp): void {
		this.httpApp = httpApp;
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

	public getHandler(code: number): IRequestHandler {
		return this.requestController.getHandler(code);
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

	public getTimerService(): ITimerService {
		return this.timerService;
	}

	public getLockService(): ILockService {
		return this.lockService;
	}

	public getLoginTypeEnables(): LoginType[] {
		return this.loginTypeEnables;
	}

	public setLoginTypeEnables(loginTypeEnables: LoginType[]): void {
		this.loginTypeEnables = loginTypeEnables;
	}

	public sendEventTo(userId: string, operationEvent: OperationEvent): void {
		this.socketApp.getEmitter().to(userId).emit(EVENT_CMD, operationEvent.toSocketData());
	}

	public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): void {
		for (let i = 0; i < userIds.length; i++) {
			let userId = userIds[i];
			this.sendEventTo(userId, operationEvent);
		}
	}

	public sendEventToAllPlayer(operationEvent: OperationEvent): void {
		this.socketApp.getEmitter().of("/").emit(EVENT_CMD, operationEvent.toSocketData());
	}

	public sendEventToNamespace(namespace: string, operationEvent: OperationEvent): void {
		this.socketApp
			.getEmitter()
			.of("/" + namespace)
			.emit(EVENT_CMD, operationEvent.toSocketData());
	}

	private handleSocketDisconnect(socket: Socket, data: string) {
		let socketAny = socket as any;
		if (socketAny.isAuthenticated) {
			socketAny.isAuthenticated = false;
			let authInfo = socketAny.authInfo as AuthInfo;
			authInfo.removeOtherData("SocketId");
		}

		if (socketAny.userId != null) {
			socket.leave(socketAny.userId);
		}
	}

	private handleOnRequest(request: Request): Promise<OperationResponse> {
		return this.requestController.handleRequest(request);
	}
}
