import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GameItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";

import { StringDataMember } from "./../../../../../GN-common/entity/DataMember";
import { GNArray, GNHashtable, GNHashtableBuilder } from "./../../../../../GN-common/common/GNData";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleExpansionType, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, TeamTicketSizeSimilarityRule } from "./../../../../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";

class GetGameInformationOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

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
			return this.newInvalidRequestParameters(request);
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

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "gameSettings", "gameId": request.gameId });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		let gameItem = new GameItem(result, collection);

		operationResponse.setParameter(ParameterCode.GameId, gameItem.getGameId());
		operationResponse.setParameter(ParameterCode.TsCreate, gameItem.getTsCreate());
		operationResponse.setParameter(ParameterCode.CreatorId, gameItem.getCreatorId());
		operationResponse.setParameter(ParameterCode.GameDescription, gameItem.getGameDescription());
		operationResponse.setParameter(ParameterCode.GameIconUrl, gameItem.getGameIconUrl());
		operationResponse.setParameter(ParameterCode.GameName, gameItem.getGameName());

		let gnGameSettings = new GNHashtable();

		{
			let characterPlayerSettings = gameItem.getGameSettings().characterPlayerSettings;
			let gnCharacterPlayerSettings = new GNHashtable();

			{
				let playerCurrenciesSettings = characterPlayerSettings.playerCurrenciesSettings;
				let gnPlayerCurrenciesSettings = new GNArray();
				for (let i = 0; i < playerCurrenciesSettings.length; i++) {
					let playerCurrenciesSetting = playerCurrenciesSettings[i];
					let gnPlayerCurrenciesSetting = new GNHashtable();

					gnPlayerCurrenciesSetting.add(ParameterCode.Key, playerCurrenciesSetting.key);
					gnPlayerCurrenciesSetting.add(ParameterCode.InitialValue, playerCurrenciesSetting.initialValue);
					gnPlayerCurrenciesSetting.add(ParameterCode.Description, playerCurrenciesSetting.description);
					gnPlayerCurrenciesSetting.add(ParameterCode.Index, playerCurrenciesSetting.index);

					gnPlayerCurrenciesSettings.add(gnPlayerCurrenciesSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerCurrenciesSettings, gnPlayerCurrenciesSettings);
			}

			{
				let playerStatisticsSettings = characterPlayerSettings.playerStatisticsSettings;
				let gnPlayerStatisticsSettings = new GNArray();
				for (let i = 0; i < playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = playerStatisticsSettings[i];
					let gnPlayerStatisticsSetting = new GNHashtable();

					gnPlayerStatisticsSetting.add(ParameterCode.Key, playerStatisticsSetting.key);
					gnPlayerStatisticsSetting.add(ParameterCode.StatisticsAggregationMethod, playerStatisticsSetting.statisticsAggregationMethod);
					gnPlayerStatisticsSetting.add(ParameterCode.MinimumValue, playerStatisticsSetting.minimumValue);
					gnPlayerStatisticsSetting.add(ParameterCode.MaximumValue, playerStatisticsSetting.maximumValue);
					gnPlayerStatisticsSetting.add(ParameterCode.InitialValue, playerStatisticsSetting.initialValue);
					gnPlayerStatisticsSetting.add(ParameterCode.Description, playerStatisticsSetting.description);
					gnPlayerStatisticsSetting.add(ParameterCode.Index, playerStatisticsSetting.index);

					gnPlayerStatisticsSettings.add(gnPlayerStatisticsSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerStatisticsSettings, gnPlayerStatisticsSettings);
			}

			{
				let playerDatasSettings = characterPlayerSettings.playerDatasSettings;
				let gnPlayerDatasSettings = new GNArray();
				for (let i = 0; i < playerDatasSettings.length; i++) {
					let playerDatasSetting = playerDatasSettings[i];
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(ParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(ParameterCode.Permission, playerDatasSetting.permission);
					gnPlayerDatasSetting.add(ParameterCode.Description, playerDatasSetting.description);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerDatasSettings, gnPlayerDatasSettings);
			}

			{
				let customDatasSettings = characterPlayerSettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = characterPlayerSettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				let playerGroupCatalogSettings = characterPlayerSettings.playerGroupCatalogSettings;
				let gnPlayerGroupCatalogSettings = new GNArray();
				for (let i = 0; i < playerGroupCatalogSettings.length; i++) {
					let playerGroupCatalogSetting = playerGroupCatalogSettings[i];
					let gnPlayerGroupCatalogSetting = new GNHashtable();

					gnPlayerGroupCatalogSetting.add(ParameterCode.CatalogId, playerGroupCatalogSetting.catalogId);
					gnPlayerGroupCatalogSetting.add(ParameterCode.Description, playerGroupCatalogSetting.description);
					gnPlayerGroupCatalogSetting.add(ParameterCode.ForceAcceptMember, playerGroupCatalogSetting.forceAcceptMember);

					gnPlayerGroupCatalogSettings.add(gnPlayerGroupCatalogSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerGroupCatalogSettings, gnPlayerGroupCatalogSettings);
			}

			{
				let playerItemCatalogSettings = characterPlayerSettings.playerItemCatalogSettings;
				let gnPlayerItemCatalogSettings = new GNArray();
				for (let i = 0; i < playerItemCatalogSettings.length; i++) {
					let playerItemCatalogSetting = playerItemCatalogSettings[i];
					let gnPlayerItemCatalogSetting = new GNHashtable();

					gnPlayerItemCatalogSetting.add(ParameterCode.CatalogId, playerItemCatalogSetting.catalogId);

					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < playerItemCatalogSetting.itemClassSettings.length; j++) {
						let itemClassSetting = playerItemCatalogSetting.itemClassSettings[j];

						let gnItemClassSetting = new GNHashtable();
						gnItemClassSetting.add(ParameterCode.ClassId, itemClassSetting.classId);
						gnItemClassSetting.add(ParameterCode.Description, itemClassSetting.description);

						gnItemClassSettings.add(gnItemClassSetting);
					}

					gnPlayerItemCatalogSetting.add(ParameterCode.ItemClassSettings, gnItemClassSettings);
					gnPlayerItemCatalogSetting.add(ParameterCode.ItemType, playerItemCatalogSetting.itemType);

					gnPlayerItemCatalogSettings.add(gnPlayerItemCatalogSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerItemCatalogSettings, gnPlayerItemCatalogSettings);
			}

			{
				let playerFriendCatalogSettings = characterPlayerSettings.playerFriendCatalogSettings;
				let gnPlayerFriendCatalogSettings = new GNArray();
				for (let i = 0; i < playerFriendCatalogSettings.length; i++) {
					let playerFriendCatalogSetting = playerFriendCatalogSettings[i];
					let gnPlayerFriendCatalogSetting = new GNHashtable();

					gnPlayerFriendCatalogSetting.add(ParameterCode.CatalogId, playerFriendCatalogSetting.catalogId);
					gnPlayerFriendCatalogSetting.add(ParameterCode.Description, playerFriendCatalogSetting.description);
					gnPlayerFriendCatalogSetting.add(ParameterCode.ForceAcceptFriend, playerFriendCatalogSetting.forceAcceptFriend);

					gnPlayerFriendCatalogSettings.add(gnPlayerFriendCatalogSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerFriendCatalogSettings, gnPlayerFriendCatalogSettings);
			}

			gnGameSettings.add(ParameterCode.CharacterPlayerSettings, gnCharacterPlayerSettings);
		}

		{
			let gamePlayerSettings = gameItem.getGameSettings().gamePlayerSettings;
			let gnGamePlayerSettings = new GNHashtable();

			{
				let playerCurrenciesSettings = gamePlayerSettings.playerCurrenciesSettings;
				let gnPlayerCurrenciesSettings = new GNArray();
				for (let i = 0; i < playerCurrenciesSettings.length; i++) {
					let playerCurrenciesSetting = playerCurrenciesSettings[i];
					let gnPlayerCurrenciesSetting = new GNHashtable();

					gnPlayerCurrenciesSetting.add(ParameterCode.Key, playerCurrenciesSetting.key);
					gnPlayerCurrenciesSetting.add(ParameterCode.InitialValue, playerCurrenciesSetting.initialValue);
					gnPlayerCurrenciesSetting.add(ParameterCode.Description, playerCurrenciesSetting.description);
					gnPlayerCurrenciesSetting.add(ParameterCode.Index, playerCurrenciesSetting.index);

					gnPlayerCurrenciesSettings.add(gnPlayerCurrenciesSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerCurrenciesSettings, gnPlayerCurrenciesSettings);
			}

			{
				let playerStatisticsSettings = gamePlayerSettings.playerStatisticsSettings;
				let gnPlayerStatisticsSettings = new GNArray();
				for (let i = 0; i < playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = playerStatisticsSettings[i];
					let gnPlayerStatisticsSetting = new GNHashtable();

					gnPlayerStatisticsSetting.add(ParameterCode.Key, playerStatisticsSetting.key);
					gnPlayerStatisticsSetting.add(ParameterCode.StatisticsAggregationMethod, playerStatisticsSetting.statisticsAggregationMethod);
					gnPlayerStatisticsSetting.add(ParameterCode.MinimumValue, playerStatisticsSetting.minimumValue);
					gnPlayerStatisticsSetting.add(ParameterCode.MaximumValue, playerStatisticsSetting.maximumValue);
					gnPlayerStatisticsSetting.add(ParameterCode.InitialValue, playerStatisticsSetting.initialValue);
					gnPlayerStatisticsSetting.add(ParameterCode.Description, playerStatisticsSetting.description);
					gnPlayerStatisticsSetting.add(ParameterCode.Index, playerStatisticsSetting.index);

					gnPlayerStatisticsSettings.add(gnPlayerStatisticsSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerStatisticsSettings, gnPlayerStatisticsSettings);
			}

			{
				let playerDatasSettings = gamePlayerSettings.playerDatasSettings;
				let gnPlayerDatasSettings = new GNArray();
				for (let i = 0; i < playerDatasSettings.length; i++) {
					let playerDatasSetting = playerDatasSettings[i];
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(ParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(ParameterCode.Permission, playerDatasSetting.permission);
					gnPlayerDatasSetting.add(ParameterCode.Description, playerDatasSetting.description);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerDatasSettings, gnPlayerDatasSettings);
			}

			{
				let customDatasSettings = gamePlayerSettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = gamePlayerSettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				let playerCharacterCatalogSettings = gamePlayerSettings.playerCharacterCatalogSettings;
				let gnPlayerCharacterCatalogSettings = new GNArray();
				for (let i = 0; i < playerCharacterCatalogSettings.length; i++) {
					let playerCharacterCatalogSetting = playerCharacterCatalogSettings[i];
					let gnPlayerCharacterCatalogSetting = new GNHashtable();

					gnPlayerCharacterCatalogSetting.add(ParameterCode.CatalogId, playerCharacterCatalogSetting.catalogId);
					gnPlayerCharacterCatalogSetting.add(ParameterCode.Description, playerCharacterCatalogSetting.description);

					gnPlayerCharacterCatalogSettings.add(gnPlayerCharacterCatalogSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerCharacterCatalogSettings, gnPlayerCharacterCatalogSettings);
			}

			{
				let groupCatalogSettings = gamePlayerSettings.playerGroupCatalogSettings;
				let gnGroupCatalogSettings = new GNArray();
				for (let i = 0; i < groupCatalogSettings.length; i++) {
					let groupCatalogSetting = groupCatalogSettings[i];
					let gnGroupCatalogSetting = new GNHashtable();

					gnGroupCatalogSetting.add(ParameterCode.CatalogId, groupCatalogSetting.catalogId);
					gnGroupCatalogSetting.add(ParameterCode.Description, groupCatalogSetting.description);
					gnGroupCatalogSetting.add(ParameterCode.ForceAcceptMember, groupCatalogSetting.forceAcceptMember);

					gnGroupCatalogSettings.add(gnGroupCatalogSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerGroupCatalogSettings, gnGroupCatalogSettings);
			}

			{
				let playerItemCatalogSettings = gamePlayerSettings.playerItemCatalogSettings;
				let gnPlayerItemCatalogSettings = new GNArray();
				for (let i = 0; i < playerItemCatalogSettings.length; i++) {
					let playerItemCatalogSetting = playerItemCatalogSettings[i];
					let gnPlayerItemCatalogSetting = new GNHashtable();

					gnPlayerItemCatalogSetting.add(ParameterCode.CatalogId, playerItemCatalogSetting.catalogId);

					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < playerItemCatalogSetting.itemClassSettings.length; j++) {
						let itemClassSetting = playerItemCatalogSetting.itemClassSettings[j];

						let gnItemClassSetting = new GNHashtable();
						gnItemClassSetting.add(ParameterCode.ClassId, itemClassSetting.classId);
						gnItemClassSetting.add(ParameterCode.Description, itemClassSetting.description);

						gnItemClassSettings.add(gnItemClassSetting);
					}

					gnPlayerItemCatalogSetting.add(ParameterCode.ItemClassSettings, gnItemClassSettings);
					gnPlayerItemCatalogSetting.add(ParameterCode.ItemType, playerItemCatalogSetting.itemType);

					gnPlayerItemCatalogSettings.add(gnPlayerItemCatalogSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerItemCatalogSettings, gnPlayerItemCatalogSettings);
			}

			{
				let playerFriendCatalogSettings = gamePlayerSettings.playerFriendCatalogSettings;
				let gnPlayerFriendCatalogSettings = new GNArray();
				for (let i = 0; i < playerFriendCatalogSettings.length; i++) {
					let playerFriendCatalogSetting = playerFriendCatalogSettings[i];
					let gnPlayerFriendCatalogSetting = new GNHashtable();

					gnPlayerFriendCatalogSetting.add(ParameterCode.CatalogId, playerFriendCatalogSetting.catalogId);
					gnPlayerFriendCatalogSetting.add(ParameterCode.Description, playerFriendCatalogSetting.description);
					gnPlayerFriendCatalogSetting.add(ParameterCode.ForceAcceptFriend, playerFriendCatalogSetting.forceAcceptFriend);

					gnPlayerFriendCatalogSettings.add(gnPlayerFriendCatalogSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerFriendCatalogSettings, gnPlayerFriendCatalogSettings);
			}

			gnGameSettings.add(ParameterCode.GamePlayerSettings, gnGamePlayerSettings);
		}

		{
			let groupSettings = gameItem.getGameSettings().groupSettings;
			let gnGroupSettings = new GNHashtable();

			{
				let groupCurrenciesSettings = groupSettings.groupCurrenciesSettings;
				let gnGroupCurrenciesSettings = new GNArray();
				for (let i = 0; i < groupCurrenciesSettings.length; i++) {
					let groupCurrenciesSetting = groupCurrenciesSettings[i];
					let gnGroupCurrenciesSetting = new GNHashtable();

					gnGroupCurrenciesSetting.add(ParameterCode.Key, groupCurrenciesSetting.key);
					gnGroupCurrenciesSetting.add(ParameterCode.InitialValue, groupCurrenciesSetting.initialValue);
					gnGroupCurrenciesSetting.add(ParameterCode.Description, groupCurrenciesSetting.description);
					gnGroupCurrenciesSetting.add(ParameterCode.Index, groupCurrenciesSetting.index);

					gnGroupCurrenciesSettings.add(gnGroupCurrenciesSetting);
				}

				gnGroupSettings.add(ParameterCode.GroupCurrenciesSettings, gnGroupCurrenciesSettings);
			}

			{
				let groupStatisticsSettings = groupSettings.groupStatisticsSettings;
				let gnGroupStatisticsSettings = new GNArray();
				for (let i = 0; i < groupStatisticsSettings.length; i++) {
					let groupStatisticsSetting = groupStatisticsSettings[i];
					let gnGroupStatisticsSetting = new GNHashtable();

					gnGroupStatisticsSetting.add(ParameterCode.Key, groupStatisticsSetting.key);
					gnGroupStatisticsSetting.add(ParameterCode.StatisticsAggregationMethod, groupStatisticsSetting.statisticsAggregationMethod);
					gnGroupStatisticsSetting.add(ParameterCode.MinimumValue, groupStatisticsSetting.minimumValue);
					gnGroupStatisticsSetting.add(ParameterCode.MaximumValue, groupStatisticsSetting.maximumValue);
					gnGroupStatisticsSetting.add(ParameterCode.InitialValue, groupStatisticsSetting.initialValue);
					gnGroupStatisticsSetting.add(ParameterCode.Description, groupStatisticsSetting.description);
					gnGroupStatisticsSetting.add(ParameterCode.Index, groupStatisticsSetting.index);

					gnGroupStatisticsSettings.add(gnGroupStatisticsSetting);
				}

				gnGroupSettings.add(ParameterCode.GroupStatisticsSettings, gnGroupStatisticsSettings);
			}

			{
				let groupDatasSettings = groupSettings.groupDatasSettings;
				let gnGroupDatasSettings = new GNArray();
				for (let i = 0; i < groupDatasSettings.length; i++) {
					let groupDatasSetting = groupDatasSettings[i];
					let gnGroupDatasSetting = new GNHashtable();

					gnGroupDatasSetting.add(ParameterCode.Key, groupDatasSetting.key);
					gnGroupDatasSetting.add(ParameterCode.Permission, groupDatasSetting.permission);
					gnGroupDatasSetting.add(ParameterCode.Description, groupDatasSetting.description);

					gnGroupDatasSettings.add(gnGroupDatasSetting);
				}

				gnGroupSettings.add(ParameterCode.GroupDatasSettings, gnGroupDatasSettings);
			}

			{
				let customDatasSettings = groupSettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnGroupSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = groupSettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnGroupSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				let groupItemCatalogSettings = groupSettings.groupItemCatalogSettings;
				let gnGroupItemCatalogSettings = new GNArray();
				for (let i = 0; i < groupItemCatalogSettings.length; i++) {
					let groupItemCatalogSetting = groupItemCatalogSettings[i];
					let gnGroupItemCatalogSetting = new GNHashtable();

					gnGroupItemCatalogSetting.add(ParameterCode.CatalogId, groupItemCatalogSetting.catalogId);

					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < groupItemCatalogSetting.itemClassSettings.length; j++) {
						let itemClassSetting = groupItemCatalogSetting.itemClassSettings[j];

						let gnItemClassSetting = new GNHashtable();
						gnItemClassSetting.add(ParameterCode.ClassId, itemClassSetting.classId);
						gnItemClassSetting.add(ParameterCode.Description, itemClassSetting.description);

						gnItemClassSettings.add(gnItemClassSetting);
					}

					gnGroupItemCatalogSetting.add(ParameterCode.ItemClassSettings, gnItemClassSettings);
					gnGroupItemCatalogSetting.add(ParameterCode.ItemType, groupItemCatalogSetting.itemType);

					gnGroupItemCatalogSettings.add(gnGroupItemCatalogSetting);
				}

				gnGroupSettings.add(ParameterCode.GroupItemCatalogSettings, gnGroupItemCatalogSettings);
			}

			gnGameSettings.add(ParameterCode.GroupSettings, gnGroupSettings);
		}

		{
			let inventorySettings = gameItem.getGameSettings().inventorySettings;
			let gnInventorySettings = new GNHashtable();

			{
				let itemStatisticsSettings = inventorySettings.itemStatisticsSettings;
				let gnItemStatisticsSettings = new GNArray();
				for (let i = 0; i < itemStatisticsSettings.length; i++) {
					let itemStatisticsSetting = itemStatisticsSettings[i];
					let gnItemStatisticsSetting = new GNHashtable();

					gnItemStatisticsSetting.add(ParameterCode.Key, itemStatisticsSetting.key);
					gnItemStatisticsSetting.add(ParameterCode.StatisticsAggregationMethod, itemStatisticsSetting.statisticsAggregationMethod);
					gnItemStatisticsSetting.add(ParameterCode.MinimumValue, itemStatisticsSetting.minimumValue);
					gnItemStatisticsSetting.add(ParameterCode.MaximumValue, itemStatisticsSetting.maximumValue);
					gnItemStatisticsSetting.add(ParameterCode.InitialValue, itemStatisticsSetting.initialValue);
					gnItemStatisticsSetting.add(ParameterCode.Description, itemStatisticsSetting.description);
					gnItemStatisticsSetting.add(ParameterCode.Index, itemStatisticsSetting.index);

					gnItemStatisticsSettings.add(gnItemStatisticsSetting);
				}

				gnInventorySettings.add(ParameterCode.ItemStatisticsSettings, gnItemStatisticsSettings);
			}

			{
				let itemDatasSettings = inventorySettings.itemDatasSettings;
				let gnItemDatasSettings = new GNArray();
				for (let i = 0; i < itemDatasSettings.length; i++) {
					let itemDatasSetting = itemDatasSettings[i];
					let gnItemDatasSetting = new GNHashtable();

					gnItemDatasSetting.add(ParameterCode.Key, itemDatasSetting.key);
					gnItemDatasSetting.add(ParameterCode.Permission, itemDatasSetting.permission);
					gnItemDatasSetting.add(ParameterCode.Description, itemDatasSetting.description);

					gnItemDatasSettings.add(gnItemDatasSetting);
				}

				gnInventorySettings.add(ParameterCode.ItemDatasSettings, gnItemDatasSettings);
			}

			{
				let customDatasSettings = inventorySettings.customDatasSettings;
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					let customDatasSetting = customDatasSettings[i];
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnInventorySettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let tagsSettings = inventorySettings.tagsSettings;
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					let tagsSetting = tagsSettings[i];
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnInventorySettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			gnGameSettings.add(ParameterCode.InventorySettings, gnInventorySettings);
		}

		operationResponse.setParameter(ParameterCode.GameSettings, gnGameSettings);

		let gnMatchmakingQueueSettings = new GNArray();

		{
			let matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings();

			for (let i = 0; i < matchmakingQueueSettings.length; i++) {
				let matchmakingQueueSetting = matchmakingQueueSettings[i];

				let gnMatchmakingQueueSetting = new GNHashtable();

				gnMatchmakingQueueSetting.add(ParameterCode.QueueName, matchmakingQueueSetting.queueName);
				gnMatchmakingQueueSetting.add(ParameterCode.MatchSize,
					new GNHashtableBuilder()
						.add(ParameterCode.Min, matchmakingQueueSetting.matchSize.min)
						.add(ParameterCode.Max, matchmakingQueueSetting.matchSize.max)
						.build()
				);

				gnMatchmakingQueueSetting.add(ParameterCode.TicketSize,
					new GNHashtableBuilder()
						.add(ParameterCode.Min, matchmakingQueueSetting.ticketSize.min)
						.add(ParameterCode.Max, matchmakingQueueSetting.ticketSize.max)
						.build()
				);

				if (matchmakingQueueSetting.teams != null) {
					let gnTeams = new GNArray();

					for (let j = 0; j < matchmakingQueueSetting.teams.length; j++) {
						let team = matchmakingQueueSetting.teams[j];

						let gnTeam = new GNHashtable();

						gnTeam.add(ParameterCode.TeamId, team.teamId);
						gnTeam.add(ParameterCode.TeamSize,
							new GNHashtableBuilder()
								.add(ParameterCode.Min, team.teamSize.min)
								.add(ParameterCode.Max, team.teamSize.max)
								.build()
						);

						gnTeams.add(gnTeam);
					}

					gnMatchmakingQueueSetting.add(ParameterCode.Teams, gnTeams);
				}

				let gnServerAllocation = new GNHashtable();
				gnServerAllocation.add(ParameterCode.Enable, matchmakingQueueSetting.serverAllocation.enable);
				gnMatchmakingQueueSetting.add(ParameterCode.ServerAllocation, gnServerAllocation);

				if (matchmakingQueueSetting.rules != null) {
					let gnRules = new GNArray();

					for (let j = 0; j < matchmakingQueueSetting.rules.length; j++) {
						let rule = matchmakingQueueSetting.rules[j];

						let gnRule = new GNHashtable();

						gnRule.add(ParameterCode.Name, rule.name);
						gnRule.add(ParameterCode.Type, <number>rule.type);

						if (rule.type == RuleType.String) {
							let stringRule = <StringRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>stringRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, stringRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, stringRule.defaultValue);
							gnRule.add(ParameterCode.CompairType, <number>stringRule.compairType);

							if (stringRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, stringRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>stringRule.advancedSettings.expansionType);

								if (stringRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, stringRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, stringRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.Difference) {
							let differenceRule = <DifferenceRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>differenceRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, differenceRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, differenceRule.defaultValue);
							gnRule.add(ParameterCode.AllowedDifference, differenceRule.allowedDifference);

							if (differenceRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, differenceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>differenceRule.advancedSettings.expansionType);

								if (differenceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, differenceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, differenceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, differenceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (differenceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, differenceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, differenceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.SetIntersection) {
							let setIntersectionRule = <SetIntersectionRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>setIntersectionRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, setIntersectionRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, setIntersectionRule.defaultValue);
							gnRule.add(ParameterCode.Min, setIntersectionRule.min);

							if (setIntersectionRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, setIntersectionRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>setIntersectionRule.advancedSettings.expansionType);

								if (setIntersectionRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, setIntersectionRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, setIntersectionRule.advancedSettings.linearExpansions.delta);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (setIntersectionRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, setIntersectionRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, setIntersectionRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.MatchTotal) {
							let matchTotalRule = <MatchTotalRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>matchTotalRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, matchTotalRule.attributePath);
							gnRule.add(ParameterCode.Max, matchTotalRule.max);
							gnRule.add(ParameterCode.Min, matchTotalRule.min);

							if (matchTotalRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, matchTotalRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>matchTotalRule.advancedSettings.expansionType);

								if (matchTotalRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, matchTotalRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideMin, matchTotalRule.advancedSettings.customExpansions.overrideMin);
									gnCustomExpansions.add(ParameterCode.OverrideMax, matchTotalRule.advancedSettings.customExpansions.overrideMax);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.RegionSelection) {
							let regionSelectionRule = <RegionSelectionRule>rule;

							gnRule.add(ParameterCode.AttributePath, regionSelectionRule.attributePath);
							gnRule.add(ParameterCode.Max, regionSelectionRule.max);

							if (regionSelectionRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, regionSelectionRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>regionSelectionRule.advancedSettings.expansionType);

								if (regionSelectionRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, regionSelectionRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, regionSelectionRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, regionSelectionRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (regionSelectionRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, regionSelectionRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, regionSelectionRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamSizeBalance) {
							let teamSizeBalanceRule = <TeamSizeBalanceRule>rule;

							gnRule.add(ParameterCode.AllowedDifference, teamSizeBalanceRule.allowedDifference);

							if (teamSizeBalanceRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, teamSizeBalanceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>teamSizeBalanceRule.advancedSettings.expansionType);

								if (teamSizeBalanceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, teamSizeBalanceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, teamSizeBalanceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, teamSizeBalanceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (teamSizeBalanceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, teamSizeBalanceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, teamSizeBalanceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamDifference) {
							let teamDifferenceRule = <TeamDifferenceRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>teamDifferenceRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, teamDifferenceRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, teamDifferenceRule.defaultValue);
							gnRule.add(ParameterCode.AllowedDifference, teamDifferenceRule.allowedDifference);

							if (teamDifferenceRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, teamDifferenceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>teamDifferenceRule.advancedSettings.expansionType);

								if (teamDifferenceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, teamDifferenceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, teamDifferenceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, teamDifferenceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (teamDifferenceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, teamDifferenceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, teamDifferenceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamTicketSizeSimilarity) {
							let teamTicketSizeSimilarityRule = <TeamTicketSizeSimilarityRule>rule;

							if (teamTicketSizeSimilarityRule.advancedSettings != null) {
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, teamTicketSizeSimilarityRule.advancedSettings.secondsUntilOptional);

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}

						gnRules.add(gnRule);
					}

					gnMatchmakingQueueSetting.add(ParameterCode.Rules, gnRules);
				}

				gnMatchmakingQueueSettings.add(gnMatchmakingQueueSetting);
			}
		}

		operationResponse.setParameter(ParameterCode.MatchmakingQueueSettings, gnMatchmakingQueueSettings);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetGameInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
