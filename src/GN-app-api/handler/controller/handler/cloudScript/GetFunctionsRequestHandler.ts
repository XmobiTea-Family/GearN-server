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
import { GNArray, GNHashtableBuilder } from "./../../../../../GN-common/common/GNData";

class GetFunctionsOperationRequest extends OperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetFunctionsOperationRequest extends GetFunctionsOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetFunctionsOperationRequest extends ServerGetFunctionsOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetFunctionsRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetFunctions;
	}

	public override getCommonOperationRequest() {
		return GetFunctionsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.getFunctions.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFunctionsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.getFunctions.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFunctionsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.getFunctions.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	private async execute(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_GetFunctions", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
		if (!cloudScriptService) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		let response = cloudScriptService.getCloudScriptFunctions();

		let gnResults = new GNArray();
		for (let i = 0; i < response.length; i++) {
			let function1 = response[i];

			gnResults.add(new GNHashtableBuilder()
				.add(ParameterCode.Version, function1.version)
				.add(ParameterCode.CanExecute, function1.canExecute)
				.build());
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		operationResponse.setParameter(ParameterCode.Results, gnResults);
		operationResponse.setParameter(ParameterCode.LatestVersion, cloudScriptService.getLatestVersion());
		operationResponse.setParameter(ParameterCode.LiveLatestVersion, cloudScriptService.getLiveLatestVersion());

		await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_GetFunctions", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
