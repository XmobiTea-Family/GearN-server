import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { StringDataMember } from "./../../../../../GN-common/entity/DataMember";

class SetEventCallbackCloudScriptOperationRequest extends OperationRequest {

	// Stores the event name value used by this instance.
	@StringDataMember({ code: ParameterCode.EventName, minLength: 6, maxLength: 128, mustNonNull: true })
	public eventName: string;

	// Stores the script value used by this instance.
	@StringDataMember({ code: ParameterCode.Script, minLength: 6, maxLength: 40960, mustNonNull: true })
	public script: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetEventCallbackCloudScriptRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetEventCallbackCloudScript;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetEventCallbackCloudScriptOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.setEventCallbackCloudScript.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			eventName: request.eventName,
			script: request.script,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { eventName: string, script: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetEventCallbackCloudScript", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the response value used in the current execution flow.
		let response = await this.gnServer.getEventCallbackCloudScriptService().addCloudScriptFunction(request.eventName, request.script);

		if (response.success) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExecuteError);
			operationResponse.setParameter(ParameterCode.ErrorMessage, response.errorMessage);
		}

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetEventCallbackCloudScript", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
