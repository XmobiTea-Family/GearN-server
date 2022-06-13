import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { IRequestHandler } from "./handler/base/IRequestHandler";
import { IRequestConverterService } from "./../../service/IRequestConverterService";

export class RequestController {
	private handlers: {
		[k: number]: IRequestHandler;
	};

	private requestUnAuthenticatedCodes: number[];

	private requestConverterService: IRequestConverterService;

	public setRequestConverterService(requestConverterService: IRequestConverterService): void {
		this.requestConverterService = requestConverterService;
	}

	public addHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true) {
		let code = requestHandler.getCode();
		this.handlers[code] = requestHandler;

		if (!onlyAuthenticated) this.requestUnAuthenticatedCodes.push(code);
	}

	public removeHandler(code: number) {
		delete this.handlers[code];
	}

	public removeAllHandlers() {
		this.handlers = [];
	}

	public getHandler(code: number): IRequestHandler {
		return this.handlers[code];
	}

	public async handleRequest(request: Request): Promise<OperationResponse> {
		let code = request.getCode();
		let isAuthenticated = request.getAuthenticated();
		if (!isAuthenticated) {
			// if the user not authentication
			// and this request not in unAthenticated
			if (this.requestUnAuthenticatedCodes.indexOf(code) == -1) {
				return OperationResponse.newOperationNotAuthorized(code, request.getRequestId());
			}
		}

		let operationRequest = this.requestConverterService.newOperationRequest(request);

		let handler = this.handlers[operationRequest.getOperationCode()];
		if (handler != null) {
			return handler.handle(request.getAuthInfo(), operationRequest);
		}

		return null;
	}

	constructor() {
		this.handlers = {};
		this.requestUnAuthenticatedCodes = [];
	}
}
