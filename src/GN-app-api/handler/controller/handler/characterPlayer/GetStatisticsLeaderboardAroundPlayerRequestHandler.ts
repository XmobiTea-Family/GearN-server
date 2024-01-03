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
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { CharacterPlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";

class GetStatisticsLeaderboardAroundPlayerOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	characterId: string;

	@StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@BooleanDataMember({ code: GNParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	loadFromCache?: boolean;

	@StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	catalogId?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardAroundPlayerOperationRequest extends GetStatisticsLeaderboardAroundPlayerOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardAroundPlayerOperationRequest extends ServerGetStatisticsLeaderboardAroundPlayerOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardAroundPlayerRequestHandler extends CharacterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetStatisticsLeaderboardAroundPlayer;
	}

	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardAroundPlayerOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.getStatisticsLeaderboardAroundPlayer);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			characterId: request.characterId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getStatisticsLeaderboardAroundPlayer.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			characterId: request.characterId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getStatisticsLeaderboardAroundPlayer.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			characterId: request.characterId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

        let positionCacheKey = "characterPlayerStatisticsLeaderboardAroundPosition_" + request.characterId + "_" + request.key;
        let cacheKey = "characterPlayerStatisticsLeaderboardAround_" + request.characterId + "_" + request.key;
        if (request.catalogId) {
            cacheKey += "_" + request.catalogId;
            positionCacheKey += "_" + request.catalogId;
        }

        if (request.loadFromCache) {
            if (request.skip + request.limit > 100) {
                request.loadFromCache = false;
            }
        }

        let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

        if (request.loadFromCache) {
            if (!(await cacheData.isValid(cacheKey)) || !(await cacheData.isValid(positionCacheKey))) {
                request.loadFromCache = false;
            }
        }

		let gnResults = new GNArray();

        let thisPosition: number;
		let characterPlayers: CharacterPlayer[];

        if (request.loadFromCache) {
		    thisPosition = await cacheData.getData(positionCacheKey);
            characterPlayers = await cacheData.getData(cacheKey);

            for (let i = request.skip; i < request.skip + request.limit; i++) {
                if (i >= characterPlayers.length) break;

                let characterPlayer = characterPlayers[i];

                let gnResult = new GNHashtable();

                gnResult.add(GNParameterCode.Position, i + thisPosition);

                gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());

                gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

                gnResults.add(gnResult);
            }
        }
        else {
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
            let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;
    
            thisPosition = await this.gnServer.getDatabase().loadPositionCharacterPlayerLeaderboardWithStatisticsAsync(request.key, request.characterId, request.catalogId, secretInfo.getGameId(), playerStatisticsSettingsItem.initialValue, direction);

            if (thisPosition != -1) {
                await cacheData.setData(positionCacheKey, thisPosition, xDatetime.ONE_MINUTE_MILLISECOND * 5);
                
                let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(request.infoRequestParam);

                if (request.skip + request.limit <= 100) {
                    characterPlayerFindOptions = null;
    
                    characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersLeaderboardWithStatisticsAsync(request.key, thisPosition, 100, request.catalogId, secretInfo.getGameId(), direction, characterPlayerFindOptions);
    
                    for (let i = request.skip; i < request.skip + request.limit; i++) {
                        if (i >= characterPlayers.length) break;
    
                        let characterPlayer = characterPlayers[i];
    
                        let gnResult = new GNHashtable();
    
                        gnResult.add(GNParameterCode.Position, i + thisPosition);
    
                        gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());
    
                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));
    
                        gnResults.add(gnResult);
                    }
    
                    await cacheData.setData(cacheKey, characterPlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
                }
                else {
                    characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, characterPlayerFindOptions);
    
                    for (let i = 0; i < characterPlayers.length; i++) {
    
                        let characterPlayer = characterPlayers[i];
    
                        let gnResult = new GNHashtable();
    
                        gnResult.add(GNParameterCode.Position, i + thisPosition + request.skip);
    
                        gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());
    
                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));
    
                        gnResults.add(gnResult);
                    }
                }
            }
        }

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
