import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { IRequestHandler } from "./handler/base/IRequestHandler";
import { IRequestConverterService } from "./../../service/IRequestConverterService";
import { OperationHelper } from "./../../../GN-common/entity/operationHelper/OperationHelper";
import { RequestRole } from "./../../../GN-common/constant/enumType/RequestRole";

export class RequestController {
	// Stores the handlers value used by this instance.
	private handlers: {
		[k: number]: {
			[k: string]: IRequestHandler;
		}
	};

	// Stores the request unauthenticated codes list used by this instance.
	private requestUnAuthenticatedCodes: string[];

	// Stores the request converter service value used by this instance.
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
	 * Handles the request.
	 * @param request Provides the request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handleRequest(request: Request): Promise<OperationResponse> {
		// Stores the operation code value used in the current execution flow.
		let operationCode = request.getOperationCode();
		// Stores the role value used in the current execution flow.
		let role = <RequestRole>request.getRole();

		// Tracks whether authenticated.
		let isAuthenticated = request.isAuthenticated();
		if (!isAuthenticated && role != RequestRole.Admin && role != RequestRole.Server) {
			// if the user not authentication
			// and this request not in unAthenticated
			if (this.requestUnAuthenticatedCodes.indexOf(operationCode) == -1) {
				return OperationHelper.newOperationResponseNotAuthorized(operationCode, request.getRequestId());
			}
		}

		// Stores the request type value used in the current execution flow.
		let requestType = request.getRequestType();
		// Stores the handler value used in the current execution flow.
		let handler = this.getHandler(requestType, operationCode);
		if (handler != null) {
			// Stores the operation request value used in the current execution flow.
			let operationRequest = this.requestConverterService.newOperationRequest(request);

			if (role == RequestRole.Admin) {
				return handler.adminHandle(request.getSecretInfo(), operationRequest);
			}
			else if (role == RequestRole.Server) {
				return handler.serverHandle(request.getSecretInfo(), operationRequest);
			}
			else if (role == RequestRole.Client) {
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
