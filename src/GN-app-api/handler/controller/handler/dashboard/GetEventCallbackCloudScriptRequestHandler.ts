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

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetEventCallbackCloudScriptRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetEventCallbackCloudScript;
	}

	public override getCommonOperationRequest() {
		return GetEventCallbackCloudScriptOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getEventCallbackCloudScript.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	private async execute(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetEventCallbackCloudScript", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let results = await this.gnServer.getEventCallbackCloudScriptService().getAllCloudScriptFunction();

		let gnResults = new GNArray();

		for (let i = 0; i < results.length; i++) {
			let result = results[i];

			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.Type, result.type);
			gnResult.add(ParameterCode.TsLastUpdate, result.tsLastUpdate);
			gnResult.add(ParameterCode.Version, result.version);
			// gnResult.add(ParameterCode.FullScript, result.fullScript);

			let gnChildScripts = new GNArray();
			let childScripts = result.childScripts;
			for (let j = 0; j < childScripts.length; j++) {
				let childScript = childScripts[j];

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

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetEventCallbackCloudScript", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
