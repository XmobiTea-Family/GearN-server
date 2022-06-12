import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { DebugParameterCode } from "./../../../../GN-common/constant/parameterCode/DebugParameterCode";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { DebugErrorCode } from "./../../../../GN-common/constant/errorCode/DebugErrorCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { OperationEvent } from "./../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../GN-common/constant/EventCode";
import { DataMember } from "./../../../service/RequestConverterService";

class DebugOperationRequest extends OperationRequest {
	@DataMember(DebugParameterCode.Boolean, true)
	booleanValue: boolean;

	@DataMember(DebugParameterCode.Boolean, true)
	numberValue: number;

	@DataMember(DebugParameterCode.Number, true)
	stringValue: string;

	@DataMember(DebugParameterCode.GNHashtable, true)
	gnHashtableValue: GNHashtable;

	@DataMember(DebugParameterCode.GNArray, true)
	gnArrayValue: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class DebugRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.Debug;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, DebugOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, DebugErrorCode.Ok);

		operationResponse.setParameter(DebugParameterCode.Boolean, request.booleanValue);
		operationResponse.setParameter(DebugParameterCode.Number, request.numberValue);
		operationResponse.setParameter(DebugParameterCode.String, request.stringValue);
		operationResponse.setParameter(DebugParameterCode.GNHashtable, request.gnHashtableValue);
		operationResponse.setParameter(DebugParameterCode.GNArray, request.gnArrayValue);

		if (authInfo != null) {
			let operationEvent = new OperationEvent(EventCode.OnDebug);
			operationEvent.setParameters(operationResponse.getParameters());

			this.gameApplication.sendEventTo(authInfo.getUserId(), operationEvent);
		}

		return operationResponse;
	}
}
