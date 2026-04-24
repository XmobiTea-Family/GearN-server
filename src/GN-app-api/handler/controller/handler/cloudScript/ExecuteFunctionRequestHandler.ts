import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { ExecuteResponseStatus } from "./../../../../service/ICloudScriptService";
import { GNData } from "./../../../../../GN-common/common/GNData";

class ExecuteFunctionOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the function name value used by this instance.
	@StringDataMember({ code: ParameterCode.FunctionName, minLength: 3, maxLength: 30, mustNonNull: true })
	public functionName: string;

	// Stores the function parameters value used by this instance.
	@DataMember({ code: ParameterCode.FunctionParameters, isOptional: true })
	public functionParameters?: any;

	// Stores the version value used by this instance.
	@StringDataMember({ code: ParameterCode.Version, minLength: 7, maxLength: 7, isOptional: true })
	public version?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerExecuteFunctionOperationRequest extends ExecuteFunctionOperationRequest {
	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminExecuteFunctionOperationRequest extends ServerExecuteFunctionOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ExecuteFunctionRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ExecuteFunction;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ExecuteFunctionOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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
			userId: request.userId,
			functionName: request.functionName,
			functionParameters: request.functionParameters,
			version: request.version,
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param role Provides the role value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, functionName: string, functionParameters: any, version: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_ExecuteFunction", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the custom tags value used in the current execution flow.
		let customTags = operationRequest.getParameters().getGNHashtable("customTags");
		// Stores the custom tags data value used in the current execution flow.
		let customTagsData = customTags == null ? null : customTags.toData();

		// Stores the cloud script service value used in the current execution flow.
		let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
		if (!cloudScriptService) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		// Stores the function parameters value used in the current execution flow.
		let functionParameters = request.functionParameters;
		if (functionParameters != null) {
			if (functionParameters instanceof GNData) {
				functionParameters = (functionParameters as GNData).toData();
			}
		}

		// Stores the response value used in the current execution flow.
		let response = await cloudScriptService.executeCloudScriptFunction(request.userId, request.functionName, functionParameters, request.version, customTagsData);

		operationResponse.setParameter(ParameterCode.FunctionLogs, response.logs);

		if (response.response.status == ExecuteResponseStatus.Ok) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
			operationResponse.setParameter(ParameterCode.Status, response.response.status);

			operationResponse.setParameter(ParameterCode.ExecutionTimeInMs, response.stats.executeTimeInMs);
			operationResponse.setParameter(ParameterCode.MemoryUsedInBytes, response.stats.memoryUsedInBytes);
			operationResponse.setParameter(ParameterCode.FunctionResult, response.response.result);
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExecuteError);
			operationResponse.setParameter(ParameterCode.Status, response.response.status);

			operationResponse.setParameter(ParameterCode.ErrorMessage, response.response.errorMessage);
		}

		await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_ExecuteFunction", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
