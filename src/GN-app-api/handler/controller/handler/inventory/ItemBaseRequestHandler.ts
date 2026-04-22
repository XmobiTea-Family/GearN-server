import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { Inventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { xItemCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xItemCatalogSettings";
import { InventoryPermissionRules, SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";

export abstract class ItemBaseRequestHandler extends RequestHandler {
	/**
	 * Checks whether get all.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	private isGetAll(infoRequestParam: InfoRequestParam): boolean {
		return infoRequestParam.catalogId
			&& infoRequestParam.classId
			&& infoRequestParam.itemType
			&& infoRequestParam.amount
			&& infoRequestParam.owner
			&& infoRequestParam.removeStatus

			&& infoRequestParam.segments
			&& infoRequestParam.customDatas
			&& infoRequestParam.displayName
			&& infoRequestParam.avatar
			&& infoRequestParam.tsCreate
			&& infoRequestParam.tags

			&& infoRequestParam.itemStatistics
			&& infoRequestParam.itemDatas;
	}

	/**
	 * Converts the to inventory find options.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected convertToInventoryFindOptions(infoRequestParam: InfoRequestParam): InventoryFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

		// Stores the answer value used in the current execution flow.
		let answer: InventoryFindOptions = {};
		answer.itemId = true;
		answer.itemType = true;

		if (infoRequestParam.catalogId) answer.catalogId = infoRequestParam.catalogId;
		if (infoRequestParam.classId) answer.classId = infoRequestParam.classId;
		if (infoRequestParam.itemType) answer.itemType = infoRequestParam.itemType;
		if (infoRequestParam.amount) answer.amount = infoRequestParam.amount;
		if (infoRequestParam.owner) answer.owner = infoRequestParam.owner;
		if (infoRequestParam.removeStatus) answer.removeStatus = infoRequestParam.removeStatus;

		if (infoRequestParam.segments) answer.segments = infoRequestParam.segments;
		if (infoRequestParam.customDatas) answer.customDatas = infoRequestParam.customDatas;
		if (infoRequestParam.displayName) answer.displayName = infoRequestParam.displayName;
		if (infoRequestParam.avatar) answer.avatar = infoRequestParam.avatar;
		if (infoRequestParam.tsCreate) answer.tsCreate = infoRequestParam.tsCreate;
		if (infoRequestParam.tags) answer.tags = infoRequestParam.tags;

		if (infoRequestParam.itemStatistics) answer.itemStatistics = infoRequestParam.itemStatistics;
		if (infoRequestParam.itemDatas) answer.itemDatas = infoRequestParam.itemDatas;

		return answer;
	}

	/**
	 * Checks whether allow method.
	 * @param userId Indicates whether r ID should be used.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param permissionRules Provides the permission rules value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	protected async isAllowMethod(userId: string, itemId: string, gameId: string, permissionRules: InventoryPermissionRules): Promise<boolean> {
		// Stores the answer value used in the current execution flow.
		let answer = false;

		if (permissionRules.otherSelfEnable) {
			answer = true;
		}

		if (!answer && permissionRules.selfEnable) {
			// Stores the inventory value used in the current execution flow.
			let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(itemId, gameId, { owner: true });

			if (inventory != null) {
				// Stores the owner value used in the current execution flow.
				let owner = inventory.getOwner();
				if (owner != null) {
					if (owner.type == OwnerType.GamePlayer) {
						if (owner.id == userId) {
							answer = true;
						}
					}
					else if (owner.type == OwnerType.CharacterPlayer) {
						// Stores the game player value used in the current execution flow.
						let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerCharacters: true });

						if (gamePlayer != null) {
							if (gamePlayer.hasPlayerCharacter(owner.id)) {
								answer = true;
							}
						}
					}
					else if (owner.type == OwnerType.Group) {
						// Stores the game player value used in the current execution flow.
						let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerGroups: true });

						if (gamePlayer != null) {
							// Stores the player group value used in the current execution flow.
							let groupItem = gamePlayer.getPlayerGroup(owner.id);

							if (groupItem != null && groupItem.status == GroupStatus.Member) {
								answer = true;
							}
						}
					}
				}
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

		if (!secretInfo.getPermission().inventory.getCatalogId.selfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().inventory.getClassId.selfEnable) {
			infoRequestParam.classId = false;
		}

		if (!secretInfo.getPermission().inventory.getItemType.selfEnable) {
			infoRequestParam.itemType = false;
		}

		if (!secretInfo.getPermission().inventory.getAmount.selfEnable) {
			infoRequestParam.amount = false;
		}

		if (!secretInfo.getPermission().inventory.getOwner.selfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().inventory.getRemoveStatus.selfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().inventory.getSegment.selfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().inventory.getCustomData.selfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().inventory.getTag.selfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().inventory.getDisplayName.selfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().inventory.getTsCreate.selfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().inventory.getAvatar.selfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().inventory.getItemStatistics.selfEnable) {
			infoRequestParam.itemStatistics = false;
		}

		if (!secretInfo.getPermission().inventory.getItemData.selfEnable) {
			infoRequestParam.itemDatas = false;
		}

	}

	/**
	 * Executes the generate info request parameter for other workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForOther(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().inventory.getCatalogId.otherSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().inventory.getClassId.otherSelfEnable) {
			infoRequestParam.classId = false;
		}

		if (!secretInfo.getPermission().inventory.getItemType.otherSelfEnable) {
			infoRequestParam.itemType = false;
		}

		if (!secretInfo.getPermission().inventory.getAmount.otherSelfEnable) {
			infoRequestParam.amount = false;
		}

		if (!secretInfo.getPermission().inventory.getOwner.otherSelfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().inventory.getRemoveStatus.otherSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().inventory.getSegment.otherSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().inventory.getCustomData.otherSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().inventory.getTag.otherSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().inventory.getDisplayName.otherSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().inventory.getTsCreate.otherSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().inventory.getAvatar.otherSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().inventory.getItemStatistics.otherSelfEnable) {
			infoRequestParam.itemStatistics = false;
		}

		if (!secretInfo.getPermission().inventory.getItemData.otherSelfEnable) {
			infoRequestParam.itemDatas = false;
		}

	}

	/**
	 * Executes the generate info request parameter for server workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForServer(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().inventory.getCatalogId.serverSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().inventory.getClassId.serverSelfEnable) {
			infoRequestParam.classId = false;
		}

		if (!secretInfo.getPermission().inventory.getItemType.serverSelfEnable) {
			infoRequestParam.itemType = false;
		}

		if (!secretInfo.getPermission().inventory.getAmount.serverSelfEnable) {
			infoRequestParam.amount = false;
		}

		if (!secretInfo.getPermission().inventory.getOwner.serverSelfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().inventory.getRemoveStatus.serverSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().inventory.getSegment.serverSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().inventory.getCustomData.serverSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().inventory.getTag.serverSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().inventory.getDisplayName.serverSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().inventory.getTsCreate.serverSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().inventory.getAvatar.serverSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().inventory.getItemStatistics.serverSelfEnable) {
			infoRequestParam.itemStatistics = false;
		}

		if (!secretInfo.getPermission().inventory.getItemData.serverSelfEnable) {
			infoRequestParam.itemDatas = false;
		}

	}

	/**
	 * Executes the generate info request parameter for admin workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 */
	protected generateInfoRequestParamForAdmin(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {

		if (!secretInfo.getPermission().inventory.getCatalogId.adminSelfEnable) {
			infoRequestParam.catalogId = false;
		}

		if (!secretInfo.getPermission().inventory.getClassId.adminSelfEnable) {
			infoRequestParam.classId = false;
		}

		if (!secretInfo.getPermission().inventory.getItemType.adminSelfEnable) {
			infoRequestParam.itemType = false;
		}

		if (!secretInfo.getPermission().inventory.getAmount.adminSelfEnable) {
			infoRequestParam.amount = false;
		}

		if (!secretInfo.getPermission().inventory.getOwner.adminSelfEnable) {
			infoRequestParam.owner = false;
		}

		if (!secretInfo.getPermission().inventory.getRemoveStatus.adminSelfEnable) {
			infoRequestParam.removeStatus = false;
		}

		if (!secretInfo.getPermission().inventory.getSegment.adminSelfEnable) {
			infoRequestParam.segments = false;
		}

		if (!secretInfo.getPermission().inventory.getCustomData.adminSelfEnable) {
			infoRequestParam.customDatas = false;
		}

		if (!secretInfo.getPermission().inventory.getTag.adminSelfEnable) {
			infoRequestParam.tags = false;
		}

		if (!secretInfo.getPermission().inventory.getDisplayName.adminSelfEnable) {
			infoRequestParam.displayName = false;
		}

		if (!secretInfo.getPermission().inventory.getTsCreate.adminSelfEnable) {
			infoRequestParam.tsCreate = false;
		}

		if (!secretInfo.getPermission().inventory.getAvatar.adminSelfEnable) {
			infoRequestParam.avatar = false;
		}

		if (!secretInfo.getPermission().inventory.getItemStatistics.adminSelfEnable) {
			infoRequestParam.itemStatistics = false;
		}

		if (!secretInfo.getPermission().inventory.getItemData.adminSelfEnable) {
			infoRequestParam.itemDatas = false;
		}

	}

	/**
	 * Executes the generate info response parameters workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateInfoResponseParameters(inventory: Inventory, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
		// Stores the answer value used in the current execution flow.
		let answer = new GNHashtable();

		if (infoRequestParam.catalogId)
			answer.add(ParameterCode.CatalogId, this.generateCatalogId(inventory));

		if (infoRequestParam.classId)
			answer.add(ParameterCode.ClassId, this.generateClassId(inventory));

		if (infoRequestParam.itemType)
			answer.add(ParameterCode.ItemType, this.generateItemType(inventory));

		if (infoRequestParam.amount)
			answer.add(ParameterCode.Amount, this.generateAmount(inventory));

		if (infoRequestParam.owner)
			answer.add(ParameterCode.Owner, this.generateOwner(inventory));

		if (infoRequestParam.removeStatus)
			answer.add(ParameterCode.RemoveStatus, this.generateRemoveStatus(inventory));

		if (infoRequestParam.segments)
			answer.add(ParameterCode.Segments, this.generateSegments(inventory));

		if (infoRequestParam.customDatas)
			answer.add(ParameterCode.CustomDatas, this.generateCustomDatas(inventory, infoRequestParam.customDataKeys, gameId));

		if (infoRequestParam.displayName)
			answer.add(ParameterCode.DisplayName, this.generateDisplayName(inventory));

		if (infoRequestParam.avatar)
			answer.add(ParameterCode.Avatar, this.generateAvatar(inventory));

		if (infoRequestParam.tsCreate)
			answer.add(ParameterCode.TsCreate, this.generateTsCreate(inventory));

		if (infoRequestParam.tags)
			answer.add(ParameterCode.Tags, this.generateTags(inventory, infoRequestParam.tagKeys, gameId));

		if (infoRequestParam.itemDatas)
			answer.add(ParameterCode.ItemDatas, this.generateItemDatas(inventory, infoRequestParam.itemDataKeys, gameId));

		if (infoRequestParam.itemStatistics)
			answer.add(ParameterCode.ItemStatistics, this.generateItemStatistics(inventory, infoRequestParam.itemStatisticsKeys, gameId));

		return answer;
	}

	/**
	 * Executes the generate catalog ID workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCatalogId(inventory: Inventory): string {
		return inventory.getCatalogId();
	}

	/**
	 * Executes the generate class ID workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateClassId(inventory: Inventory): string {
		return inventory.getClassId();
	}

	/**
	 * Executes the generate item type workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateItemType(inventory: Inventory): number {
		return inventory.getItemType();
	}

	/**
	 * Executes the generate amount workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateAmount(inventory: Inventory): number {
		return inventory.getAmount();
	}

	/**
	 * Executes the generate owner workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateOwner(inventory: Inventory): GNHashtable {
		// Stores the owner value used in the current execution flow.
		let owner = inventory.getOwner();

		// Stores the GearN owner value used in the current execution flow.
		let gnOwner = new GNHashtable();

		gnOwner.add(ParameterCode.Type, owner.type);
		gnOwner.add(ParameterCode.Id, owner.id);

		return gnOwner;
	}

	/**
	 * Executes the generate remove status workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateRemoveStatus(inventory: Inventory): GNHashtable {
		// Stores the remove status value used in the current execution flow.
		let removeStatus = inventory.getRemoveStatus();

		// Stores the GearN remove status value used in the current execution flow.
		let gnRemoveStatus = new GNHashtable();

		gnRemoveStatus.add(ParameterCode.TsRemove, removeStatus.tsRemove);
		gnRemoveStatus.add(ParameterCode.Reason, removeStatus.reason);

		return gnRemoveStatus;
	}

	/**
	 * Executes the generate segments workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateSegments(inventory: Inventory): string[] {
		return inventory.getAllSegments();
	}

	/**
	 * Executes the generate custom datas workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @param customDataKeys Provides the custom data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateCustomDatas(inventory: Inventory, customDataKeys: string[], gameId: string): GNArray {
		// Stores the GearN custom datas value used in the current execution flow.
		let gnCustomDatas = new GNArray();

		// Stores the resolved inventory settings instance for the current execution flow.
		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

		for (let i = 0; i < inventorySettings.customDatasSettings.length; i++) {
			// Stores the custom datas settings item value used in the current execution flow.
			let customDatasSettingsItem = inventorySettings.customDatasSettings[i];

			if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = inventory.getCustomData(customDatasSettingsItem.key);

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
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateDisplayName(inventory: Inventory): string {
		return inventory.getDisplayName();
	}

	/**
	 * Executes the generate avatar workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateAvatar(inventory: Inventory): GNHashtable {
		// Stores the avatar value used in the current execution flow.
		let avatar = inventory.getAvatar();

		// Stores the GearN avatar value used in the current execution flow.
		let gnAvatar = new GNHashtable();

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

		return gnAvatar;
	}

	/**
	 * Executes the generate timestamp create workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsCreate(inventory: Inventory): number {
		return inventory.getTsCreate();
	}

	/**
	 * Executes the generate tags workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @param tagKeys Provides the tag keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTags(inventory: Inventory, tagKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN tags value used in the current execution flow.
		let gnTags = new GNArray();

		// Stores the resolved inventory settings instance for the current execution flow.
		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

		for (let i = 0; i < inventorySettings.tagsSettings.length; i++) {
			// Stores the tags settings item value used in the current execution flow.
			let tagsSettingsItem = inventorySettings.tagsSettings[i];

			if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
				// Stores the value value used in the current execution flow.
				let value = inventory.getTag(tagsSettingsItem.key);

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
	 * Executes the generate item datas workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @param itemDataKeys Provides the item data keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateItemDatas(inventory: Inventory, itemDataKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN item datas value used in the current execution flow.
		let gnItemDatas = new GNArray();

		// Stores the resolved inventory settings instance for the current execution flow.
		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

		for (let i = 0; i < inventorySettings.itemDatasSettings.length; i++) {
			// Stores the item datas settings item value used in the current execution flow.
			let itemDatasSettingsItem = inventorySettings.itemDatasSettings[i];

			if (itemDataKeys == null || itemDataKeys.indexOf(itemDatasSettingsItem.key) != -1) {
				// Stores the item data value used in the current execution flow.
				let itemData = inventory.getItemData(itemDatasSettingsItem.key);

				if (itemData != null) {
					// Stores the GearN item data value used in the current execution flow.
					let gnItemData = new GNHashtable();

					gnItemData.add(ParameterCode.Key, itemData.key);
					gnItemData.add(ParameterCode.Value, itemData.value);

					gnItemDatas.add(gnItemData);
				}
			}
		}

		return gnItemDatas;
	}

	/**
	 * Executes the generate item statistics workflow.
	 * @param inventory Provides the inventory value used by this operation.
	 * @param itemStatisticsKeys Provides the item statistics keys value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateItemStatistics(inventory: Inventory, itemStatisticsKeys: Array<string>, gameId: string): GNArray {
		// Stores the GearN item statistics value used in the current execution flow.
		let gnItemStatistics = new GNArray();

		// Stores the resolved inventory settings instance for the current execution flow.
		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

		for (let i = 0; i < inventorySettings.itemStatisticsSettings.length; i++) {
			// Stores the item statistics settings item value used in the current execution flow.
			let itemStatisticsSettingsItem = inventorySettings.itemStatisticsSettings[i];

			if (itemStatisticsKeys == null || itemStatisticsKeys.indexOf(itemStatisticsSettingsItem.key) != -1) {
				// Stores the item statistics value used in the current execution flow.
				let itemStatistics = inventory.getItemStatistics(itemStatisticsSettingsItem.key);

				// Stores the GearN item statistic value used in the current execution flow.
				let gnItemStatistic = new GNHashtable();
				gnItemStatistic.add(ParameterCode.Key, itemStatisticsSettingsItem.key);

				if (itemStatistics != null) gnItemStatistic.add(ParameterCode.Value, itemStatistics.value);
				else gnItemStatistic.add(ParameterCode.Value, itemStatisticsSettingsItem.initialValue);

				gnItemStatistics.add(gnItemStatistic);
			}
		}

		return gnItemStatistics;
	}
}
