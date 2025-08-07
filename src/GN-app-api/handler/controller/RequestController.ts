import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { IRequestHandler } from "./handler/base/IRequestHandler";
import { IRequestConverterService } from "./../../service/IRequestConverterService";
import { OperationHelper } from "./../../../GN-common/entity/operationHelper/OperationHelper";
import { RequestRole } from "./../../../GN-common/constant/enumType/RequestRole";

export class RequestController {
	private handlers: {
		[k: number]: {
			[k: string]: IRequestHandler;
		}
	};

	private requestUnAuthenticatedCodes: string[];

	private requestConverterService: IRequestConverterService;

	public setRequestConverterService(requestConverterService: IRequestConverterService): void {
		this.requestConverterService = requestConverterService;
	}

	public getRequestUnAuthenticatedCodes(): string[] {
		return this.requestUnAuthenticatedCodes;
	}

	public addHandler(requestType: number, requestHandler: IRequestHandler, onlyAuthenticated: boolean = true) {
		if (this.handlers[requestType] == null) {
			this.handlers[requestType] = {};
		}

		let allHandler = this.handlers[requestType];

		let operationCode = requestHandler.getCode();
		allHandler[operationCode] = requestHandler;

		if (!onlyAuthenticated) this.requestUnAuthenticatedCodes.push(operationCode);
	}

	public removeHandler(requestType: number, operationCode: string) {
		if (this.handlers[requestType] == null) {
			this.handlers[requestType] = {};
		}

		let allHandler = this.handlers[requestType];

		delete allHandler[operationCode];
	}

	public removeAllHandlers() {
		this.handlers = {};
	}

	public getHandler(requestType: number, operationCode: string): IRequestHandler {
		if (this.handlers[requestType] == null) {
			this.handlers[requestType] = {};
		}

		let allHandler = this.handlers[requestType];

		return allHandler[operationCode];
	}

	public getAllHandlers(requestType: number): IRequestHandler[] {
		if (this.handlers[requestType] == null) {
			this.handlers[requestType] = {};
		}

		let allHandler = this.handlers[requestType];
		return Object.values(allHandler);
	}

	public async handleRequest(request: Request): Promise<OperationResponse> {
		let operationCode = request.getOperationCode();
		let role = <RequestRole>request.getRole();

		let isAuthenticated = request.isAuthenticated();
		if (!isAuthenticated && role != RequestRole.Admin && role != RequestRole.Server) {
			// if the user not authentication
			// and this request not in unAthenticated
			if (this.requestUnAuthenticatedCodes.indexOf(operationCode) == -1) {
				return OperationHelper.newOperationResponseNotAuthorized(operationCode, request.getRequestId());
			}
		}

		let requestType = request.getRequestType();
		let handler = this.getHandler(requestType, operationCode);
		if (handler != null) {
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

	constructor() {
		this.handlers = {};
		this.requestUnAuthenticatedCodes = [];
	}

}
