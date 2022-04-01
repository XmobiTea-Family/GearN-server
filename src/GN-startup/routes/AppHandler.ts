import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";

export class AppHandler {
	private handlers: {
		[k: number]: (operationRequest: OperationRequest) => Promise<OperationResponse>;
	} = {};

	public addHandler(code: number, handler: (operationRequest: OperationRequest) => Promise<OperationResponse>) {
		this.handlers[code] = handler;
	}

	public handleRequest(request: Request): Promise<OperationResponse> {
		let operationRequest = OperationRequest.newOperationRequest(request);

		let handler = this.handlers[operationRequest.getOperationCode()];
		if (handler != null) {
			return handler(operationRequest);
		}

		return null;
	}
}
