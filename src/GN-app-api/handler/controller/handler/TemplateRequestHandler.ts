import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { DebugParameterCode } from "./../../../../GN-common/constant/parameterCode/DebugParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { DebugErrorCode } from "./../../../../GN-common/constant/errorCode/DebugErrorCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class TemplateOperationRequest extends OperationRequest {
	@BooleanDataMember({ code: DebugParameterCode.Boolean })
	booleanValue: boolean;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}

}

export class TemplateRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.Debug;
	}

	public override getCommonOperationRequest() {
		return TemplateOperationRequest;
	}

	public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setScriptData(ParameterCode.ErrorCode, DebugErrorCode.Ok);

		operationResponse.setScriptData(DebugParameterCode.Boolean, request.booleanValue);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse);
		}

		return operationResponse;
	}

}
