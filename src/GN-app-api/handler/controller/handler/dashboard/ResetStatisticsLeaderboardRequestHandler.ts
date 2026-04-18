import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";

class ResetStatisticsLeaderboardOperationRequest extends OperationRequest {

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	// Stores the version value used by this instance.
	@StringDataMember({ code: ParameterCode.Version, minLength: 2, maxLength: 32 })
	public version: string;

	// Stores the game ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

	// Stores the log value used by this instance.
	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	// Stores the catalog ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	public catalogId?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ResetStatisticsLeaderboardRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ResetStatisticsLeaderboard;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ResetStatisticsLeaderboardOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.resetStatisticsLeaderboard.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			type: request.type,
			key: request.key,
			version: request.version,
			gameId: request.gameId,
			log: request.log,
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { type: number, key: string, version: string, gameId: string, log: string, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_ResetStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		// Stores the type value used in the current execution flow.
		let type = request.type;
		// Stores the key value used in the current execution flow.
		let key = request.key;
		// Stores the version value used in the current execution flow.
		let version = request.version;

		// Stores the log value used in the current execution flow.
		let log = request.log;

		if (type == OwnerType.MasterPlayer) {
			// Stores the backup statistics leaderboard collection value used in the current execution flow.
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");

			// Tracks whether this version exists.
			let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
			if (hasThisVersion) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VersionInvalid);
				return operationResponse;
			}

			// Stores the resolved master player settings instance for the current execution flow.
			let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

