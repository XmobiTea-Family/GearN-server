import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetPlayerInformationOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	characterId: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerInformationOperationRequest extends GetPlayerInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayerInformationOperationRequest extends ServerGetPlayerInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayerInformationRequestHandler extends CharacterPlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetPlayerInformation;
	}

	public override getCommonOperationRequest() {
		return GetPlayerInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInformation.otherSelfEnable && !secretInfo.getPermission().characterPlayer.getPlayerInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		let allowMethod = false;
		let owned = false;
		let updateTsLastLogin = false;

		if (secretInfo.getPermission().characterPlayer.getPlayerInformation.otherSelfEnable) {
			allowMethod = true;
		}

		if (secretInfo.getPermission().characterPlayer.getPlayerInformation.selfEnable) {
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

			if (gamePlayer != null) {
				if (gamePlayer.hasPlayerCharacter(request.characterId)) {
					allowMethod = true;
					owned = true;
					updateTsLastLogin = true;
				}
			}
		}

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		if (owned) {
			this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);
		}
		else {
			this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);
		}

		return this.execute({
			characterId: request.characterId,
			infoRequestParam: request.infoRequestParam,
			updateTsLastLogin: updateTsLastLogin,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			characterId: request.characterId,
			infoRequestParam: request.infoRequestParam,
			updateTsLastLogin: false,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			characterId: request.characterId,
			infoRequestParam: request.infoRequestParam,
			updateTsLastLogin: false,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, infoRequestParam: InfoRequestParam, updateTsLastLogin: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetPlayerInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(request.infoRequestParam);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		if (request.updateTsLastLogin) {
			characterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			characterPlayer.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetPlayerInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
