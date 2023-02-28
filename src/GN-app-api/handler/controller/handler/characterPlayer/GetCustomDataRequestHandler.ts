import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";

class GetCustomDataOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	characterId: string;

	@GNArrayDataMember({ code: GNParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	customDataKeys?: Array<string>;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetCustomDataOperationRequest extends GetCustomDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCustomDataOperationRequest extends ServerGetCustomDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetCustomDataRequestHandler extends CharacterPlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetCustomData;
	}

	public override getCommonOperationRequest() {
		return GetCustomDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.getCustomData);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			customDataKeys: request.customDataKeys,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCustomDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getCustomData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			customDataKeys: request.customDataKeys,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCustomDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getCustomData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			customDataKeys: request.customDataKeys,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, customDataKeys: Array<string> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetCustomData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			customDatas: true,
		}

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		let gnInfoResponseParameters = new GNHashtable();

		gnInfoResponseParameters.add(GNParameterCode.CustomDatas, this.generateCustomDatas(characterPlayer, request.customDataKeys, secretInfo.getGameId()));

		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetCustomData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