			// Stores the player statistics settings item value used in the current execution flow.
			let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);

			if (playerStatisticsSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				return operationResponse;
			}

			// Stores the master player find options value used in the current execution flow.
			let masterPlayerFindOptions: MasterPlayerFindOptions = {
				userId: true,
				playerStatistics: true,
			}

			// Stores the statistics aggregation method value used in the current execution flow.
			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
			// Stores the direction value used in the current execution flow.
			let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

			// Stores the master player collection value used in the current execution flow.
			let masterPlayerCollection = await this.gnServer.getDatabase().systemCollection("MasterPlayer");
			Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + masterPlayerCollection.collectionName + " starting");

			// Stores the master players value used in the current execution flow.
			let masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithStatisticsAllAsync(key, direction, masterPlayerFindOptions);

			// Stores the backup data value used in the current execution flow.
			let backupData: {
				// Stores the key value used by this contract.
				key: string,
				// Stores the version value used by this contract.
				version: string,
				// Stores the log value used by this contract.
				log: string,
				// Stores the timestamp create value used by this contract.
				tsCreate: number,
				// Stores the results list used by this contract.
				results: {
					// Stores the position value used by this contract.
					position: number,
					// Indicates whether r ID should be used.
					userId: string,
					// Stores the value value used by this contract.
					value: number,
					// Stores the timestamp last update value used by this contract.
					tsLastUpdate: number,
				}[]
			} = {
				key: key,
				version: version,
				log: log,
				tsCreate: currentMilliseconds,
				results: []
			};

			// Stores the log requests value used in the current execution flow.
			let logRequests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

			for (let i = 0; i < masterPlayers.length; i++) {
				// Stores the master player value used in the current execution flow.
				let masterPlayer = masterPlayers[i];

				// Stores the player statistics value used in the current execution flow.
				let playerStatistics = masterPlayer.getPlayerStatistics(key);

				// Stores the value value used in the current execution flow.
				let value = playerStatisticsSettingsItem.initialValue;
				// Stores the timestamp last update value used in the current execution flow.
				let tsLastUpdate = currentMilliseconds;

				if (playerStatistics != null) {
					value = playerStatistics.value,
						tsLastUpdate = playerStatistics.tsLastUpdate;
				}

				// Tracks whether r ID should be used.
				let userId = masterPlayer.getUserId();

				backupData.results.push({
					position: i,
					userId: userId,
					value: value,
					tsLastUpdate: tsLastUpdate,
				});

				if (playerStatistics != null) {
					// Stores the amount value used in the current execution flow.
					let amount = value - playerStatisticsSettingsItem.initialValue;

					logRequests.push({
						userId: userId,
						amount: -amount,
						startValue: value,
						finalValue: playerStatisticsSettingsItem.initialValue,
						key: key,
						log: log,
						tsCreate: currentMilliseconds,
					});
				}
			}

			// Stores the unset value used in the current execution flow.
			let $unset = {} as any;
			$unset["playerStatistics." + key] = null;

			await masterPlayerCollection.updateMany({}, {
				$unset: $unset
			});

			await backupStatisticsLeaderboardCollection.insertOne(backupData);

			this.gnServer.getDatabase().insertMasterPlayerStatisticsLogsAsync(logRequests);

			Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + masterPlayerCollection.collectionName + " success");
		}
		else {
			// Stores the game ID value used in the current execution flow.
			let gameId = request.gameId;

			if (type == OwnerType.GamePlayer) {
				// Stores the backup statistics leaderboard collection value used in the current execution flow.
				let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);

				// Tracks whether this version exists.
				let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
				if (hasThisVersion) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VersionInvalid);
					return operationResponse;
				}

				// Stores the resolved game player settings instance for the current execution flow.
				let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);
				// Stores the player statistics settings item value used in the current execution flow.
				let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings.find(x => x.key == key);

				if (playerStatisticsSettingsItem == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
					return operationResponse;
				}

				// Stores the game player find options value used in the current execution flow.
				let gamePlayerFindOptions: GamePlayerFindOptions = {
					userId: true,
					playerStatistics: true,
				}

				// Stores the statistics aggregation method value used in the current execution flow.
				let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
				// Stores the direction value used in the current execution flow.
				let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

				// Stores the game player collection value used in the current execution flow.
				let gamePlayerCollection = await this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + gamePlayerCollection.collectionName + " starting");

				// Stores the game players value used in the current execution flow.
				let gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithStatisticsAllAsync(key, gameId, direction, gamePlayerFindOptions);

				// Stores the backup data value used in the current execution flow.
				let backupData: {
					// Stores the key value used by this contract.
					key: string,
					// Stores the version value used by this contract.
					version: string,
					// Stores the log value used by this contract.
					log: string,
					// Stores the timestamp create value used by this contract.
					tsCreate: number,
					// Stores the results list used by this contract.
					results: {
						// Stores the position value used by this contract.
						position: number,
						// Indicates whether r ID should be used.
						userId: string,
						// Stores the value value used by this contract.
						value: number,
						// Stores the timestamp last update value used by this contract.
						tsLastUpdate: number,
					}[]
				} = {
					key: key,
					version: version,
					log: log,
					tsCreate: currentMilliseconds,
					results: []
				};

				// Stores the log requests value used in the current execution flow.
				let logRequests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

				for (let i = 0; i < gamePlayers.length; i++) {
					// Stores the game player value used in the current execution flow.
					let gamePlayer = gamePlayers[i];

					// Stores the player statistics value used in the current execution flow.
					let playerStatistics = gamePlayer.getPlayerStatistics(key);

					// Stores the value value used in the current execution flow.
					let value = playerStatisticsSettingsItem.initialValue;
					// Stores the timestamp last update value used in the current execution flow.
					let tsLastUpdate = currentMilliseconds;

					if (playerStatistics != null) {
						value = playerStatistics.value,
							tsLastUpdate = playerStatistics.tsLastUpdate;
					}

					// Tracks whether r ID should be used.
					let userId = gamePlayer.getUserId();

					backupData.results.push({
						position: i,
						userId: userId,
						value: value,
						tsLastUpdate: tsLastUpdate,
					});

					if (playerStatistics != null) {
						// Stores the amount value used in the current execution flow.
						let amount = value - playerStatisticsSettingsItem.initialValue;

						logRequests.push({
							userId: userId,
							amount: -amount,
							startValue: value,
							finalValue: playerStatisticsSettingsItem.initialValue,
							key: key,
							log: log,
							tsCreate: currentMilliseconds,
						});
					}
				}

				// Stores the unset value used in the current execution flow.
				let $unset = {} as any;
				$unset["playerStatistics." + key] = null;

				await gamePlayerCollection.updateMany({}, {
					$unset: $unset
				});

				await backupStatisticsLeaderboardCollection.insertOne(backupData);

				this.gnServer.getDatabase().insertGamePlayerStatisticsLogsAsync(logRequests, gameId);

				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + gamePlayerCollection.collectionName + " success");
			}
			else if (type == OwnerType.CharacterPlayer) {
				// Stores the backup statistics leaderboard collection value used in the current execution flow.
				let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);

				// Tracks whether this version exists.
				let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
				if (hasThisVersion) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VersionInvalid);
					return operationResponse;
				}

				// Stores the resolved character player settings instance for the current execution flow.
				let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);
				// Stores the player statistics settings item value used in the current execution flow.
				let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);

				if (playerStatisticsSettingsItem == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
					return operationResponse;
				}

				// Stores the character player find options value used in the current execution flow.
				let characterPlayerFindOptions: CharacterPlayerFindOptions = {
					characterId: true,
					playerStatistics: true,
				}

				// Stores the statistics aggregation method value used in the current execution flow.
				let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
				// Stores the direction value used in the current execution flow.
				let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

				// Stores the character player collection value used in the current execution flow.
				let characterPlayerCollection = await this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + characterPlayerCollection.collectionName + " starting");

				// Stores the character players value used in the current execution flow.
				let characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersLeaderboardWithStatisticsAllAsync(key, request.catalogId, gameId, direction, characterPlayerFindOptions);

				// Stores the backup data value used in the current execution flow.
				let backupData: {
					// Stores the key value used by this contract.
					key: string,
					// Stores the version value used by this contract.
					version: string,
					// Stores the log value used by this contract.
					log: string,
					// Stores the timestamp create value used by this contract.
					tsCreate: number,
					// Stores the results list used by this contract.
					results: {
						// Stores the position value used by this contract.
						position: number,
						// Stores the character ID value used by this contract.
						characterId: string,
						// Stores the value value used by this contract.
						value: number,
						// Stores the timestamp last update value used by this contract.
						tsLastUpdate: number,
					}[]
				} = {
					key: key,
					version: version,
					log: log,
					tsCreate: currentMilliseconds,
					results: []
				};

				// Stores the log requests value used in the current execution flow.
				let logRequests: { characterId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

				for (let i = 0; i < characterPlayers.length; i++) {
					// Stores the character player value used in the current execution flow.
					let characterPlayer = characterPlayers[i];

					// Stores the player statistics value used in the current execution flow.
					let playerStatistics = characterPlayer.getPlayerStatistics(key);

					// Stores the value value used in the current execution flow.
					let value = playerStatisticsSettingsItem.initialValue;
					// Stores the timestamp last update value used in the current execution flow.
					let tsLastUpdate = currentMilliseconds;

					if (playerStatistics != null) {
						value = playerStatistics.value,
							tsLastUpdate = playerStatistics.tsLastUpdate;
					}

					// Stores the character ID value used in the current execution flow.
					let characterId = characterPlayer.getCharacterId();

					backupData.results.push({
						position: i,
						characterId: characterId,
						value: value,
						tsLastUpdate: tsLastUpdate,
					});

					if (playerStatistics != null) {
						// Stores the amount value used in the current execution flow.
						let amount = value - playerStatisticsSettingsItem.initialValue;

						logRequests.push({
							characterId: characterId,
							amount: -amount,
							startValue: value,
							finalValue: playerStatisticsSettingsItem.initialValue,
							key: key,
							log: log,
							tsCreate: currentMilliseconds,
						});
					}
				}

				// Stores the unset value used in the current execution flow.
				let $unset = {} as any;
				$unset["playerStatistics." + key] = null;

				let $filter = {} as any;
				if (request.catalogId) {
					$filter["catalogId"] = request.catalogId;
				}

				await characterPlayerCollection.updateMany($filter, {
					$unset: $unset
				});

				await backupStatisticsLeaderboardCollection.insertOne(backupData);

				this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogsAsync(logRequests, gameId);

				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + characterPlayerCollection.collectionName + " success");
			}
			else if (type == OwnerType.Group) {
				// Stores the backup statistics leaderboard collection value used in the current execution flow.
				let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);

				// Tracks whether this version exists.
				let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
				if (hasThisVersion) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VersionInvalid);
					return operationResponse;
				}

				// Stores the resolved group settings instance for the current execution flow.
				let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);
				// Stores the group statistics settings item value used in the current execution flow.
				let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == key);

				if (groupStatisticsSettingsItem == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
					return operationResponse;
				}

				// Stores the group find options value used in the current execution flow.
				let groupFindOptions: GroupFindOptions = {
					groupId: true,
					groupStatistics: true,
				}

				// Stores the statistics aggregation method value used in the current execution flow.
				let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;
				// Stores the direction value used in the current execution flow.
				let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

				// Stores the group collection value used in the current execution flow.
				let groupCollection = await this.gnServer.getDatabase().systemGameCollection("Group", gameId);
				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + groupCollection.collectionName + " starting");

				// Stores the groups value used in the current execution flow.
				let groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAllAsync(key, request.catalogId, gameId, direction, groupFindOptions);

				// Stores the backup data value used in the current execution flow.
				let backupData: {
					// Stores the key value used by this contract.
					key: string,
					// Stores the version value used by this contract.
					version: string,
					// Stores the log value used by this contract.
					log: string,
					// Stores the timestamp create value used by this contract.
					tsCreate: number,
					// Stores the results list used by this contract.
					results: {
						// Stores the position value used by this contract.
						position: number,
						// Stores the group ID value used by this contract.
						groupId: string,
						// Stores the value value used by this contract.
						value: number,
						// Stores the timestamp last update value used by this contract.
						tsLastUpdate: number,
					}[]
				} = {
					key: key,
					version: version,
					log: log,
					tsCreate: currentMilliseconds,
					results: []
				};

				// Stores the log requests value used in the current execution flow.
				let logRequests: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

				for (let i = 0; i < groups.length; i++) {
					// Stores the group value used in the current execution flow.
					let group = groups[i];

					// Stores the group statistics value used in the current execution flow.
					let groupStatistics = group.getGroupStatistics(key);

					// Stores the value value used in the current execution flow.
					let value = groupStatisticsSettingsItem.initialValue;
					// Stores the timestamp last update value used in the current execution flow.
					let tsLastUpdate = currentMilliseconds;

					if (groupStatistics != null) {
						value = groupStatistics.value,
							tsLastUpdate = groupStatistics.tsLastUpdate;
					}

					// Stores the group ID value used in the current execution flow.
					let groupId = group.getGroupId();

					backupData.results.push({
						position: i,
						groupId: groupId,
						value: value,
						tsLastUpdate: tsLastUpdate,
					});

					if (groupStatistics != null) {
						// Stores the amount value used in the current execution flow.
						let amount = value - groupStatisticsSettingsItem.initialValue;

						logRequests.push({
							groupId: groupId,
							amount: -amount,
							startValue: value,
							finalValue: groupStatisticsSettingsItem.initialValue,
							key: key,
							log: log,
							tsCreate: currentMilliseconds,
						});
					}
				}

				// Stores the unset value used in the current execution flow.
				let $unset = {} as any;
				$unset["groupStatistics." + key] = null;

				let $filter = {} as any;
				if (request.catalogId) {
					$filter["catalogId"] = request.catalogId;
				}

				await groupCollection.updateMany($filter, {
					$unset: $unset
				});

				await backupStatisticsLeaderboardCollection.insertOne(backupData);

				this.gnServer.getDatabase().insertGroupStatisticsLogsAsync(logRequests, gameId);

				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + groupCollection.collectionName + " success");
			}
			else if (type == OwnerType.Inventory) {
				// Stores the backup statistics leaderboard collection value used in the current execution flow.
				let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);

				// Stores the resolved inventory settings instance for the current execution flow.
				let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);
				// Stores the item statistics settings item value used in the current execution flow.
				let itemStatisticsSettingsItem = inventorySettings.itemStatisticsSettings.find(x => x.key == key);

				if (itemStatisticsSettingsItem == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
					return operationResponse;
				}

				// Stores the inventory find options value used in the current execution flow.
				let inventoryFindOptions: InventoryFindOptions = {
					itemId: true,
					itemStatistics: true,
				}

				// Stores the statistics aggregation method value used in the current execution flow.
				let statisticsAggregationMethod = <xStatisticsAggregationMethod>itemStatisticsSettingsItem.statisticsAggregationMethod;
				// Stores the direction value used in the current execution flow.
				let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

				// Stores the inventory collection value used in the current execution flow.
				let inventoryCollection = await this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + inventoryCollection.collectionName + " starting");

				// Stores the inventories value used in the current execution flow.
				let inventories = await this.gnServer.getDatabase().loadInventoriesLeaderboardWithStatisticsAllAsync(key, request.catalogId, gameId, direction, inventoryFindOptions);

				// Stores the backup data value used in the current execution flow.
				let backupData: {
					// Stores the key value used by this contract.
					key: string,
					// Stores the version value used by this contract.
					version: string,
					// Stores the log value used by this contract.
					log: string,
					// Stores the timestamp create value used by this contract.
					tsCreate: number,
					// Stores the results list used by this contract.
					results: {
						// Stores the position value used by this contract.
						position: number,
						// Stores the item ID value used by this contract.
						itemId: string,
						// Stores the value value used by this contract.
						value: number,
						// Stores the timestamp last update value used by this contract.
						tsLastUpdate: number,
					}[]
				} = {
					key: key,
					version: version,
					log: log,
					tsCreate: currentMilliseconds,
					results: []
				};

				// Stores the log requests value used in the current execution flow.
				let logRequests: { itemId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

				for (let i = 0; i < inventories.length; i++) {
					// Stores the inventory value used in the current execution flow.
					let inventory = inventories[i];

					// Stores the item statistics value used in the current execution flow.
					let itemStatistics = inventory.getItemStatistics(key);

					// Stores the value value used in the current execution flow.
					let value = itemStatisticsSettingsItem.initialValue;
					// Stores the timestamp last update value used in the current execution flow.
					let tsLastUpdate = currentMilliseconds;

					if (itemStatistics != null) {
						value = itemStatistics.value,
							tsLastUpdate = itemStatistics.tsLastUpdate;
					}

					// Stores the item ID value used in the current execution flow.
					let itemId = inventory.getItemId();

					backupData.results.push({
						position: i,
						itemId: itemId,
						value: value,
						tsLastUpdate: tsLastUpdate,
					});

					if (itemStatistics != null) {
						// Stores the amount value used in the current execution flow.
						let amount = value - itemStatisticsSettingsItem.initialValue;

						logRequests.push({
							itemId: itemId,
							amount: -amount,
							startValue: value,
							finalValue: itemStatisticsSettingsItem.initialValue,
							key: key,
							log: log,
							tsCreate: currentMilliseconds,
						});
					}
				}

				// Stores the unset value used in the current execution flow.
				let $unset = {} as any;
				$unset["itemStatistics." + key] = null;

				let $filter = {} as any;
				if (request.catalogId) {
					$filter["catalogId"] = request.catalogId;
				}

				await inventoryCollection.updateMany($filter, {
					$unset: $unset
				});

				await backupStatisticsLeaderboardCollection.insertOne(backupData);

				this.gnServer.getDatabase().insertInventoryStatisticsLogsAsync(logRequests, gameId);

				Debug.log("[GearN] ResetStatisticsLeaderboard for key " + key + " at " + inventoryCollection.collectionName + " success");
			}
			else {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerTypeNotSupport);
				return operationResponse;
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_ResetStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
