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
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { GetFriendStatisticsLeaderboardRequestHandler } from "./GetFriendStatisticsLeaderboardRequestHandler";
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { GamePlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";

class GetFriendStatisticsLeaderboardAroundPlayerOperationRequest extends OperationRequest {
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

class ServerGetFriendStatisticsLeaderboardAroundPlayerOperationRequest extends GetFriendStatisticsLeaderboardAroundPlayerOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetFriendStatisticsLeaderboardAroundPlayerOperationRequest extends ServerGetFriendStatisticsLeaderboardAroundPlayerOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetFriendStatisticsLeaderboardAroundPlayerRequestHandler extends GamePlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetFriendStatisticsLeaderboardAroundPlayer;
	}

	public override getCommonOperationRequest() {
		return GetFriendStatisticsLeaderboardAroundPlayerOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboardAroundPlayer.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboardAroundPlayer.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboardAroundPlayer.selfEnable) {
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFriendStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboardAroundPlayer.serverSelfEnable) {
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFriendStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboardAroundPlayer.adminSelfEnable) {
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
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetFriendStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

        let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		let cacheKey = "gamePlayerStatisticsLeaderboardFriendAround_" + request.userId;

		if (request.loadFromCache) {
			if (!(await cacheData.isValid(cacheKey))) {
				request.loadFromCache = false;
			}
		}

		let gnResults = new GNArray();

		let gamePlayers: GamePlayer[];

		if (request.loadFromCache) {
			gamePlayers = await cacheData.getData(cacheKey);
		}
		else {
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), null);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GamePlayerNotFound);

				return operationResponse;
			}

			let friendIds: string[] = [];

			let allPlayerFriends = gamePlayer.getAllPlayerFriends();

			for (let i = 0; i < allPlayerFriends.length; i++) {
				let playerFriendItem = allPlayerFriends[i];

				if (playerFriendItem.status == <number>FriendStatus.Friend) {
					friendIds.push(playerFriendItem.friendId);
				}
			}

			let allGamePlayers = await this.gnServer.getDatabase().loadFriendGamePlayersLeaderboardWithStatisticsAsync(friendIds, secretInfo.getGameId(), null);

			allGamePlayers.push(gamePlayer);

			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

			gamePlayers = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum
				? GetFriendStatisticsLeaderboardRequestHandler.quickSortAsc(request.key, allGamePlayers, playerStatisticsSettingsItem.initialValue)
				: GetFriendStatisticsLeaderboardRequestHandler.quickSort(request.key, allGamePlayers, playerStatisticsSettingsItem.initialValue);

			await cacheData.setData(cacheKey, gamePlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
		}

		let gamePlayer = gamePlayers.find(x => x.getUserId() == request.userId);
		let thisPosition = gamePlayers.indexOf(gamePlayer);

		for (let i = request.skip + thisPosition; i < request.skip + thisPosition + request.limit; i++) {
			if (i >= gamePlayers.length) break;

			let gamePlayer = gamePlayers[i];

			let gnResult = new GNHashtable();

			gnResult.add(GNParameterCode.Position, i);

			gnResult.add(GNParameterCode.UserId, gamePlayer.getUserId());

			gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetFriendStatisticsLeaderboardAroundPlayer", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
