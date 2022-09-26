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
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class DebugOperationRequest extends OperationRequest {
	@BooleanDataMember({ code: DebugParameterCode.Boolean, isOptional: true })
	booleanValue: boolean;

	@NumberDataMember({ code: DebugParameterCode.Number, isOptional: true })
	numberValue: number;

	@StringDataMember({ code: DebugParameterCode.String, isOptional: true })
	stringValue: string;

	@GNHashtableDataMember({ code: DebugParameterCode.GNHashtable, isOptional: true })
	gnHashtableValue: GNHashtable;

	@GNArrayDataMember({ code: DebugParameterCode.GNArray, isOptional: true })
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
		operationResponse.setScriptData(ParameterCode.ErrorCode, DebugErrorCode.Ok);

		operationResponse.setScriptData(DebugParameterCode.Boolean, request.booleanValue);
		operationResponse.setScriptData(DebugParameterCode.Number, request.numberValue);
		operationResponse.setScriptData(DebugParameterCode.String, request.stringValue);
		operationResponse.setScriptData(DebugParameterCode.GNHashtable, request.gnHashtableValue);
		operationResponse.setScriptData(DebugParameterCode.GNArray, request.gnArrayValue);

		if (authInfo != null) {
			let operationEvent = new OperationEvent(EventCode.OnDebug);
			operationEvent.setParameters(operationResponse.getParameters());

			this.gameApplication.sendEventTo(authInfo.getUserId(), operationEvent);
		}

		this.gameApplication.joinRoom(authInfo.getUserId(), "test");

		return operationResponse;
	}
}
