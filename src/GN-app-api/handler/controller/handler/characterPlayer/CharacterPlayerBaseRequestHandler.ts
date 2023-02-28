import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xCharacterCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xCharacterCatalogSettings";
import { CharacterPlayerPermissionRules, SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

export abstract class CharacterPlayerBaseRequestHandler extends RequestHandler {
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

    protected convertToCharacterPlayerFindOptions(infoRequestParam: InfoRequestParam): CharacterPlayerFindOptions {
        if (this.isGetAll(infoRequestParam)) return null;

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

    protected async isAllowMethod(userId: string, characterId: string, gameId: string, permissionRules: CharacterPlayerPermissionRules): Promise<boolean> {
        let answer = false;

        if (permissionRules.otherSelfEnable) {
            answer = true;
        }

        if (!answer && permissionRules.selfEnable) {
            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, { playerCharacters: true });

            if (gamePlayer != null) {
                if (gamePlayer.hasPlayerCharacter(characterId)) answer = true;
            }
        }

        return answer;
    }

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
            infoRequestParam.playerInventories = false;
        }

        if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.selfEnable) {
            infoRequestParam.playerFriends = false;
        }
    }

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
            infoRequestParam.playerInventories = false;
        }

        if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.otherSelfEnable) {
            infoRequestParam.playerFriends = false;
        }
    }

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
            infoRequestParam.playerInventories = false;
        }

        if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.serverSelfEnable) {
            infoRequestParam.playerFriends = false;
        }
    }

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
            infoRequestParam.playerInventories = false;
        }

        if (!secretInfo.getPermission().characterPlayer.getPlayerFriend.adminSelfEnable) {
            infoRequestParam.playerFriends = false;
        }
    }

    protected generateInfoResponseParameters(characterPlayer: CharacterPlayer, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
        let answer = new GNHashtable();

        if (infoRequestParam.catalogId)
            answer.add(GNParameterCode.CatalogId, this.generateCatalogId(characterPlayer));

        if (infoRequestParam.owner)
            answer.add(GNParameterCode.Owner, this.generateOwner(characterPlayer));

        if (infoRequestParam.removeStatus)
            answer.add(GNParameterCode.RemoveStatus, this.generateRemoveStatus(characterPlayer));

        if (infoRequestParam.segments)
            answer.add(GNParameterCode.Segments, this.generateSegments(characterPlayer));

        if (infoRequestParam.customDatas)
            answer.add(GNParameterCode.CustomDatas, this.generateCustomDatas(characterPlayer, infoRequestParam.customDataKeys, gameId));

        if (infoRequestParam.displayName)
            answer.add(GNParameterCode.DisplayName, this.generateDisplayName(characterPlayer, gameId));

        if (infoRequestParam.avatar)
            answer.add(GNParameterCode.Avatar, this.generateAvatar(characterPlayer));

        if (infoRequestParam.tsCreate)
            answer.add(GNParameterCode.TsCreate, this.generateTsCreate(characterPlayer));

        if (infoRequestParam.tags)
            answer.add(GNParameterCode.Tags, this.generateTags(characterPlayer, infoRequestParam.tagKeys, gameId));

        if (infoRequestParam.playerBan)
            answer.add(GNParameterCode.PlayerBan, this.generatePlayerBan(characterPlayer));

        if (infoRequestParam.playerDatas)
            answer.add(GNParameterCode.PlayerDatas, this.generatePlayerDatas(characterPlayer, infoRequestParam.playerDataKeys, gameId));

        if (infoRequestParam.playerCurrencies)
            answer.add(GNParameterCode.PlayerCurrencies, this.generatePlayerCurrencies(characterPlayer, infoRequestParam.playerCurrencyKeys, gameId));

        if (infoRequestParam.playerStatistics)
            answer.add(GNParameterCode.PlayerStatistics, this.generatePlayerStatistics(characterPlayer, infoRequestParam.playerStatisticsKeys, gameId));

        if (infoRequestParam.playerInventories)
            answer.add(GNParameterCode.PlayerInventories, this.generatePlayerInventories(characterPlayer, infoRequestParam.itemCatalogIds));

        if (infoRequestParam.playerGroups)
            answer.add(GNParameterCode.PlayerGroups, this.generatePlayerGroups(characterPlayer, infoRequestParam.groupCatalogIds));

        if (infoRequestParam.playerFriends)
            answer.add(GNParameterCode.PlayerFriends, this.generatePlayerFriends(characterPlayer, infoRequestParam.friendCatalogIds));

        if (infoRequestParam.tsLastLogin)
            answer.add(GNParameterCode.TsLastLogin, this.generateTsLastLogin(characterPlayer));

        if (infoRequestParam.ipAddressCreate)
            answer.add(GNParameterCode.IpAddressCreate, this.generateIpAddressCreate(characterPlayer));

        if (infoRequestParam.countryCode)
            answer.add(GNParameterCode.CountryCode, this.generateCountryCode(characterPlayer));

        return answer;
    }

    protected generateCatalogId(characterPlayer: CharacterPlayer): string {
        return characterPlayer.getCatalogId();
    }

    protected generateOwner(characterPlayer: CharacterPlayer): GNHashtable {
        let owner = characterPlayer.getOwner();

        let gnOwner = new GNHashtable();

        gnOwner.add(GNParameterCode.Type, owner.type);
        gnOwner.add(GNParameterCode.Id, owner.id);

        return gnOwner;
    }

    protected generateRemoveStatus(characterPlayer: CharacterPlayer): GNHashtable {
        let removeStatus = characterPlayer.getRemoveStatus();

        let gnRemoveStatus = new GNHashtable();

        gnRemoveStatus.add(GNParameterCode.TsRemove, removeStatus.tsRemove);
        gnRemoveStatus.add(GNParameterCode.Reason, removeStatus.reason);

        return gnRemoveStatus;
    }

    protected generateSegments(characterPlayer: CharacterPlayer): string[] {
        return characterPlayer.getAllSegments();
    }

    protected generateCustomDatas(characterPlayer: CharacterPlayer, customDataKeys: string[], gameId: string): GNArray {
        let gnCustomDatas = new GNArray();

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

        for (let i = 0; i < characterPlayerSettings.customDatasSettings.length; i++) {
            let customDatasSettingsItem = characterPlayerSettings.customDatasSettings[i];

            if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
                let value = characterPlayer.getCustomData(customDatasSettingsItem.key);

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

    protected generateDisplayName(characterPlayer: CharacterPlayer, gameId: string): string {
        let displayName = characterPlayer.getDisplayName();
        if (!displayName) {
            let owner = characterPlayer.getOwner();
            let catalogId = characterPlayer.getCatalogId();

            if (owner != null && catalogId != null) {
                let playerCharacterCatalogSettings: xCharacterCatalogSettings[] = null;

                if (owner.type == OwnerType.GamePlayer) {
                    playerCharacterCatalogSettings = this.gnServer.getGNSettings().getGamePlayerSettings(gameId).playerCharacterCatalogSettings;
                }

                if (playerCharacterCatalogSettings != null) {
                    let playerCharacterCatalogSettingsItem = playerCharacterCatalogSettings.find(x => x.catalogId == catalogId);

                    if (playerCharacterCatalogSettingsItem != null) {
                        displayName = playerCharacterCatalogSettingsItem.displayName ?? "";
                    }
                }
            }
        }

        return displayName;
    }

    protected generateAvatar(characterPlayer: CharacterPlayer): GNHashtable {
        let avatar = characterPlayer.getAvatar();

        let gnAvatar = new GNHashtable();

        gnAvatar.add(GNParameterCode.Type, avatar.type);
        gnAvatar.add(GNParameterCode.Value, avatar.value);

        return gnAvatar;
    }

    protected generateTsCreate(characterPlayer: CharacterPlayer): number {
        return characterPlayer.getTsCreate();
    }

    protected generateTags(characterPlayer: CharacterPlayer, tagKeys: Array<string>, gameId: string): GNArray {
        let gnTags = new GNArray();

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

        for (let i = 0; i < characterPlayerSettings.tagsSettings.length; i++) {
            let tagsSettingsItem = characterPlayerSettings.tagsSettings[i];

            if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
                let value = characterPlayer.getTag(tagsSettingsItem.key);

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

    protected generatePlayerBan(characterPlayer: CharacterPlayer): GNHashtable {
        let gnPlayerBan = new GNHashtable();

        let playerBan = characterPlayer.getPlayerBan();

        gnPlayerBan.add(GNParameterCode.TsExpire, playerBan.tsExpire);
        gnPlayerBan.add(GNParameterCode.Reason, playerBan.reason);

        return gnPlayerBan;
    }

    protected generatePlayerDatas(characterPlayer: CharacterPlayer, playerDataKeys: Array<string>, gameId: string): GNArray {
        let gnPlayerDatas = new GNArray();

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

        for (let i = 0; i < characterPlayerSettings.playerDatasSettings.length; i++) {
            let playerDatasSettingsItem = characterPlayerSettings.playerDatasSettings[i];

            if (playerDataKeys == null || playerDataKeys.indexOf(playerDatasSettingsItem.key) != -1) {
                let playerData = characterPlayer.getPlayerData(playerDatasSettingsItem.key);

                if (playerData != null) {
                    let gnPlayerData = new GNHashtable();

                    gnPlayerData.add(GNParameterCode.Key, playerData.key);
                    gnPlayerData.add(GNParameterCode.Value, playerData.value);

                    gnPlayerDatas.add(gnPlayerData);
                }
            }
        }

        return gnPlayerDatas;
    }

    protected generatePlayerCurrencies(characterPlayer: CharacterPlayer, playerCurrencyKeys: Array<string>, gameId: string): GNArray {
        let gnPlayerCurrencies = new GNArray();

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

        for (let i = 0; i < characterPlayerSettings.playerCurrencySettings.length; i++) {
            let playerCurrencySettingsItem = characterPlayerSettings.playerCurrencySettings[i];

            if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrencySettingsItem.key) != -1) {
                let playerCurrency = characterPlayer.getPlayerCurrency(playerCurrencySettingsItem.key);

                let gnPlayerCurrency = new GNHashtable();
                gnPlayerCurrency.add(GNParameterCode.Key, playerCurrencySettingsItem.key);

                if (playerCurrency != null) gnPlayerCurrency.add(GNParameterCode.Value, playerCurrency.value);
                else gnPlayerCurrency.add(GNParameterCode.Value, playerCurrencySettingsItem.initialValue);

                gnPlayerCurrencies.add(gnPlayerCurrency);
            }
        }

        return gnPlayerCurrencies;
    }

    protected generatePlayerStatistics(characterPlayer: CharacterPlayer, playerStatisticsKeys: Array<string>, gameId: string): GNArray {
        let gnPlayerStatistics = new GNArray();

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

        for (let i = 0; i < characterPlayerSettings.playerStatisticsSettings.length; i++) {
            let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings[i];

            if (playerStatisticsKeys == null || playerStatisticsKeys.indexOf(playerStatisticsSettingsItem.key) != -1) {
                let playerStatistics = characterPlayer.getPlayerStatistics(playerStatisticsSettingsItem.key);

                let gnPlayerStatistic = new GNHashtable();
                gnPlayerStatistic.add(GNParameterCode.Key, playerStatisticsSettingsItem.key);

                if (playerStatistics != null) gnPlayerStatistic.add(GNParameterCode.Value, playerStatistics.value);
                else gnPlayerStatistic.add(GNParameterCode.Value, playerStatisticsSettingsItem.initialValue);

                gnPlayerStatistics.add(gnPlayerStatistic);
            }
        }

        return gnPlayerStatistics;
    }

    protected generatePlayerInventories(characterPlayer: CharacterPlayer, itemCatalogIds: Array<string>): GNArray {
        let gnPlayerInventories = new GNArray();

        let playerInventories = characterPlayer.getAllPlayerInventories();

        for (let i = 0; i < playerInventories.length; i++) {
            let playerInventory = playerInventories[i];

            if (itemCatalogIds == null || itemCatalogIds.indexOf(playerInventory.catalogId) != -1) {
                let gnPlayerInventory = new GNHashtable();

                gnPlayerInventory.add(GNParameterCode.ItemId, playerInventory.itemId);
                gnPlayerInventory.add(GNParameterCode.CatalogId, playerInventory.catalogId);
                gnPlayerInventory.add(GNParameterCode.ClassId, playerInventory.classId);

                gnPlayerInventories.add(gnPlayerInventory);
            }
        }

        return gnPlayerInventories;
    }

    protected generatePlayerGroups(characterPlayer: CharacterPlayer, groupCatalogIds: Array<string>): GNArray {
        let gnPlayerGroups = new GNArray();

        let playerGroups = characterPlayer.getAllPlayerGroups();

        for (let i = 0; i < playerGroups.length; i++) {
            let playerGroup = playerGroups[i];

            if (groupCatalogIds == null || groupCatalogIds.indexOf(playerGroup.catalogId) != -1) {
                let gnPlayerGroup = new GNHashtable();

                gnPlayerGroup.add(GNParameterCode.GroupId, playerGroup.groupId);
                gnPlayerGroup.add(GNParameterCode.CatalogId, playerGroup.catalogId);
                gnPlayerGroup.add(GNParameterCode.Status, playerGroup.status);
                gnPlayerGroup.add(GNParameterCode.TsLastStatusUpdate, playerGroup.tsLastStatusUpdate);

                gnPlayerGroups.add(gnPlayerGroup);
            }
        }

        return gnPlayerGroups;
    }

    protected generatePlayerFriends(characterPlayer: CharacterPlayer, friendCatalogIds: Array<string>): GNArray {
        let gnPlayerFriends = new GNArray();

        let playerFriends = characterPlayer.getAllPlayerFriends();

        for (let i = 0; i < playerFriends.length; i++) {
            let playerFriend = playerFriends[i];

            if (friendCatalogIds == null || friendCatalogIds.indexOf(playerFriend.catalogId) != -1) {
                let gnPlayerFriend = new GNHashtable();

                gnPlayerFriend.add(GNParameterCode.FriendId, playerFriend.friendId);
                gnPlayerFriend.add(GNParameterCode.CatalogId, playerFriend.catalogId);
                gnPlayerFriend.add(GNParameterCode.Status, playerFriend.status);
                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, playerFriend.tsLastStatusUpdate);

                gnPlayerFriends.add(gnPlayerFriend);
            }
        }

        return gnPlayerFriends;
    }

    protected generateTsLastLogin(characterPlayer: CharacterPlayer): number {
        return characterPlayer.getTsLastLogin();
    }

    protected generateIpAddressCreate(characterPlayer: CharacterPlayer): string {
        return characterPlayer.getIpAddressCreate();
    }

    protected generateCountryCode(characterPlayer: CharacterPlayer): string {
        return characterPlayer.getCountryCode();
    }

}
