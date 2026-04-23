import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { GNHashtableDataMember, StringDataMember } from "./../../../../../GN-common/entity/DataMember";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { CloudScriptService } from "./../../../../service/CloudScriptService";
import { CacheService, ICacheServiceController, MemoryCacheServiceController, MongoDbCacheServiceController } from "./../../../../service/CacheService";
import { GNServerSettingsOptions, LogType } from "@xmobitea/gn-typescript-client";
import { ConfigService } from "./../../../../service/ConfigService";

class CreateGameOperationRequest extends OperationRequest {

	// Stores the game ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateGameRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.CreateGame;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return CreateGameOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.createGame.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			gameId: request.gameId,
			creatorId: authInfo.getUserId(),
		}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { gameId: string, creatorId: string, }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_CreateGame", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the game ID value used in the current execution flow.
		let gameId = request.gameId;

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");
		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "gameSettings", gameId: gameId });

		if (result != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameIsExists);
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
					playerCurrenciesSettings: [],
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
					playerCurrenciesSettings: [],
					playerDatasSettings: [],
					playerFriendCatalogSettings: [],
					playerGroupCatalogSettings: [],
					playerItemCatalogSettings: [],
					playerStatisticsSettings: [],
					tagsSettings: [],
				},
				groupSettings: {
					customDatasSettings: [],
					groupCurrenciesSettings: [],
					groupDatasSettings: [],
					groupItemCatalogSettings: [],
					groupStatisticsSettings: [],
					tagsSettings: [],
				},
				inventorySettings: {
					customDatasSettings: [],
					itemDatasSettings: [],
					itemStatisticsSettings: [],
					tagsSettings: []
				},
			},
			matchmakingQueueSettings: [],
			tsCreate: xDatetime.getCurrentMilliseconds(),
			creatorId: request.creatorId,
		} as any;

		await collection.insertOne(result);

		{
			// Stores the game player collection value used in the current execution flow.
			let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);

			await gamePlayerCollection.createIndex({ userId: 1 }, { background: true, name: "userId_1" });
			await gamePlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
			await gamePlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
			await gamePlayerCollection.createIndex({ tsLastLogin: -1 }, { background: true, name: "tsLastLogin_-1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".GamePlayer.CurrencyLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);
			await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await currencyLogCollection.createIndex({ userId: 1, key: 1, "_id": -1 }, { background: true, name: "userId_1_key_1_id_-1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".GamePlayer.StatisticsLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);
			await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await statisticsLogCollection.createIndex({ userId: 1, key: 1, _id: -1 }, { background: true, name: "userId_1_key_1_id_-1" });
		}

		{
			// Stores the backup statistics leaderboard collection value used in the current execution flow.
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
			await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
		}

		{
			// Stores the character player collection value used in the current execution flow.
			let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);

			await characterPlayerCollection.createIndex({ characterId: 1 }, { background: true, name: "characterId_1" });
			await characterPlayerCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
			await characterPlayerCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CharacterPlayer.CurrencyLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
			await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await currencyLogCollection.createIndex({ characterId: 1, key: 1, _id: -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CharacterPlayer.StatisticsLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
			await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await statisticsLogCollection.createIndex({ characterId: 1, key: 1, _id: -1 }, { background: true, name: "characterId_1_key_1_id_-1" });
		}

		{
			// Stores the backup statistics leaderboard collection value used in the current execution flow.
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
			await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
		}

		{
			// Stores the group collection value used in the current execution flow.
			let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);

			await groupCollection.createIndex({ groupId: 1 }, { background: true, name: "groupId_1" });
			await groupCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
			await groupCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Group.CurrencyLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId);
			await currencyLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await currencyLogCollection.createIndex({ groupId: 1, key: 1, _id: -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Group.StatisticsLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId);
			await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await statisticsLogCollection.createIndex({ groupId: 1, key: 1, _id: -1 }, { background: true, name: "groupId_1_key_1_id_-1" });
		}

		{
			// Stores the backup statistics leaderboard collection value used in the current execution flow.
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
			await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
		}

		{
			await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".Group.Message", {
				capped: true,
				size: 51200000000,
				max: 100000000
			});

			// Stores the group message collection value used in the current execution flow.
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);
			await groupMessageCollection.createIndex({ groupId: 1, _id: -1 }, { background: true, name: "groupId_1_id_-1" });
		}

		{
			// Stores the inventory collection value used in the current execution flow.
			let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);

			await inventoryCollection.createIndex({ itemId: 1 }, { background: true, name: "itemId_1" });
			await inventoryCollection.createIndex({ segments: 1 }, { background: true, name: "segments_1" });
			await inventoryCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".Inventory.StatisticsLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId);
			await statisticsLogCollection.createIndex({ key: 1, _id: -1 }, { background: true, name: "key_1_id_-1" });
			await statisticsLogCollection.createIndex({ itemId: 1, key: 1, _id: -1 }, { background: true, name: "itemId_1_key_1_id_-1" });
		}

		{
			// Stores the backup statistics leaderboard collection value used in the current execution flow.
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
			await backupStatisticsLeaderboardCollection.createIndex({ key: 1, version: 1 }, { background: true, name: "key_1_version_1" });
		}

		{
			// Stores the store inventory collection value used in the current execution flow.
			let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);

			await storeInventoryCollection.createIndex({ storeId: 1 }, { background: true, name: "storeId_1" });
			await storeInventoryCollection.createIndex({ displayNameNormalize: 1 }, { background: true, name: "displayNameNormalize_1" });
			await storeInventoryCollection.createIndex({ tags: 1 }, { background: true, sparse: true, name: "tags_1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".StoreInventory.StoreLog", {
				capped: true,
				size: 5120000000,
				max: 100000000
			});

			// Stores the store inventory log collection value used in the current execution flow.
			let storeInventoryLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			await storeInventoryLogCollection.createIndex({ storeId: 1, id: 1, storeReceiveType: -1, _id: -1 }, { background: true, name: "storeId_1_id_1_storeReceiveType_-1_id_-1" });
			await storeInventoryLogCollection.createIndex({ id: 1, storeReceiveType: -1, _id: -1 }, { background: true, name: "id_1_storeReceiveType_-1_id_-1" });
			await storeInventoryLogCollection.createIndex({ storeReceiveType: -1, _id: -1 }, { background: true, name: "storeReceiveType_-1_id_-1" });
		}

		{
			// Stores the store inventory used collection value used in the current execution flow.
			let storeInventoryUsedCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory.StoreUsed", gameId);
			await storeInventoryUsedCollection.createIndex({ storeId: 1 }, { background: true, name: "storeId_1" });
		}

		{
			// Stores the receipt IAP collection value used in the current execution flow.
			let receiptIAPCollection = this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", gameId);
			receiptIAPCollection.createIndex({ payloadMd5: 1 }, { background: true, name: "payloadMd5_1" });
			receiptIAPCollection.createIndex({ transactionId: 1 }, { background: true, name: "transactionId_1" });
		}

		{
			await this.gnServer.getDatabase().createCollection("Runtime." + gameId + ".MatchmakingTicket", {
				capped: true,
				size: 5120000,
				max: 100000
			});

			// Stores the matchmaking ticket collection value used in the current execution flow.
			let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);

			await matchmakingTicketCollection.createIndex({ userIds: 1, queueName: 1, status: -1 }, { background: true, name: "userIds_1_queueName_1_status_-1" });
			await matchmakingTicketCollection.createIndex({ queueName: 1, status: -1, tsCreate: -1 }, { background: true, name: "queueName_1_status_-1_tsCreate_-1" });
			await matchmakingTicketCollection.createIndex({ ticketId: 1 }, { background: true, name: "ticketId_1" });
			await matchmakingTicketCollection.createIndex({ status: -1, _id: -1 }, { background: true, name: "status_-1_id_-1" });
		}

		{
			await this.gnServer.getDatabase().logCreateCollection("Runtime." + gameId + ".CloudScript.Log", {
				capped: true,
				size: 5120000,
				max: 100000
			});

			// Stores the cloud script function log collection value used in the current execution flow.
			let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CloudScript.Log", gameId);
			await cloudScriptFunctionLogCollection.createIndex({ tsCreate: -1 }, { background: true, name: "tsCreate-1" });
		}

		{
			// Stores the match collection value used in the current execution flow.
			let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);

			await matchCollection.createIndex({ matchId: 1 }, { background: true, name: "matchId_1" });
			await matchCollection.createIndex({ queueName: 1, tsCreate: -1 }, { background: true, name: "queueName_1_tsCreate_-1" });
			await matchCollection.createIndex({ status: -1, tsCreate: -1 }, { background: true, name: "status_-1_tsCreate_-1" });
		}

		{
			// Stores the configuration collection value used in the current execution flow.
			let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
			await configCollection.createIndex({ configName: 1, label: 1 }, { background: true, unique: true, name: "configName_1_label_1" });
		}

		{
			// Stores the cache collection value used in the current execution flow.
			let cacheCollection = this.gnServer.getDatabase().runtimeGameCollection("Cache", gameId);
			await cacheCollection.createIndex({ key: 1 }, { background: true, name: "key_1" });
		}

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("dashboard_addGameId", { gameId: gameId });

		operationResponse.setParameter(ParameterCode.GameId, gameId);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_CreateGame", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Adds the game ID.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	private addGameId(gameId: string) {
		// Stores the game IDs value used in the current execution flow.
		let gameIds = this.gnServer.getGameIds();
		if (!gameIds.includes(gameId)) gameIds.push(gameId);

		{
			// Stores the old cloud script service value used in the current execution flow.
			let oldCloudScriptService = this.gnServer.getCloudScriptService("live");
			if (oldCloudScriptService != null) {
				// Stores the cloud script service value used in the current execution flow.
				let cloudScriptService = new CloudScriptService();

				// Stores the cloud script function collection value used in the current execution flow.
				let cloudScriptFunctionCollection = this.gnServer.getDatabase().systemGameCollection("CloudScript.Function", gameId);
				// Stores the cloud script function log collection value used in the current execution flow.
				let cloudScriptFunctionLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CloudScript.Log", gameId);

				cloudScriptService.setCloudScriptFunctionCollection(cloudScriptFunctionCollection);
				cloudScriptService.setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection);

				this.gnServer.setCloudScriptService(gameId, cloudScriptService);

				{
					// Stores the GearN server settings options value used in the current execution flow.
					let gnServerSettingsOptions: GNServerSettingsOptions = (oldCloudScriptService as any).gnServerSettingsOptions;
					// Stores the database connection value used in the current execution flow.
					let dbConnection = (oldCloudScriptService as any).dbConnection;

					cloudScriptService.init(gameId, gnServerSettingsOptions, {
						url: dbConnection.url,
						dbName: dbConnection.dbName,
						logUrl: dbConnection.logUrl,
						logDbName: dbConnection.logDbName,
						options: dbConnection.options,
					}, this.gnServer, (oldCloudScriptService as any).executeTimeoutInMs);
					cloudScriptService.run();
				}
			}
		}

		{
			// Stores the configuration service value used in the current execution flow.
			let configService = new ConfigService();

			// Stores the configuration collection value used in the current execution flow.
			let configCollection = this.gnServer.getDatabase().systemGameCollection("Config", gameId);
			configService.setConfigCollection(gameId, configCollection);

			this.gnServer.setConfigGame(gameId, configService);
			configService.run();
		}

		{
			// Tracks whether single node.
			let isSingleNode = this.gnServer.getHttpApp().getClusterHandler().getIsSingleNode();

			// Stores the cache service controller value used in the current execution flow.
			let cacheServiceController: ICacheServiceController;
			if (isSingleNode) cacheServiceController = new MemoryCacheServiceController();
			else cacheServiceController = new MongoDbCacheServiceController(this.gnServer.getDatabase().runtimeGameCollection("Cache", gameId), this.gnServer.getDatabase());

			// Stores the cache service value used in the current execution flow.
			let cacheService = new CacheService(cacheServiceController);
			this.gnServer.setCacheService(gameId, cacheService);
		}

	}

	/**
	 * Executes the init workflow.
	 */
	protected init(): void {
		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		this.gnServer.getHttpApp().getClusterHandler().onEvent("dashboard_addGameId", (data) => {
			// Stores the game ID value used in the current execution flow.
			let gameId = data.gameId as string;

			thiz.addGameId(gameId);
		});
	}
}
