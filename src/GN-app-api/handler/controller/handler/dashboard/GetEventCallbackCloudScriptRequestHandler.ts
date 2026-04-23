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

class GetEventCallbackCloudScriptOperationRequest extends OperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetEventCallbackCloudScriptRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetEventCallbackCloudScript;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetEventCallbackCloudScriptOperationRequest;
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

		if (!secretInfo.getPermission().dashboard.getEventCallbackCloudScript.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetEventCallbackCloudScript", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the results value used in the current execution flow.
		let results = await this.gnServer.getEventCallbackCloudScriptService().getAllCloudScriptFunction();

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		for (let i = 0; i < results.length; i++) {
			// Stores the result value used in the current execution flow.
			let result = results[i];

			// Stores the GearN result value used in the current execution flow.
			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.Type, result.type);
			gnResult.add(ParameterCode.TsLastUpdate, result.tsLastUpdate);
			gnResult.add(ParameterCode.Version, result.version);
			// gnResult.add(ParameterCode.FullScript, result.fullScript);

			let gnChildScripts = new GNArray();
			// Stores the child scripts value used in the current execution flow.
			let childScripts = result.childScripts;
			for (let j = 0; j < childScripts.length; j++) {
				// Stores the child script value used in the current execution flow.
				let childScript = childScripts[j];

				// Stores the GearN child script value used in the current execution flow.
				let gnChildScript = new GNHashtable();
				gnChildScript.add(ParameterCode.EventName, childScript.eventName);
				gnChildScript.add(ParameterCode.Script, childScript.script);
				gnChildScript.add(ParameterCode.HasEdit, childScript.hasEdit);

				gnChildScripts.add(gnChildScript);
			}

			gnResult.add(ParameterCode.ChildScripts, gnChildScripts);

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetEventCallbackCloudScript", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
