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

class AddFunctionOperationRequest extends OperationRequest {

	// Stores the script value used by this instance.
	@StringDataMember({ code: ParameterCode.Script, minLength: 0, maxLength: Number.MAX_SAFE_INTEGER, mustNonNull: true })
	public script: string;

	// Indicates whether execute can be performed.
	@BooleanDataMember({ code: ParameterCode.CanExecute })
	public canExecute: boolean;

	// Indicates whether live.
	@BooleanDataMember({ code: ParameterCode.IsLive })
	public isLive: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerAddFunctionOperationRequest extends AddFunctionOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminAddFunctionOperationRequest extends ServerAddFunctionOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class AddFunctionRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.AddFunction;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return AddFunctionOperationRequest;
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

		if (!secretInfo.getPermission().cloudScript.addFunction.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ script: request.script, canExecute: request.canExecute, isLive: request.isLive }, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerAddFunctionOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.addFunction.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ script: request.script, canExecute: request.canExecute, isLive: request.isLive }, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminAddFunctionOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.addFunction.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ script: request.script, canExecute: request.canExecute, isLive: request.isLive }, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { script: string, canExecute: boolean, isLive: boolean }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_AddFunction", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the cloud script service value used in the current execution flow.
		let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
		if (!cloudScriptService) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		// Stores the response value used in the current execution flow.
		let response = await cloudScriptService.addCloudScriptFunction(request.script, request.isLive, request.canExecute);

		if (response.success) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
			operationResponse.setParameter(ParameterCode.Version, response.version);
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExecuteError);
			operationResponse.setParameter(ParameterCode.ErrorMessage, response.errorMessage);
		}

		await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_AddFunction", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
