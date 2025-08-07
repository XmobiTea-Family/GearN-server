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

	protected convertToGamePlayerFindOptions(infoRequestParam: InfoRequestParam): GamePlayerFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

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
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.selfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

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
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.otherSelfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

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
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.serverSelfEnable) {
			infoRequestParam.playerFriends = false;
		}

	}

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
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.adminSelfEnable) {
			infoRequestParam.playerFriends = false;
		}

	}

	protected generateInfoResponseParameters(gamePlayer: GamePlayer, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
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

	protected generateSegments(gamePlayer: GamePlayer): string[] {
		return gamePlayer.getAllSegments();
	}

	protected generateCustomDatas(gamePlayer: GamePlayer, customDataKeys: string[], gameId: string): GNArray {
		let gnCustomDatas = new GNArray();

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.customDatasSettings.length; i++) {
			let customDatasSettingsItem = gamePlayerSettings.customDatasSettings[i];

			if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
				let value = gamePlayer.getCustomData(customDatasSettingsItem.key);

				if (value != null) {
					let gnCustomData = new GNHashtable();

					gnCustomData.add(ParameterCode.Key, customDatasSettingsItem.key);
					gnCustomData.add(ParameterCode.Value, value);

					gnCustomDatas.add(gnCustomData);
				}
			}
		}

		return gnCustomDatas;
	}

	protected generateDisplayName(gamePlayer: GamePlayer): string {
		return gamePlayer.getDisplayName();
	}

	protected generateAvatar(gamePlayer: GamePlayer): GNHashtable {
		let avatar = gamePlayer.getAvatar();

		let gnAvatar = new GNHashtable();

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

		return gnAvatar;
	}

	protected generateTsCreate(gamePlayer: GamePlayer): number {
		return gamePlayer.getTsCreate();
	}

	protected generateTags(gamePlayer: GamePlayer, tagKeys: Array<string>, gameId: string): GNArray {
		let gnTags = new GNArray();

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.tagsSettings.length; i++) {
			let tagsSettingsItem = gamePlayerSettings.tagsSettings[i];

			if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
				let value = gamePlayer.getTag(tagsSettingsItem.key);

				if (value != null) {
					let gnTag = new GNHashtable();

					gnTag.add(ParameterCode.Key, tagsSettingsItem.key);
					gnTag.add(ParameterCode.Value, value);

					gnTags.add(gnTag);
				}
			}
		}

		return gnTags;
	}

	protected generatePlayerBan(gamePlayer: GamePlayer): GNHashtable {
		let gnPlayerBan = new GNHashtable();

		let playerBan = gamePlayer.getPlayerBan();

		gnPlayerBan.add(ParameterCode.TsExpire, playerBan.tsExpire);
		gnPlayerBan.add(ParameterCode.Reason, playerBan.reason);

		return gnPlayerBan;
	}

	protected generatePlayerDatas(gamePlayer: GamePlayer, playerDataKeys: Array<string>, gameId: string): GNArray {
		let gnPlayerDatas = new GNArray();

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.playerDatasSettings.length; i++) {
			let playerDatasSettingsItem = gamePlayerSettings.playerDatasSettings[i];

			if (playerDataKeys == null || playerDataKeys.indexOf(playerDatasSettingsItem.key) != -1) {
				let playerData = gamePlayer.getPlayerData(playerDatasSettingsItem.key);

				if (playerData != null) {
					let gnPlayerData = new GNHashtable();

					gnPlayerData.add(ParameterCode.Key, playerData.key);
					gnPlayerData.add(ParameterCode.Value, playerData.value);

					gnPlayerDatas.add(gnPlayerData);
				}
			}
		}

		return gnPlayerDatas;
	}

	protected generatePlayerCurrencies(gamePlayer: GamePlayer, playerCurrencyKeys: Array<string>, gameId: string): GNArray {
		let gnPlayerCurrencies = new GNArray();

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.playerCurrencySettings.length; i++) {
			let playerCurrencySettingsItem = gamePlayerSettings.playerCurrencySettings[i];

			if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrencySettingsItem.key) != -1) {
				let playerCurrency = gamePlayer.getPlayerCurrency(playerCurrencySettingsItem.key);

				let gnPlayerCurrency = new GNHashtable();
				gnPlayerCurrency.add(ParameterCode.Key, playerCurrencySettingsItem.key);

				if (playerCurrency != null) gnPlayerCurrency.add(ParameterCode.Value, playerCurrency.value);
				else gnPlayerCurrency.add(ParameterCode.Value, playerCurrencySettingsItem.initialValue);

				gnPlayerCurrencies.add(gnPlayerCurrency);
			}
		}

		return gnPlayerCurrencies;
	}

	protected generatePlayerStatistics(gamePlayer: GamePlayer, playerStatisticsKeys: Array<string>, gameId: string): GNArray {
		let gnPlayerStatistics = new GNArray();

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId);

		for (let i = 0; i < gamePlayerSettings.playerStatisticsSettings.length; i++) {
			let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings[i];

			if (playerStatisticsKeys == null || playerStatisticsKeys.indexOf(playerStatisticsSettingsItem.key) != -1) {
				let playerStatistics = gamePlayer.getPlayerStatistics(playerStatisticsSettingsItem.key);

				let gnPlayerStatistic = new GNHashtable();
				gnPlayerStatistic.add(ParameterCode.Key, playerStatisticsSettingsItem.key);

				if (playerStatistics != null) gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);
				else gnPlayerStatistic.add(ParameterCode.Value, playerStatisticsSettingsItem.initialValue);

				gnPlayerStatistics.add(gnPlayerStatistic);
			}
		}

		return gnPlayerStatistics;
	}

	protected generatePlayerCharacters(gamePlayer: GamePlayer, characterCatalogIds: Array<string>): GNArray {
		let gnPlayerCharacters = new GNArray();

		let playerCharacters = gamePlayer.getAllPlayerCharacters();

		for (let i = 0; i < playerCharacters.length; i++) {
			let playerCharacter = playerCharacters[i];

			if (characterCatalogIds == null || characterCatalogIds.indexOf(playerCharacter.catalogId) != -1) {
				let gnPlayerCharacter = new GNHashtable();

				gnPlayerCharacter.add(ParameterCode.CharacterId, playerCharacter.characterId);
				gnPlayerCharacter.add(ParameterCode.CatalogId, playerCharacter.catalogId);

				gnPlayerCharacters.add(gnPlayerCharacter);
			}
		}

		return gnPlayerCharacters;
	}

	protected generatePlayerInventories(gamePlayer: GamePlayer, itemCatalogIds: Array<string>): GNArray {
		let gnPlayerInventories = new GNArray();

		let playerInventories = gamePlayer.getAllPlayerInventories();

		for (let i = 0; i < playerInventories.length; i++) {
			let playerInventory = playerInventories[i];

			if (itemCatalogIds == null || itemCatalogIds.indexOf(playerInventory.catalogId) != -1) {
				let gnPlayerInventory = new GNHashtable();

				gnPlayerInventory.add(ParameterCode.ItemId, playerInventory.itemId);
				gnPlayerInventory.add(ParameterCode.CatalogId, playerInventory.catalogId);
				gnPlayerInventory.add(ParameterCode.ClassId, playerInventory.classId);

				gnPlayerInventories.add(gnPlayerInventory);
			}
		}

		return gnPlayerInventories;
	}

	protected generatePlayerGroups(gamePlayer: GamePlayer, groupCatalogIds: Array<string>): GNArray {
		let gnPlayerGroups = new GNArray();

		let playerGroups = gamePlayer.getAllPlayerGroups();

		for (let i = 0; i < playerGroups.length; i++) {
			let playerGroup = playerGroups[i];

			if (groupCatalogIds == null || groupCatalogIds.indexOf(playerGroup.catalogId) != -1) {
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

	protected generatePlayerFriends(gamePlayer: GamePlayer, friendCatalogIds: Array<string>): GNArray {
		let gnPlayerFriends = new GNArray();

		let playerFriends = gamePlayer.getAllPlayerFriends();

		for (let i = 0; i < playerFriends.length; i++) {
			let playerFriend = playerFriends[i];

			if (friendCatalogIds == null || friendCatalogIds.indexOf(playerFriend.catalogId) != -1) {
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

	protected generateTsLastLogin(gamePlayer: GamePlayer): number {
		return gamePlayer.getTsLastLogin();
	}

	protected generateIpAddressCreate(gamePlayer: GamePlayer): string {
		return gamePlayer.getIpAddressCreate();
	}

	protected generateCountryCode(gamePlayer: GamePlayer): string {
		return gamePlayer.getCountryCode();
	}
}
