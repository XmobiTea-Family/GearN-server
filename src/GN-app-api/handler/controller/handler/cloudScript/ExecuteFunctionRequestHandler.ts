import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { ExecuteResponseStatus } from "./../../../../service/ICloudScriptService";
import { GNData } from "./../../../../../GN-common/common/GNData";

class ExecuteFunctionOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.FunctionName, minLength: 3, maxLength: 30, mustNonNull: true })
	public functionName: string;

	@DataMember({ code: ParameterCode.FunctionParameters, isOptional: true })
	public functionParameters?: any;

	@StringDataMember({ code: ParameterCode.Version, minLength: 7, maxLength: 7, isOptional: true })
	public version?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerExecuteFunctionOperationRequest extends ExecuteFunctionOperationRequest {
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminExecuteFunctionOperationRequest extends ServerExecuteFunctionOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ExecuteFunctionRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.ExecuteFunction;
	}

	public override getCommonOperationRequest() {
		return ExecuteFunctionOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().cloudScript.executeFunction.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().cloudScript.executeFunction.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().cloudScript.executeFunction.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: authInfo.getUserId(),
			functionName: request.functionName,
			functionParameters: request.functionParameters,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerExecuteFunctionOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.executeFunction.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			functionName: request.functionName,
			functionParameters: request.functionParameters,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminExecuteFunctionOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.executeFunction.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			functionName: request.functionName,
			functionParameters: request.functionParameters,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, functionName: string, functionParameters: any, version: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_ExecuteFunction", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let customTags = operationRequest.getParameters().getGNHashtable("customTags");
		let customTagsData = customTags == null ? null : customTags.toData();

		let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
		if (!cloudScriptService) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		let functionParameters = request.functionParameters;
		if (functionParameters != null) {
			if (functionParameters instanceof GNData) {
				functionParameters = (functionParameters as GNData).toData();
			}
		}

		let response = await cloudScriptService.executeCloudScriptFunction(request.userId, request.functionName, functionParameters, request.version, customTagsData);

		operationResponse.setParameter(ParameterCode.FunctionLogs, response.logs);

		if (response.response.status == ExecuteResponseStatus.Ok) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
			operationResponse.setParameter(ParameterCode.Status, <number>response.response.status);

			operationResponse.setParameter(ParameterCode.ExecutionTimeInMs, response.stats.executeTimeInMs);
			operationResponse.setParameter(ParameterCode.MemoryUsedInBytes, response.stats.memoryUsedInBytes);
			operationResponse.setParameter(ParameterCode.FunctionResult, response.response.result);
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExecuteError);
			operationResponse.setParameter(ParameterCode.Status, <number>response.response.status);

			operationResponse.setParameter(ParameterCode.ErrorMessage, response.response.errorMessage);
		}

		await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_ExecuteFunction", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
