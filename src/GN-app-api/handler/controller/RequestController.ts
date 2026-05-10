import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { IRequestHandler } from "./handler/base/IRequestHandler";
import { IRequestConverterService } from "./../../service/IRequestConverterService";
import { OperationHelper } from "./../../../GN-common/entity/operationHelper/OperationHelper";
import { RequestRole } from "./../../../GN-common/constant/enumType/RequestRole";

export class RequestController {
    // Handlers are indexed by request type, then by operation code.
    private handlers: {
        [k: number]: {
            [k: string]: IRequestHandler;
        };
    };

    // Operation codes that are allowed to bypass client authentication checks.
    private requestUnAuthenticatedCodes: string[];

    // Converts the raw transport request into the typed operation request expected by handlers.
    private requestConverterService: IRequestConverterService;

    /**
     * Sets the request converter service.
     * @param requestConverterService Provides the request converter service used by this operation.
     */
    public setRequestConverterService(requestConverterService: IRequestConverterService): void {
        this.requestConverterService = requestConverterService;
    }

    /**
     * Returns the request unauthenticated codes.
     * @returns Returns the request unauthenticated codes.
     */
    public getRequestUnAuthenticatedCodes(): string[] {
        return this.requestUnAuthenticatedCodes;
    }

    /**
     * Adds the handler.
     * @param requestType Provides the request type value used by this operation.
     * @param requestHandler Provides the request handler used by this operation.
     * @param onlyAuthenticated Indicates whether only authenticated access is allowed.
     */
    public addHandler(requestType: number, requestHandler: IRequestHandler, onlyAuthenticated: boolean = true) {
        if (this.handlers[requestType] == null) {
            this.handlers[requestType] = {};
        }

        // Stores the complete handler collection used in the current execution flow.
        let allHandler = this.handlers[requestType];

        // Stores the operation code value used in the current execution flow.
        let operationCode = requestHandler.getCode();
        allHandler[operationCode] = requestHandler;

        if (!onlyAuthenticated) this.requestUnAuthenticatedCodes.push(operationCode);
    }

    /**
     * Removes the handler.
     * @param requestType Provides the request type value used by this operation.
     * @param operationCode Provides the operation code value used by this operation.
     */
    public removeHandler(requestType: number, operationCode: string) {
        if (this.handlers[requestType] == null) {
            this.handlers[requestType] = {};
        }

        // Stores the complete handler collection used in the current execution flow.
        let allHandler = this.handlers[requestType];

        delete allHandler[operationCode];
    }

    /**
     * Removes all handlers.
     */
    public removeAllHandlers() {
        this.handlers = {};
    }

    /**
     * Returns the handler.
     * @param requestType Provides the request type value used by this operation.
     * @param operationCode Provides the operation code value used by this operation.
     * @returns Returns the handler.
     */
    public getHandler(requestType: number, operationCode: string): IRequestHandler {
        if (this.handlers[requestType] == null) {
            this.handlers[requestType] = {};
        }

        // Stores the complete handler collection used in the current execution flow.
        let allHandler = this.handlers[requestType];

        return allHandler[operationCode];
    }

    /**
     * Returns all handlers.
     * @param requestType Provides the request type value used by this operation.
     * @returns Returns all handlers.
     */
    public getAllHandlers(requestType: number): IRequestHandler[] {
        if (this.handlers[requestType] == null) {
            this.handlers[requestType] = {};
        }

        // Stores the complete handler collection used in the current execution flow.
        let allHandler = this.handlers[requestType];
        return Object.values(allHandler);
    }

    /**
     * Applies authentication rules, converts the request payload, then dispatches to the correct role entrypoint.
     * @param request Provides the request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async handleRequest(request: Request): Promise<OperationResponse> {
        let operationCode = request.getOperationCode();
        let role = request.getRole();

        // Admin and server roles are authenticated upstream through secrets, not client auth tokens.
        let isAuthenticated = request.isAuthenticated();
        if (!isAuthenticated && role != RequestRole.Admin && role != RequestRole.Server) {
            if (this.requestUnAuthenticatedCodes.indexOf(operationCode) == -1) {
                return OperationHelper.newOperationResponseNotAuthorized(operationCode, request.getRequestId());
            }
        }

        let requestType = request.getRequestType();
        let handler = this.getHandler(requestType, operationCode);
        if (handler != null) {
            // Convert only after a handler is found to avoid unnecessary request-model allocation.
            let operationRequest = this.requestConverterService.newOperationRequest(request);

            if (role == RequestRole.Admin) {
                return handler.adminHandle(request.getSecretInfo(), operationRequest);
            } else if (role == RequestRole.Server) {
                return handler.serverHandle(request.getSecretInfo(), operationRequest);
            } else if (role == RequestRole.Client) {
                return handler.handle(request.getAuthInfo(), request.getSecretInfo(), operationRequest);
            }
        }

        return null;
    }

    /**
     * Initializes a new request controller instance.
     */
    constructor() {
        this.handlers = {};
        this.requestUnAuthenticatedCodes = [];
    }
}
