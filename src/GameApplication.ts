const EVENT_CMD = "e";

import { RequestController } from "./GN-app-api/handler/controller/RequestController";
import { OperationEvent } from "./GN-common/entity/operationEvent/OperationEvent";
import { DebugRequestHandler } from "./GN-app-api/handler/controller/handler/DebugRequestHandler";
import { Socket } from "socket.io";
import { xConfig } from "./GN-library/xconfig/lib/xConfig";
import { xDatabase } from "./GN-library/xdatabase/lib/xDatabase";
import { IFacebookService } from "./GN-app-api/service/IFacebookService";
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

export class GameApplication {
	private socketApp: SocketApp;
	private httpApp: HttpApp;

	private requestController: RequestController;
	private configGame: xConfig;
	private xDatabase: xDatabase;
	private facebookService: IFacebookService;

	public setConfigGame(configGame: xConfig) {
		this.configGame = configGame;
	}

	public setDatabase(xDatabase: xDatabase) {
		this.xDatabase = xDatabase;
	}

	public setFacebookService(facebookService: IFacebookService) {
		this.facebookService = facebookService;
	}

	public init(): void {
		this.requestController = new RequestController();

		// this.requestController.addHandler(new DebugRequestHandler(this), false);
		this.requestController.addHandler(new EnterDisplayNameRequestHandler(this));
		this.requestController.addHandler(new FetchAllDataRequestHandler(this));
		this.requestController.addHandler(new GetAppConfigRequestHandler(this), false);
		this.requestController.addHandler(new LoginRequestHandler(this), false);
		this.requestController.addHandler(new RegisterAccountRequestHandler(this), false);
		this.requestController.addHandler(new RegisterSocketRequestHandler(this));
	}

	public run() {
		let authTokenCollection = this.xDatabase.systemGameCollection("AuthTokenCollection");
		this.httpApp.getApiMiddleware().setAuthTokenCollection(authTokenCollection);

		this.httpApp.getHttpAppHandler().setOnHttpRequest(this.handleOnRequest);

		let adapterEventCollection = this.xDatabase.systemGameCollection("AdapterEventCollection");
		this.socketApp.setEmitter(adapterEventCollection);

		this.socketApp.getSocketAppHandler().setOnSocketDisconnect(this.handleSocketDisconnect);
		this.socketApp.getSocketAppHandler().setOnSocketRequest(this.handleOnRequest);

		let configCollection = this.xDatabase.systemGameCollection("ConfigGame");
		this.configGame.setConfigCollection(configCollection);
		this.configGame.run();
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

	public addHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true) {
		this.requestController.addHandler(requestHandler, onlyAuthenticated);
	}

	public getConfigGame(): xConfig {
		return this.configGame;
	}

	public getDatabase(): xDatabase {
		return this.xDatabase;
	}

	public getFacebookService(): IFacebookService {
		return this.facebookService;
	}

	public sendEventTo(userId: string, operationEvent: OperationEvent) {
		this.socketApp.getEmitter().to(userId).emit(EVENT_CMD, operationEvent.toSocketData());
	}

	public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent) {
		for (let i = 0; i < userIds.length; i++) {
			let userId = userIds[i];
			this.sendEventTo(userId, operationEvent);
		}
	}

	public sendEventToAllPlayer(operationEvent: OperationEvent) {
		this.socketApp.getEmitter().of("/").emit(EVENT_CMD, operationEvent.toSocketData());
	}

	public sendEventToNamespace(namespace: string, operationEvent: OperationEvent) {
		this.socketApp
			.getEmitter()
			.of("/" + namespace)
			.emit(EVENT_CMD, operationEvent.toSocketData());
	}

	private async handleSocketDisconnect(socket: Socket, data: string) {
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
