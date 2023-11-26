import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GameItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { StringDataMember } from "./../../../../../GN-common/entity/DataMember";
import { GNArray, GNHashtable, GNHashtableBuilder } from "./../../../../../GN-common/common/GNData";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleExpansionType, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, TeamTicketSizeSimilarityRule } from "./../../../../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";

class GetGameInformationOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	gameId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetGameInformationRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetGameInformation;
	}

	public override getCommonOperationRequest() {
		return GetGameInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getGameInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			gameId: request.gameId
		}, secretInfo, operationRequest);
	}

	private async execute(request: { gameId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetGameInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "gameSettings", "gameId": request.gameId });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GameNotFound);
			return operationResponse;
		}

		let gameItem = new GameItem(result, collection);

		operationResponse.setParameter(GNParameterCode.GameId, gameItem.getGameId());
		operationResponse.setParameter(GNParameterCode.TsCreate, gameItem.getTsCreate());
		operationResponse.setParameter(GNParameterCode.CreatorId, gameItem.getCreatorId());
		operationResponse.setParameter(GNParameterCode.GameDescription, gameItem.getGameDescription());
		operationResponse.setParameter(GNParameterCode.GameIconUrl, gameItem.getGameIconUrl());
		operationResponse.setParameter(GNParameterCode.GameName, gameItem.getGameName());

		let gnGameSettings = new GNHashtable();

		{
			let characterPlayerSettings = gameItem.getGameSettings().characterPlayerSettings;
			let gnCharacterPlayerSettings = new GNHashtable();

			{
				let playerCurrencySettings = characterPlayerSettings.playerCurrencySettings;
				let gnPlayerCurrencySettings = new GNArray();
				for (let i = 0; i < playerCurrencySettings.length; i++) {
					let playerCurrencySetting = playerCurrencySettings[i];
					let gnPlayerCurrencySetting = new GNHashtable();

					gnPlayerCurrencySetting.add(GNParameterCode.Key, playerCurrencySetting.key);
					gnPlayerCurrencySetting.add(GNParameterCode.InitialValue, playerCurrencySetting.initialValue);
					gnPlayerCurrencySetting.add(GNParameterCode.DisplayName, playerCurrencySetting.displayName);
					gnPlayerCurrencySetting.add(GNParameterCode.Index, playerCurrencySetting.index);

					gnPlayerCurrencySettings.add(gnPlayerCurrencySetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.CurrencySettings, gnPlayerCurrencySettings);
			}

			{
				let playerStatisticsSettings = characterPlayerSettings.playerStatisticsSettings;
				let gnPlayerStatisticsSettings = new GNArray();
				for (let i = 0; i < playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = playerStatisticsSettings[i];
					let gnPlayerStatisticsSetting = new GNHashtable();

					gnPlayerStatisticsSetting.add(GNParameterCode.Key, playerStatisticsSetting.key);
					gnPlayerStatisticsSetting.add(GNParameterCode.StatisticsAggregationMethod, playerStatisticsSetting.statisticsAggregationMethod);
					gnPlayerStatisticsSetting.add(GNParameterCode.MinimumValue, playerStatisticsSetting.minimumValue);
					gnPlayerStatisticsSetting.add(GNParameterCode.MaximumValue, playerStatisticsSetting.maximumValue);
					gnPlayerStatisticsSetting.add(GNParameterCode.InitialValue, playerStatisticsSetting.initialValue);
					gnPlayerStatisticsSetting.add(GNParameterCode.Index, playerStatisticsSetting.index);

					gnPlayerStatisticsSettings.add(gnPlayerStatisticsSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.StatisticsSettings, gnPlayerStatisticsSettings);
			}

			{
				let playerDatasSettings = characterPlayerSettings.playerDatasSettings;
				let gnPlayerDatasSettings = new GNArray();
				for (let i = 0; i < playerDatasSettings.length; i++) {
					let playerDatasSetting = playerDatasSettings[i];
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(GNParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(GNParameterCode.Permission, playerDatasSetting.permission);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.DatasSettings, gnPlayerDatasSettings);
			}

			{
				let customDatasSettings = characterPlayerSettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(GNParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(GNParameterCode.Permission, customDatasSetting.permission);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = characterPlayerSettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(GNParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(GNParameterCode.DisplayName, tagsSetting.displayName);
					gnTagsSetting.add(GNParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				let groupCatalogSettings = characterPlayerSettings.playerGroupCatalogSettings;
				let gnGroupCatalogSettings = new GNArray();
				for (let i = 0; i < groupCatalogSettings.length; i++) {
					let groupCatalogSetting = groupCatalogSettings[i];
					let gnGroupCatalogSetting = new GNHashtable();

					gnGroupCatalogSetting.add(GNParameterCode.CatalogId, groupCatalogSetting.catalogId);
					gnGroupCatalogSetting.add(GNParameterCode.DisplayName, groupCatalogSetting.displayName);
					gnGroupCatalogSetting.add(GNParameterCode.ForceAcceptMember, groupCatalogSetting.forceAcceptMember);

					gnGroupCatalogSettings.add(gnGroupCatalogSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.GroupCatalogSettings, gnGroupCatalogSettings);
			}

			{
				let itemCatalogSettings = characterPlayerSettings.playerItemCatalogSettings;
				let gnItemCatalogSettings = new GNArray();
				for (let i = 0; i < itemCatalogSettings.length; i++) {
					let itemCatalogSetting = itemCatalogSettings[i];
					let gnItemCatalogSetting = new GNHashtable();

					gnItemCatalogSetting.add(GNParameterCode.CatalogId, itemCatalogSetting.catalogId);

					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < itemCatalogSetting.itemClassSettings.length; j++) {
						let itemClassSetting = itemCatalogSetting.itemClassSettings[j];

						let gnItemClassSetting = new GNHashtable();
						gnItemClassSetting.add(GNParameterCode.ClassId, itemClassSetting.classId);
						gnItemClassSetting.add(GNParameterCode.DisplayName, itemClassSetting.displayName);

						gnItemClassSettings.add(gnItemClassSetting);
					}

					gnItemCatalogSetting.add(GNParameterCode.ItemClassSettings, gnItemClassSettings);
					gnItemCatalogSetting.add(GNParameterCode.ItemType, itemCatalogSetting.itemType);

					gnItemCatalogSettings.add(gnItemCatalogSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.ItemCatalogSettings, gnItemCatalogSettings);
			}

			{
				let friendCatalogSettings = characterPlayerSettings.playerFriendCatalogSettings;
				let gnFriendCatalogSettings = new GNArray();
				for (let i = 0; i < friendCatalogSettings.length; i++) {
					let friendCatalogSetting = friendCatalogSettings[i];
					let gnFriendCatalogSetting = new GNHashtable();

					gnFriendCatalogSetting.add(GNParameterCode.CatalogId, friendCatalogSetting.catalogId);
					gnFriendCatalogSetting.add(GNParameterCode.ForceAcceptFriend, friendCatalogSetting.forceAcceptFriend);

					gnFriendCatalogSettings.add(gnFriendCatalogSetting);
				}

				gnCharacterPlayerSettings.add(GNParameterCode.FriendCatalogSettings, gnFriendCatalogSettings);
			}

			gnGameSettings.add(GNParameterCode.CharacterPlayerSettings, gnCharacterPlayerSettings);
		}

		{
			let gamePlayerSettings = gameItem.getGameSettings().gamePlayerSettings;
			let gnGamePlayerSettings = new GNHashtable();

			{
				let playerCurrencySettings = gamePlayerSettings.playerCurrencySettings;
				let gnPlayerCurrencySettings = new GNArray();
				for (let i = 0; i < playerCurrencySettings.length; i++) {
					let playerCurrencySetting = playerCurrencySettings[i];
					let gnPlayerCurrencySetting = new GNHashtable();

					gnPlayerCurrencySetting.add(GNParameterCode.Key, playerCurrencySetting.key);
					gnPlayerCurrencySetting.add(GNParameterCode.InitialValue, playerCurrencySetting.initialValue);
					gnPlayerCurrencySetting.add(GNParameterCode.DisplayName, playerCurrencySetting.displayName);
					gnPlayerCurrencySetting.add(GNParameterCode.Index, playerCurrencySetting.index);

					gnPlayerCurrencySettings.add(gnPlayerCurrencySetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.CurrencySettings, gnPlayerCurrencySettings);
			}

			{
				let playerStatisticsSettings = gamePlayerSettings.playerStatisticsSettings;
				let gnPlayerStatisticsSettings = new GNArray();
				for (let i = 0; i < playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = playerStatisticsSettings[i];
					let gnPlayerStatisticsSetting = new GNHashtable();

					gnPlayerStatisticsSetting.add(GNParameterCode.Key, playerStatisticsSetting.key);
					gnPlayerStatisticsSetting.add(GNParameterCode.StatisticsAggregationMethod, playerStatisticsSetting.statisticsAggregationMethod);
					gnPlayerStatisticsSetting.add(GNParameterCode.MinimumValue, playerStatisticsSetting.minimumValue);
					gnPlayerStatisticsSetting.add(GNParameterCode.MaximumValue, playerStatisticsSetting.maximumValue);
					gnPlayerStatisticsSetting.add(GNParameterCode.InitialValue, playerStatisticsSetting.initialValue);
					gnPlayerStatisticsSetting.add(GNParameterCode.Index, playerStatisticsSetting.index);

					gnPlayerStatisticsSettings.add(gnPlayerStatisticsSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.StatisticsSettings, gnPlayerStatisticsSettings);
			}

			{
				let playerDatasSettings = gamePlayerSettings.playerDatasSettings;
				let gnPlayerDatasSettings = new GNArray();
				for (let i = 0; i < playerDatasSettings.length; i++) {
					let playerDatasSetting = playerDatasSettings[i];
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(GNParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(GNParameterCode.Permission, playerDatasSetting.permission);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.DatasSettings, gnPlayerDatasSettings);
			}

			{
				let customDatasSettings = gamePlayerSettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(GNParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(GNParameterCode.Permission, customDatasSetting.permission);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = gamePlayerSettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(GNParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(GNParameterCode.DisplayName, tagsSetting.displayName);
					gnTagsSetting.add(GNParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				let characterCatalogSettings = gamePlayerSettings.playerCharacterCatalogSettings;
				let gnCharacterCatalogSettings = new GNArray();
				for (let i = 0; i < characterCatalogSettings.length; i++) {
					let characterCatalogSetting = characterCatalogSettings[i];
					let gnCharacterCatalogSetting = new GNHashtable();

					gnCharacterCatalogSetting.add(GNParameterCode.CatalogId, characterCatalogSetting.catalogId);
					gnCharacterCatalogSetting.add(GNParameterCode.DisplayName, characterCatalogSetting.displayName);

					gnCharacterCatalogSettings.add(gnCharacterCatalogSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.CharacterCatalogSettings, gnCharacterCatalogSettings);
			}

			{
				let groupCatalogSettings = gamePlayerSettings.playerGroupCatalogSettings;
				let gnGroupCatalogSettings = new GNArray();
				for (let i = 0; i < groupCatalogSettings.length; i++) {
					let groupCatalogSetting = groupCatalogSettings[i];
					let gnGroupCatalogSetting = new GNHashtable();

					gnGroupCatalogSetting.add(GNParameterCode.CatalogId, groupCatalogSetting.catalogId);
					gnGroupCatalogSetting.add(GNParameterCode.DisplayName, groupCatalogSetting.displayName);
					gnGroupCatalogSetting.add(GNParameterCode.ForceAcceptMember, groupCatalogSetting.forceAcceptMember);

					gnGroupCatalogSettings.add(gnGroupCatalogSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.GroupCatalogSettings, gnGroupCatalogSettings);
			}

			{
				let itemCatalogSettings = gamePlayerSettings.playerItemCatalogSettings;
				let gnItemCatalogSettings = new GNArray();
				for (let i = 0; i < itemCatalogSettings.length; i++) {
					let itemCatalogSetting = itemCatalogSettings[i];
					let gnItemCatalogSetting = new GNHashtable();

					gnItemCatalogSetting.add(GNParameterCode.CatalogId, itemCatalogSetting.catalogId);

					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < itemCatalogSetting.itemClassSettings.length; j++) {
						let itemClassSetting = itemCatalogSetting.itemClassSettings[j];

						let gnItemClassSetting = new GNHashtable();
						gnItemClassSetting.add(GNParameterCode.ClassId, itemClassSetting.classId);
						gnItemClassSetting.add(GNParameterCode.DisplayName, itemClassSetting.displayName);

						gnItemClassSettings.add(gnItemClassSetting);
					}

					gnItemCatalogSetting.add(GNParameterCode.ItemClassSettings, gnItemClassSettings);
					gnItemCatalogSetting.add(GNParameterCode.ItemType, itemCatalogSetting.itemType);

					gnItemCatalogSettings.add(gnItemCatalogSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.ItemCatalogSettings, gnItemCatalogSettings);
			}

			{
				let friendCatalogSettings = gamePlayerSettings.playerFriendCatalogSettings;
				let gnFriendCatalogSettings = new GNArray();
				for (let i = 0; i < friendCatalogSettings.length; i++) {
					let friendCatalogSetting = friendCatalogSettings[i];
					let gnFriendCatalogSetting = new GNHashtable();

					gnFriendCatalogSetting.add(GNParameterCode.CatalogId, friendCatalogSetting.catalogId);
					gnFriendCatalogSetting.add(GNParameterCode.ForceAcceptFriend, friendCatalogSetting.forceAcceptFriend);

					gnFriendCatalogSettings.add(gnFriendCatalogSetting);
				}

				gnGamePlayerSettings.add(GNParameterCode.FriendCatalogSettings, gnFriendCatalogSettings);
			}

			gnGameSettings.add(GNParameterCode.GamePlayerSettings, gnGamePlayerSettings);
		}

		{
			let groupSettings = gameItem.getGameSettings().groupSettings;
			let gnGroupSettings = new GNHashtable();

			{
				let groupCurrencySettings = groupSettings.groupCurrencySettings;
				let gnGroupCurrencySettings = new GNArray();
				for (let i = 0; i < groupCurrencySettings.length; i++) {
					let groupCurrencySetting = groupCurrencySettings[i];
					let gnGroupCurrencySetting = new GNHashtable();

					gnGroupCurrencySetting.add(GNParameterCode.Key, groupCurrencySetting.key);
					gnGroupCurrencySetting.add(GNParameterCode.InitialValue, groupCurrencySetting.initialValue);
					gnGroupCurrencySetting.add(GNParameterCode.DisplayName, groupCurrencySetting.displayName);
					gnGroupCurrencySetting.add(GNParameterCode.Index, groupCurrencySetting.index);

					gnGroupCurrencySettings.add(gnGroupCurrencySetting);
				}

				gnGroupSettings.add(GNParameterCode.CurrencySettings, gnGroupCurrencySettings);
			}

			{
				let groupStatisticsSettings = groupSettings.groupStatisticsSettings;
				let gnGroupStatisticsSettings = new GNArray();
				for (let i = 0; i < groupStatisticsSettings.length; i++) {
					let groupStatisticsSetting = groupStatisticsSettings[i];
					let gnGroupStatisticsSetting = new GNHashtable();

					gnGroupStatisticsSetting.add(GNParameterCode.Key, groupStatisticsSetting.key);
					gnGroupStatisticsSetting.add(GNParameterCode.StatisticsAggregationMethod, groupStatisticsSetting.statisticsAggregationMethod);
					gnGroupStatisticsSetting.add(GNParameterCode.MinimumValue, groupStatisticsSetting.minimumValue);
					gnGroupStatisticsSetting.add(GNParameterCode.MaximumValue, groupStatisticsSetting.maximumValue);
					gnGroupStatisticsSetting.add(GNParameterCode.InitialValue, groupStatisticsSetting.initialValue);
					gnGroupStatisticsSetting.add(GNParameterCode.Index, groupStatisticsSetting.index);

					gnGroupStatisticsSettings.add(gnGroupStatisticsSetting);
				}

				gnGroupSettings.add(GNParameterCode.StatisticsSettings, gnGroupStatisticsSettings);
			}

			{
				let groupDatasSettings = groupSettings.groupDatasSettings;
				let gnGroupDatasSettings = new GNArray();
				for (let i = 0; i < groupDatasSettings.length; i++) {
					let groupDatasSetting = groupDatasSettings[i];
					let gnGroupDatasSetting = new GNHashtable();

					gnGroupDatasSetting.add(GNParameterCode.Key, groupDatasSetting.key);
					gnGroupDatasSetting.add(GNParameterCode.Permission, groupDatasSetting.permission);

					gnGroupDatasSettings.add(gnGroupDatasSetting);
				}

				gnGroupSettings.add(GNParameterCode.DatasSettings, gnGroupDatasSettings);
			}

			{
				let customDatasSettings = groupSettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(GNParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(GNParameterCode.Permission, customDatasSetting.permission);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnGroupSettings.add(GNParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = groupSettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(GNParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(GNParameterCode.DisplayName, tagsSetting.displayName);
					gnTagsSetting.add(GNParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnGroupSettings.add(GNParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				let itemCatalogSettings = groupSettings.groupItemCatalogSettings;
				let gnItemCatalogSettings = new GNArray();
				for (let i = 0; i < itemCatalogSettings.length; i++) {
					let itemCatalogSetting = itemCatalogSettings[i];
					let gnItemCatalogSetting = new GNHashtable();

					gnItemCatalogSetting.add(GNParameterCode.CatalogId, itemCatalogSetting.catalogId);

					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < itemCatalogSetting.itemClassSettings.length; j++) {
						let itemClassSetting = itemCatalogSetting.itemClassSettings[j];

						let gnItemClassSetting = new GNHashtable();
						gnItemClassSetting.add(GNParameterCode.ClassId, itemClassSetting.classId);
						gnItemClassSetting.add(GNParameterCode.DisplayName, itemClassSetting.displayName);

						gnItemClassSettings.add(gnItemClassSetting);
					}

					gnItemCatalogSetting.add(GNParameterCode.ItemClassSettings, gnItemClassSettings);
					gnItemCatalogSetting.add(GNParameterCode.ItemType, itemCatalogSetting.itemType);

					gnItemCatalogSettings.add(gnItemCatalogSetting);
				}

				gnGroupSettings.add(GNParameterCode.ItemCatalogSettings, gnItemCatalogSettings);
			}

			gnGameSettings.add(GNParameterCode.GroupSettings, gnGroupSettings);
		}

		{
			let inventorySettings = gameItem.getGameSettings().inventorySettings;
			let gnInventorySettings = new GNHashtable();

			{
				let inventoryStatisticsSettings = inventorySettings.inventoryStatisticsSettings;
				let gnInventoryStatisticsSettings = new GNArray();
				for (let i = 0; i < inventoryStatisticsSettings.length; i++) {
					let inventoryStatisticsSetting = inventoryStatisticsSettings[i];
					let gnInventoryStatisticsSetting = new GNHashtable();

					gnInventoryStatisticsSetting.add(GNParameterCode.Key, inventoryStatisticsSetting.key);
					gnInventoryStatisticsSetting.add(GNParameterCode.StatisticsAggregationMethod, inventoryStatisticsSetting.statisticsAggregationMethod);
					gnInventoryStatisticsSetting.add(GNParameterCode.MinimumValue, inventoryStatisticsSetting.minimumValue);
					gnInventoryStatisticsSetting.add(GNParameterCode.MaximumValue, inventoryStatisticsSetting.maximumValue);
					gnInventoryStatisticsSetting.add(GNParameterCode.InitialValue, inventoryStatisticsSetting.initialValue);
					gnInventoryStatisticsSetting.add(GNParameterCode.Index, inventoryStatisticsSetting.index);

					gnInventoryStatisticsSettings.add(gnInventoryStatisticsSetting);
				}

				gnInventorySettings.add(GNParameterCode.StatisticsSettings, gnInventoryStatisticsSettings);
			}

			{
				let inventoryDatasSettings = inventorySettings.inventoryDatasSettings;
				let gnInventoryDatasSettings = new GNArray();
				for (let i = 0; i < inventoryDatasSettings.length; i++) {
					let inventoryDatasSetting = inventoryDatasSettings[i];
					let gnInventoryDatasSetting = new GNHashtable();

					gnInventoryDatasSetting.add(GNParameterCode.Key, inventoryDatasSetting.key);
					gnInventoryDatasSetting.add(GNParameterCode.Permission, inventoryDatasSetting.permission);

					gnInventoryDatasSettings.add(gnInventoryDatasSetting);
				}

				gnInventorySettings.add(GNParameterCode.DatasSettings, gnInventoryDatasSettings);
			}

			{
				let customDatasSettings = inventorySettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(GNParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(GNParameterCode.Permission, customDatasSetting.permission);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnInventorySettings.add(GNParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = inventorySettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(GNParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(GNParameterCode.DisplayName, tagsSetting.displayName);
					gnTagsSetting.add(GNParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnInventorySettings.add(GNParameterCode.TagsSettings, gnTagsSettings);
			}

			gnGameSettings.add(GNParameterCode.InventorySettings, gnInventorySettings);
		}

		operationResponse.setParameter(GNParameterCode.GameSettings, gnGameSettings);

		let gnMatchmakingQueueSettings = new GNArray();

		{
			let matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings();

			for (let i = 0; i < matchmakingQueueSettings.length; i++) {
				let matchmakingQueueSetting = matchmakingQueueSettings[i];

				let gnMatchmakingQueueSetting = new GNHashtable();

				gnMatchmakingQueueSetting.add(GNParameterCode.QueueName, matchmakingQueueSetting.queueName);
				gnMatchmakingQueueSetting.add(GNParameterCode.MatchSize,
					new GNHashtableBuilder()
						.add(GNParameterCode.Min, matchmakingQueueSetting.matchSize.min)
						.add(GNParameterCode.Max, matchmakingQueueSetting.matchSize.max)
						.build()
				);

				gnMatchmakingQueueSetting.add(GNParameterCode.TicketSize,
					new GNHashtableBuilder()
						.add(GNParameterCode.Min, matchmakingQueueSetting.ticketSize.min)
						.add(GNParameterCode.Max, matchmakingQueueSetting.ticketSize.max)
						.build()
				);

				if (matchmakingQueueSetting.teams != null) {
					let gnTeams = new GNArray();

					for (let j = 0; j < matchmakingQueueSetting.teams.length; j++) {
						let team = matchmakingQueueSetting.teams[j];

						let gnTeam = new GNHashtable();

						gnTeam.add(GNParameterCode.TeamId, team.teamId);
						gnTeam.add(GNParameterCode.TeamSize,
							new GNHashtableBuilder()
								.add(GNParameterCode.Min, team.teamSize.min)
								.add(GNParameterCode.Max, team.teamSize.max)
								.build()
						);

						gnTeams.add(gnTeam);
					}

					gnMatchmakingQueueSetting.add(GNParameterCode.Teams, gnTeams);
				}

				let gnServerAllocation = new GNHashtable();
				gnServerAllocation.add(GNParameterCode.Enable, matchmakingQueueSetting.serverAllocation.enable);
				gnMatchmakingQueueSetting.add(GNParameterCode.ServerAllocation, gnServerAllocation);

				if (matchmakingQueueSetting.rules != null) {
					let gnRules = new GNArray();

					for (let j = 0; j < matchmakingQueueSetting.rules.length; j++) {
						let rule = matchmakingQueueSetting.rules[j];

						let gnRule = new GNHashtable();

						gnRule.add(GNParameterCode.Name, rule.name);
						gnRule.add(GNParameterCode.Type, <number>rule.type);

						if (rule.type == RuleType.String) {
							let stringRule = <StringRule>rule;

							gnRule.add(GNParameterCode.AttributeSource, <number>stringRule.attributeSource);
							gnRule.add(GNParameterCode.AttributePath, stringRule.attributePath);
							gnRule.add(GNParameterCode.DefaultValue, stringRule.defaultValue);
							gnRule.add(GNParameterCode.CompairType, <number>stringRule.compairType);

							if (stringRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, stringRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>stringRule.advancedSettings.expansionType);

								if (stringRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, stringRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideValue, stringRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.Difference) {
							let differenceRule = <DifferenceRule>rule;

							gnRule.add(GNParameterCode.AttributeSource, <number>differenceRule.attributeSource);
							gnRule.add(GNParameterCode.AttributePath, differenceRule.attributePath);
							gnRule.add(GNParameterCode.DefaultValue, differenceRule.defaultValue);
							gnRule.add(GNParameterCode.AllowedDifference, differenceRule.allowedDifference);

							if (differenceRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, differenceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>differenceRule.advancedSettings.expansionType);

								if (differenceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(GNParameterCode.SecondsBetweenExpansions, differenceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(GNParameterCode.Delta, differenceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(GNParameterCode.Limit, differenceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(GNParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (differenceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, differenceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideValue, differenceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.SetIntersection) {
							let setIntersectionRule = <SetIntersectionRule>rule;

							gnRule.add(GNParameterCode.AttributeSource, <number>setIntersectionRule.attributeSource);
							gnRule.add(GNParameterCode.AttributePath, setIntersectionRule.attributePath);
							gnRule.add(GNParameterCode.DefaultValue, setIntersectionRule.defaultValue);
							gnRule.add(GNParameterCode.Min, setIntersectionRule.min);

							if (setIntersectionRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, setIntersectionRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>setIntersectionRule.advancedSettings.expansionType);

								if (setIntersectionRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(GNParameterCode.SecondsBetweenExpansions, setIntersectionRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(GNParameterCode.Delta, setIntersectionRule.advancedSettings.linearExpansions.delta);

									gnAdvancedSettings.add(GNParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (setIntersectionRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, setIntersectionRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideValue, setIntersectionRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.MatchTotal) {
							let matchTotalRule = <MatchTotalRule>rule;

							gnRule.add(GNParameterCode.AttributeSource, <number>matchTotalRule.attributeSource);
							gnRule.add(GNParameterCode.AttributePath, matchTotalRule.attributePath);
							gnRule.add(GNParameterCode.Max, matchTotalRule.max);
							gnRule.add(GNParameterCode.Min, matchTotalRule.min);

							if (matchTotalRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, matchTotalRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>matchTotalRule.advancedSettings.expansionType);

								if (matchTotalRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, matchTotalRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideMin, matchTotalRule.advancedSettings.customExpansions.overrideMin);
									gnCustomExpansions.add(GNParameterCode.OverrideMax, matchTotalRule.advancedSettings.customExpansions.overrideMax);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.RegionSelection) {
							let regionSelectionRule = <RegionSelectionRule>rule;

							gnRule.add(GNParameterCode.AttributePath, regionSelectionRule.attributePath);
							gnRule.add(GNParameterCode.Max, regionSelectionRule.max);

							if (regionSelectionRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, regionSelectionRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>regionSelectionRule.advancedSettings.expansionType);

								if (regionSelectionRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(GNParameterCode.SecondsBetweenExpansions, regionSelectionRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(GNParameterCode.Delta, regionSelectionRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(GNParameterCode.Limit, regionSelectionRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(GNParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (regionSelectionRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, regionSelectionRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideValue, regionSelectionRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamSizeBalance) {
							let teamSizeBalanceRule = <TeamSizeBalanceRule>rule;

							gnRule.add(GNParameterCode.AllowedDifference, teamSizeBalanceRule.allowedDifference);

							if (teamSizeBalanceRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, teamSizeBalanceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>teamSizeBalanceRule.advancedSettings.expansionType);

								if (teamSizeBalanceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(GNParameterCode.SecondsBetweenExpansions, teamSizeBalanceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(GNParameterCode.Delta, teamSizeBalanceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(GNParameterCode.Limit, teamSizeBalanceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(GNParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (teamSizeBalanceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, teamSizeBalanceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideValue, teamSizeBalanceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamDifference) {
							let teamDifferenceRule = <TeamDifferenceRule>rule;

							gnRule.add(GNParameterCode.AttributeSource, <number>teamDifferenceRule.attributeSource);
							gnRule.add(GNParameterCode.AttributePath, teamDifferenceRule.attributePath);
							gnRule.add(GNParameterCode.DefaultValue, teamDifferenceRule.defaultValue);
							gnRule.add(GNParameterCode.AllowedDifference, teamDifferenceRule.allowedDifference);

							if (teamDifferenceRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, teamDifferenceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(GNParameterCode.ExpansionType, <number>teamDifferenceRule.advancedSettings.expansionType);

								if (teamDifferenceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(GNParameterCode.SecondsBetweenExpansions, teamDifferenceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(GNParameterCode.Delta, teamDifferenceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(GNParameterCode.Limit, teamDifferenceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(GNParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (teamDifferenceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(GNParameterCode.SecondsBetweenExpansions, teamDifferenceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(GNParameterCode.OverrideValue, teamDifferenceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(GNParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamTicketSizeSimilarity) {
							let teamTicketSizeSimilarityRule = <TeamTicketSizeSimilarityRule>rule;

							if (teamTicketSizeSimilarityRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(GNParameterCode.SecondsUntilOptional, teamTicketSizeSimilarityRule.advancedSettings.secondsUntilOptional);

								gnRule.add(GNParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}

						gnRules.add(gnRule);
					}

					gnMatchmakingQueueSetting.add(GNParameterCode.Rules, gnRules);
				}

				gnMatchmakingQueueSettings.add(gnMatchmakingQueueSetting);
			}
		}

		operationResponse.setParameter(GNParameterCode.MatchmakingQueueSettings, gnMatchmakingQueueSettings);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetGameInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
