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

export class GetGameInformationRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetGameInformation;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetGameInformationOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.getGameInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			gameId: request.gameId
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { gameId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetGameInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "gameSettings", "gameId": request.gameId });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		// Stores the game item value used in the current execution flow.
		let gameItem = new GameItem(result, collection);

		operationResponse.setParameter(ParameterCode.GameId, gameItem.getGameId());
		operationResponse.setParameter(ParameterCode.TsCreate, gameItem.getTsCreate());
		operationResponse.setParameter(ParameterCode.CreatorId, gameItem.getCreatorId());
		operationResponse.setParameter(ParameterCode.GameDescription, gameItem.getGameDescription());
		operationResponse.setParameter(ParameterCode.GameIconUrl, gameItem.getGameIconUrl());
		operationResponse.setParameter(ParameterCode.GameName, gameItem.getGameName());

		// Stores the resolved GearN game settings instance for the current execution flow.
		let gnGameSettings = new GNHashtable();

		{
			// Stores the resolved character player settings instance for the current execution flow.
			let characterPlayerSettings = gameItem.getGameSettings().characterPlayerSettings;
			// Stores the resolved GearN character player settings instance for the current execution flow.
			let gnCharacterPlayerSettings = new GNHashtable();

			{
				// Stores the resolved player currencies settings instance for the current execution flow.
				let playerCurrenciesSettings = characterPlayerSettings.playerCurrenciesSettings;
				// Stores the resolved GearN player currencies settings instance for the current execution flow.
				let gnPlayerCurrenciesSettings = new GNArray();
				for (let i = 0; i < playerCurrenciesSettings.length; i++) {
					// Stores the player currencies setting value used in the current execution flow.
					let playerCurrenciesSetting = playerCurrenciesSettings[i];
					// Stores the GearN player currencies setting value used in the current execution flow.
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
				// Stores the resolved player statistics settings instance for the current execution flow.
				let playerStatisticsSettings = characterPlayerSettings.playerStatisticsSettings;
				// Stores the resolved GearN player statistics settings instance for the current execution flow.
				let gnPlayerStatisticsSettings = new GNArray();
				for (let i = 0; i < playerStatisticsSettings.length; i++) {
					// Stores the player statistics setting value used in the current execution flow.
					let playerStatisticsSetting = playerStatisticsSettings[i];
					// Stores the GearN player statistics setting value used in the current execution flow.
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
				// Stores the resolved player datas settings instance for the current execution flow.
				let playerDatasSettings = characterPlayerSettings.playerDatasSettings;
				// Stores the resolved GearN player datas settings instance for the current execution flow.
				let gnPlayerDatasSettings = new GNArray();
				for (let i = 0; i < playerDatasSettings.length; i++) {
					// Stores the player datas setting value used in the current execution flow.
					let playerDatasSetting = playerDatasSettings[i];
					// Stores the GearN player datas setting value used in the current execution flow.
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(ParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(ParameterCode.Permission, playerDatasSetting.permission);
					gnPlayerDatasSetting.add(ParameterCode.Description, playerDatasSetting.description);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerDatasSettings, gnPlayerDatasSettings);
			}

			{
				// Stores the resolved custom datas settings instance for the current execution flow.
				let customDatasSettings = characterPlayerSettings.customDatasSettings;
				// Stores the resolved GearN custom datas settings instance for the current execution flow.
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					// Stores the custom datas setting value used in the current execution flow.
					let customDatasSetting = customDatasSettings[i];
					// Stores the GearN custom datas setting value used in the current execution flow.
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				// Stores the resolved tags settings instance for the current execution flow.
				let tagsSettings = characterPlayerSettings.tagsSettings;
				// Stores the resolved GearN tags settings instance for the current execution flow.
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
					let tagsSetting = tagsSettings[i];
					// Stores the GearN tags setting value used in the current execution flow.
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				// Stores the resolved player group catalog settings instance for the current execution flow.
				let playerGroupCatalogSettings = characterPlayerSettings.playerGroupCatalogSettings;
				// Stores the resolved GearN player group catalog settings instance for the current execution flow.
				let gnPlayerGroupCatalogSettings = new GNArray();
				for (let i = 0; i < playerGroupCatalogSettings.length; i++) {
					// Stores the player group catalog setting value used in the current execution flow.
					let playerGroupCatalogSetting = playerGroupCatalogSettings[i];
					// Stores the GearN player group catalog setting value used in the current execution flow.
					let gnPlayerGroupCatalogSetting = new GNHashtable();

					gnPlayerGroupCatalogSetting.add(ParameterCode.CatalogId, playerGroupCatalogSetting.catalogId);
					gnPlayerGroupCatalogSetting.add(ParameterCode.Description, playerGroupCatalogSetting.description);
					gnPlayerGroupCatalogSetting.add(ParameterCode.ForceAcceptMember, playerGroupCatalogSetting.forceAcceptMember);

					gnPlayerGroupCatalogSettings.add(gnPlayerGroupCatalogSetting);
				}

				gnCharacterPlayerSettings.add(ParameterCode.PlayerGroupCatalogSettings, gnPlayerGroupCatalogSettings);
			}

			{
				// Stores the resolved player item catalog settings instance for the current execution flow.
				let playerItemCatalogSettings = characterPlayerSettings.playerItemCatalogSettings;
				// Stores the resolved GearN player item catalog settings instance for the current execution flow.
				let gnPlayerItemCatalogSettings = new GNArray();
				for (let i = 0; i < playerItemCatalogSettings.length; i++) {
					// Stores the player item catalog setting value used in the current execution flow.
					let playerItemCatalogSetting = playerItemCatalogSettings[i];
					// Stores the GearN player item catalog setting value used in the current execution flow.
					let gnPlayerItemCatalogSetting = new GNHashtable();

					gnPlayerItemCatalogSetting.add(ParameterCode.CatalogId, playerItemCatalogSetting.catalogId);

					// Stores the resolved GearN item class settings instance for the current execution flow.
					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < playerItemCatalogSetting.itemClassSettings.length; j++) {
						// Stores the item class setting value used in the current execution flow.
						let itemClassSetting = playerItemCatalogSetting.itemClassSettings[j];

						// Stores the GearN item class setting value used in the current execution flow.
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
				// Stores the resolved player friend catalog settings instance for the current execution flow.
				let playerFriendCatalogSettings = characterPlayerSettings.playerFriendCatalogSettings;
				// Stores the resolved GearN player friend catalog settings instance for the current execution flow.
				let gnPlayerFriendCatalogSettings = new GNArray();
				for (let i = 0; i < playerFriendCatalogSettings.length; i++) {
					// Stores the player friend catalog setting value used in the current execution flow.
					let playerFriendCatalogSetting = playerFriendCatalogSettings[i];
					// Stores the GearN player friend catalog setting value used in the current execution flow.
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
			// Stores the resolved game player settings instance for the current execution flow.
			let gamePlayerSettings = gameItem.getGameSettings().gamePlayerSettings;
			// Stores the resolved GearN game player settings instance for the current execution flow.
			let gnGamePlayerSettings = new GNHashtable();

			{
				// Stores the resolved player currencies settings instance for the current execution flow.
				let playerCurrenciesSettings = gamePlayerSettings.playerCurrenciesSettings;
				// Stores the resolved GearN player currencies settings instance for the current execution flow.
				let gnPlayerCurrenciesSettings = new GNArray();
				for (let i = 0; i < playerCurrenciesSettings.length; i++) {
					// Stores the player currencies setting value used in the current execution flow.
					let playerCurrenciesSetting = playerCurrenciesSettings[i];
					// Stores the GearN player currencies setting value used in the current execution flow.
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
				// Stores the resolved player statistics settings instance for the current execution flow.
				let playerStatisticsSettings = gamePlayerSettings.playerStatisticsSettings;
				// Stores the resolved GearN player statistics settings instance for the current execution flow.
				let gnPlayerStatisticsSettings = new GNArray();
				for (let i = 0; i < playerStatisticsSettings.length; i++) {
					// Stores the player statistics setting value used in the current execution flow.
					let playerStatisticsSetting = playerStatisticsSettings[i];
					// Stores the GearN player statistics setting value used in the current execution flow.
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
				// Stores the resolved player datas settings instance for the current execution flow.
				let playerDatasSettings = gamePlayerSettings.playerDatasSettings;
				// Stores the resolved GearN player datas settings instance for the current execution flow.
				let gnPlayerDatasSettings = new GNArray();
				for (let i = 0; i < playerDatasSettings.length; i++) {
					// Stores the player datas setting value used in the current execution flow.
					let playerDatasSetting = playerDatasSettings[i];
					// Stores the GearN player datas setting value used in the current execution flow.
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(ParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(ParameterCode.Permission, playerDatasSetting.permission);
					gnPlayerDatasSetting.add(ParameterCode.Description, playerDatasSetting.description);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerDatasSettings, gnPlayerDatasSettings);
			}

			{
				// Stores the resolved custom datas settings instance for the current execution flow.
				let customDatasSettings = gamePlayerSettings.customDatasSettings;
				// Stores the resolved GearN custom datas settings instance for the current execution flow.
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					// Stores the custom datas setting value used in the current execution flow.
					let customDatasSetting = customDatasSettings[i];
					// Stores the GearN custom datas setting value used in the current execution flow.
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				// Stores the resolved tags settings instance for the current execution flow.
				let tagsSettings = gamePlayerSettings.tagsSettings;
				// Stores the resolved GearN tags settings instance for the current execution flow.
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
					let tagsSetting = tagsSettings[i];
					// Stores the GearN tags setting value used in the current execution flow.
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				// Stores the resolved player character catalog settings instance for the current execution flow.
				let playerCharacterCatalogSettings = gamePlayerSettings.playerCharacterCatalogSettings;
				// Stores the resolved GearN player character catalog settings instance for the current execution flow.
				let gnPlayerCharacterCatalogSettings = new GNArray();
				for (let i = 0; i < playerCharacterCatalogSettings.length; i++) {
					// Stores the player character catalog setting value used in the current execution flow.
					let playerCharacterCatalogSetting = playerCharacterCatalogSettings[i];
					// Stores the GearN player character catalog setting value used in the current execution flow.
					let gnPlayerCharacterCatalogSetting = new GNHashtable();

					gnPlayerCharacterCatalogSetting.add(ParameterCode.CatalogId, playerCharacterCatalogSetting.catalogId);
					gnPlayerCharacterCatalogSetting.add(ParameterCode.Description, playerCharacterCatalogSetting.description);

					gnPlayerCharacterCatalogSettings.add(gnPlayerCharacterCatalogSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerCharacterCatalogSettings, gnPlayerCharacterCatalogSettings);
			}

			{
				// Stores the resolved group catalog settings instance for the current execution flow.
				let groupCatalogSettings = gamePlayerSettings.playerGroupCatalogSettings;
				// Stores the resolved GearN group catalog settings instance for the current execution flow.
				let gnGroupCatalogSettings = new GNArray();
				for (let i = 0; i < groupCatalogSettings.length; i++) {
					// Stores the group catalog setting value used in the current execution flow.
					let groupCatalogSetting = groupCatalogSettings[i];
					// Stores the GearN group catalog setting value used in the current execution flow.
					let gnGroupCatalogSetting = new GNHashtable();

					gnGroupCatalogSetting.add(ParameterCode.CatalogId, groupCatalogSetting.catalogId);
					gnGroupCatalogSetting.add(ParameterCode.Description, groupCatalogSetting.description);
					gnGroupCatalogSetting.add(ParameterCode.ForceAcceptMember, groupCatalogSetting.forceAcceptMember);

					gnGroupCatalogSettings.add(gnGroupCatalogSetting);
				}

				gnGamePlayerSettings.add(ParameterCode.PlayerGroupCatalogSettings, gnGroupCatalogSettings);
			}

			{
				// Stores the resolved player item catalog settings instance for the current execution flow.
				let playerItemCatalogSettings = gamePlayerSettings.playerItemCatalogSettings;
				// Stores the resolved GearN player item catalog settings instance for the current execution flow.
				let gnPlayerItemCatalogSettings = new GNArray();
				for (let i = 0; i < playerItemCatalogSettings.length; i++) {
					// Stores the player item catalog setting value used in the current execution flow.
					let playerItemCatalogSetting = playerItemCatalogSettings[i];
					// Stores the GearN player item catalog setting value used in the current execution flow.
					let gnPlayerItemCatalogSetting = new GNHashtable();

					gnPlayerItemCatalogSetting.add(ParameterCode.CatalogId, playerItemCatalogSetting.catalogId);

					// Stores the resolved GearN item class settings instance for the current execution flow.
					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < playerItemCatalogSetting.itemClassSettings.length; j++) {
						// Stores the item class setting value used in the current execution flow.
						let itemClassSetting = playerItemCatalogSetting.itemClassSettings[j];

						// Stores the GearN item class setting value used in the current execution flow.
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
				// Stores the resolved player friend catalog settings instance for the current execution flow.
				let playerFriendCatalogSettings = gamePlayerSettings.playerFriendCatalogSettings;
				// Stores the resolved GearN player friend catalog settings instance for the current execution flow.
				let gnPlayerFriendCatalogSettings = new GNArray();
				for (let i = 0; i < playerFriendCatalogSettings.length; i++) {
					// Stores the player friend catalog setting value used in the current execution flow.
					let playerFriendCatalogSetting = playerFriendCatalogSettings[i];
					// Stores the GearN player friend catalog setting value used in the current execution flow.
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
			// Stores the resolved group settings instance for the current execution flow.
			let groupSettings = gameItem.getGameSettings().groupSettings;
			// Stores the resolved GearN group settings instance for the current execution flow.
			let gnGroupSettings = new GNHashtable();

			{
				// Stores the resolved group currencies settings instance for the current execution flow.
				let groupCurrenciesSettings = groupSettings.groupCurrenciesSettings;
				// Stores the resolved GearN group currencies settings instance for the current execution flow.
				let gnGroupCurrenciesSettings = new GNArray();
				for (let i = 0; i < groupCurrenciesSettings.length; i++) {
					// Stores the group currencies setting value used in the current execution flow.
					let groupCurrenciesSetting = groupCurrenciesSettings[i];
					// Stores the GearN group currencies setting value used in the current execution flow.
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
				// Stores the resolved group statistics settings instance for the current execution flow.
				let groupStatisticsSettings = groupSettings.groupStatisticsSettings;
				// Stores the resolved GearN group statistics settings instance for the current execution flow.
				let gnGroupStatisticsSettings = new GNArray();
				for (let i = 0; i < groupStatisticsSettings.length; i++) {
					// Stores the group statistics setting value used in the current execution flow.
					let groupStatisticsSetting = groupStatisticsSettings[i];
					// Stores the GearN group statistics setting value used in the current execution flow.
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
				// Stores the resolved group datas settings instance for the current execution flow.
				let groupDatasSettings = groupSettings.groupDatasSettings;
				// Stores the resolved GearN group datas settings instance for the current execution flow.
				let gnGroupDatasSettings = new GNArray();
				for (let i = 0; i < groupDatasSettings.length; i++) {
					// Stores the group datas setting value used in the current execution flow.
					let groupDatasSetting = groupDatasSettings[i];
					// Stores the GearN group datas setting value used in the current execution flow.
					let gnGroupDatasSetting = new GNHashtable();

					gnGroupDatasSetting.add(ParameterCode.Key, groupDatasSetting.key);
					gnGroupDatasSetting.add(ParameterCode.Permission, groupDatasSetting.permission);
					gnGroupDatasSetting.add(ParameterCode.Description, groupDatasSetting.description);

					gnGroupDatasSettings.add(gnGroupDatasSetting);
				}

				gnGroupSettings.add(ParameterCode.GroupDatasSettings, gnGroupDatasSettings);
			}

			{
				// Stores the resolved custom datas settings instance for the current execution flow.
				let customDatasSettings = groupSettings.customDatasSettings;
				// Stores the resolved GearN custom datas settings instance for the current execution flow.
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					// Stores the custom datas setting value used in the current execution flow.
					let customDatasSetting = customDatasSettings[i];
					// Stores the GearN custom datas setting value used in the current execution flow.
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnGroupSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				// Stores the resolved tags settings instance for the current execution flow.
				let tagsSettings = groupSettings.tagsSettings;
				// Stores the resolved GearN tags settings instance for the current execution flow.
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
					let tagsSetting = tagsSettings[i];
					// Stores the GearN tags setting value used in the current execution flow.
					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnGroupSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			{
				// Stores the resolved group item catalog settings instance for the current execution flow.
				let groupItemCatalogSettings = groupSettings.groupItemCatalogSettings;
				// Stores the resolved GearN group item catalog settings instance for the current execution flow.
				let gnGroupItemCatalogSettings = new GNArray();
				for (let i = 0; i < groupItemCatalogSettings.length; i++) {
					// Stores the group item catalog setting value used in the current execution flow.
					let groupItemCatalogSetting = groupItemCatalogSettings[i];
					// Stores the GearN group item catalog setting value used in the current execution flow.
					let gnGroupItemCatalogSetting = new GNHashtable();

					gnGroupItemCatalogSetting.add(ParameterCode.CatalogId, groupItemCatalogSetting.catalogId);

					// Stores the resolved GearN item class settings instance for the current execution flow.
					let gnItemClassSettings = new GNArray();

					for (let j = 0; j < groupItemCatalogSetting.itemClassSettings.length; j++) {
						// Stores the item class setting value used in the current execution flow.
						let itemClassSetting = groupItemCatalogSetting.itemClassSettings[j];

						// Stores the GearN item class setting value used in the current execution flow.
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
			// Stores the resolved inventory settings instance for the current execution flow.
			let inventorySettings = gameItem.getGameSettings().inventorySettings;
			// Stores the resolved GearN inventory settings instance for the current execution flow.
			let gnInventorySettings = new GNHashtable();

			{
				// Stores the resolved item statistics settings instance for the current execution flow.
				let itemStatisticsSettings = inventorySettings.itemStatisticsSettings;
				// Stores the resolved GearN item statistics settings instance for the current execution flow.
				let gnItemStatisticsSettings = new GNArray();
				for (let i = 0; i < itemStatisticsSettings.length; i++) {
					// Stores the item statistics setting value used in the current execution flow.
					let itemStatisticsSetting = itemStatisticsSettings[i];
					// Stores the GearN item statistics setting value used in the current execution flow.
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
				// Stores the resolved item datas settings instance for the current execution flow.
				let itemDatasSettings = inventorySettings.itemDatasSettings;
				// Stores the resolved GearN item datas settings instance for the current execution flow.
				let gnItemDatasSettings = new GNArray();
				for (let i = 0; i < itemDatasSettings.length; i++) {
					// Stores the item datas setting value used in the current execution flow.
					let itemDatasSetting = itemDatasSettings[i];
					// Stores the GearN item datas setting value used in the current execution flow.
					let gnItemDatasSetting = new GNHashtable();

					gnItemDatasSetting.add(ParameterCode.Key, itemDatasSetting.key);
					gnItemDatasSetting.add(ParameterCode.Permission, itemDatasSetting.permission);
					gnItemDatasSetting.add(ParameterCode.Description, itemDatasSetting.description);

					gnItemDatasSettings.add(gnItemDatasSetting);
				}

				gnInventorySettings.add(ParameterCode.ItemDatasSettings, gnItemDatasSettings);
			}

			{
				// Stores the resolved custom datas settings instance for the current execution flow.
				let customDatasSettings = inventorySettings.customDatasSettings;
				// Stores the resolved GearN custom datas settings instance for the current execution flow.
				let gnCustomDatasSettings = new GNArray();
				for (let i = 0; i < customDatasSettings.length; i++) {
					// Stores the custom datas setting value used in the current execution flow.
					let customDatasSetting = customDatasSettings[i];
					// Stores the GearN custom datas setting value used in the current execution flow.
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnInventorySettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				// Stores the resolved tags settings instance for the current execution flow.
				let tagsSettings = inventorySettings.tagsSettings;
				// Stores the resolved GearN tags settings instance for the current execution flow.
				let gnTagsSettings = new GNArray();
				for (let i = 0; i < tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
					let tagsSetting = tagsSettings[i];
					// Stores the GearN tags setting value used in the current execution flow.
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

		// Stores the resolved GearN matchmaking queue settings instance for the current execution flow.
		let gnMatchmakingQueueSettings = new GNArray();

		{
			// Stores the resolved matchmaking queue settings instance for the current execution flow.
			let matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings();

			for (let i = 0; i < matchmakingQueueSettings.length; i++) {
				// Stores the matchmaking queue setting value used in the current execution flow.
				let matchmakingQueueSetting = matchmakingQueueSettings[i];

				// Stores the GearN matchmaking queue setting value used in the current execution flow.
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
					// Stores the GearN teams value used in the current execution flow.
					let gnTeams = new GNArray();

					for (let j = 0; j < matchmakingQueueSetting.teams.length; j++) {
						// Stores the team value used in the current execution flow.
						let team = matchmakingQueueSetting.teams[j];

						// Stores the GearN team value used in the current execution flow.
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

				// Stores the GearN server allocation value used in the current execution flow.
				let gnServerAllocation = new GNHashtable();
				gnServerAllocation.add(ParameterCode.Enable, matchmakingQueueSetting.serverAllocation.enable);
				gnMatchmakingQueueSetting.add(ParameterCode.ServerAllocation, gnServerAllocation);

				if (matchmakingQueueSetting.rules != null) {
					// Stores the GearN rules value used in the current execution flow.
					let gnRules = new GNArray();

					for (let j = 0; j < matchmakingQueueSetting.rules.length; j++) {
						// Stores the rule value used in the current execution flow.
						let rule = matchmakingQueueSetting.rules[j];

						// Stores the GearN rule value used in the current execution flow.
						let gnRule = new GNHashtable();

						gnRule.add(ParameterCode.Name, rule.name);
						gnRule.add(ParameterCode.Type, <number>rule.type);

						if (rule.type == RuleType.String) {
							// Stores the string rule value used in the current execution flow.
							let stringRule = <StringRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>stringRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, stringRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, stringRule.defaultValue);
							gnRule.add(ParameterCode.CompairType, <number>stringRule.compairType);

							if (stringRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, stringRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>stringRule.advancedSettings.expansionType);

								if (stringRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, stringRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, stringRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.Difference) {
							// Stores the difference rule value used in the current execution flow.
							let differenceRule = <DifferenceRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>differenceRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, differenceRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, differenceRule.defaultValue);
							gnRule.add(ParameterCode.AllowedDifference, differenceRule.allowedDifference);

							if (differenceRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, differenceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>differenceRule.advancedSettings.expansionType);

								if (differenceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									// Stores the GearN linear expansions value used in the current execution flow.
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, differenceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, differenceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, differenceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (differenceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, differenceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, differenceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.SetIntersection) {
							// Stores the set intersection rule value used in the current execution flow.
							let setIntersectionRule = <SetIntersectionRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>setIntersectionRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, setIntersectionRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, setIntersectionRule.defaultValue);
							gnRule.add(ParameterCode.Min, setIntersectionRule.min);

							if (setIntersectionRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, setIntersectionRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>setIntersectionRule.advancedSettings.expansionType);

								if (setIntersectionRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									// Stores the GearN linear expansions value used in the current execution flow.
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, setIntersectionRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, setIntersectionRule.advancedSettings.linearExpansions.delta);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (setIntersectionRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, setIntersectionRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, setIntersectionRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.MatchTotal) {
							// Stores the match total rule value used in the current execution flow.
							let matchTotalRule = <MatchTotalRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>matchTotalRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, matchTotalRule.attributePath);
							gnRule.add(ParameterCode.Max, matchTotalRule.max);
							gnRule.add(ParameterCode.Min, matchTotalRule.min);

							if (matchTotalRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, matchTotalRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>matchTotalRule.advancedSettings.expansionType);

								if (matchTotalRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
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
							// Stores the region selection rule value used in the current execution flow.
							let regionSelectionRule = <RegionSelectionRule>rule;

							gnRule.add(ParameterCode.AttributePath, regionSelectionRule.attributePath);
							gnRule.add(ParameterCode.Max, regionSelectionRule.max);

							if (regionSelectionRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, regionSelectionRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>regionSelectionRule.advancedSettings.expansionType);

								if (regionSelectionRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									// Stores the GearN linear expansions value used in the current execution flow.
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, regionSelectionRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, regionSelectionRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, regionSelectionRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (regionSelectionRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, regionSelectionRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, regionSelectionRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamSizeBalance) {
							// Stores the team size balance rule value used in the current execution flow.
							let teamSizeBalanceRule = <TeamSizeBalanceRule>rule;

							gnRule.add(ParameterCode.AllowedDifference, teamSizeBalanceRule.allowedDifference);

							if (teamSizeBalanceRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, teamSizeBalanceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>teamSizeBalanceRule.advancedSettings.expansionType);

								if (teamSizeBalanceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									// Stores the GearN linear expansions value used in the current execution flow.
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, teamSizeBalanceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, teamSizeBalanceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, teamSizeBalanceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (teamSizeBalanceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, teamSizeBalanceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, teamSizeBalanceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamDifference) {
							// Stores the team difference rule value used in the current execution flow.
							let teamDifferenceRule = <TeamDifferenceRule>rule;

							gnRule.add(ParameterCode.AttributeSource, <number>teamDifferenceRule.attributeSource);
							gnRule.add(ParameterCode.AttributePath, teamDifferenceRule.attributePath);
							gnRule.add(ParameterCode.DefaultValue, teamDifferenceRule.defaultValue);
							gnRule.add(ParameterCode.AllowedDifference, teamDifferenceRule.allowedDifference);

							if (teamDifferenceRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
								let gnAdvancedSettings = new GNHashtable();

								gnAdvancedSettings.add(ParameterCode.SecondsUntilOptional, teamDifferenceRule.advancedSettings.secondsUntilOptional);
								gnAdvancedSettings.add(ParameterCode.ExpansionType, <number>teamDifferenceRule.advancedSettings.expansionType);

								if (teamDifferenceRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
									// Stores the GearN linear expansions value used in the current execution flow.
									let gnLinearExpansions = new GNHashtable();

									gnLinearExpansions.add(ParameterCode.SecondsBetweenExpansions, teamDifferenceRule.advancedSettings.linearExpansions.secondsBetweenExpansions);
									gnLinearExpansions.add(ParameterCode.Delta, teamDifferenceRule.advancedSettings.linearExpansions.delta);
									gnLinearExpansions.add(ParameterCode.Limit, teamDifferenceRule.advancedSettings.linearExpansions.limit);

									gnAdvancedSettings.add(ParameterCode.LinearExpansions, gnLinearExpansions);
								}
								else if (teamDifferenceRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
									// Stores the GearN custom expansions value used in the current execution flow.
									let gnCustomExpansions = new GNHashtable();

									gnCustomExpansions.add(ParameterCode.SecondsBetweenExpansions, teamDifferenceRule.advancedSettings.customExpansions.secondsBetweenExpansions);
									gnCustomExpansions.add(ParameterCode.OverrideValue, teamDifferenceRule.advancedSettings.customExpansions.overrideValue);

									gnAdvancedSettings.add(ParameterCode.CustomExpansions, gnCustomExpansions);
								}

								gnRule.add(ParameterCode.AdvancedSettings, gnAdvancedSettings);
							}
						}
						else if (rule.type == RuleType.TeamTicketSizeSimilarity) {
							// Stores the team ticket size similarity rule value used in the current execution flow.
							let teamTicketSizeSimilarityRule = <TeamTicketSizeSimilarityRule>rule;

							if (teamTicketSizeSimilarityRule.advancedSettings != null) {
								// Stores the resolved GearN advanced settings instance for the current execution flow.
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
