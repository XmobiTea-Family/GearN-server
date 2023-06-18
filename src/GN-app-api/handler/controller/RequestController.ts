import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { IRequestHandler } from "./handler/base/IRequestHandler";
import { IRequestConverterService } from "./../../service/IRequestConverterService";
import { OperationHelper } from "./../../../GN-common/entity/operationHelper/OperationHelper";

export class RequestController {
	private handlers: {
		[k: number]: {
			[k: number]: IRequestHandler;
		}
	};

	private requestUnAuthenticatedCodes: number[];

	private requestConverterService: IRequestConverterService;

	public setRequestConverterService(requestConverterService: IRequestConverterService): void {
		this.requestConverterService = requestConverterService;
	}

	public getRequestUnAuthenticatedCodes(): number[] {
		return this.requestUnAuthenticatedCodes;
	}

	public addHandler(type: number, requestHandler: IRequestHandler, onlyAuthenticated: boolean = true) {
		if (this.handlers[type] == null) {
			this.handlers[type] = {};
		}

		let allHandler = this.handlers[type];

		let code = requestHandler.getCode();
		allHandler[code] = requestHandler;

		if (!onlyAuthenticated) this.requestUnAuthenticatedCodes.push(code);
	}

	public removeHandler(type: number, code: number) {
		if (this.handlers[type] == null) {
			this.handlers[type] = {};
		}

		let allHandler = this.handlers[type];

		delete allHandler[code];
	}

	public removeAllHandlers() {
		this.handlers = {};
	}

	public getHandler(type: number, code: number): IRequestHandler {
		if (this.handlers[type] == null) {
			this.handlers[type] = {};
		}

		let allHandler = this.handlers[type];

		return allHandler[code];
	}

	public getAllHandlers(type: number): IRequestHandler[] {
		if (this.handlers[type] == null) {
			this.handlers[type] = {};
		}

		let allHandler = this.handlers[type];
		return Object.values(allHandler);
	}

	public async handleRequest(request: Request): Promise<OperationResponse> {
		let code = request.getCode();
		let role = request.getRole();

		let isAuthenticated = request.isAuthenticated();
		if (!isAuthenticated && role != 1 && role != 2) {
			// if the user not authentication
			// and this request not in unAthenticated
			if (this.requestUnAuthenticatedCodes.indexOf(code) == -1) {
				return OperationHelper.newOperationResponseNotAuthorized(code, request.getRequestId(), request.isEncrypted());
			}
		}

		let type = request.getType();
		let handler = this.getHandler(type, code);
		if (handler != null) {
			let operationRequest = this.requestConverterService.newOperationRequest(request);

			if (role == 1) {
				return handler.adminHandle(request.getSecretInfo(), operationRequest);
			}
			else if (role == 2) {
				return handler.serverHandle(request.getSecretInfo(), operationRequest);
			}
			else if (role == 3) {
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
