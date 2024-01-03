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

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { OwnerType } from "../../../../../GN-common/constant/enumType/OwnerType";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "../../../../../GN-library/xdebug/lib/xDebug";
import { GamePlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { CharacterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { GroupFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { InventoryFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";

class ResetStatisticsLeaderboardOperationRequest extends OperationRequest {
    @NumberDataMember({ code: GNParameterCode.OwnerType, mustInt: true })
    type: number;

    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32 })
    key: string;

    @StringDataMember({ code: GNParameterCode.Version, minLength: 2, maxLength: 32 })
    version: string;

    @StringDataMember({ code: GNParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
    gameId: string;

    @StringDataMember({ code: GNParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    log?: string;

	@StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	catalogId?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class ResetStatisticsLeaderboardRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.ResetStatisticsLeaderboard;
    }

    public override getCommonOperationRequest() {
        return ResetStatisticsLeaderboardOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(operationRequest);
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

    private async execute(request: { type: number, key: string, version: string, gameId: string, log: string, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_ResetStatisticsLeaderboard", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let type = request.type;
        let key = request.key;
        let version = request.version;

        let log = request.log;

        if (type == OwnerType.MasterPlayer) {
            let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");

            let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
            if (hasThisVersion) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.VersionInvalid);
                return operationResponse;
            }

            let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

            let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);

            if (playerStatisticsSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);
                return operationResponse;
            }

            let masterPlayerFindOptions: MasterPlayerFindOptions = {
                userId: true,
                playerStatistics: true,
            }

            let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
            let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

            let masterPlayerCollection = await this.gnServer.getDatabase().systemCollection("MasterPlayer");
            Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + masterPlayerCollection.collectionName + " starting");

            let masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithStatisticsAllAsync(key, direction, masterPlayerFindOptions);

            let backupData: {
                key: string,
                version: string,
                log: string,
                tsCreate: number,
                results: {
                    position: number,
                    userId: string,
                    value: number,
                    tsLastUpdate: number,
                }[]
            } = {
                key: key,
                version: version,
                log: log,
                tsCreate: currentMilliseconds,
                results: []
            };

            let logRequests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

            for (let i = 0; i < masterPlayers.length; i++) {
                let masterPlayer = masterPlayers[i];

                let playerStatistics = masterPlayer.getPlayerStatistics(key);

                let value = playerStatisticsSettingsItem.initialValue;
                let tsLastUpdate = currentMilliseconds;

                if (playerStatistics != null) {
                    value = playerStatistics.value,
                        tsLastUpdate = playerStatistics.tsLastUpdate;
                }

                let userId = masterPlayer.getUserId();

                backupData.results.push({
                    position: i,
                    userId: userId,
                    value: value,
                    tsLastUpdate: tsLastUpdate,
                });

                if (playerStatistics != null) {
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

            let $unset = {} as any;
            $unset["playerStatistics." + key] = null;

            await masterPlayerCollection.updateMany({}, {
                $unset: $unset
            });

            await backupStatisticsLeaderboardCollection.insertOne(backupData);

            this.gnServer.getDatabase().insertMasterPlayerStatisticsLogsAsync(logRequests);

            Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + masterPlayerCollection.collectionName + " success");
        }
        else {
            let gameId = request.gameId;

            if (type == OwnerType.GamePlayer) {
                let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);

                let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
                if (hasThisVersion) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.VersionInvalid);
                    return operationResponse;
                }

                let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);
                let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings.find(x => x.key == key);

                if (playerStatisticsSettingsItem == null) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);
                    return operationResponse;
                }

                let gamePlayerFindOptions: GamePlayerFindOptions = {
                    userId: true,
                    playerStatistics: true,
                }

                let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
                let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

                let gamePlayerCollection = await this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + gamePlayerCollection.collectionName + " starting");

                let gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithStatisticsAllAsync(key, gameId, direction, gamePlayerFindOptions);

                let backupData: {
                    key: string,
                    version: string,
                    log: string,
                    tsCreate: number,
                    results: {
                        position: number,
                        userId: string,
                        value: number,
                        tsLastUpdate: number,
                    }[]
                } = {
                    key: key,
                    version: version,
                    log: log,
                    tsCreate: currentMilliseconds,
                    results: []
                };

                let logRequests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

                for (let i = 0; i < gamePlayers.length; i++) {
                    let gamePlayer = gamePlayers[i];

                    let playerStatistics = gamePlayer.getPlayerStatistics(key);

                    let value = playerStatisticsSettingsItem.initialValue;
                    let tsLastUpdate = currentMilliseconds;

                    if (playerStatistics != null) {
                        value = playerStatistics.value,
                            tsLastUpdate = playerStatistics.tsLastUpdate;
                    }

                    let userId = gamePlayer.getUserId();

                    backupData.results.push({
                        position: i,
                        userId: userId,
                        value: value,
                        tsLastUpdate: tsLastUpdate,
                    });

                    if (playerStatistics != null) {
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

                let $unset = {} as any;
                $unset["playerStatistics." + key] = null;

                await gamePlayerCollection.updateMany({}, {
                    $unset: $unset
                });

                await backupStatisticsLeaderboardCollection.insertOne(backupData);

                this.gnServer.getDatabase().insertGamePlayerStatisticsLogsAsync(logRequests, gameId);

                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + gamePlayerCollection.collectionName + " success");
            }
            else if (type == OwnerType.CharacterPlayer) {
                let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);

                let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
                if (hasThisVersion) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.VersionInvalid);
                    return operationResponse;
                }

                let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);
                let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);

                if (playerStatisticsSettingsItem == null) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);
                    return operationResponse;
                }

                let characterPlayerFindOptions: CharacterPlayerFindOptions = {
                    characterId: true,
                    playerStatistics: true,
                }

                let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
                let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

                let characterPlayerCollection = await this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + characterPlayerCollection.collectionName + " starting");

                let characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersLeaderboardWithStatisticsAllAsync(key, request.catalogId, gameId, direction, characterPlayerFindOptions);

                let backupData: {
                    key: string,
                    version: string,
                    log: string,
                    tsCreate: number,
                    results: {
                        position: number,
                        characterId: string,
                        value: number,
                        tsLastUpdate: number,
                    }[]
                } = {
                    key: key,
                    version: version,
                    log: log,
                    tsCreate: currentMilliseconds,
                    results: []
                };

                let logRequests: { characterId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

                for (let i = 0; i < characterPlayers.length; i++) {
                    let characterPlayer = characterPlayers[i];

                    let playerStatistics = characterPlayer.getPlayerStatistics(key);

                    let value = playerStatisticsSettingsItem.initialValue;
                    let tsLastUpdate = currentMilliseconds;

                    if (playerStatistics != null) {
                        value = playerStatistics.value,
                            tsLastUpdate = playerStatistics.tsLastUpdate;
                    }

                    let characterId = characterPlayer.getCharacterId();

                    backupData.results.push({
                        position: i,
                        characterId: characterId,
                        value: value,
                        tsLastUpdate: tsLastUpdate,
                    });

                    if (playerStatistics != null) {
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

                let $unset = {} as any;
                $unset["playerStatistics." + key] = null;

                await characterPlayerCollection.updateMany({}, {
                    $unset: $unset
                });

                await backupStatisticsLeaderboardCollection.insertOne(backupData);

                this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogsAsync(logRequests, gameId);

                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + characterPlayerCollection.collectionName + " success");
            }
            else if (type == OwnerType.Group) {
                let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);

                let hasThisVersion = (await backupStatisticsLeaderboardCollection.countDocuments({ key: key, version: version })) != 0;
                if (hasThisVersion) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.VersionInvalid);
                    return operationResponse;
                }

                let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);
                let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == key);

                if (groupStatisticsSettingsItem == null) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);
                    return operationResponse;
                }

                let groupFindOptions: GroupFindOptions = {
                    groupId: true,
                    groupStatistics: true,
                }

                let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;
                let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

                let groupCollection = await this.gnServer.getDatabase().systemGameCollection("Group", gameId);
                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + groupCollection.collectionName + " starting");

                let groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAllAsync(key, request.catalogId, gameId, direction, groupFindOptions);

                let backupData: {
                    key: string,
                    version: string,
                    log: string,
                    tsCreate: number,
                    results: {
                        position: number,
                        groupId: string,
                        value: number,
                        tsLastUpdate: number,
                    }[]
                } = {
                    key: key,
                    version: version,
                    log: log,
                    tsCreate: currentMilliseconds,
                    results: []
                };

                let logRequests: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

                for (let i = 0; i < groups.length; i++) {
                    let group = groups[i];

                    let groupStatistics = group.getGroupStatistics(key);

                    let value = groupStatisticsSettingsItem.initialValue;
                    let tsLastUpdate = currentMilliseconds;

                    if (groupStatistics != null) {
                        value = groupStatistics.value,
                            tsLastUpdate = groupStatistics.tsLastUpdate;
                    }

                    let groupId = group.getGroupId();

                    backupData.results.push({
                        position: i,
                        groupId: groupId,
                        value: value,
                        tsLastUpdate: tsLastUpdate,
                    });

                    if (groupStatistics != null) {
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

                let $unset = {} as any;
                $unset["groupStatistics." + key] = null;

                await groupCollection.updateMany({}, {
                    $unset: $unset
                });

                await backupStatisticsLeaderboardCollection.insertOne(backupData);

                this.gnServer.getDatabase().insertGroupStatisticsLogsAsync(logRequests, gameId);

                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + groupCollection.collectionName + " success");
            }
            else if (type == OwnerType.Inventory) {
                let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);

                let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);
                let inventoryStatisticsSettingsItem = inventorySettings.inventoryStatisticsSettings.find(x => x.key == key);

                if (inventoryStatisticsSettingsItem == null) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);
                    return operationResponse;
                }

                let inventoryFindOptions: InventoryFindOptions = {
                    itemId: true,
                    itemStatistics: true,
                }

                let statisticsAggregationMethod = <xStatisticsAggregationMethod>inventoryStatisticsSettingsItem.statisticsAggregationMethod;
                let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

                let inventoryCollection = await this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + inventoryCollection.collectionName + " starting");

                let inventories = await this.gnServer.getDatabase().loadInventoriesLeaderboardWithStatisticsAllAsync(key, request.catalogId, gameId, direction, inventoryFindOptions);

                let backupData: {
                    key: string,
                    version: string,
                    log: string,
                    tsCreate: number,
                    results: {
                        position: number,
                        itemId: string,
                        value: number,
                        tsLastUpdate: number,
                    }[]
                } = {
                    key: key,
                    version: version,
                    log: log,
                    tsCreate: currentMilliseconds,
                    results: []
                };

                let logRequests: { itemId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

                for (let i = 0; i < inventories.length; i++) {
                    let inventory = inventories[i];

                    let itemStatistics = inventory.getItemStatistics(key);

                    let value = inventoryStatisticsSettingsItem.initialValue;
                    let tsLastUpdate = currentMilliseconds;

                    if (itemStatistics != null) {
                        value = itemStatistics.value,
                            tsLastUpdate = itemStatistics.tsLastUpdate;
                    }

                    let itemId = inventory.getItemId();

                    backupData.results.push({
                        position: i,
                        itemId: itemId,
                        value: value,
                        tsLastUpdate: tsLastUpdate,
                    });

                    if (itemStatistics != null) {
                        let amount = value - inventoryStatisticsSettingsItem.initialValue;

                        logRequests.push({
                            itemId: itemId,
                            amount: -amount,
                            startValue: value,
                            finalValue: inventoryStatisticsSettingsItem.initialValue,
                            key: key,
                            log: log,
                            tsCreate: currentMilliseconds,
                        });
                    }
                }

                let $unset = {} as any;
                $unset["itemStatistics." + key] = null;

                await inventoryCollection.updateMany({}, {
                    $unset: $unset
                });

                await backupStatisticsLeaderboardCollection.insertOne(backupData);

                this.gnServer.getDatabase().insertInventoryStatisticsLogsAsync(logRequests, gameId);

                Debug.log("[GN] ResetStatisticsLeaderboard for key " + key + " at " + inventoryCollection.collectionName + " success");
            }
            else {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.OwnerTypeNotSupport);
                return operationResponse;
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_ResetStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
