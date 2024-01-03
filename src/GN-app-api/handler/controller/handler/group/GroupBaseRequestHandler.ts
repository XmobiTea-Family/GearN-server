import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
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
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";

export abstract class GroupBaseRequestHandler extends RequestHandler {
    private static readonly EXPIRED_CACHE = 15 * xDatetime.ONE_MINUTE_MILLISECOND;

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

    protected convertToGroupFindOptions(infoRequestParam: InfoRequestParam): GroupFindOptions {
        if (this.isGetAll(infoRequestParam)) return null;

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

    protected async isAllowMethod(userId: string, groupId: string, gameId: string, permissionRules: GroupPermissionRules): Promise<boolean> {
        let answer = false;

        if (permissionRules.otherSelfEnable) {
            answer = true;
        }

        if (!answer && permissionRules.selfEnable) {
            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerGroups: true });

            if (gamePlayer != null) {
                let playerGroup = gamePlayer.getPlayerGroup(groupId);

                if (playerGroup != null && playerGroup.status == <number>GroupStatus.Member) answer = true;
            }
        }

        return answer;
    }

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

    protected generateInfoResponseParameters(group: Group, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
        let answer = new GNHashtable();

        if (infoRequestParam.catalogId)
            answer.add(GNParameterCode.CatalogId, this.generateCatalogId(group));

        if (infoRequestParam.members)
            answer.add(GNParameterCode.Members, this.generateMembers(group));

        if (infoRequestParam.removeStatus)
            answer.add(GNParameterCode.RemoveStatus, this.generateRemoveStatus(group));

        if (infoRequestParam.segments)
            answer.add(GNParameterCode.Segments, this.generateSegments(group));

        if (infoRequestParam.customDatas)
            answer.add(GNParameterCode.CustomDatas, this.generateCustomDatas(group, infoRequestParam.customDataKeys, gameId));

        if (infoRequestParam.displayName)
            answer.add(GNParameterCode.DisplayName, this.generateDisplayName(group, gameId));

        if (infoRequestParam.avatar)
            answer.add(GNParameterCode.Avatar, this.generateAvatar(group));

        if (infoRequestParam.tsCreate)
            answer.add(GNParameterCode.TsCreate, this.generateTsCreate(group));

        if (infoRequestParam.tags)
            answer.add(GNParameterCode.Tags, this.generateTags(group, infoRequestParam.tagKeys, gameId));

        if (infoRequestParam.groupDatas)
            answer.add(GNParameterCode.GroupDatas, this.generateGroupDatas(group, infoRequestParam.groupDataKeys, gameId));

        if (infoRequestParam.groupCurrencies)
            answer.add(GNParameterCode.GroupCurrencies, this.generateGroupCurrencies(group, infoRequestParam.groupCurrencyKeys, gameId));

        if (infoRequestParam.groupStatistics)
            answer.add(GNParameterCode.GroupStatistics, this.generateGroupStatistics(group, infoRequestParam.groupStatisticsKeys, gameId));

        if (infoRequestParam.groupInventories)
            answer.add(GNParameterCode.GroupInventories, this.generateGroupInventories(group, infoRequestParam.itemCatalogIds));

        return answer;
    }

    protected generateCatalogId(group: Group): string {
        return group.getCatalogId();
    }

    protected generateMembers(group: Group): GNArray {
        let gnMembers = new GNArray();

        let members = group.getAllMembers();

        for (let i = 0; i < members.length; i++) {
            let member = members[i];

            let gnMember = new GNHashtable();

            gnMember.add(GNParameterCode.MemberId, member.memberId);
            gnMember.add(GNParameterCode.Status, member.status);

            gnMembers.add(gnMember);
        }

        return gnMembers;
    }

    protected generateRemoveStatus(group: Group): GNHashtable {
        let removeStatus = group.getRemoveStatus();

        let gnRemoveStatus = new GNHashtable();

        gnRemoveStatus.add(GNParameterCode.TsRemove, removeStatus.tsRemove);
        gnRemoveStatus.add(GNParameterCode.Reason, removeStatus.reason);

        return gnRemoveStatus;
    }

    protected generateSegments(group: Group): string[] {
        return group.getAllSegments();
    }

    protected generateCustomDatas(group: Group, customDataKeys: string[], gameId: string): GNArray {
        let gnCustomDatas = new GNArray();

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

        for (let i = 0; i < groupSettings.customDatasSettings.length; i++) {
            let customDatasSettingsItem = groupSettings.customDatasSettings[i];

            if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
                let value = group.getCustomData(customDatasSettingsItem.key);

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

    protected generateDisplayName(group: Group, gameId: string): string {
        let displayName = group.getDisplayName();
        if (!displayName) {
            let groupType = group.getGroupType();
            let catalogId = group.getCatalogId();

            if (catalogId != null) {
                let groupCharacterCatalogSettings: xCharacterCatalogSettings[] = null;

                if (groupType == <number>OwnerType.GamePlayer) {
                    groupCharacterCatalogSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId).playerGroupCatalogSettings;
                }
                else if (groupType == <number>OwnerType.CharacterPlayer) {
                    groupCharacterCatalogSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId).playerGroupCatalogSettings;
                }

                if (groupCharacterCatalogSettings != null) {
                    let groupCharacterCatalogSettingsItem = groupCharacterCatalogSettings.find(x => x.catalogId == catalogId);

                    if (groupCharacterCatalogSettingsItem != null) {
                        displayName = groupCharacterCatalogSettingsItem.displayName ?? "";
                    }
                }
            }
        }

        return displayName;
    }

    protected generateAvatar(group: Group): GNHashtable {
        let avatar = group.getAvatar();

        let gnAvatar = new GNHashtable();

        gnAvatar.add(GNParameterCode.Type, avatar.type);
        gnAvatar.add(GNParameterCode.Value, avatar.value);

        return gnAvatar;
    }

    protected generateTsCreate(group: Group): number {
        return group.getTsCreate();
    }

    protected generateTags(group: Group, tagKeys: Array<string>, gameId: string): GNArray {
        let gnTags = new GNArray();

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

        for (let i = 0; i < groupSettings.tagsSettings.length; i++) {
            let tagsSettingsItem = groupSettings.tagsSettings[i];

            if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
                let value = group.getTag(tagsSettingsItem.key);

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

    protected generateGroupDatas(group: Group, groupDataKeys: Array<string>, gameId: string): GNArray {
        let gnGroupDatas = new GNArray();

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

        for (let i = 0; i < groupSettings.groupDatasSettings.length; i++) {
            let groupDatasSettingsItem = groupSettings.groupDatasSettings[i];

            if (groupDataKeys == null || groupDataKeys.indexOf(groupDatasSettingsItem.key) != -1) {
                let groupData = group.getGroupData(groupDatasSettingsItem.key);

                if (groupData != null) {
                    let gnGroupData = new GNHashtable();

                    gnGroupData.add(GNParameterCode.Key, groupData.key);
                    gnGroupData.add(GNParameterCode.Value, groupData.value);

                    gnGroupDatas.add(gnGroupData);
                }
            }
        }

        return gnGroupDatas;
    }

    protected generateGroupCurrencies(group: Group, groupCurrencyKeys: Array<string>, gameId: string): GNArray {
        let gnGroupCurrencies = new GNArray();

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

        for (let i = 0; i < groupSettings.groupCurrencySettings.length; i++) {
            let groupCurrencySettingsItem = groupSettings.groupCurrencySettings[i];

            if (groupCurrencyKeys == null || groupCurrencyKeys.indexOf(groupCurrencySettingsItem.key) != -1) {
                let groupCurrency = group.getGroupCurrency(groupCurrencySettingsItem.key);

                let gnGroupCurrency = new GNHashtable();
                gnGroupCurrency.add(GNParameterCode.Key, groupCurrencySettingsItem.key);

                if (groupCurrency != null) gnGroupCurrency.add(GNParameterCode.Value, groupCurrency.value);
                else gnGroupCurrency.add(GNParameterCode.Value, groupCurrencySettingsItem.initialValue);

                gnGroupCurrencies.add(gnGroupCurrency);
            }
        }

        return gnGroupCurrencies;
    }

    protected generateGroupStatistics(group: Group, groupStatisticsKeys: Array<string>, gameId: string): GNArray {
        let gnGroupStatistics = new GNArray();

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(gameId);

        for (let i = 0; i < groupSettings.groupStatisticsSettings.length; i++) {
            let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings[i];

            if (groupStatisticsKeys == null || groupStatisticsKeys.indexOf(groupStatisticsSettingsItem.key) != -1) {
                let groupStatistics = group.getGroupStatistics(groupStatisticsSettingsItem.key);

                let gnGroupStatistic = new GNHashtable();
                gnGroupStatistic.add(GNParameterCode.Key, groupStatisticsSettingsItem.key);

                if (groupStatistics != null) gnGroupStatistic.add(GNParameterCode.Value, groupStatistics.value);
                else gnGroupStatistic.add(GNParameterCode.Value, groupStatisticsSettingsItem.initialValue);

                gnGroupStatistics.add(gnGroupStatistic);
            }
        }

        return gnGroupStatistics;
    }

    protected generateGroupInventories(group: Group, itemCatalogIds: Array<string>): GNArray {
        let gnGroupInventories = new GNArray();

        let groupInventories = group.getAllGroupInventories();

        for (let i = 0; i < groupInventories.length; i++) {
            let groupInventory = groupInventories[i];

            if (itemCatalogIds == null || itemCatalogIds.indexOf(groupInventory.catalogId) != -1) {
                let gnGroupInventory = new GNHashtable();

                gnGroupInventory.add(GNParameterCode.ItemId, groupInventory.itemId);
                gnGroupInventory.add(GNParameterCode.CatalogId, groupInventory.catalogId);
                gnGroupInventory.add(GNParameterCode.ClassId, groupInventory.classId);

                gnGroupInventories.add(gnGroupInventory);
            }
        }

        return gnGroupInventories;
    }

    protected async isMember(group: Group, userId: string, gameId: string): Promise<boolean> {
        let groupType = <OwnerType>group.getGroupType();

        if (groupType == OwnerType.GamePlayer) {
            if (!group.hasMember(userId)) {
                return false;
            }

            let memberItem = group.getMember(userId);
            let status = <GroupStatus>memberItem.status;

            if (status == GroupStatus.Member) {
                return true;
            }
        }
        else if (groupType == OwnerType.CharacterPlayer) {
            let gamePlayerFindOptions: GamePlayerFindOptions = {
                playerCharacters: true,
            }

            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);
            if (gamePlayer == null) {
                return false;
            }

            let playerCharacters = gamePlayer.getAllPlayerCharacters();
            let isMember = false;

            for (let i = 0; i < playerCharacters.length; i++) {
                let playerCharacter = playerCharacters[i];

                if (!group.hasMember(playerCharacter.characterId)) {
                    continue;
                }

                let memberItem = group.getMember(playerCharacter.characterId);
                let status = <GroupStatus>memberItem.status;

                if (status != GroupStatus.Member) {
                    continue;
                }

                isMember = true;
                break;
            }

            return isMember;
        }

        return false;
    }

    protected async getGroupMessages(groupId: string, gameId: string, skip: number, limit: number): Promise<GroupMessageItem[]> {

        let cacheData = this.gnServer.getCacheService(gameId);

        if (!(await cacheData.isValid("GroupMessages_" + groupId))) {
            await cacheData.setData("GroupMessages_" + groupId, await this.getDatabaseGroupMessage(groupId, gameId), GroupBaseRequestHandler.EXPIRED_CACHE);
        }

        let groupMessageItems = await cacheData.getData<Array<GroupMessageItem>>("GroupMessages_" + groupId);

        let answer: GroupMessageItem[] = [];

        if (skip < 0) skip = 0;
        if (limit < 0) limit = 0;

        let startI = skip;
        let endI = skip + limit;

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

    private async getDatabaseGroupMessage(groupId: string, gameId: string): Promise<GroupMessageItem[]> {
        let groupMessagesResults = await this.gnServer.getDatabase().loadGroupMessagesAsync(groupId, gameId, 0, 150);

        let answer: GroupMessageItem[] = [];

        while (await groupMessagesResults.hasNext()) {
            let groupMessageDoc = await groupMessagesResults.next();

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

    protected async sendGroupMessage(groupId: string, gameId: string, groupMessageItem: GroupMessageItem): Promise<void> {

        let cacheData = this.gnServer.getCacheService(gameId);

        if (!(await cacheData.isValid("GroupMessages_" + groupId))) {
            await cacheData.setData("GroupMessages_" + groupId, await this.getDatabaseGroupMessage(groupId, gameId), GroupBaseRequestHandler.EXPIRED_CACHE);
        }

        await this.gnServer.getDatabase().createGroupMessageAsync(groupId, gameId, groupMessageItem.senderId, groupMessageItem.senderType, groupMessageItem.message, groupMessageItem.tsCreate);

        let groupMessageItems = await cacheData.getData<Array<GroupMessageItem>>("GroupMessages_" + groupId);

        if (groupMessageItems.length > 150) groupMessageItems.splice(149, 1);
        groupMessageItems.unshift(groupMessageItem);
    }
}
