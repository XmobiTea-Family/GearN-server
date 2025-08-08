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
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetStatisticsLeaderboardAroundPlayerOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	public key: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	public loadFromCache?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardAroundPlayerOperationRequest extends GetStatisticsLeaderboardAroundPlayerOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

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

export class GetStatisticsLeaderboardAroundPlayerRequestHandler extends GamePlayerBaseRequestHandler {

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
			if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.selfEnable) {
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

		if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.serverSelfEnable) {
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

		if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.adminSelfEnable) {
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
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

			return operationResponse;
		}

		let positionCacheKey = "gamePlayerStatisticsLeaderboardAroundPosition_" + request.userId + "_" + request.key;
		let cacheKey = "gamePlayerStatisticsLeaderboardAround_" + request.userId + "_" + request.key;

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
		let gamePlayers: GamePlayer[];

		if (request.loadFromCache) {
			thisPosition = await cacheData.getData(positionCacheKey);
			gamePlayers = await cacheData.getData(cacheKey);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= gamePlayers.length) break;

				let gamePlayer = gamePlayers[i];

				let gnResult = new GNHashtable();

				gnResult.add(ParameterCode.Position, i + thisPosition);

				gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

				gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

				gnResults.add(gnResult);
			}
		}
		else {
			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
			let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

			thisPosition = await this.gnServer.getDatabase().loadPositionGamePlayerLeaderboardWithStatisticsAsync(request.key, request.userId, secretInfo.getGameId(), playerStatisticsSettingsItem.initialValue, direction);

			if (thisPosition != -1) {
				await cacheData.setData(positionCacheKey, thisPosition, xDatetime.ONE_MINUTE_MILLISECOND * 5);

				let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(request.infoRequestParam);

				if (request.skip + request.limit <= 100) {
					gamePlayerFindOptions = null;

					gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithStatisticsAsync(request.key, thisPosition, 100, secretInfo.getGameId(), direction, gamePlayerFindOptions);

					for (let i = request.skip; i < request.skip + request.limit; i++) {
						if (i >= gamePlayers.length) break;

						let gamePlayer = gamePlayers[i];

						let gnResult = new GNHashtable();

						gnResult.add(ParameterCode.Position, i + thisPosition);

						gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

						gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

						gnResults.add(gnResult);
					}

					await cacheData.setData(cacheKey, gamePlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
				}
				else {
					gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, secretInfo.getGameId(), direction, gamePlayerFindOptions);

					for (let i = 0; i < gamePlayers.length; i++) {

						let gamePlayer = gamePlayers[i];

						let gnResult = new GNHashtable();

						gnResult.add(ParameterCode.Position, i + thisPosition + request.skip);

						gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

						gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

						gnResults.add(gnResult);
					}
				}
			}
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
