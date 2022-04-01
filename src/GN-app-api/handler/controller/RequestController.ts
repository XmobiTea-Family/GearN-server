import { OperationRequest } from "./../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./../../../GN-common/entity/operationRequest/base/Request";
import { AuthInfo } from "./../../../GN-common/entity/AuthInfo";

export class RequestController {
	private handlers: {
		[k: number]: (authInfo: AuthInfo, operationRequest: OperationRequest) => Promise<OperationResponse>;
	};

	public addHandler(code: number, handler: (authInfo: AuthInfo, operationRequest: OperationRequest) => Promise<OperationResponse>) {
		this.handlers[code] = handler;
	}

	public handleRequest(request: Request): Promise<OperationResponse> {
		let operationRequest = OperationRequest.newOperationRequest(request);

		let handler = this.handlers[operationRequest.getOperationCode()];
		if (handler != null) {
			return handler(request.getAuthInfo(), operationRequest);
		}

		return null;
	}

	constructor() {
		this.handlers = {};
	}
}
