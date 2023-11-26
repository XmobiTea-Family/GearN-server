import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNHashtableDataMember, StringDataMember } from "./../../../../../GN-common/entity/DataMember";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { CloudScriptService } from "../../../../service/CloudScriptService";
import { xConfig } from "../../../../../GN-library/xconfig/lib/xConfig";
import { Debug } from "../../../../../GN-library/xdebug/lib/xDebug";
import { GNServerSettingsOptions, LogType } from "@xmobitea/gn-typescript-client";

class GrantGameOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
    gameId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GrantGameRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.GrantGame;
    }

    public override getCommonOperationRequest() {
        return GrantGameOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(operationRequest);
        }

        if (!secretInfo.getPermission().masterAdmin.grantGame.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            gameId: request.gameId,
            creatorId: authInfo.getUserId(),
        }, secretInfo, operationRequest);
    }

    private async execute(request: { gameId: string, creatorId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GrantGame", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let gameId = request.gameId;

        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");
        let result = await collection.findOne({ type: "gameSettings", gameId: gameId });

        if (result != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GameIsExists);
            return operationResponse;
        }

        result = {
            type: "gameSettings",
            gameId: gameId,
            gameName: "",
            gameDescription: "",
            gameIconUrl: "",
            gameSettings: {
                gamePlayerSettings: {
                    customDatasSettings: [],
                    playerCurrencySettings: [],
                    playerDatasSettings: [],
                    playerFriendCatalogSettings: [],
                    playerGroupCatalogSettings: [],
                    playerItemCatalogSettings: [],
                    playerStatisticsSettings: [],
                    tagsSettings: [],
                    playerCharacterCatalogSettings: [],
                },
                characterPlayerSettings: {
                    customDatasSettings: [],
                    playerCurrencySettings: [],
                    playerDatasSettings: [],
                    playerFriendCatalogSettings: [],
                    playerGroupCatalogSettings: [],
                    playerItemCatalogSettings: [],
                    playerStatisticsSettings: [],
                    tagsSettings: [],
                },
                groupSettings: {
                    customDatasSettings: [],
                    groupCurrencySettings: [],
                    groupDatasSettings: [],
                    groupItemCatalogSettings: [],
                    groupStatisticsSettings: [],
                    tagsSettings: [],
                },
                inventorySettings: {
                    customDatasSettings: [],
                    inventoryDatasSettings: [],
                    inventoryStatisticsSettings: [],
                    tagsSettings: []
                },
            },
            matchmakingQueueSettings: [],
            tsCreate: xDatetime.getCurrentMilliseconds(),
            creatorId: request.creatorId,
        } as any;

        collection.insertOne(result);

        {
            let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);

            await gamePlayerCollection.createIndex({ "userId": 1 }, { background: true, name: "userId_1" });
            await gamePlayerCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
            await gamePlayerCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".GamePlayer.CurrencyLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.CurrencyLog", gameId);
            await currencyLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await currencyLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".GamePlayer.StatisticsLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsLog", gameId);
            await statisticsLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await statisticsLogCollection.createIndex({ "userId": 1, "key": 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
        }

        {
            let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
            await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
        }

        {
            let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);

            await characterPlayerCollection.createIndex({ "characterId": 1 }, { background: true, name: "characterId_1" });
            await characterPlayerCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
            await characterPlayerCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CharacterPlayer.CurrencyLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
            await currencyLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await currencyLogCollection.createIndex({ "characterId": 1, "key": 1, "_id": -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CharacterPlayer.StatisticsLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
            await statisticsLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await statisticsLogCollection.createIndex({ "characterId": 1, "key": 1, "_id": -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
        }

        {
            let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
            await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
        }

        {
            let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);

            await groupCollection.createIndex({ "groupId": 1 }, { background: true, name: "groupId_1" });
            await groupCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
            await groupCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.CurrencyLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let currencyLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.CurrencyLog", gameId);
            await currencyLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await currencyLogCollection.createIndex({ "groupId": 1, "key": 1, "_id": -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.StatisticsLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsLog", gameId);
            await statisticsLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await statisticsLogCollection.createIndex({ "groupId": 1, "key": 1, "_id": -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
        }

        {
            let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
            await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.Message", {
                capped: true,
                size: 51200000000,
                max: 100000000
            });

            let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);
            await groupMessageCollection.createIndex({ "groupId": 1, "_id": -1 }, { background: true, name: "groupId_1_id_-1" });
        }

        {
            let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);

            await inventoryCollection.createIndex({ "itemId": 1 }, { background: true, name: "itemId_1" });
            await inventoryCollection.createIndex({ "segments": 1 }, { background: true, name: "segments_1" });
            await inventoryCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Inventory.StatisticsLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let statisticsLogCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsLog", gameId);
            await statisticsLogCollection.createIndex({ "key": 1, "_id": -1 }, { background: true, name: "key_1_id_-1" });
            await statisticsLogCollection.createIndex({ "itemId": 1, "key": 1, "_id": -1 }, { background: true, name: "itemId_1_key_1_id_-1" });
        }

        {
            let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
            await backupStatisticsLeaderboardCollection.createIndex({ "key": 1, "version": 1 }, { background: true, name: "key_1_version_1" });
        }

        {
            let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);

            await storeInventoryCollection.createIndex({ "storeId": 1 }, { background: true, name: "storeId_1" });
            await storeInventoryCollection.createIndex({ "displayNameNormalize": 1 }, { background: true, name: "displayNameNormalize_1" });
            await storeInventoryCollection.createIndex({ "tags": 1 }, { background: true, sparse: true, name: "tags_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".StoreInventory.StoreLog", {
                capped: true,
                size: 5120000000,
                max: 100000000
            });

            let storeInventoryLogCollection = this.gnServer.getDatabase().runtimeGameCollection("StoreInventory.StoreLog", gameId);
            await storeInventoryLogCollection.createIndex({ "storeId": 1, "id": 1, "storeReceiveType": -1, "_id": -1 }, { background: true, name: "storeId_1_id_1_storeReceiveType_-1_id_-1" });
            await storeInventoryLogCollection.createIndex({ "id": 1, "storeReceiveType": -1, "_id": -1 }, { background: true, name: "id_1_storeReceiveType_-1_id_-1" });
            await storeInventoryLogCollection.createIndex({ "storeReceiveType": -1, "_id": -1 }, { background: true, name: "storeReceiveType_-1_id_-1" });
        }

        {
            let receiptIAPCollection = this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", gameId);
            receiptIAPCollection.createIndex({ "payloadMd5": 1 }, { background: true, name: "payloadMd5_1" });
            receiptIAPCollection.createIndex({ "transactionId": 1 }, { background: true, name: "transactionId_1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".MatchmakingTicket", {
                capped: true,
                size: 5120000,
                max: 100000
            });

            let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);

            await matchmakingTicketCollection.createIndex({ "userIds": 1, "queueName": 1, "status": -1 }, { background: true, name: "userIds_1_queueName_1_status_-1" });
            await matchmakingTicketCollection.createIndex({ "queueName": 1, "status": -1, "tsCreate": -1 }, { background: true, name: "queueName_1_status_-1_tsCreate_-1" });
            await matchmakingTicketCollection.createIndex({ "ticketId": 1 }, { background: true, name: "ticketId_1" });
            await matchmakingTicketCollection.createIndex({ "status": -1, "_id": -1 }, { background: true, name: "status_-1_id_-1" });
        }

        {
            await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".CloudScript.Log", {
                capped: true,
                size: 5120000,
                max: 100000
            });

            let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CloudScript.Log", gameId);
            await cloudScriptFunctionLogCollection.createIndex({ "tsCreate": -1 }, { background: true, name: "tsCreate-1" });
        }

        {
            let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);

            await matchCollection.createIndex({ "matchId": 1 }, { background: true, name: "matchId_1" });
            await matchCollection.createIndex({ "queueName": 1, "tsCreate": -1 }, { background: true, name: "queueName_1_tsCreate_-1" });
            await matchCollection.createIndex({ "status": -1, "tsCreate": -1 }, { background: true, name: "status_-1_tsCreate_-1" });
        }

        {
            let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
            await configCollection.createIndex({ "configName": 1, "label": 1 }, { background: true, unique: true, name: "configName_1_label_1" });
        }

        let gameIds = this.gnServer.getGameIds();
        if (!gameIds.includes(gameId)) gameIds.push(gameId);

        {
            let oldCloudScriptService = this.gnServer.getCloudScriptService("main");
            if (oldCloudScriptService != null) {
                let cloudScriptService = new CloudScriptService();

                let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemGameCollection("CloudScript.Function", gameId);
                let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().runtimeGameCollection("CloudScript.Log", gameId);

                cloudScriptService.setCloudScriptFunctionCollection(cloudScriptFunctionCollection);
                cloudScriptService.setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection);

                this.gnServer.setCloudScriptService(gameId, cloudScriptService);

                {
                    let gnServerSettingsOptions: GNServerSettingsOptions = (oldCloudScriptService as any).gnServerSettingsOptions;
                    let dbConnection = (oldCloudScriptService as any).dbConnection;

                    cloudScriptService.init(gameId, gnServerSettingsOptions, {
                        dbName: dbConnection.dbName,
                        url: dbConnection.url,
                        options: dbConnection.options,
                    }, this.gnServer);
                    cloudScriptService.run();
                }
            }
        }

        {
            let xConfigGame = new xConfig();

            let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
            xConfigGame.setConfigCollection(gameId, configCollection);

            this.gnServer.setConfigGame(gameId, xConfigGame);
            xConfigGame.run(() => {
                Debug.log("[GN] Config Game sync success for gameId " + gameId);
            });
        }

        operationResponse.setParameter(GNParameterCode.GameId, gameId);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GrantGame", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
