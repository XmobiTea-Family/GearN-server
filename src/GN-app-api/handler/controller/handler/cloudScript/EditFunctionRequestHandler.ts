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

class EditFunctionOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.Version, minLength: 7, maxLength: 7, mustNonNull: true })
	version: string;

	@BooleanDataMember({ code: ParameterCode.CanExecute })
	canExecute: boolean;

	@BooleanDataMember({ code: ParameterCode.IsLive })
	isLive: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerEditFunctionOperationRequest extends EditFunctionOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminEditFunctionOperationRequest extends ServerEditFunctionOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class EditFunctionRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.EditFunction;
	}

	public override getCommonOperationRequest() {
		return EditFunctionOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.editFunction.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ version: request.version, canExecute: request.canExecute, isLive: request.isLive }, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerEditFunctionOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.editFunction.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ version: request.version, canExecute: request.canExecute, isLive: request.isLive }, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminEditFunctionOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().cloudScript.editFunction.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ version: request.version, canExecute: request.canExecute, isLive: request.isLive }, secretInfo, operationRequest);
	}

	private async execute(request: { version: string, canExecute: boolean, isLive: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_EditFunction", request, secretInfo, operationRequest);
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

		let response = await cloudScriptService.editCloudScriptFunction(request.version, request.isLive, request.canExecute);

		if (response.success) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExecuteError);
			operationResponse.setParameter(ParameterCode.ErrorMessage, response.errorMessage);
		}

		await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_EditFunction", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
