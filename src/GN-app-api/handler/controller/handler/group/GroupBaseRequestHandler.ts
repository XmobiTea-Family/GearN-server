import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { Group } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xCharacterCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xCharacterCatalogSettings";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { GroupMessageItem } from "./model/GroupMessageItem";
import { GroupPermissionRules, SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

export abstract class GroupBaseRequestHandler extends RequestHandler {
	// Stores the EXPIRED CACHE value used by this instance.
	private static readonly EXPIRED_CACHE = 15 * xDatetime.ONE_MINUTE_MILLISECOND;
	// Stores the GROUP MESSAGE CACHE LIMIT value used by this instance.
	private static readonly GROUP_MESSAGE_CACHE_LIMIT = 150;

	/**
	 * Checks whether get all.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	private isGetAll(infoRequestParam: InfoRequestParam): boolean {
		return infoRequestParam.catalogId
			&& infoRequestParam.members
			&& infoRequestParam.removeStatus

			&& infoRequestParam.segments
			&& infoRequestParam.customDatas
			&& infoRequestParam.displayName
			&& infoRequestParam.avatar
			&& infoRequestParam.tsCreate
			&& infoRequestParam.tags

			&& infoRequestParam.groupCurrencies
			&& infoRequestParam.groupStatistics
			&& infoRequestParam.groupDatas
			&& infoRequestParam.groupInventories;
	}

	/**
	 * Converts the to group find options.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected convertToGroupFindOptions(infoRequestParam: InfoRequestParam): GroupFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

		// Stores the answer value used in the current execution flow.
		let answer: GroupFindOptions = {};
		answer.groupId = true;
		answer.groupType = true;

		if (infoRequestParam.catalogId) answer.catalogId = infoRequestParam.catalogId;
		if (infoRequestParam.members) answer.members = infoRequestParam.members;
		if (infoRequestParam.removeStatus) answer.removeStatus = infoRequestParam.removeStatus;

		if (infoRequestParam.segments) answer.segments = infoRequestParam.segments;
		if (infoRequestParam.customDatas) answer.customDatas = infoRequestParam.customDatas;
		if (infoRequestParam.displayName) answer.displayName = infoRequestParam.displayName;
		if (infoRequestParam.avatar) answer.avatar = infoRequestParam.avatar;
		if (infoRequestParam.tsCreate) answer.tsCreate = infoRequestParam.tsCreate;
		if (infoRequestParam.tags) answer.tags = infoRequestParam.tags;

		if (infoRequestParam.groupCurrencies) answer.groupCurrencies = infoRequestParam.groupCurrencies;
		if (infoRequestParam.groupStatistics) answer.groupStatistics = infoRequestParam.groupStatistics;
		if (infoRequestParam.groupDatas) answer.groupDatas = infoRequestParam.groupDatas;
		if (infoRequestParam.groupInventories) answer.groupInventories = infoRequestParam.groupInventories;

		return answer;
	}

	/**
	 * Checks whether allow method.
	 * @param userId Indicates whether r ID should be used.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param permissionRules Provides the permission rules value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	protected async isAllowMethod(userId: string, groupId: string, gameId: string, permissionRules: GroupPermissionRules): Promise<boolean> {
		// Stores the answer value used in the current execution flow.
		let answer = false;

		if (permissionRules.otherSelfEnable) {
			answer = true;
		}

		if (!answer && permissionRules.selfEnable) {
			// Stores the group value used in the current execution flow.
			let group = await this.gnServer.getDatabase().loadGroupAsync(groupId, gameId, {
				members: true,
				groupType: true,
			});

			if (group != null) {
				// Stores the group type value used in the current execution flow.
				let groupType = group.getGroupType();
				if (groupType == OwnerType.GamePlayer) {
					// Stores the member item value used in the current execution flow.
					let memberItem = group.getMember(userId);
					if (memberItem != null && memberItem.status == GroupStatus.Member) {
						answer = true;
					}
				}
				else if (groupType == OwnerType.CharacterPlayer) {
					// Stores the game player value used in the current execution flow.
					let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerCharacters: true });

					if (gamePlayer != null) {
						// Stores the character players value used in the current execution flow.
						let characterPlayers = gamePlayer.getAllPlayerCharacters();

						if (characterPlayers != null) {
							for (let i = 0; i < characterPlayers.length; i++) {
								// Stores the character player value used in the current execution flow.
								let characterPlayer = characterPlayers[i];

								// Stores the member item value used in the current execution flow.
								let memberItem = group.getMember(characterPlayer.characterId);
								if (memberItem != null && memberItem.status == GroupStatus.Member) {
									answer = true;

									break;
								}
							}
						}
					}
				}
			}

			// // Stores the game player value used in the current execution flow.
			// let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerGroups: true });

			// if (gamePlayer != null) {
			// 	// Stores the player group value used in the current execution flow.
			// 	let playerGroup = gamePlayer.getPlayerGroup(groupId);

			// 	if (playerGroup != null && playerGroup.status == GroupStatus.Member) answer = true;
			// }
		}

		return answer;
	}

	/**
	 * Executes the generate info request parameter for owner workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOwner(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().group.getCatalogId.selfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().group.getMembers.selfEnable) {
			infoRequestParam.members = false;
		}

		if (!secretInfo.getPermission().group.getRemoveStatus.selfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().group.getSegment.selfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().group.getCustomData.selfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().group.getTag.selfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().group.getDisplayName.selfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().group.getTsCreate.selfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().group.getAvatar.selfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().group.getGroupCurrency.selfEnable) {
			infoRequestParam.groupCurrencies = false;
		}

		if (!secretInfo.getPermission().group.getGroupStatistics.selfEnable) {
			infoRequestParam.groupStatistics = false;
		}

		if (!secretInfo.getPermission().group.getGroupData.selfEnable) {
			infoRequestParam.groupDatas = false;
		}

		if (!secretInfo.getPermission().group.getGroupInventory.selfEnable) {
			infoRequestParam.groupInventories = false;
		}

	}

	/**
	 * Executes the generate info request parameter for other workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOther(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().group.getCatalogId.otherSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().group.getMembers.otherSelfEnable) {
			infoRequestParam.members = false;
		}

		if (!secretInfo.getPermission().group.getRemoveStatus.otherSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().group.getSegment.otherSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().group.getCustomData.otherSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().group.getTag.otherSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().group.getDisplayName.otherSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().group.getTsCreate.otherSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().group.getAvatar.otherSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().group.getGroupCurrency.otherSelfEnable) {
			infoRequestParam.groupCurrencies = false;
		}

		if (!secretInfo.getPermission().group.getGroupStatistics.otherSelfEnable) {
			infoRequestParam.groupStatistics = false;
		}

		if (!secretInfo.getPermission().group.getGroupData.otherSelfEnable) {
			infoRequestParam.groupDatas = false;
		}

		if (!secretInfo.getPermission().group.getGroupInventory.otherSelfEnable) {
			infoRequestParam.groupInventories = false;
		}

	}

	/**
	 * Executes the generate info request parameter for server workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForServer(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().group.getCatalogId.serverSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().group.getMembers.serverSelfEnable) {
			infoRequestParam.members = false;
		}

		if (!secretInfo.getPermission().group.getRemoveStatus.serverSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().group.getSegment.serverSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().group.getCustomData.serverSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().group.getTag.serverSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().group.getDisplayName.serverSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().group.getTsCreate.serverSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().group.getAvatar.serverSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().group.getGroupCurrency.serverSelfEnable) {
			infoRequestParam.groupCurrencies = false;
		}

		if (!secretInfo.getPermission().group.getGroupStatistics.serverSelfEnable) {
			infoRequestParam.groupStatistics = false;
		}

		if (!secretInfo.getPermission().group.getGroupData.serverSelfEnable) {
			infoRequestParam.groupDatas = false;
		}

		if (!secretInfo.getPermission().group.getGroupInventory.serverSelfEnable) {
			infoRequestParam.groupInventories = false;
		}

	}

	/**
	 * Executes the generate info request parameter for admin workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForAdmin(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().group.getCatalogId.adminSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().group.getMembers.adminSelfEnable) {
			infoRequestParam.members = false;
		}

		if (!secretInfo.getPermission().group.getRemoveStatus.adminSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().group.getSegment.adminSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().group.getCustomData.adminSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().group.getTag.adminSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().group.getDisplayName.adminSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().group.getTsCreate.adminSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().group.getAvatar.adminSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().group.getGroupCurrency.adminSelfEnable) {
			infoRequestParam.groupCurrencies = false;
		}

		if (!secretInfo.getPermission().group.getGroupStatistics.adminSelfEnable) {
			infoRequestParam.groupStatistics = false;
		}

		if (!secretInfo.getPermission().group.getGroupData.adminSelfEnable) {
			infoRequestParam.groupDatas = false;
		}

		if (!secretInfo.getPermission().group.getGroupInventory.adminSelfEnable) {
			infoRequestParam.groupInventories = false;
		}

	}

	/**
	 * Executes the generate info response parameters workflow.
	 * @param group Provides the group value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateInfoResponseParameters(group: Group, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
		// Stores the answer value used in the current execution flow.
		let answer = new GNHashtable();

		if (infoRequestParam.catalogId)
			answer.add(ParameterCode.CatalogId, this.generateCatalogId(group));

		if (infoRequestParam.members)
			answer.add(ParameterCode.Members, this.generateMembers(group));

		if (infoRequestParam.removeStatus)
			answer.add(ParameterCode.RemoveStatus, this.generateRemoveStatus(group));

		if (infoRequestParam.segments)
			answer.add(ParameterCode.Segments, this.generateSegments(group));

		if (infoRequestParam.customDatas)
			answer.add(ParameterCode.CustomDatas, this.generateCustomDatas(group, infoRequestParam.customDataKeys, gameId));

		if (infoRequestParam.displayName)
			answer.add(ParameterCode.DisplayName, this.generateDisplayName(group));

		if (infoRequestParam.avatar)
			answer.add(ParameterCode.Avatar, this.generateAvatar(group));

		if (infoRequestParam.tsCreate)
			answer.add(ParameterCode.TsCreate, this.generateTsCreate(group));

		if (infoRequestParam.tags)
			answer.add(ParameterCode.Tags, this.generateTags(group, infoRequestParam.tagKeys, gameId));

		if (infoRequestParam.groupDatas)
			answer.add(ParameterCode.GroupDatas, this.generateGroupDatas(group, infoRequestParam.groupDataKeys, gameId));

		if (infoRequestParam.groupCurrencies)
			answer.add(ParameterCode.GroupCurrencies, this.generateGroupCurrencies(group, infoRequestParam.groupCurrencyKeys, gameId));

		if (infoRequestParam.groupStatistics)
			answer.add(ParameterCode.GroupStatistics, this.generateGroupStatistics(group, infoRequestParam.groupStatisticsKeys, gameId));

		if (infoRequestParam.groupInventories)
			answer.add(ParameterCode.GroupInventories, this.generateGroupInventories(group, infoRequestParam.itemCatalogIds));

		return answer;
	}

	/**
	 * Executes the generate catalog ID workflow.
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCatalogId(group: Group): string {
		return group.getCatalogId();
	}

	/**
	 * Executes the generate members workflow.
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateMembers(group: Group): GNArray {
		// Stores the GearN members value used in the current execution flow.
		let gnMembers = new GNArray();

		// Stores the members value used in the current execution flow.
		let members = group.getAllMembers();

		for (let i = 0; i < members.length; i++) {
			// Stores the member value used in the current execution flow.
			let member = members[i];

			// Stores the GearN member value used in the current execution flow.
			let gnMember = new GNHashtable();

			gnMember.add(ParameterCode.MemberId, member.memberId);
			gnMember.add(ParameterCode.Status, member.status);

			gnMembers.add(gnMember);
		}

		return gnMembers;
	}

	/**
	 * Executes the generate remove status workflow.
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateRemoveStatus(group: Group): GNHashtable {
		// Stores the remove status value used in the current execution flow.
		let removeStatus = group.getRemoveStatus();

		// Stores the GearN remove status value used in the current execution flow.
		let gnRemoveStatus = new GNHashtable();

		gnRemoveStatus.add(ParameterCode.TsRemove, removeStatus.tsRemove);
		gnRemoveStatus.add(ParameterCode.Reason, removeStatus.reason);

		return gnRemoveStatus;
	}

	/**
	 * Executes the generate segments workflow.
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateSegments(group: Group): string[] {
		return group.getAllSegments();
	}

	/**
	 * Executes the generate custom datas workflow.
	 * @param group Provides the group value used by this operation.
	 * @param customDataKeys Provides the custom data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCustomDatas(group: Group, customDataKeys: string[], gameId: string): GNArray {
		// Stores the GearN custom datas value used in the current execution flow.
		let gnCustomDatas = new GNArray();

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

		for (let i = 0; i < groupSettings.customDatasSettings.length; i++) {
			// Stores the custom datas settings item value used in the current execution flow.
			let customDatasSettingsItem = groupSettings.customDatasSettings[i];

			if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = group.getCustomData(customDatasSettingsItem.key);

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
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateDisplayName(group: Group): string {
		return group.getDisplayName();;
	}

	/**
	 * Executes the generate avatar workflow.
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateAvatar(group: Group): GNHashtable {
		// Stores the avatar value used in the current execution flow.
		let avatar = group.getAvatar();

		// Stores the GearN avatar value used in the current execution flow.
		let gnAvatar = new GNHashtable();

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

		return gnAvatar;
	}

	/**
	 * Executes the generate timestamp create workflow.
	 * @param group Provides the group value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsCreate(group: Group): number {
		return group.getTsCreate();
	}

	/**
	 * Executes the generate tags workflow.
	 * @param group Provides the group value used by this operation.
	 * @param tagKeys Provides the tag keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTags(group: Group, tagKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN tags value used in the current execution flow.
		let gnTags = new GNArray();

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

		for (let i = 0; i < groupSettings.tagsSettings.length; i++) {
			// Stores the tags settings item value used in the current execution flow.
			let tagsSettingsItem = groupSettings.tagsSettings[i];

			if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = group.getTag(tagsSettingsItem.key);

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
	 * Executes the generate group datas workflow.
	 * @param group Provides the group value used by this operation.
	 * @param groupDataKeys Provides the group data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateGroupDatas(group: Group, groupDataKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN group datas value used in the current execution flow.
		let gnGroupDatas = new GNArray();

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

		for (let i = 0; i < groupSettings.groupDatasSettings.length; i++) {
			// Stores the group datas settings item value used in the current execution flow.
			let groupDatasSettingsItem = groupSettings.groupDatasSettings[i];

			if (groupDataKeys == null || groupDataKeys.indexOf(groupDatasSettingsItem.key) != -1) {
				// Stores the group data value used in the current execution flow.
				let groupData = group.getGroupData(groupDatasSettingsItem.key);

				if (groupData != null) {
					// Stores the GearN group data value used in the current execution flow.
					let gnGroupData = new GNHashtable();

					gnGroupData.add(ParameterCode.Key, groupData.key);
					gnGroupData.add(ParameterCode.Value, groupData.value);

					gnGroupDatas.add(gnGroupData);
				}
			}
		}

		return gnGroupDatas;
	}

	/**
	 * Executes the generate group currencies workflow.
	 * @param group Provides the group value used by this operation.
	 * @param groupCurrencyKeys Provides the group currency keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateGroupCurrencies(group: Group, groupCurrencyKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN group currencies value used in the current execution flow.
		let gnGroupCurrencies = new GNArray();

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

		for (let i = 0; i < groupSettings.groupCurrenciesSettings.length; i++) {
			// Stores the group currencies settings item value used in the current execution flow.
			let groupCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings[i];

			if (groupCurrencyKeys == null || groupCurrencyKeys.indexOf(groupCurrenciesSettingsItem.key) != -1) {
				// Stores the group currency value used in the current execution flow.
				let groupCurrency = group.getGroupCurrency(groupCurrenciesSettingsItem.key);

				// Stores the GearN group currency value used in the current execution flow.
				let gnGroupCurrency = new GNHashtable();
				gnGroupCurrency.add(ParameterCode.Key, groupCurrenciesSettingsItem.key);

				if (groupCurrency != null) gnGroupCurrency.add(ParameterCode.Value, groupCurrency.value);
				else gnGroupCurrency.add(ParameterCode.Value, groupCurrenciesSettingsItem.initialValue);

				gnGroupCurrencies.add(gnGroupCurrency);
			}
		}

		return gnGroupCurrencies;
	}

	/**
	 * Executes the generate group statistics workflow.
	 * @param group Provides the group value used by this operation.
	 * @param groupStatisticsKeys Provides the group statistics keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateGroupStatistics(group: Group, groupStatisticsKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN group statistics value used in the current execution flow.
		let gnGroupStatistics = new GNArray();

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

		for (let i = 0; i < groupSettings.groupStatisticsSettings.length; i++) {
			// Stores the group statistics settings item value used in the current execution flow.
			let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings[i];

			if (groupStatisticsKeys == null || groupStatisticsKeys.indexOf(groupStatisticsSettingsItem.key) != -1) {
				// Stores the group statistics value used in the current execution flow.
				let groupStatistics = group.getGroupStatistics(groupStatisticsSettingsItem.key);

				// Stores the GearN group statistic value used in the current execution flow.
				let gnGroupStatistic = new GNHashtable();
				gnGroupStatistic.add(ParameterCode.Key, groupStatisticsSettingsItem.key);

				if (groupStatistics != null) gnGroupStatistic.add(ParameterCode.Value, groupStatistics.value);
				else gnGroupStatistic.add(ParameterCode.Value, groupStatisticsSettingsItem.initialValue);

				gnGroupStatistics.add(gnGroupStatistic);
			}
		}

		return gnGroupStatistics;
	}

	/**
	 * Executes the generate group inventories workflow.
	 * @param group Provides the group value used by this operation.
	 * @param itemCatalogIds Provides the item catalog IDs value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateGroupInventories(group: Group, itemCatalogIds: Array<string>): GNArray {
		// Stores the GearN group inventories value used in the current execution flow.
		let gnGroupInventories = new GNArray();

		// Stores the group inventories value used in the current execution flow.
		let groupInventories = group.getAllGroupInventories();

		for (let i = 0; i < groupInventories.length; i++) {
			// Stores the group inventory value used in the current execution flow.
			let groupInventory = groupInventories[i];

			if (itemCatalogIds == null || itemCatalogIds.indexOf(groupInventory.catalogId) != -1) {
				// Stores the GearN group inventory value used in the current execution flow.
				let gnGroupInventory = new GNHashtable();

				gnGroupInventory.add(ParameterCode.ItemId, groupInventory.itemId);
				gnGroupInventory.add(ParameterCode.CatalogId, groupInventory.catalogId);
				gnGroupInventory.add(ParameterCode.ClassId, groupInventory.classId);

				gnGroupInventories.add(gnGroupInventory);
			}
		}

		return gnGroupInventories;
	}

	/**
	 * Checks whether member.
	 * @param group Provides the group value used by this operation.
	 * @param userId Indicates whether r ID should be used.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	protected async isMember(group: Group, userId: string, gameId: string): Promise<boolean> {
		// Stores the group type value used in the current execution flow.
		let groupType = <OwnerType>group.getGroupType();

		if (groupType == OwnerType.GamePlayer) {
			if (!group.hasMember(userId)) {
				return false;
			}

			// Stores the member item value used in the current execution flow.
			let memberItem = group.getMember(userId);

			if (memberItem.status == GroupStatus.Member) {
				return true;
			}
		}
		else if (groupType == OwnerType.CharacterPlayer) {
			// Stores the game player find options value used in the current execution flow.
			let gamePlayerFindOptions: GamePlayerFindOptions = {
				playerCharacters: true,
			}

			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);
			if (gamePlayer == null) {
				return false;
			}

			// Stores the player characters value used in the current execution flow.
			let playerCharacters = gamePlayer.getAllPlayerCharacters();
			// Tracks whether member.
			let isMember = false;

			for (let i = 0; i < playerCharacters.length; i++) {
				// Stores the player character value used in the current execution flow.
				let playerCharacter = playerCharacters[i];

				if (!group.hasMember(playerCharacter.characterId)) {
					continue;
				}

				// Stores the member item value used in the current execution flow.
				let memberItem = group.getMember(playerCharacter.characterId);

				if (memberItem.status != GroupStatus.Member) {
					continue;
				}

				isMember = true;
				break;
			}

			return isMember;
		}

		return false;
	}

	/**
	 * Returns the group messages.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @returns Returns the group messages.
	 */
	protected async getGroupMessages(groupId: string, gameId: string, skip: number, limit: number): Promise<GroupMessageItem[]> {

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(gameId);
		// Stores the cache key value used in the current execution flow.
		let cacheKey = "GroupMessages_" + groupId;

		if (!(await cacheData.isValid(cacheKey))) {
			await cacheData.setData(cacheKey, await this.getDatabaseGroupMessage(groupId, gameId), GroupBaseRequestHandler.EXPIRED_CACHE);
		}

		// Stores the group message items value used in the current execution flow.
		let groupMessageItems = await cacheData.getData<Array<GroupMessageItem>>(cacheKey);
		if (groupMessageItems == null) groupMessageItems = [];

		// Stores the answer value used in the current execution flow.
		let answer: GroupMessageItem[] = [];

		if (skip < 0) skip = 0;
		if (limit < 0) limit = 0;

		// Stores the start i value used in the current execution flow.
		let startI = skip;
		// Stores the end i value used in the current execution flow.
		let endI = skip + limit;
		if (endI > GroupBaseRequestHandler.GROUP_MESSAGE_CACHE_LIMIT) endI = GroupBaseRequestHandler.GROUP_MESSAGE_CACHE_LIMIT;

		for (let i = startI; i < endI; i++) {
			if (i < groupMessageItems.length) {
				answer.push(groupMessageItems[i]);
			}
			else {
				break;
			}
		}

		return answer;
	}

	/**
	 * Returns the database group message.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the database group message.
	 */
	private async getDatabaseGroupMessage(groupId: string, gameId: string): Promise<GroupMessageItem[]> {
		// Stores the group messages results value used in the current execution flow.
		let groupMessagesResults = await this.gnServer.getDatabase().loadGroupMessagesAsync(groupId, gameId, 0, 150);

		// Stores the answer value used in the current execution flow.
		let answer: GroupMessageItem[] = [];

		while (await groupMessagesResults.hasNext()) {
			// Stores the group message doc value used in the current execution flow.
			let groupMessageDoc = await groupMessagesResults.next();

			// Stores the group message item value used in the current execution flow.
			let groupMessageItem: GroupMessageItem = {
				tsCreate: groupMessageDoc["tsCreate"],
				message: groupMessageDoc["message"],
				senderId: groupMessageDoc["senderId"],
				senderType: groupMessageDoc["senderType"],
			}

			answer.push(groupMessageItem);
		}

		return answer;
	}

	/**
	 * Sends the group message.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupMessageItem Provides the group message item value used by this operation.
	 */
	protected async sendGroupMessage(groupId: string, gameId: string, groupMessageItem: GroupMessageItem): Promise<void> {

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(gameId);
		// Stores the cache key value used in the current execution flow.
		let cacheKey = "GroupMessages_" + groupId;

		if (!(await cacheData.isValid(cacheKey))) {
			await cacheData.setData(cacheKey, await this.getDatabaseGroupMessage(groupId, gameId), GroupBaseRequestHandler.EXPIRED_CACHE);
		}

		await this.gnServer.getDatabase().createGroupMessageAsync(groupId, gameId, groupMessageItem.senderId, groupMessageItem.senderType, groupMessageItem.message, groupMessageItem.tsCreate);

		// Stores the group message items value used in the current execution flow.
		let groupMessageItems = await cacheData.getData<Array<GroupMessageItem>>(cacheKey);
		if (groupMessageItems == null) groupMessageItems = [];

		groupMessageItems.unshift(groupMessageItem);
		if (groupMessageItems.length > GroupBaseRequestHandler.GROUP_MESSAGE_CACHE_LIMIT) groupMessageItems.splice(GroupBaseRequestHandler.GROUP_MESSAGE_CACHE_LIMIT);

		await cacheData.setData(cacheKey, groupMessageItems, GroupBaseRequestHandler.EXPIRED_CACHE);
	}
}
