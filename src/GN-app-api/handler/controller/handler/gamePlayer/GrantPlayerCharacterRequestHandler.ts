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

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GrantPlayerCharacterOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	catalogId: string;

	@StringDataMember({ code: GNParameterCode.DisplayName, defaultValue: "", isOptional: true, mustNonNull: true })
	displayName?: string;

	@BooleanDataMember({ code: GNParameterCode.UniqueDisplayName, defaultValue: false, isOptional: true })
	uniqueDisplayName?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGrantPlayerCharacterOperationRequest extends GrantPlayerCharacterOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGrantPlayerCharacterOperationRequest extends ServerGrantPlayerCharacterOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GrantPlayerCharacterRequestHandler extends GamePlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.GrantPlayerCharacter;
	}

	public override getCommonOperationRequest() {
		return GrantPlayerCharacterOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.grantPlayerCharacter.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.grantPlayerCharacter.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.grantPlayerCharacter.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			displayName: request.displayName,
			ipAddress: (request as any).originRequest.getIP(),
			uniqueDisplayName: request.uniqueDisplayName,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGrantPlayerCharacterOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.grantPlayerCharacter.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			displayName: request.displayName,
			ipAddress: (request as any).originRequest.getIP(),
			uniqueDisplayName: request.uniqueDisplayName,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGrantPlayerCharacterOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.grantPlayerCharacter.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			displayName: request.displayName,
			ipAddress: (request as any).originRequest.getIP(),
			uniqueDisplayName: request.uniqueDisplayName,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, catalogId: string, displayName: string, uniqueDisplayName: boolean, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GrantPlayerCharacter", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerCharacters: true,
		}

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		let playerCharacterCatalogSettingsItem = gamePlayerSettings.playerCharacterCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerCharacterCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CatalogIdNotFound);
			return operationResponse;
		}

        if (request.uniqueDisplayName && request.displayName) {
            let characterPlayerWithThisDisplayName = await this.gnServer.getDatabase().loadCharacterPlayerWithDisplayNameAsync(request.displayName, secretInfo.getGameId(), { displayName: true });

            if (characterPlayerWithThisDisplayName != null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.DisplayNameHasUse);
                return operationResponse;
            }
        }

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		let characterId = StringUtility.generateRandomString(11, this.gnServer.getIdTypeCase());

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let result = {} as any;

		result["characterId"] = characterId;
		result["catalogId"] = request.catalogId;
		result["owner"] = { "id": request.userId, "type": <number>OwnerType.GamePlayer };
		result["removeStatus"] = { "tsRemove": 0, "reason": "" };
		result["playerCharacters"] = [];
		result["playerInventories"] = [];
		result["playerGroups"] = [];
		result["playerFriends"] = [];
		result["playerBan"] = { "tsExpire": 0, "reason": "" };
		result["playerCurrencies"] = {};
		result["playerStatistics"] = {};
		result["playerDatas"] = [];
		result["ipAddressCreate"] = request.ipAddress;
		result["countryCode"] = "";
		result["tsLastLogin"] = currentMilliseconds;
		result["segments"] = [];
		result["customDatas"] = {};
		result["tsCreate"] = currentMilliseconds;
		result["displayName"] = request.displayName;
		result["displayNameNormalize"] = DisplayNameUtility.normalizeString(request.displayName);
		result["avatar"] = { "type": 0, "value": "0" };
		result["tags"] = {};

		let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
		if (ipDetailResponse.statusCode == "Ok") {
			if (ipDetailResponse.detail.countryCode) {
				result["countryCode"] = ipDetailResponse.detail.countryCode;
			}
		}

		let characterPlayer = await this.gnServer.getDatabase().createCharacterPlayerAsync(result, secretInfo.getGameId());

		gamePlayer.setPlayerCharacter(characterId, request.catalogId);
		gamePlayer.saveAsync();

		let gnPlayerCharacters = new GNArray();

		let gnPlayerCharacter = new GNHashtable();

		gnPlayerCharacter.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());
		gnPlayerCharacter.add(GNParameterCode.CatalogId, characterPlayer.getCatalogId());

		gnPlayerCharacters.add(gnPlayerCharacter);

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(GNParameterCode.PlayerCharacters, gnPlayerCharacters);

		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GrantPlayerCharacter", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
