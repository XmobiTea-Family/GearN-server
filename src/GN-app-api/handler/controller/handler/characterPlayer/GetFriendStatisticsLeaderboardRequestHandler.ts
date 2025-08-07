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
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class GetFriendStatisticsLeaderboardOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	characterId: string;

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	loadFromCache?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetFriendStatisticsLeaderboardOperationRequest extends GetFriendStatisticsLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetFriendStatisticsLeaderboardOperationRequest extends ServerGetFriendStatisticsLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetFriendStatisticsLeaderboardRequestHandler extends CharacterPlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetFriendStatisticsLeaderboard;
	}

	public override getCommonOperationRequest() {
		return GetFriendStatisticsLeaderboardOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getFriendStatisticsLeaderboard.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			characterId: request.characterId,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFriendStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getFriendStatisticsLeaderboard.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			characterId: request.characterId,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFriendStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getFriendStatisticsLeaderboard.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			characterId: request.characterId,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetFriendStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

			return operationResponse;
		}

		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		let cacheKey = "characterPlayerStatisticsLeaderboardFriend_" + request.characterId;

		if (request.loadFromCache) {
			if (!(await cacheData.isValid(cacheKey))) {
				request.loadFromCache = false;
			}
		}

		let gnResults = new GNArray();

		let characterPlayers: CharacterPlayer[];

		if (request.loadFromCache) {
			characterPlayers = await cacheData.getData(cacheKey);
		}
		else {
			let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), null);

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);

				return operationResponse;
			}

			let friendIds: string[] = [];

			let allPlayerFriends = characterPlayer.getAllPlayerFriends();

			for (let i = 0; i < allPlayerFriends.length; i++) {
				let playerFriendItem = allPlayerFriends[i];

				if (playerFriendItem.status == <number>FriendStatus.Friend) {
					friendIds.push(playerFriendItem.friendId);
				}
			}

			let allCharacterPlayers = await this.gnServer.getDatabase().loadFriendCharacterPlayersLeaderboardWithStatisticsAsync(friendIds, secretInfo.getGameId(), null);

			allCharacterPlayers.push(characterPlayer);

			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

			characterPlayers = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum
				? GetFriendStatisticsLeaderboardRequestHandler.quickSortAsc(request.key, allCharacterPlayers, playerStatisticsSettingsItem.initialValue)
				: GetFriendStatisticsLeaderboardRequestHandler.quickSort(request.key, allCharacterPlayers, playerStatisticsSettingsItem.initialValue);

			await cacheData.setData(cacheKey, characterPlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
		}

		for (let i = request.skip; i < request.skip + request.limit; i++) {
			if (i >= characterPlayers.length) break;

			let characterPlayer = characterPlayers[i];

			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.Position, i);

			gnResult.add(ParameterCode.CharacterId, characterPlayer.getCharacterId());

			gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetFriendStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	public static quickSort(key: string, characterPlayers: CharacterPlayer[], initialValue: number): CharacterPlayer[] {
		if (characterPlayers.length < 2) return characterPlayers;

		let pivotIndex = characterPlayers.length - 1;
		let pivot = characterPlayers[pivotIndex];

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let pivotPlayerStatistic = pivot.getPlayerStatistics(key);
		if (pivotPlayerStatistic == null) {
			pivotPlayerStatistic = {
				tsLastUpdate: currentMilliseconds,
				value: initialValue
			}
		}

		let left = [];
		let right = [];

		let currentItem;
		for (let i = 0; i < pivotIndex; i++) {
			currentItem = characterPlayers[i];

			let currentPlayerStatistic = currentItem.getPlayerStatistics(key);
			if (currentPlayerStatistic == null) {
				currentPlayerStatistic = {
					tsLastUpdate: currentMilliseconds,
					value: initialValue
				}
			}

			if (currentPlayerStatistic.value < pivotPlayerStatistic.value) {
				right.push(currentItem);
			}
			else if (currentPlayerStatistic.value == pivotPlayerStatistic.value) {
				if (currentPlayerStatistic.tsLastUpdate > pivotPlayerStatistic.tsLastUpdate) {
					right.push(currentItem);
				}
				else {
					left.push(currentItem);
				}
			}
			else {
				left.push(currentItem);
			}
		}

		return [...this.quickSort(key, right, initialValue), pivot, ...this.quickSort(key, left, initialValue)];
	}

	public static quickSortAsc(key: string, characterPlayers: CharacterPlayer[], initialValue: number): CharacterPlayer[] {
		if (characterPlayers.length < 2) return characterPlayers;

		let pivotIndex = characterPlayers.length - 1;
		let pivot = characterPlayers[pivotIndex];

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let pivotPlayerStatistic = pivot.getPlayerStatistics(key);
		if (pivotPlayerStatistic == null) {
			pivotPlayerStatistic = {
				tsLastUpdate: currentMilliseconds,
				value: initialValue
			}
		}

		let left = [];
		let right = [];

		let currentItem;
		for (let i = 0; i < pivotIndex; i++) {
			currentItem = characterPlayers[i];

			let currentPlayerStatistic = currentItem.getPlayerStatistics(key);
			if (currentPlayerStatistic == null) {
				currentPlayerStatistic = {
					tsLastUpdate: currentMilliseconds,
					value: initialValue
				}
			}

			if (currentPlayerStatistic.value > pivotPlayerStatistic.value) {
				right.push(currentItem);
			}
			else if (currentPlayerStatistic.value == pivotPlayerStatistic.value) {
				if (currentPlayerStatistic.tsLastUpdate > pivotPlayerStatistic.tsLastUpdate) {
					right.push(currentItem);
				}
				else {
					left.push(currentItem);
				}
			}
			else {
				left.push(currentItem);
			}
		}

		return [...this.quickSort(key, right, initialValue), pivot, ...this.quickSort(key, left, initialValue)];
	}
}
