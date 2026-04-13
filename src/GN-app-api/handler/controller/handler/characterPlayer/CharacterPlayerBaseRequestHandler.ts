import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xCharacterCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xCharacterCatalogSettings";
import { CharacterPlayerPermissionRules, SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

export abstract class CharacterPlayerBaseRequestHandler extends RequestHandler {
	/**
	 * Checks whether get all.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	private isGetAll(infoRequestParam: InfoRequestParam): boolean {
		return infoRequestParam.catalogId
			&& infoRequestParam.owner
			&& infoRequestParam.removeStatus
			&& infoRequestParam.segments
			&& infoRequestParam.customDatas
			&& infoRequestParam.displayName
			&& infoRequestParam.avatar
			&& infoRequestParam.tsCreate
			&& infoRequestParam.tags
			&& infoRequestParam.playerBan
			&& infoRequestParam.playerDatas
			&& infoRequestParam.playerCurrencies
			&& infoRequestParam.playerStatistics

			&& infoRequestParam.playerInventories
			&& infoRequestParam.playerGroups
			&& infoRequestParam.playerFriends

			&& infoRequestParam.tsLastLogin
			&& infoRequestParam.ipAddressCreate
			&& infoRequestParam.countryCode;
	}

	/**
	 * Converts the to character player find options.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected convertToCharacterPlayerFindOptions(infoRequestParam: InfoRequestParam): CharacterPlayerFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

		// Stores the answer value used in the current execution flow.
		let answer: CharacterPlayerFindOptions = {};
		answer.characterId = true;

		if (infoRequestParam.catalogId) answer.catalogId = infoRequestParam.catalogId;
		if (infoRequestParam.owner) answer.owner = infoRequestParam.owner;
		if (infoRequestParam.removeStatus) answer.removeStatus = infoRequestParam.removeStatus;

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

		if (infoRequestParam.playerInventories) answer.playerInventories = infoRequestParam.playerInventories;
		if (infoRequestParam.playerGroups) answer.playerGroups = infoRequestParam.playerGroups;
		if (infoRequestParam.playerFriends) answer.playerFriends = infoRequestParam.playerFriends;

		if (infoRequestParam.tsLastLogin) answer.tsLastLogin = infoRequestParam.tsLastLogin;
		if (infoRequestParam.ipAddressCreate) answer.ipAddressCreate = infoRequestParam.ipAddressCreate;
		if (infoRequestParam.countryCode) answer.countryCode = infoRequestParam.countryCode;

		return answer;
	}

	/**
	 * Checks whether allow method.
	 * @param userId Indicates whether r ID should be used.
	 * @param characterId Provides the character ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param permissionRules Provides the permission rules value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	protected async isAllowMethod(userId: string, characterId: string, gameId: string, permissionRules: CharacterPlayerPermissionRules): Promise<boolean> {
		// Stores the answer value used in the current execution flow.
		let answer = false;

		if (permissionRules.otherSelfEnable) {
			answer = true;
		}

		if (!answer && permissionRules.selfEnable) {
			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerCharacters: true });

			if (gamePlayer != null) {
				if (gamePlayer.hasPlayerCharacter(characterId)) answer = true;
			}
		}

		return answer;
	}

	/**
	 * Executes the generate info request parameter for owner workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOwner(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().characterPlayer.getCatalogId.selfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getOwner.selfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getRemoveStatus.selfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getSegment.selfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTag.selfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getDisplayName.selfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsCreate.selfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getIpAddressCreate.selfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.selfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerBan.selfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCountryCode.selfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getAvatar.selfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.selfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerStatistics.selfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCustomData.selfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerData.selfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInventory.selfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerGroup.selfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.selfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

	/**
	 * Executes the generate info request parameter for other workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOther(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().characterPlayer.getCatalogId.otherSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getOwner.otherSelfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getRemoveStatus.otherSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getSegment.otherSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTag.otherSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getDisplayName.otherSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsCreate.otherSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getIpAddressCreate.otherSelfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.otherSelfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerBan.otherSelfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCountryCode.otherSelfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getAvatar.otherSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.otherSelfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerStatistics.otherSelfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCustomData.otherSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerData.otherSelfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInventory.otherSelfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerGroup.otherSelfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.otherSelfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

	/**
	 * Executes the generate info request parameter for server workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForServer(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().characterPlayer.getCatalogId.serverSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getOwner.serverSelfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getRemoveStatus.serverSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getSegment.serverSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTag.serverSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getDisplayName.serverSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsCreate.serverSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getIpAddressCreate.serverSelfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.serverSelfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerBan.serverSelfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCountryCode.serverSelfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getAvatar.serverSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.serverSelfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerStatistics.serverSelfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCustomData.serverSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerData.serverSelfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInventory.serverSelfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerGroup.serverSelfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.serverSelfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

	/**
	 * Executes the generate info request parameter for admin workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForAdmin(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().characterPlayer.getCatalogId.adminSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getOwner.adminSelfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getRemoveStatus.adminSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getSegment.adminSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTag.adminSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getDisplayName.adminSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsCreate.adminSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getIpAddressCreate.adminSelfEnable) {
			infoRequestParam.ipAddressCreate = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.adminSelfEnable) {
			infoRequestParam.tsLastLogin = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerBan.adminSelfEnable) {
			infoRequestParam.playerBan = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCountryCode.adminSelfEnable) {
			infoRequestParam.countryCode = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getAvatar.adminSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.adminSelfEnable) {
			infoRequestParam.playerCurrencies = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerStatistics.adminSelfEnable) {
			infoRequestParam.playerStatistics = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getCustomData.adminSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerData.adminSelfEnable) {
			infoRequestParam.playerDatas = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerInventory.adminSelfEnable) {
			infoRequestParam.playerInventories = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerGroup.adminSelfEnable) {
			infoRequestParam.playerGroups = false;
		}

		if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.adminSelfEnable) {
			infoRequestParam.playerFriends = false;
		}
	}

	/**
	 * Executes the generate info response parameters workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateInfoResponseParameters(characterPlayer: CharacterPlayer, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
		// Stores the answer value used in the current execution flow.
		let answer = new GNHashtable();

		if (infoRequestParam.catalogId)
			answer.add(ParameterCode.CatalogId, this.generateCatalogId(characterPlayer));

		if (infoRequestParam.owner)
			answer.add(ParameterCode.Owner, this.generateOwner(characterPlayer));

		if (infoRequestParam.removeStatus)
			answer.add(ParameterCode.RemoveStatus, this.generateRemoveStatus(characterPlayer));

		if (infoRequestParam.segments)
			answer.add(ParameterCode.Segments, this.generateSegments(characterPlayer));

		if (infoRequestParam.customDatas)
			answer.add(ParameterCode.CustomDatas, this.generateCustomDatas(characterPlayer, infoRequestParam.customDataKeys, gameId));

		if (infoRequestParam.displayName)
			answer.add(ParameterCode.DisplayName, this.generateDisplayName(characterPlayer));

		if (infoRequestParam.avatar)
			answer.add(ParameterCode.Avatar, this.generateAvatar(characterPlayer));

		if (infoRequestParam.tsCreate)
			answer.add(ParameterCode.TsCreate, this.generateTsCreate(characterPlayer));

		if (infoRequestParam.tags)
			answer.add(ParameterCode.Tags, this.generateTags(characterPlayer, infoRequestParam.tagKeys, gameId));

		if (infoRequestParam.playerBan)
			answer.add(ParameterCode.PlayerBan, this.generatePlayerBan(characterPlayer));

		if (infoRequestParam.playerDatas)
			answer.add(ParameterCode.PlayerDatas, this.generatePlayerDatas(characterPlayer, infoRequestParam.playerDataKeys, gameId));

		if (infoRequestParam.playerCurrencies)
			answer.add(ParameterCode.PlayerCurrencies, this.generatePlayerCurrencies(characterPlayer, infoRequestParam.playerCurrencyKeys, gameId));

		if (infoRequestParam.playerStatistics)
			answer.add(ParameterCode.PlayerStatistics, this.generatePlayerStatistics(characterPlayer, infoRequestParam.playerStatisticsKeys, gameId));

		if (infoRequestParam.playerInventories)
			answer.add(ParameterCode.PlayerInventories, this.generatePlayerInventories(characterPlayer, infoRequestParam.itemCatalogIds));

		if (infoRequestParam.playerGroups)
			answer.add(ParameterCode.PlayerGroups, this.generatePlayerGroups(characterPlayer, infoRequestParam.groupCatalogIds));

		if (infoRequestParam.playerFriends)
			answer.add(ParameterCode.PlayerFriends, this.generatePlayerFriends(characterPlayer, infoRequestParam.friendCatalogIds));

		if (infoRequestParam.tsLastLogin)
			answer.add(ParameterCode.TsLastLogin, this.generateTsLastLogin(characterPlayer));

		if (infoRequestParam.ipAddressCreate)
			answer.add(ParameterCode.IpAddressCreate, this.generateIpAddressCreate(characterPlayer));

		if (infoRequestParam.countryCode)
			answer.add(ParameterCode.CountryCode, this.generateCountryCode(characterPlayer));

		return answer;
	}

	/**
	 * Executes the generate catalog ID workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCatalogId(characterPlayer: CharacterPlayer): string {
		return characterPlayer.getCatalogId();
	}

	/**
	 * Executes the generate owner workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateOwner(characterPlayer: CharacterPlayer): GNHashtable {
		// Stores the owner value used in the current execution flow.
		let owner = characterPlayer.getOwner();

		// Stores the GearN owner value used in the current execution flow.
		let gnOwner = new GNHashtable();

		gnOwner.add(ParameterCode.Type, owner.type);
		gnOwner.add(ParameterCode.Id, owner.id);

		return gnOwner;
	}

	/**
	 * Executes the generate remove status workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateRemoveStatus(characterPlayer: CharacterPlayer): GNHashtable {
		// Stores the remove status value used in the current execution flow.
		let removeStatus = characterPlayer.getRemoveStatus();

		// Stores the GearN remove status value used in the current execution flow.
		let gnRemoveStatus = new GNHashtable();

		gnRemoveStatus.add(ParameterCode.TsRemove, removeStatus.tsRemove);
		gnRemoveStatus.add(ParameterCode.Reason, removeStatus.reason);

		return gnRemoveStatus;
	}

	/**
	 * Executes the generate segments workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateSegments(characterPlayer: CharacterPlayer): string[] {
		return characterPlayer.getAllSegments();
	}

	/**
	 * Executes the generate custom datas workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param customDataKeys Provides the custom data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCustomDatas(characterPlayer: CharacterPlayer, customDataKeys: string[], gameId: string): GNArray {
		// Stores the GearN custom datas value used in the current execution flow.
		let gnCustomDatas = new GNArray();

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

		for (let i = 0; i < characterPlayerSettings.customDatasSettings.length; i++) {
			// Stores the custom datas settings item value used in the current execution flow.
			let customDatasSettingsItem = characterPlayerSettings.customDatasSettings[i];

			if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = characterPlayer.getCustomData(customDatasSettingsItem.key);

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateDisplayName(characterPlayer: CharacterPlayer): string {
		return characterPlayer.getDisplayName();
	}

	/**
	 * Executes the generate avatar workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateAvatar(characterPlayer: CharacterPlayer): GNHashtable {
		// Stores the avatar value used in the current execution flow.
		let avatar = characterPlayer.getAvatar();

		// Stores the GearN avatar value used in the current execution flow.
		let gnAvatar = new GNHashtable();

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

		return gnAvatar;
	}

	/**
	 * Executes the generate timestamp create workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsCreate(characterPlayer: CharacterPlayer): number {
		return characterPlayer.getTsCreate();
	}

	/**
	 * Executes the generate tags workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param tagKeys Provides the tag keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTags(characterPlayer: CharacterPlayer, tagKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN tags value used in the current execution flow.
		let gnTags = new GNArray();

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

		for (let i = 0; i < characterPlayerSettings.tagsSettings.length; i++) {
			// Stores the tags settings item value used in the current execution flow.
			let tagsSettingsItem = characterPlayerSettings.tagsSettings[i];

			if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = characterPlayer.getTag(tagsSettingsItem.key);

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerBan(characterPlayer: CharacterPlayer): GNHashtable {
		// Stores the GearN player ban value used in the current execution flow.
		let gnPlayerBan = new GNHashtable();

		// Stores the player ban value used in the current execution flow.
		let playerBan = characterPlayer.getPlayerBan();

		gnPlayerBan.add(ParameterCode.TsExpire, playerBan.tsExpire);
		gnPlayerBan.add(ParameterCode.Reason, playerBan.reason);

		return gnPlayerBan;
	}

	/**
	 * Executes the generate player datas workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param playerDataKeys Provides the player data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerDatas(characterPlayer: CharacterPlayer, playerDataKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN player datas value used in the current execution flow.
		let gnPlayerDatas = new GNArray();

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

		for (let i = 0; i < characterPlayerSettings.playerDatasSettings.length; i++) {
			// Stores the player datas settings item value used in the current execution flow.
			let playerDatasSettingsItem = characterPlayerSettings.playerDatasSettings[i];

			if (playerDataKeys == null || playerDataKeys.indexOf(playerDatasSettingsItem.key) != -1) {
				// Stores the player data value used in the current execution flow.
				let playerData = characterPlayer.getPlayerData(playerDatasSettingsItem.key);

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param playerCurrencyKeys Provides the player currency keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerCurrencies(characterPlayer: CharacterPlayer, playerCurrencyKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN player currencies value used in the current execution flow.
		let gnPlayerCurrencies = new GNArray();

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

		for (let i = 0; i < characterPlayerSettings.playerCurrenciesSettings.length; i++) {
			// Stores the player currencies settings item value used in the current execution flow.
			let playerCurrenciesSettingsItem = characterPlayerSettings.playerCurrenciesSettings[i];

			if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrenciesSettingsItem.key) != -1) {
				// Stores the player currency value used in the current execution flow.
				let playerCurrency = characterPlayer.getPlayerCurrency(playerCurrenciesSettingsItem.key);

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param playerStatisticsKeys Provides the player statistics keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerStatistics(characterPlayer: CharacterPlayer, playerStatisticsKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN player statistics value used in the current execution flow.
		let gnPlayerStatistics = new GNArray();

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

		for (let i = 0; i < characterPlayerSettings.playerStatisticsSettings.length; i++) {
			// Stores the player statistics settings item value used in the current execution flow.
			let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings[i];

			if (playerStatisticsKeys == null || playerStatisticsKeys.indexOf(playerStatisticsSettingsItem.key) != -1) {
				// Stores the player statistics value used in the current execution flow.
				let playerStatistics = characterPlayer.getPlayerStatistics(playerStatisticsSettingsItem.key);

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
	 * Executes the generate player inventories workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param itemCatalogIds Provides the item catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerInventories(characterPlayer: CharacterPlayer, itemCatalogIds: Array<string>): GNArray {
		// Stores the GearN player inventories value used in the current execution flow.
		let gnPlayerInventories = new GNArray();

		// Stores the player inventories value used in the current execution flow.
		let playerInventories = characterPlayer.getAllPlayerInventories();

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param groupCatalogIds Provides the group catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerGroups(characterPlayer: CharacterPlayer, groupCatalogIds: Array<string>): GNArray {
		// Stores the GearN player groups value used in the current execution flow.
		let gnPlayerGroups = new GNArray();

		// Stores the player groups value used in the current execution flow.
		let playerGroups = characterPlayer.getAllPlayerGroups();

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param friendCatalogIds Provides the friend catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePlayerFriends(characterPlayer: CharacterPlayer, friendCatalogIds: Array<string>): GNArray {
		// Stores the GearN player friends value used in the current execution flow.
		let gnPlayerFriends = new GNArray();

		// Stores the player friends value used in the current execution flow.
		let playerFriends = characterPlayer.getAllPlayerFriends();

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
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsLastLogin(characterPlayer: CharacterPlayer): number {
		return characterPlayer.getTsLastLogin();
	}

	/**
	 * Executes the generate IP address create workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateIpAddressCreate(characterPlayer: CharacterPlayer): string {
		return characterPlayer.getIpAddressCreate();
	}

	/**
	 * Executes the generate country code workflow.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCountryCode(characterPlayer: CharacterPlayer): string {
		return characterPlayer.getCountryCode();
	}

}
