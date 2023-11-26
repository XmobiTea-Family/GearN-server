import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { Inventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { xItemCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xItemCatalogSettings";
import { InventoryPermissionRules, SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export abstract class ItemBaseRequestHandler extends RequestHandler {
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

    protected convertToInventoryFindOptions(infoRequestParam: InfoRequestParam): InventoryFindOptions {
        if (this.isGetAll(infoRequestParam)) return null;

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

    protected async isAllowMethod(userId: string, itemId: string, gameId: string, permissionRules: InventoryPermissionRules): Promise<boolean> {
        let answer = false;

        if (permissionRules.otherSelfEnable) {
            answer = true;
        }

        if (!answer && permissionRules.selfEnable) {
            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerInventories: true });

            if (gamePlayer != null) {
                if (gamePlayer.hasPlayerInventory(itemId)) answer = true;
            }
        }

        return answer;
    }

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
            infoRequestParam.removeStatus = false;
        }

        if (!secretInfo.getPermission().inventory.getOwner.selfEnable) {
            infoRequestParam.removeStatus = false;
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
            infoRequestParam.removeStatus = false;
        }

        if (!secretInfo.getPermission().inventory.getOwner.otherSelfEnable) {
            infoRequestParam.removeStatus = false;
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
            infoRequestParam.removeStatus = false;
        }

        if (!secretInfo.getPermission().inventory.getOwner.serverSelfEnable) {
            infoRequestParam.removeStatus = false;
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
            infoRequestParam.removeStatus = false;
        }

        if (!secretInfo.getPermission().inventory.getOwner.adminSelfEnable) {
            infoRequestParam.removeStatus = false;
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

    protected generateInfoResponseParameters(inventory: Inventory, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
        let answer = new GNHashtable();

        if (infoRequestParam.catalogId)
            answer.add(GNParameterCode.CatalogId, this.generateCatalogId(inventory));

        if (infoRequestParam.classId)
            answer.add(GNParameterCode.ClassId, this.generateClassId(inventory));

        if (infoRequestParam.itemType)
            answer.add(GNParameterCode.ItemType, this.generateItemType(inventory));

        if (infoRequestParam.amount)
            answer.add(GNParameterCode.Amount, this.generateAmount(inventory));

        if (infoRequestParam.owner)
            answer.add(GNParameterCode.Owner, this.generateOwner(inventory));

        if (infoRequestParam.removeStatus)
            answer.add(GNParameterCode.RemoveStatus, this.generateRemoveStatus(inventory));

        if (infoRequestParam.segments)
            answer.add(GNParameterCode.Segments, this.generateSegments(inventory));

        if (infoRequestParam.customDatas)
            answer.add(GNParameterCode.CustomDatas, this.generateCustomDatas(inventory, infoRequestParam.customDataKeys, gameId));

        if (infoRequestParam.displayName)
            answer.add(GNParameterCode.DisplayName, this.generateDisplayName(inventory, gameId));

        if (infoRequestParam.avatar)
            answer.add(GNParameterCode.Avatar, this.generateAvatar(inventory));

        if (infoRequestParam.tsCreate)
            answer.add(GNParameterCode.TsCreate, this.generateTsCreate(inventory));

        if (infoRequestParam.tags)
            answer.add(GNParameterCode.Tags, this.generateTags(inventory, infoRequestParam.tagKeys, gameId));

        if (infoRequestParam.itemDatas)
            answer.add(GNParameterCode.ItemDatas, this.generateItemDatas(inventory, infoRequestParam.itemDataKeys, gameId));

        if (infoRequestParam.itemStatistics)
            answer.add(GNParameterCode.ItemStatistics, this.generateItemStatistics(inventory, infoRequestParam.itemStatisticsKeys, gameId));

        return answer;
    }

    protected generateCatalogId(inventory: Inventory): string {
        return inventory.getCatalogId();
    }

    protected generateClassId(inventory: Inventory): string {
        return inventory.getClassId();
    }

    protected generateItemType(inventory: Inventory): number {
        return inventory.getItemType();
    }

    protected generateAmount(inventory: Inventory): number {
        return inventory.getAmount();
    }

    protected generateOwner(inventory: Inventory): GNHashtable {
        let owner = inventory.getOwner();

        let gnOwner = new GNHashtable();

        gnOwner.add(GNParameterCode.Type, owner.type);
        gnOwner.add(GNParameterCode.Id, owner.id);

        return gnOwner;
    }

    protected generateRemoveStatus(inventory: Inventory): GNHashtable {
        let removeStatus = inventory.getRemoveStatus();

        let gnRemoveStatus = new GNHashtable();

        gnRemoveStatus.add(GNParameterCode.TsRemove, removeStatus.tsRemove);
        gnRemoveStatus.add(GNParameterCode.Reason, removeStatus.reason);

        return gnRemoveStatus;
    }

    protected generateSegments(inventory: Inventory): string[] {
        return inventory.getAllSegments();
    }

    protected generateCustomDatas(inventory: Inventory, customDataKeys: string[], gameId: string): GNArray {
        let gnCustomDatas = new GNArray();

        let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

        for (let i = 0; i < inventorySettings.customDatasSettings.length; i++) {
            let customDatasSettingsItem = inventorySettings.customDatasSettings[i];

            if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
                let value = inventory.getCustomData(customDatasSettingsItem.key);

                if (value != null) {
                    let gnCustomData = new GNHashtable();

                    gnCustomData.add(GNParameterCode.Key, customDatasSettingsItem.key);
                    gnCustomData.add(GNParameterCode.Value, value);

                    gnCustomDatas.add(gnCustomData);
                }
            }
        }

        return gnCustomDatas;
    }

    protected generateDisplayName(inventory: Inventory, gameId: string): string {
        let displayName = inventory.getDisplayName();
        if (!displayName) {
            let owner = inventory.getOwner();
            let catalogId = inventory.getCatalogId();
            let classId = inventory.getClassId();

            if (owner != null && catalogId != null && classId != null) {
                let itemCatalogSettings: xItemCatalogSettings[] = null;

                if (owner.type == OwnerType.GamePlayer) {
                    itemCatalogSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId).playerItemCatalogSettings;
                }
                else if (owner.type == OwnerType.CharacterPlayer) {
                    itemCatalogSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId).playerItemCatalogSettings;
                }

                if (itemCatalogSettings != null) {
                    let itemCatalogSettingsItem = itemCatalogSettings.find(x => x.catalogId == catalogId);

                    if (itemCatalogSettingsItem != null) {
                        let itemClassSettingsItem = itemCatalogSettingsItem.itemClassSettings.find(x => x.classId == classId);

                        if (itemClassSettingsItem != null) {
                            displayName = itemClassSettingsItem.displayName ?? "";
                        }
                    }
                }
            }
        }

        return displayName;
    }

    protected generateAvatar(inventory: Inventory): GNHashtable {
        let avatar = inventory.getAvatar();

        let gnAvatar = new GNHashtable();

        gnAvatar.add(GNParameterCode.Type, avatar.type);
        gnAvatar.add(GNParameterCode.Value, avatar.value);

        return gnAvatar;
    }

    protected generateTsCreate(inventory: Inventory): number {
        return inventory.getTsCreate();
    }

    protected generateTags(inventory: Inventory, tagKeys: Array<string>, gameId: string): GNArray {
        let gnTags = new GNArray();

        let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

        for (let i = 0; i < inventorySettings.tagsSettings.length; i++) {
            let tagsSettingsItem = inventorySettings.tagsSettings[i];

            if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
                let value = inventory.getTag(tagsSettingsItem.key);

                if (value != null) {
                    let gnTag = new GNHashtable();

                    gnTag.add(GNParameterCode.Key, tagsSettingsItem.key);
                    gnTag.add(GNParameterCode.Value, value);

                    gnTags.add(gnTag);
                }
            }
        }

        return gnTags;
    }

    protected generateItemDatas(inventory: Inventory, inventoryDataKeys: Array<string>, gameId: string): GNArray {
        let gnItemDatas = new GNArray();

        let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

        for (let i = 0; i < inventorySettings.inventoryDatasSettings.length; i++) {
            let inventoryDatasSettingsItem = inventorySettings.inventoryDatasSettings[i];

            if (inventoryDataKeys == null || inventoryDataKeys.indexOf(inventoryDatasSettingsItem.key) != -1) {
                let inventoryData = inventory.getItemData(inventoryDatasSettingsItem.key);

                if (inventoryData != null) {
                    let gnItemData = new GNHashtable();

                    gnItemData.add(GNParameterCode.Key, inventoryData.key);
                    gnItemData.add(GNParameterCode.Value, inventoryData.value);

                    gnItemDatas.add(gnItemData);
                }
            }
        }

        return gnItemDatas;
    }

    protected generateItemStatistics(inventory: Inventory, inventoryStatisticsKeys: Array<string>, gameId: string): GNArray {
        let gnItemStatistics = new GNArray();

        let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(gameId);

        for (let i = 0; i < inventorySettings.inventoryStatisticsSettings.length; i++) {
            let inventoryStatisticsSettingsItem = inventorySettings.inventoryStatisticsSettings[i];

            if (inventoryStatisticsKeys == null || inventoryStatisticsKeys.indexOf(inventoryStatisticsSettingsItem.key) != -1) {
                let inventoryStatistics = inventory.getItemStatistics(inventoryStatisticsSettingsItem.key);

                let gnItemStatistic = new GNHashtable();
                gnItemStatistic.add(GNParameterCode.Key, inventoryStatisticsSettingsItem.key);

                if (inventoryStatistics != null) gnItemStatistic.add(GNParameterCode.Value, inventoryStatistics.value);
                else gnItemStatistic.add(GNParameterCode.Value, inventoryStatisticsSettingsItem.initialValue);

                gnItemStatistics.add(gnItemStatistic);
            }
        }

        return gnItemStatistics;
    }
}
