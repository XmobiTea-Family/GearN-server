import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../GN-common/entity/AuthInfo";

class DebugOperationRequest extends OperationRequest {
	objectId: number;

	constructor(operationRequest: OperationRequest) {
		super(operationRequest);

		this.objectId = this.parameters.getNumber(0);
	}

	public isValidRequest() {
		return false;
	}
}

export class DebugRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.Debug;
	}

	public handle = async (authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> => {
		let request = new DebugOperationRequest(operationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		return null;
	};
}
