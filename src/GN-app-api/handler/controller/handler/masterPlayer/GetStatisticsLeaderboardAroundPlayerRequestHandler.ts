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
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { MasterPlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";

class GetStatisticsLeaderboardAroundPlayerOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

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

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardAroundPlayerOperationRequest extends GetStatisticsLeaderboardAroundPlayerOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

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

export class GetStatisticsLeaderboardAroundPlayerRequestHandler extends MasterPlayerBaseRequestHandler {

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

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboardAroundPlayer.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboardAroundPlayer.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboardAroundPlayer.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			userId: request.userId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboardAroundPlayer.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			userId: request.userId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboardAroundPlayer.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			userId: request.userId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_GetStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();
		let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

        let positionCacheKey = "masterPlayerStatisticsLeaderboardAroundPosition_" + request.userId + "_" + request.key;
        let cacheKey = "masterPlayerStatisticsLeaderboardAround_" + request.userId + "_" + request.key;

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
        let masterPlayers: MasterPlayer[];

        if (request.loadFromCache) {
            thisPosition = await cacheData.getData(positionCacheKey);
            masterPlayers = await cacheData.getData(cacheKey);

            for (let i = request.skip; i < request.skip + request.limit; i++) {
                if (i >= masterPlayers.length) break;

                let masterPlayer = masterPlayers[i];

                let gnResult = new GNHashtable();
    
                gnResult.add(GNParameterCode.Position, i + thisPosition);
    
                gnResult.add(GNParameterCode.UserId, masterPlayer.getUserId());
    
                gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));
    
                gnResults.add(gnResult);
            }
        }
        else {
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
            let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;
    
            thisPosition = await this.gnServer.getDatabase().loadPositionMasterPlayerLeaderboardWithStatisticsAsync(request.key, request.userId, playerStatisticsSettingsItem.initialValue, direction);
    
            if (thisPosition != -1) {
                await cacheData.setData(positionCacheKey, thisPosition, xDatetime.ONE_MINUTE_MILLISECOND * 5);

                let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);

                if (request.skip + request.limit <= 100) {
                    masterPlayerFindOptions = null;

                    masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithStatisticsAsync(request.key, thisPosition, 100, direction, masterPlayerFindOptions);

                    for (let i = request.skip; i < request.skip + request.limit; i++) {
                        if (i >= masterPlayers.length) break;

                        let masterPlayer = masterPlayers[i];

                        let gnResult = new GNHashtable();

                        gnResult.add(GNParameterCode.Position, i + thisPosition);

                        gnResult.add(GNParameterCode.UserId, masterPlayer.getUserId());

                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

                        gnResults.add(gnResult);
                    }

                    await cacheData.setData(cacheKey, masterPlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
                }
                else {
                    masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, direction, masterPlayerFindOptions);

                    for (let i = 0; i < masterPlayers.length; i++) {
                        let masterPlayer = masterPlayers[i];

                        let gnResult = new GNHashtable();

                        gnResult.add(GNParameterCode.Position, i + thisPosition + request.skip);

                        gnResult.add(GNParameterCode.UserId, masterPlayer.getUserId());

                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

                        gnResults.add(gnResult);
                    }
                }
            }
        }

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_GetStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
