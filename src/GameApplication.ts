import { RequestController } from "./GN-app-api/handler/controller/RequestController";
import { OperationEvent } from "./GN-common/entity/operationEvent/OperationEvent";
import { DebugRequestHandler } from "./GN-app-api/handler/controller/handler/DebugRequestHandler";
import { ApiMiddleware } from "./GN-startup/middleware/ApiMiddleware";
import { Socket } from "socket.io";
import { xConfig } from "./GN-library/xconfig/lib/xConfig";
import { xDatabase } from "./GN-library/xdatabase/lib/xDatabase";
import { IFacebookService } from "./GN-app-api/service/IFacebookService";

export class GameApplication {
	private requestController: RequestController;
	private apiMiddleware: ApiMiddleware;
	private configGame: xConfig;
	private xDatabase: xDatabase;
	private facebookService: IFacebookService;

	private static instance: GameApplication;

	public static getInstance(): GameApplication {
		if (this.instance == null) {
			this.instance = new GameApplication();
			this.instance.init();
		}

		return this.instance;
	}

	private init(): void {
		this.requestController = new RequestController();
		this.apiMiddleware = new ApiMiddleware();

		this.requestController.addHandler(new DebugRequestHandler(this));
	}

	public getRequestController(): RequestController {
		return this.requestController;
	}

	public getApiMiddleware(): ApiMiddleware {
		return this.apiMiddleware;
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

	public handleSocketDisconnect(socket: Socket, data: string) {}

	public sendEventTo(userId: string, operationEvent: OperationEvent) {}

	public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent) {}

	public sendEventToAllPlayer(operationEvent: OperationEvent) {}

	public sendEventToNamespace(namespace: string, operationEvent: OperationEvent) {}
}
