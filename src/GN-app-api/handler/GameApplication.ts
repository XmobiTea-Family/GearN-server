import { RequestController } from "./controller/RequestController";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { IRequestHandler } from "./controller/handler/base/IRequestHandler";
import { DebugRequestHandler } from "./controller/handler/DebugRequestHandler";
import { ApiMiddleware } from "./../../GN-startup/middleware/ApiMiddleware";
import { Socket } from "socket.io";

export class GameApplication {
    private requestController: RequestController;
    private apiMiddleware: ApiMiddleware;

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

        this.addHandler(new DebugRequestHandler(this));
    }

    public getRequestController(): RequestController {
        return this.requestController;
    }

    public getApiMiddleware(): ApiMiddleware {
        return this.apiMiddleware;
    }

    public addHandler(requestHandler: IRequestHandler) {
        this.requestController.addHandler(requestHandler.getCode(), requestHandler.handle);
    }

    public handleSocketDisconnect(socket: Socket, data: string) {}

    public sendEventTo(userId: string, operationEvent: OperationEvent) {}

    public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent) {}

    public sendEventToAllPlayer(operationEvent: OperationEvent) {}

    public sendEventToNamespace(namespace: string, operationEvent: OperationEvent) {}
}
