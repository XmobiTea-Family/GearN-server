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
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class GetFriendStatisticsLeaderboardOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	public key: string;

	// Stores the info request parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	// Stores the skip value used by this instance.
	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	// Stores the limit value used by this instance.
	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	// Indicates whether load from cache.
	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	public loadFromCache?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetFriendStatisticsLeaderboardOperationRequest extends GetFriendStatisticsLeaderboardOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetFriendStatisticsLeaderboardOperationRequest extends ServerGetFriendStatisticsLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetFriendStatisticsLeaderboardRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetFriendStatisticsLeaderboard;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetFriendStatisticsLeaderboardOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboard.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboard.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboard.selfEnable) {
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFriendStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboard.serverSelfEnable) {
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFriendStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getFriendStatisticsLeaderboard.adminSelfEnable) {
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetFriendStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		// Stores the player statistics settings item value used in the current execution flow.
		let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

			return operationResponse;
		}

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		// Stores the cache key value used in the current execution flow.
		let cacheKey = "gamePlayerStatisticsLeaderboardFriend_" + request.userId + "_" + request.key;

		if (request.loadFromCache) {
			if (!(await cacheData.isValid(cacheKey))) {
				request.loadFromCache = false;
			}
		}

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		// Stores the game players value used in the current execution flow.
		let gamePlayers: GamePlayer[];

		if (request.loadFromCache) {
			gamePlayers = await cacheData.getData(cacheKey);
		}
		else {
			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), null);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);

				return operationResponse;
			}

			// Stores the friend IDs value used in the current execution flow.
			let friendIds: string[] = [];

			// Stores the complete player friends collection used in the current execution flow.
			let allPlayerFriends = gamePlayer.getAllPlayerFriends();

			for (let i = 0; i < allPlayerFriends.length; i++) {
				// Stores the player friend item value used in the current execution flow.
				let playerFriendItem = allPlayerFriends[i];

				if (playerFriendItem.status == FriendStatus.Friend) {
					friendIds.push(playerFriendItem.friendId);
				}
			}

			// Stores the complete game players collection used in the current execution flow.
			let allGamePlayers = await this.gnServer.getDatabase().gamePlayerRepository.loadFriendGamePlayersLeaderboardWithStatisticsAsync(friendIds, secretInfo.getGameId(), null);

			allGamePlayers.push(gamePlayer);

			// Stores the statistics aggregation method value used in the current execution flow.
			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

			gamePlayers = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum
				? GetFriendStatisticsLeaderboardRequestHandler.quickSortAsc(request.key, allGamePlayers, playerStatisticsSettingsItem.initialValue)
				: GetFriendStatisticsLeaderboardRequestHandler.quickSort(request.key, allGamePlayers, playerStatisticsSettingsItem.initialValue);

			await cacheData.setData(cacheKey, gamePlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
		}

		for (let i = request.skip; i < request.skip + request.limit; i++) {
			if (i >= gamePlayers.length) break;

			// Stores the game player value used in the current execution flow.
			let gamePlayer = gamePlayers[i];

			// Stores the GearN result value used in the current execution flow.
			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.Position, i);

			gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

			gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetFriendStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Executes the quick sort workflow.
	 * @param key Provides the key value used by this operation.
	 * @param gamePlayers Provides the game players value used by this operation.
	 * @param initialValue Provides the initial value value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static quickSort(key: string, gamePlayers: GamePlayer[], initialValue: number): GamePlayer[] {
		if (gamePlayers.length < 2) return gamePlayers;

		// let pivotIndex = gamePlayers.length - 1;
		// let pivot = gamePlayers[pivotIndex];

		// let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// let pivotPlayerStatistic = pivot.getPlayerStatistics(key);
		// if (pivotPlayerStatistic == null) {
		// 	pivotPlayerStatistic = {
		// 		tsLastUpdate: currentMilliseconds,
		// 		value: initialValue
		// 	}
		// }

		// let left = [];
		// let right = [];

		// let currentItem;
		// for (let i = 0; i < pivotIndex; i++) {
		// 	currentItem = gamePlayers[i];

		// 	let currentPlayerStatistic = currentItem.getPlayerStatistics(key);
		// 	if (currentPlayerStatistic == null) {
		// 		currentPlayerStatistic = {
		// 			tsLastUpdate: currentMilliseconds,
		// 			value: initialValue
		// 		}
		// 	}

		// 	if (currentPlayerStatistic.value < pivotPlayerStatistic.value) {
		// 		right.push(currentItem);
		// 	}
		// 	else if (currentPlayerStatistic.value == pivotPlayerStatistic.value) {
		// 		if (currentPlayerStatistic.tsLastUpdate > pivotPlayerStatistic.tsLastUpdate) {
		// 			right.push(currentItem);
		// 		}
		// 		else {
		// 			left.push(currentItem);
		// 		}
		// 	}
		// 	else {
		// 		left.push(currentItem);
		// 	}
		// }

		// return [...this.quickSort(key, right, initialValue), pivot, ...this.quickSort(key, left, initialValue)];

		const currentMilliseconds = xDatetime.getCurrentMilliseconds();

		return gamePlayers.sort((left, right) => {
			// Stores the left stat value used in the current execution flow.
			let leftStat = left.getPlayerStatistics(key);
			// Stores the right stat value used in the current execution flow.
			let rightStat = right.getPlayerStatistics(key);

			if (leftStat == null) leftStat = { tsLastUpdate: currentMilliseconds, value: initialValue };
			if (rightStat == null) rightStat = { tsLastUpdate: currentMilliseconds, value: initialValue };

			if (leftStat.value > rightStat.value) return -1;
			if (leftStat.value < rightStat.value) return 1;

			// if (leftStat.tsLastUpdate > rightStat.tsLastUpdate) return -1;
			// if (leftStat.tsLastUpdate < rightStat.tsLastUpdate) return 1;

			return 0;
		});
	}

	/**
	 * Executes the quick sort asc workflow.
	 * @param key Provides the key value used by this operation.
	 * @param gamePlayers Provides the game players value used by this operation.
	 * @param initialValue Provides the initial value value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static quickSortAsc(key: string, gamePlayers: GamePlayer[], initialValue: number): GamePlayer[] {
		if (gamePlayers.length < 2) return gamePlayers;

		// let pivotIndex = gamePlayers.length - 1;
		// let pivot = gamePlayers[pivotIndex];

		// let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// let pivotPlayerStatistic = pivot.getPlayerStatistics(key);
		// if (pivotPlayerStatistic == null) {
		// 	pivotPlayerStatistic = {
		// 		tsLastUpdate: currentMilliseconds,
		// 		value: initialValue
		// 	}
		// }

		// let left = [];
		// let right = [];

		// let currentItem;
		// for (let i = 0; i < pivotIndex; i++) {
		// 	currentItem = gamePlayers[i];

		// 	let currentPlayerStatistic = currentItem.getPlayerStatistics(key);
		// 	if (currentPlayerStatistic == null) {
		// 		currentPlayerStatistic = {
		// 			tsLastUpdate: currentMilliseconds,
		// 			value: initialValue
		// 		}
		// 	}

		// 	if (currentPlayerStatistic.value > pivotPlayerStatistic.value) {
		// 		right.push(currentItem);
		// 	}
		// 	else if (currentPlayerStatistic.value == pivotPlayerStatistic.value) {
		// 		if (currentPlayerStatistic.tsLastUpdate > pivotPlayerStatistic.tsLastUpdate) {
		// 			right.push(currentItem);
		// 		}
		// 		else {
		// 			left.push(currentItem);
		// 		}
		// 	}
		// 	else {
		// 		left.push(currentItem);
		// 	}
		// }

		// return [...this.quickSort(key, right, initialValue), pivot, ...this.quickSort(key, left, initialValue)];

		const currentMilliseconds = xDatetime.getCurrentMilliseconds();

		return gamePlayers.sort((left, right) => {
			// Stores the left stat value used in the current execution flow.
			let leftStat = left.getPlayerStatistics(key);
			// Stores the right stat value used in the current execution flow.
			let rightStat = right.getPlayerStatistics(key);

			if (leftStat == null) leftStat = { tsLastUpdate: currentMilliseconds, value: initialValue };
			if (rightStat == null) rightStat = { tsLastUpdate: currentMilliseconds, value: initialValue };

			if (leftStat.value > rightStat.value) return 1;
			if (leftStat.value < rightStat.value) return -1;

			// if (leftStat.tsLastUpdate > rightStat.tsLastUpdate) return -1;
			// if (leftStat.tsLastUpdate < rightStat.tsLastUpdate) return 1;

			return 0;
		});
	}
}
