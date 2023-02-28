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

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetPlayersWithTagOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@StringDataMember({ code: GNParameterCode.Value, minLength: 2, maxLength: 32, mustNonNull: true })
	value: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayersWithTagOperationRequest extends GetPlayersWithTagOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayersWithTagOperationRequest extends ServerGetPlayersWithTagOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersWithTagRequestHandler extends CharacterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetPlayersWithTag;
	}

	public override getCommonOperationRequest() {
		return GetPlayersWithTagOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayersWithTag.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			value: request.value,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayersWithTag.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			value: request.value,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayersWithTag.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			value: request.value,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { key: string, value: string, skip: number, limit: number, infoRequestParam: InfoRequestParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetPlayersWithTag", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(request.infoRequestParam);

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let tagsSettingsItem = characterPlayerSettings.tagsSettings.find(x => x.key == request.key);

		if (tagsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

		let gnResults = new GNArray();

		let characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersWithTagAsync(request.key, request.value, request.skip, request.limit, secretInfo.getGameId(), characterPlayerFindOptions);

		for (let i = 0; i < characterPlayers.length; i++) {
			let characterPlayer = characterPlayers[i];

			let gnResult = new GNHashtable();

			gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());

			gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetPlayersWithTag", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
