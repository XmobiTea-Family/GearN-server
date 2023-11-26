import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";
import { ContentDataParam } from "./model/ContentDataParam";

class SetContentDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: GNParameterCode.Configs, elementCls: ContentDataParam, mustNonNull: true })
	configs: Array<ContentDataParam>;

	@StringDataMember({ code: GNParameterCode.Label, minLength: 2, maxLength: 32, isOptional: true })
	label?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetContentDataOperationRequest extends SetContentDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetContentDataOperationRequest extends ServerSetContentDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetContentDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetContentData;
	}

	public override getCommonOperationRequest() {
		return SetContentDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.setContentData.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			configs: request.configs,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.setContentData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			configs: request.configs,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.setContentData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			configs: request.configs,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { configs: Array<ContentDataParam>, label: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_SetContentData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let configGame = this.gnServer.getConfigGame(secretInfo.getGameId());
		if (!configGame) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GameNotFound);
			return operationResponse;
		}

		if (!request.label) request.label = "origin";

		for (let i = 0; i < request.configs.length; i++) {
			let config = request.configs[i];

			configGame.setConfigAsync(config.key, request.label, config.data != null ? config.data.toData() : null);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_SetContentData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
