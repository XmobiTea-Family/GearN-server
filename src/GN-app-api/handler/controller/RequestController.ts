import { OperationRequest } from "./../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { AuthInfo } from "./../../../GN-common/entity/AuthInfo";
import { IRequestHandler } from "./handler/base/IRequestHandler";

export class RequestController {
	private handlers: {
		[k: number]: (authInfo: AuthInfo, operationRequest: OperationRequest) => Promise<OperationResponse>;
	};

	private requestUnAuthenticatedCodes: number[];

	private _addHandler(code: number, handler: (authInfo: AuthInfo, operationRequest: OperationRequest) => Promise<OperationResponse>, onlyAuthenticated: boolean) {
		this.handlers[code] = handler;

		if (!onlyAuthenticated) this.requestUnAuthenticatedCodes.push(code);
	}

	public addHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true) {
        this._addHandler(requestHandler.getCode(), requestHandler.handle, onlyAuthenticated);
    }

	public async handleRequest(request: Request): Promise<OperationResponse> {
		let code = request.getCode();
		let isAuthenticated = request.getAuthenticated();
		if (!isAuthenticated) {	// if the user not authentication
			// and this request not in unAthenticated
			if (this.requestUnAuthenticatedCodes.indexOf(code) == -1) {
				return OperationResponse.newOperationNotAuthorized(code, request.getRequestId());
			}
		}

		let operationRequest = OperationRequest.newOperationRequest(request);

		let handler = this.handlers[operationRequest.getOperationCode()];
		if (handler != null) {
			return handler(request.getAuthInfo(), operationRequest);
		}

		return null;
	}

	constructor() {
		this.handlers = {};
		this.requestUnAuthenticatedCodes = [];
	}
}
