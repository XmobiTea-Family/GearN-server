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

class GetContentDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: GNParameterCode.Keys, elementCls: String, isOptional: true })
	keys?: Array<string>;

	@StringDataMember({ code: GNParameterCode.Label, minLength: 2, maxLength: 32, isOptional: true, defaultValue: "" })
	label?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetContentDataOperationRequest extends GetContentDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetContentDataOperationRequest extends ServerGetContentDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetContentDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetContentData;
	}

	public override getCommonOperationRequest() {
		return GetContentDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getContentData.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getContentData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getContentData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { keys: Array<string>, label: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_GetContentData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let configGame = this.gnServer.getConfigService(secretInfo.getGameId());
		if (!configGame) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GameNotFound);
			return operationResponse;
		}

		if (!request.label) request.label = "origin";

		let gnConfigs = new GNArray();

		let configDic = configGame.getConfigDicViaLabel(request.label);

		configDic.forEach((value, key) => {
			if (request.keys == null || request.keys.indexOf(key) != -1) {
				let gnConfig = new GNHashtable();

				gnConfig.add(GNParameterCode.Key, key);
				gnConfig.add(GNParameterCode.Data, value.getData());

				gnConfigs.add(gnConfig);
			}
		});

		operationResponse.setParameter(GNParameterCode.Configs, gnConfigs);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_GetContentData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
