import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export abstract class GamePlayerBaseRequestHandler extends RequestHandler {
	/**
	 * Checks whether get all.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	private isGetAll(infoRequestParam: InfoRequestParam): boolean {
		return infoRequestParam.segments
			&& infoRequestParam.customDatas
			&& infoRequestParam.displayName
			&& infoRequestParam.avatar
			&& infoRequestParam.tsCreate
			&& infoRequestParam.tags
			&& infoRequestParam.playerBan
			&& infoRequestParam.playerDatas
			&& infoRequestParam.playerCurrencies
			&& infoRequestParam.playerStatistics

			&& infoRequestParam.playerCharacters
			&& infoRequestParam.playerInventories
			&& infoRequestParam.playerGroups
			&& infoRequestParam.playerFriends

			&& infoRequestParam.tsLastLogin
			&& infoRequestParam.ipAddressCreate
			&& infoRequestParam.countryCode;
	}

	/**
	 * Converts the to game player find options.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected convertToGamePlayerFindOptions(infoRequestParam: InfoRequestParam): GamePlayerFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

		// Stores the answer value used in the current execution flow.
		let answer: GamePlayerFindOptions = {};
		answer.userId = true;

		if (infoRequestParam.segments) answer.segments = infoRequestParam.segments;
		if (infoRequestParam.customDatas) answer.customDatas = infoRequestParam.customDatas;
		if (infoRequestParam.displayName) answer.displayName = infoRequestParam.displayName;
		if (infoRequestParam.avatar) answer.avatar = infoRequestParam.avatar;
		if (infoRequestParam.tsCreate) answer.tsCreate = infoRequestParam.tsCreate;
		if (infoRequestParam.tags) answer.tags = infoRequestParam.tags;
		if (infoRequestParam.playerBan) answer.playerBan = infoRequestParam.playerBan;
		if (infoRequestParam.playerDatas) answer.playerDatas = infoRequestParam.playerDatas;
		if (infoRequestParam.playerCurrencies) answer.playerCurrencies = infoRequestParam.playerCurrencies;
		if (infoRequestParam.playerStatistics) answer.playerStatistics = infoRequestParam.playerStatistics;

		if (infoRequestParam.playerCharacters) answer.playerCharacters = infoRequestParam.playerCharacters;
		if (infoRequestParam.playerInventories) answer.playerInventories = infoRequestParam.playerInventories;
		if (infoRequestParam.playerGroups) answer.playerGroups = infoRequestParam.playerGroups;
		if (infoRequestParam.playerFriends) answer.playerFriends = infoRequestParam.playerFriends;

		if (infoRequestParam.tsLastLogin) answer.tsLastLogin = infoRequestParam.tsLastLogin;
		if (infoRequestParam.ipAddressCreate) answer.ipAddressCreate = infoRequestParam.ipAddressCreate;
		if (infoRequestParam.countryCode) answer.countryCode = infoRequestParam.countryCode;

		return answer;
	}

	/**
	 * Executes the generate info request parameter for owner workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOwner(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().gamePlayer.getSegment.selfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTag.selfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getDisplayName.selfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsCreate.selfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getIpAddressCreate.selfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsLastLogin.selfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerBan.selfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCountryCode.selfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getAvatar.selfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCurrency.selfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerStatistics.selfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCustomData.selfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerData.selfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCharacter.selfEnable) {
			infoRequestParam.playerCharacters = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerInventory.selfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerGroup.selfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.selfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

	/**
	 * Executes the generate info request parameter for other workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOther(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().gamePlayer.getSegment.otherSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTag.otherSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getDisplayName.otherSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsCreate.otherSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getIpAddressCreate.otherSelfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsLastLogin.otherSelfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerBan.otherSelfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCountryCode.otherSelfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getAvatar.otherSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCurrency.otherSelfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerStatistics.otherSelfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCustomData.otherSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerData.otherSelfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCharacter.otherSelfEnable) {
			infoRequestParam.playerCharacters = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerInventory.otherSelfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerGroup.otherSelfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.otherSelfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

	/**
	 * Executes the generate info request parameter for server workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForServer(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().gamePlayer.getSegment.serverSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTag.serverSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getDisplayName.serverSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsCreate.serverSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getIpAddressCreate.serverSelfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsLastLogin.serverSelfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerBan.serverSelfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCountryCode.serverSelfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getAvatar.serverSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCurrency.serverSelfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerStatistics.serverSelfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCustomData.serverSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerData.serverSelfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCharacter.serverSelfEnable) {
			infoRequestParam.playerCharacters = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerInventory.serverSelfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerGroup.serverSelfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.serverSelfEnable) {
			infoRequestParam.playerFriends = false;
		}

	}

	/**
	 * Executes the generate info request parameter for admin workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForAdmin(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().gamePlayer.getSegment.adminSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTag.adminSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getDisplayName.adminSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsCreate.adminSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getIpAddressCreate.adminSelfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getTsLastLogin.adminSelfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerBan.adminSelfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCountryCode.adminSelfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getAvatar.adminSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCurrency.adminSelfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerStatistics.adminSelfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getCustomData.adminSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerData.adminSelfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerCharacter.adminSelfEnable) {
			infoRequestParam.playerCharacters = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerInventory.adminSelfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerGroup.adminSelfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.adminSelfEnable) {
			infoRequestParam.playerFriends = false;
		}

	}

	/**
	 * Executes the generate info response parameters workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateInfoResponseParameters(gamePlayer: GamePlayer, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
		// Stores the answer value used in the current execution flow.
		let answer = new GNHashtable();

		if (infoRequestParam.segments)
			answer.add(ParameterCode.Segments, this.generateSegments(gamePlayer));

		if (infoRequestParam.customDatas)
			answer.add(ParameterCode.CustomDatas, this.generateCustomDatas(gamePlayer, infoRequestParam.customDataKeys, gameId));

		if (infoRequestParam.displayName)
			answer.add(ParameterCode.DisplayName, this.generateDisplayName(gamePlayer));

		if (infoRequestParam.avatar)
			answer.add(ParameterCode.Avatar, this.generateAvatar(gamePlayer));

		if (infoRequestParam.tsCreate)
			answer.add(ParameterCode.TsCreate, this.generateTsCreate(gamePlayer));

		if (infoRequestParam.tags)
			answer.add(ParameterCode.Tags, this.generateTags(gamePlayer, infoRequestParam.tagKeys, gameId));

		if (infoRequestParam.playerBan)
			answer.add(ParameterCode.PlayerBan, this.generatePlayerBan(gamePlayer));

		if (infoRequestParam.playerDatas)
			answer.add(ParameterCode.PlayerDatas, this.generatePlayerDatas(gamePlayer, infoRequestParam.playerDataKeys, gameId));

		if (infoRequestParam.playerCurrencies)
			answer.add(ParameterCode.PlayerCurrencies, this.generatePlayerCurrencies(gamePlayer, infoRequestParam.playerCurrencyKeys, gameId));

		if (infoRequestParam.playerStatistics)
			answer.add(ParameterCode.PlayerStatistics, this.generatePlayerStatistics(gamePlayer, infoRequestParam.playerStatisticsKeys, gameId));

		if (infoRequestParam.playerCharacters)
			answer.add(ParameterCode.PlayerCharacters, this.generatePlayerCharacters(gamePlayer, infoRequestParam.characterCatalogIds));

		if (infoRequestParam.playerInventories)
			answer.add(ParameterCode.PlayerInventories, this.generatePlayerInventories(gamePlayer, infoRequestParam.itemCatalogIds));

		if (infoRequestParam.playerGroups)
			answer.add(ParameterCode.PlayerGroups, this.generatePlayerGroups(gamePlayer, infoRequestParam.groupCatalogIds));

		if (infoRequestParam.playerFriends)
			answer.add(ParameterCode.PlayerFriends, this.generatePlayerFriends(gamePlayer, infoRequestParam.friendCatalogIds));

		if (infoRequestParam.tsLastLogin)
			answer.add(ParameterCode.TsLastLogin, this.generateTsLastLogin(gamePlayer));

		if (infoRequestParam.ipAddressCreate)
			answer.add(ParameterCode.IpAddressCreate, this.generateIpAddressCreate(gamePlayer));

		if (infoRequestParam.countryCode)
			answer.add(ParameterCode.CountryCode, this.generateCountryCode(gamePlayer));

		return answer;
	}

	/**
	 * Executes the generate segments workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateSegments(gamePlayer: GamePlayer): string[] {
		return gamePlayer.getAllSegments();
	}

	/**
	 * Executes the generate custom datas workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param customDataKeys Provides the custom data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCustomDatas(gamePlayer: GamePlayer, customDataKeys: string[], gameId: string): GNArray {
		// Stores the GearN custom datas value used in the current execution flow.
		let gnCustomDatas = new GNArray();

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.customDatasSettings.length; i++) {
			// Stores the custom datas settings item value used in the current execution flow.
			let customDatasSettingsItem = gamePlayerSettings.customDatasSettings[i];

			if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = gamePlayer.getCustomData(customDatasSettingsItem.key);

				if (value != null) {
					// Stores the GearN custom data value used in the current execution flow.
					let gnCustomData = new GNHashtable();

					gnCustomData.add(ParameterCode.Key, customDatasSettingsItem.key);
					gnCustomData.add(ParameterCode.Value, value);

					gnCustomDatas.add(gnCustomData);
				}
			}
		}

		return gnCustomDatas;
	}

	/**
	 * Executes the generate display name workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateDisplayName(gamePlayer: GamePlayer): string {
		return gamePlayer.getDisplayName();
	}

	/**
	 * Executes the generate avatar workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateAvatar(gamePlayer: GamePlayer): GNHashtable {
		// Stores the avatar value used in the current execution flow.
		let avatar = gamePlayer.getAvatar();

		// Stores the GearN avatar value used in the current execution flow.
		let gnAvatar = new GNHashtable();

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

		return gnAvatar;
	}

	/**
	 * Executes the generate timestamp create workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsCreate(gamePlayer: GamePlayer): number {
		return gamePlayer.getTsCreate();
	}

	/**
	 * Executes the generate tags workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param tagKeys Provides the tag keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTags(gamePlayer: GamePlayer, tagKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN tags value used in the current execution flow.
		let gnTags = new GNArray();

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.tagsSettings.length; i++) {
			// Stores the tags settings item value used in the current execution flow.
			let tagsSettingsItem = gamePlayerSettings.tagsSettings[i];

			if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = gamePlayer.getTag(tagsSettingsItem.key);

				if (value != null) {
					// Stores the GearN tag value used in the current execution flow.
					let gnTag = new GNHashtable();

					gnTag.add(ParameterCode.Key, tagsSettingsItem.key);
					gnTag.add(ParameterCode.Value, value);

					gnTags.add(gnTag);
				}
			}
		}

		return gnTags;
	}

	/**
	 * Executes the generate player ban workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerBan(gamePlayer: GamePlayer): GNHashtable {
		// Stores the GearN player ban value used in the current execution flow.
		let gnPlayerBan = new GNHashtable();

		// Stores the player ban value used in the current execution flow.
		let playerBan = gamePlayer.getPlayerBan();

		gnPlayerBan.add(ParameterCode.TsExpire, playerBan.tsExpire);
		gnPlayerBan.add(ParameterCode.Reason, playerBan.reason);

		return gnPlayerBan;
	}

	/**
	 * Executes the generate player datas workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param playerDataKeys Provides the player data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerDatas(gamePlayer: GamePlayer, playerDataKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN player datas value used in the current execution flow.
		let gnPlayerDatas = new GNArray();

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.playerDatasSettings.length; i++) {
			// Stores the player datas settings item value used in the current execution flow.
			let playerDatasSettingsItem = gamePlayerSettings.playerDatasSettings[i];

			if (playerDataKeys == null || playerDataKeys.indexOf(playerDatasSettingsItem.key) != -1) {
				// Stores the player data value used in the current execution flow.
				let playerData = gamePlayer.getPlayerData(playerDatasSettingsItem.key);

				if (playerData != null) {
					// Stores the GearN player data value used in the current execution flow.
					let gnPlayerData = new GNHashtable();

					gnPlayerData.add(ParameterCode.Key, playerData.key);
					gnPlayerData.add(ParameterCode.Value, playerData.value);

					gnPlayerDatas.add(gnPlayerData);
				}
			}
		}

		return gnPlayerDatas;
	}

	/**
	 * Executes the generate player currencies workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param playerCurrencyKeys Provides the player currency keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerCurrencies(gamePlayer: GamePlayer, playerCurrencyKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN player currencies value used in the current execution flow.
		let gnPlayerCurrencies = new GNArray();

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.playerCurrenciesSettings.length; i++) {
			// Stores the player currencies settings item value used in the current execution flow.
			let playerCurrenciesSettingsItem = gamePlayerSettings.playerCurrenciesSettings[i];

			if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrenciesSettingsItem.key) != -1) {
				// Stores the player currency value used in the current execution flow.
				let playerCurrency = gamePlayer.getPlayerCurrency(playerCurrenciesSettingsItem.key);

				// Stores the GearN player currency value used in the current execution flow.
				let gnPlayerCurrency = new GNHashtable();
				gnPlayerCurrency.add(ParameterCode.Key, playerCurrenciesSettingsItem.key);

				if (playerCurrency != null) gnPlayerCurrency.add(ParameterCode.Value, playerCurrency.value);
				else gnPlayerCurrency.add(ParameterCode.Value, playerCurrenciesSettingsItem.initialValue);

				gnPlayerCurrencies.add(gnPlayerCurrency);
			}
		}

		return gnPlayerCurrencies;
	}

	/**
	 * Executes the generate player statistics workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param playerStatisticsKeys Provides the player statistics keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerStatistics(gamePlayer: GamePlayer, playerStatisticsKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN player statistics value used in the current execution flow.
		let gnPlayerStatistics = new GNArray();

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.playerStatisticsSettings.length; i++) {
			// Stores the player statistics settings item value used in the current execution flow.
			let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings[i];

			if (playerStatisticsKeys == null || playerStatisticsKeys.indexOf(playerStatisticsSettingsItem.key) != -1) {
				// Stores the player statistics value used in the current execution flow.
				let playerStatistics = gamePlayer.getPlayerStatistics(playerStatisticsSettingsItem.key);

				// Stores the GearN player statistic value used in the current execution flow.
				let gnPlayerStatistic = new GNHashtable();
				gnPlayerStatistic.add(ParameterCode.Key, playerStatisticsSettingsItem.key);

				if (playerStatistics != null) gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);
				else gnPlayerStatistic.add(ParameterCode.Value, playerStatisticsSettingsItem.initialValue);

				gnPlayerStatistics.add(gnPlayerStatistic);
			}
		}

		return gnPlayerStatistics;
	}

	/**
	 * Executes the generate player characters workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param characterCatalogIds Provides the character catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerCharacters(gamePlayer: GamePlayer, characterCatalogIds: Array<string>): GNArray {
		// Stores the GearN player characters value used in the current execution flow.
		let gnPlayerCharacters = new GNArray();

		// Stores the player characters value used in the current execution flow.
		let playerCharacters = gamePlayer.getAllPlayerCharacters();

		for (let i = 0; i < playerCharacters.length; i++) {
			// Stores the player character value used in the current execution flow.
			let playerCharacter = playerCharacters[i];

			if (characterCatalogIds == null || characterCatalogIds.indexOf(playerCharacter.catalogId) != -1) {
				// Stores the GearN player character value used in the current execution flow.
				let gnPlayerCharacter = new GNHashtable();

				gnPlayerCharacter.add(ParameterCode.CharacterId, playerCharacter.characterId);
				gnPlayerCharacter.add(ParameterCode.CatalogId, playerCharacter.catalogId);

				gnPlayerCharacters.add(gnPlayerCharacter);
			}
		}

		return gnPlayerCharacters;
	}

	/**
	 * Executes the generate player inventories workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param itemCatalogIds Provides the item catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerInventories(gamePlayer: GamePlayer, itemCatalogIds: Array<string>): GNArray {
		// Stores the GearN player inventories value used in the current execution flow.
		let gnPlayerInventories = new GNArray();

		// Stores the player inventories value used in the current execution flow.
		let playerInventories = gamePlayer.getAllPlayerInventories();

		for (let i = 0; i < playerInventories.length; i++) {
			// Stores the player inventory value used in the current execution flow.
			let playerInventory = playerInventories[i];

			if (itemCatalogIds == null || itemCatalogIds.indexOf(playerInventory.catalogId) != -1) {
				// Stores the GearN player inventory value used in the current execution flow.
				let gnPlayerInventory = new GNHashtable();

				gnPlayerInventory.add(ParameterCode.ItemId, playerInventory.itemId);
				gnPlayerInventory.add(ParameterCode.CatalogId, playerInventory.catalogId);
				gnPlayerInventory.add(ParameterCode.ClassId, playerInventory.classId);

				gnPlayerInventories.add(gnPlayerInventory);
			}
		}

		return gnPlayerInventories;
	}

	/**
	 * Executes the generate player groups workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param groupCatalogIds Provides the group catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerGroups(gamePlayer: GamePlayer, groupCatalogIds: Array<string>): GNArray {
		// Stores the GearN player groups value used in the current execution flow.
		let gnPlayerGroups = new GNArray();

		// Stores the player groups value used in the current execution flow.
		let playerGroups = gamePlayer.getAllPlayerGroups();

		for (let i = 0; i < playerGroups.length; i++) {
			// Stores the player group value used in the current execution flow.
			let playerGroup = playerGroups[i];

			if (groupCatalogIds == null || groupCatalogIds.indexOf(playerGroup.catalogId) != -1) {
				// Stores the GearN player group value used in the current execution flow.
				let gnPlayerGroup = new GNHashtable();

				gnPlayerGroup.add(ParameterCode.GroupId, playerGroup.groupId);
				gnPlayerGroup.add(ParameterCode.CatalogId, playerGroup.catalogId);
				gnPlayerGroup.add(ParameterCode.Status, playerGroup.status);
				gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, playerGroup.tsLastStatusUpdate);

				gnPlayerGroups.add(gnPlayerGroup);
			}
		}

		return gnPlayerGroups;
	}

	/**
	 * Executes the generate player friends workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param friendCatalogIds Provides the friend catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerFriends(gamePlayer: GamePlayer, friendCatalogIds: Array<string>): GNArray {
		// Stores the GearN player friends value used in the current execution flow.
		let gnPlayerFriends = new GNArray();

		// Stores the player friends value used in the current execution flow.
		let playerFriends = gamePlayer.getAllPlayerFriends();

		for (let i = 0; i < playerFriends.length; i++) {
			// Stores the player friend value used in the current execution flow.
			let playerFriend = playerFriends[i];

			if (friendCatalogIds == null || friendCatalogIds.indexOf(playerFriend.catalogId) != -1) {
				// Stores the GearN player friend value used in the current execution flow.
				let gnPlayerFriend = new GNHashtable();

				gnPlayerFriend.add(ParameterCode.FriendId, playerFriend.friendId);
				gnPlayerFriend.add(ParameterCode.CatalogId, playerFriend.catalogId);
				gnPlayerFriend.add(ParameterCode.Status, playerFriend.status);
				gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, playerFriend.tsLastStatusUpdate);

				gnPlayerFriends.add(gnPlayerFriend);
			}
		}

		return gnPlayerFriends;
	}

	/**
	 * Executes the generate timestamp last login workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsLastLogin(gamePlayer: GamePlayer): number {
		return gamePlayer.getTsLastLogin();
	}

	/**
	 * Executes the generate IP address create workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateIpAddressCreate(gamePlayer: GamePlayer): string {
		return gamePlayer.getIpAddressCreate();
	}

	/**
	 * Executes the generate country code workflow.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCountryCode(gamePlayer: GamePlayer): string {
		return gamePlayer.getCountryCode();
	}
}
