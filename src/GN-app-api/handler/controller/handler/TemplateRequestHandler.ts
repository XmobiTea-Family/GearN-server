import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { DebugParameterCode } from "./../../../../GN-common/constant/parameterCode/DebugParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { DebugErrorCode } from "./../../../../GN-common/constant/errorCode/DebugErrorCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { DataMember } from "./../../../service/RequestConverterService";

class TemplateOperationRequest extends OperationRequest {
	@DataMember(DebugParameterCode.Boolean)
	booleanValue: boolean;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class TemplateRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.Debug;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, TemplateOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, DebugErrorCode.Ok);

		operationResponse.setParameter(DebugParameterCode.Boolean, request.booleanValue);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse);
		}

		return operationResponse;
	}
}
