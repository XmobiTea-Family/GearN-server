import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../GN-common/entity/AuthInfo";

class LoginOperationRequest extends OperationRequest {
	objectId: number;

	constructor(operationRequest: OperationRequest) {
		super(operationRequest);

		this.objectId = this.parameters.getNumber(0);
	}

	public isValidRequest() {
		return false;
	}
}

export class LoginRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.Login;
	}

	public handle = async (authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> => {
		let request = new LoginOperationRequest(operationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		return null;
	};
}
