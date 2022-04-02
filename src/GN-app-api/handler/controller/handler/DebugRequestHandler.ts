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

class DebugOperationRequest extends OperationRequest {
	booleanValue: boolean;
	numberValue: number;
	stringValue: string;
	gnHashtableValue: GNHashtable;
	gnArrayValue: GNArray;

	constructor(operationRequest: OperationRequest) {
		super(operationRequest);

		this.booleanValue = this.parameters.getBoolean(DebugParameterCode.Boolean);
		this.numberValue = this.parameters.getNumber(DebugParameterCode.Number);
		this.stringValue = this.parameters.getString(DebugParameterCode.String);
		this.gnHashtableValue = this.parameters.getGNHashtable(DebugParameterCode.GNHashtable);
		this.gnArrayValue = this.parameters.getGNArray(DebugParameterCode.GNArray);
	}

	public isValidRequest() {
		return true;
	}
}

export class DebugRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.Debug;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = new DebugOperationRequest(operationRequest);

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

		return operationResponse;
	}
}
