import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export abstract class MasterPlayerBaseRequestHandler extends RequestHandler {
    /**
     * Checks whether get all.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     * @returns Returns the operation result.
     */
    private isGetAll(infoRequestParam: InfoRequestParam): boolean {
        return infoRequestParam.external && infoRequestParam.segments && infoRequestParam.customDatas && infoRequestParam.displayName && infoRequestParam.avatar && infoRequestParam.tsCreate && infoRequestParam.tags && infoRequestParam.playerBan && infoRequestParam.playerDatas && infoRequestParam.playerCurrencies && infoRequestParam.playerStatistics && infoRequestParam.tsLastLogin && infoRequestParam.ipAddressCreate && infoRequestParam.countryCode && infoRequestParam.email && infoRequestParam.pushNotifications;
    }

    /**
     * Converts the to master player find options.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     * @returns Returns the operation result.
     */
    protected convertToMasterPlayerFindOptions(infoRequestParam: InfoRequestParam): MasterPlayerFindOptions {
        if (this.isGetAll(infoRequestParam)) return null;

        // Stores the answer value used in the current execution flow.
        let answer: MasterPlayerFindOptions = {};
        answer.userId = true;

        if (infoRequestParam.external) answer.external = infoRequestParam.external;
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
        if (infoRequestParam.tsLastLogin) answer.tsLastLogin = infoRequestParam.tsLastLogin;
        if (infoRequestParam.ipAddressCreate) answer.ipAddressCreate = infoRequestParam.ipAddressCreate;
        if (infoRequestParam.countryCode) answer.countryCode = infoRequestParam.countryCode;
        if (infoRequestParam.email) answer.email = infoRequestParam.email;
        if (infoRequestParam.pushNotifications) answer.pushNotifications = infoRequestParam.pushNotifications;

        return answer;
    }

    /**
     * Executes the generate info request parameter for owner workflow.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     */
    protected generateInfoRequestParamForOwner(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {
        if (!secretInfo.getPermission().masterPlayer.getSegment.selfEnable) {
            infoRequestParam.segments = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTag.selfEnable) {
            infoRequestParam.tags = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getDisplayName.selfEnable) {
            infoRequestParam.displayName = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsCreate.selfEnable) {
            infoRequestParam.tsCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getIpAddressCreate.selfEnable) {
            infoRequestParam.ipAddressCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsLastLogin.selfEnable) {
            infoRequestParam.tsLastLogin = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerBan.selfEnable) {
            infoRequestParam.playerBan = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCountryCode.selfEnable) {
            infoRequestParam.countryCode = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getEmail.selfEnable) {
            infoRequestParam.email = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getAvatar.selfEnable) {
            infoRequestParam.avatar = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.selfEnable) {
            infoRequestParam.playerCurrencies = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerStatistics.selfEnable) {
            infoRequestParam.playerStatistics = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCustomData.selfEnable) {
            infoRequestParam.customDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerData.selfEnable) {
            infoRequestParam.playerDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getExternal.selfEnable) {
            infoRequestParam.external = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPushNotification.selfEnable) {
            infoRequestParam.pushNotifications = false;
        }
    }

    /**
     * Executes the generate info request parameter for other workflow.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     */
    protected generateInfoRequestParamForOther(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {
        if (!secretInfo.getPermission().masterPlayer.getSegment.otherSelfEnable) {
            infoRequestParam.segments = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTag.otherSelfEnable) {
            infoRequestParam.tags = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getDisplayName.otherSelfEnable) {
            infoRequestParam.displayName = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsCreate.otherSelfEnable) {
            infoRequestParam.tsCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getIpAddressCreate.otherSelfEnable) {
            infoRequestParam.ipAddressCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsLastLogin.otherSelfEnable) {
            infoRequestParam.tsLastLogin = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerBan.otherSelfEnable) {
            infoRequestParam.playerBan = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCountryCode.otherSelfEnable) {
            infoRequestParam.countryCode = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getEmail.otherSelfEnable) {
            infoRequestParam.email = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getAvatar.otherSelfEnable) {
            infoRequestParam.avatar = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.otherSelfEnable) {
            infoRequestParam.playerCurrencies = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerStatistics.otherSelfEnable) {
            infoRequestParam.playerStatistics = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCustomData.otherSelfEnable) {
            infoRequestParam.customDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerData.otherSelfEnable) {
            infoRequestParam.playerDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getExternal.otherSelfEnable) {
            infoRequestParam.external = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPushNotification.otherSelfEnable) {
            infoRequestParam.pushNotifications = false;
        }
    }

    /**
     * Executes the generate info request parameter for server workflow.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     */
    protected generateInfoRequestParamForServer(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {
        if (!secretInfo.getPermission().masterPlayer.getSegment.serverSelfEnable) {
            infoRequestParam.segments = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTag.serverSelfEnable) {
            infoRequestParam.tags = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getDisplayName.serverSelfEnable) {
            infoRequestParam.displayName = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsCreate.serverSelfEnable) {
            infoRequestParam.tsCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getIpAddressCreate.serverSelfEnable) {
            infoRequestParam.ipAddressCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsLastLogin.serverSelfEnable) {
            infoRequestParam.tsLastLogin = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerBan.serverSelfEnable) {
            infoRequestParam.playerBan = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCountryCode.serverSelfEnable) {
            infoRequestParam.countryCode = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getEmail.serverSelfEnable) {
            infoRequestParam.email = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getAvatar.serverSelfEnable) {
            infoRequestParam.avatar = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.serverSelfEnable) {
            infoRequestParam.playerCurrencies = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerStatistics.serverSelfEnable) {
            infoRequestParam.playerStatistics = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCustomData.serverSelfEnable) {
            infoRequestParam.customDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerData.serverSelfEnable) {
            infoRequestParam.playerDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getExternal.serverSelfEnable) {
            infoRequestParam.external = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPushNotification.serverSelfEnable) {
            infoRequestParam.pushNotifications = false;
        }
    }

    /**
     * Executes the generate info request parameter for admin workflow.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     */
    protected generateInfoRequestParamForAdmin(secretInfo: SecretInfo, infoRequestParam: InfoRequestParam): void {
        if (!secretInfo.getPermission().masterPlayer.getSegment.adminSelfEnable) {
            infoRequestParam.segments = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTag.adminSelfEnable) {
            infoRequestParam.tags = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getDisplayName.adminSelfEnable) {
            infoRequestParam.displayName = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsCreate.adminSelfEnable) {
            infoRequestParam.tsCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getIpAddressCreate.adminSelfEnable) {
            infoRequestParam.ipAddressCreate = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getTsLastLogin.adminSelfEnable) {
            infoRequestParam.tsLastLogin = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerBan.adminSelfEnable) {
            infoRequestParam.playerBan = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCountryCode.adminSelfEnable) {
            infoRequestParam.countryCode = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getEmail.adminSelfEnable) {
            infoRequestParam.email = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getAvatar.adminSelfEnable) {
            infoRequestParam.avatar = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.adminSelfEnable) {
            infoRequestParam.playerCurrencies = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerStatistics.adminSelfEnable) {
            infoRequestParam.playerStatistics = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getCustomData.adminSelfEnable) {
            infoRequestParam.customDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayerData.adminSelfEnable) {
            infoRequestParam.playerDatas = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getExternal.adminSelfEnable) {
            infoRequestParam.external = false;
        }

        if (!secretInfo.getPermission().masterPlayer.getPushNotification.adminSelfEnable) {
            infoRequestParam.pushNotifications = false;
        }
    }

    /**
     * Executes the generate info response parameters workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @param infoRequestParam Provides the info request parameter value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateInfoResponseParameters(masterPlayer: MasterPlayer, infoRequestParam: InfoRequestParam): GNHashtable {
        // Stores the answer value used in the current execution flow.
        let answer = new GNHashtable();

        if (infoRequestParam.external) answer.add(ParameterCode.External, this.generateExternal(masterPlayer));

        if (infoRequestParam.segments) answer.add(ParameterCode.Segments, this.generateSegments(masterPlayer));

        if (infoRequestParam.customDatas) answer.add(ParameterCode.CustomDatas, this.generateCustomDatas(masterPlayer, infoRequestParam.customDataKeys));

        if (infoRequestParam.displayName) answer.add(ParameterCode.DisplayName, this.generateDisplayName(masterPlayer));

        if (infoRequestParam.avatar) answer.add(ParameterCode.Avatar, this.generateAvatar(masterPlayer));

        if (infoRequestParam.tsCreate) answer.add(ParameterCode.TsCreate, this.generateTsCreate(masterPlayer));

        if (infoRequestParam.tags) answer.add(ParameterCode.Tags, this.generateTags(masterPlayer, infoRequestParam.tagKeys));

        if (infoRequestParam.playerBan) answer.add(ParameterCode.PlayerBan, this.generatePlayerBan(masterPlayer));

        if (infoRequestParam.playerDatas) answer.add(ParameterCode.PlayerDatas, this.generatePlayerDatas(masterPlayer, infoRequestParam.playerDataKeys));

        if (infoRequestParam.playerCurrencies) answer.add(ParameterCode.PlayerCurrencies, this.generatePlayerCurrencies(masterPlayer, infoRequestParam.playerCurrencyKeys));

        if (infoRequestParam.playerStatistics) answer.add(ParameterCode.PlayerStatistics, this.generatePlayerStatistics(masterPlayer, infoRequestParam.playerStatisticsKeys));

        if (infoRequestParam.tsLastLogin) answer.add(ParameterCode.TsLastLogin, this.generateTsLastLogin(masterPlayer));

        if (infoRequestParam.ipAddressCreate) answer.add(ParameterCode.IpAddressCreate, this.generateIpAddressCreate(masterPlayer));

        if (infoRequestParam.countryCode) answer.add(ParameterCode.CountryCode, this.generateCountryCode(masterPlayer));

        if (infoRequestParam.email) answer.add(ParameterCode.Email, this.generateEmail(masterPlayer));

        if (infoRequestParam.pushNotifications) answer.add(ParameterCode.PushNotifications, this.generatePushNotifications(masterPlayer));

        return answer;
    }

    /**
     * Executes the generate external workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateExternal(masterPlayer: MasterPlayer): GNHashtable {
        // Stores the GearN external value used in the current execution flow.
        let gnExternal = new GNHashtable();

        // Stores the external item value used in the current execution flow.
        let externalItem = masterPlayer.getExternal();

        if (externalItem.device != null) {
            // Stores the GearN device value used in the current execution flow.
            let gnDevice = new GNHashtable();

            if (externalItem.device.customDeviceId != null) gnDevice.add(ParameterCode.CustomDeviceId, externalItem.device.customDeviceId);
            if (externalItem.device.androidDeviceId != null) gnDevice.add(ParameterCode.AndroidDeviceId, externalItem.device.androidDeviceId);
            if (externalItem.device.iOSDeviceId != null) gnDevice.add(ParameterCode.iOSDeviceId, externalItem.device.iOSDeviceId);
            if (externalItem.device.windowsPhoneDeviceId != null) gnDevice.add(ParameterCode.WindowsPhoneDeviceId, externalItem.device.windowsPhoneDeviceId);
            if (externalItem.device.windowsDeviceId != null) gnDevice.add(ParameterCode.WindowsDeviceId, externalItem.device.windowsDeviceId);
            if (externalItem.device.linuxDeviceId != null) gnDevice.add(ParameterCode.LinuxDeviceId, externalItem.device.linuxDeviceId);
            if (externalItem.device.macOSDeviceId != null) gnDevice.add(ParameterCode.MacOSDeviceId, externalItem.device.macOSDeviceId);
            if (externalItem.device.editorDeviceId != null) gnDevice.add(ParameterCode.EditorDeviceId, externalItem.device.editorDeviceId);

            gnExternal.add(ParameterCode.Device, gnDevice);
        }

        if (externalItem.account != null) {
            // Stores the GearN account value used in the current execution flow.
            let gnAccount = new GNHashtable();

            if (externalItem.account.username != null) gnAccount.add(ParameterCode.Username, externalItem.account.username);

            gnExternal.add(ParameterCode.Account, gnAccount);
        }

        if (externalItem.custom != null) {
            // Stores the GearN custom value used in the current execution flow.
            let gnCustom = new GNHashtable();

            if (externalItem.custom.customId != null) gnCustom.add(ParameterCode.CustomId, externalItem.custom.customId);

            gnExternal.add(ParameterCode.Custom, gnCustom);
        }

        if (externalItem.apple != null) {
            // Stores the GearN apple value used in the current execution flow.
            let gnApple = new GNHashtable();

            gnApple.add(ParameterCode.AppleId, externalItem.apple.appleId);
            gnApple.add(ParameterCode.Email, externalItem.apple.email);

            gnExternal.add(ParameterCode.Apple, gnApple);
        }

        if (externalItem.google != null) {
            // Stores the GearN google value used in the current execution flow.
            let gnGoogle = new GNHashtable();

            gnGoogle.add(ParameterCode.GoogleId, externalItem.google.googleId);
            gnGoogle.add(ParameterCode.DisplayName, externalItem.google.displayName);
            gnGoogle.add(ParameterCode.Email, externalItem.google.email);

            gnExternal.add(ParameterCode.Google, gnGoogle);
        }

        if (externalItem.facebook != null) {
            // Stores the GearN facebook value used in the current execution flow.
            let gnFacebook = new GNHashtable();

            gnFacebook.add(ParameterCode.FacebookId, externalItem.facebook.facebookId);
            gnFacebook.add(ParameterCode.DisplayName, externalItem.facebook.displayName);
            gnFacebook.add(ParameterCode.Email, externalItem.facebook.email);

            gnExternal.add(ParameterCode.Facebook, gnFacebook);
        }

        if (externalItem.genericService != null) {
            // Stores the GearN generic services value used in the current execution flow.
            let gnGenericServices = new GNArray();

            if (externalItem.genericService.genericServices != null) {
                externalItem.genericService.genericServices.forEach((value, key: string) => {
                    // Stores the GearN generic service value used in the current execution flow.
                    let gnGenericService = new GNHashtable();
                    gnGenericService.add(ParameterCode.ServiceName, key);
                    gnGenericService.add(ParameterCode.ServiceId, value.serviceId);

                    gnGenericServices.add(gnGenericService);
                });
            }

            gnExternal.add(ParameterCode.GenericService, gnGenericServices);
        }

        if (externalItem.googlePlayGameService != null) {
            // Stores the GearN google play game service value used in the current execution flow.
            let gnGooglePlayGameService = new GNHashtable();

            gnGooglePlayGameService.add(ParameterCode.PlayerId, externalItem.googlePlayGameService.playerId);
            gnGooglePlayGameService.add(ParameterCode.DisplayName, externalItem.googlePlayGameService.displayName);
            gnGooglePlayGameService.add(ParameterCode.Email, externalItem.googlePlayGameService.email);

            gnExternal.add(ParameterCode.GooglePlayGameService, gnGooglePlayGameService);
        }

        if (externalItem.gameCenter != null) {
            // Stores the GearN game center value used in the current execution flow.
            let gnGameCenter = new GNHashtable();

            gnGameCenter.add(ParameterCode.PlayerId, externalItem.gameCenter.playerId);
            gnGameCenter.add(ParameterCode.DisplayName, externalItem.gameCenter.displayName);
            gnGameCenter.add(ParameterCode.Email, externalItem.gameCenter.email);

            gnExternal.add(ParameterCode.GameCenter, gnGameCenter);
        }

        return gnExternal;
    }

    /**
     * Executes the generate segments workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateSegments(masterPlayer: MasterPlayer): string[] {
        return masterPlayer.getAllSegments();
    }

    /**
     * Executes the generate custom datas workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @param customDataKeys Provides the custom data keys value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateCustomDatas(masterPlayer: MasterPlayer, customDataKeys: Array<string>): GNArray {
        // Stores the GearN custom datas value used in the current execution flow.
        let gnCustomDatas = new GNArray();

        // Stores the resolved master player settings instance for the current execution flow.
        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.customDatasSettings.length; i++) {
            // Stores the custom datas settings item value used in the current execution flow.
            let customDatasSettingsItem = masterPlayerSettings.customDatasSettings[i];

            if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
                // Stores the value value used in the current execution flow.
                let value = masterPlayer.getCustomData(customDatasSettingsItem.key);

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
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateDisplayName(masterPlayer: MasterPlayer): string {
        return masterPlayer.getDisplayName();
    }

    /**
     * Executes the generate avatar workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateAvatar(masterPlayer: MasterPlayer): GNHashtable {
        // Stores the GearN avatar value used in the current execution flow.
        let gnAvatar = new GNHashtable();

        // Stores the avatar value used in the current execution flow.
        let avatar = masterPlayer.getAvatar();

        gnAvatar.add(ParameterCode.Type, avatar.type);
        gnAvatar.add(ParameterCode.Value, avatar.value);

        return gnAvatar;
    }

    /**
     * Executes the generate timestamp create workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateTsCreate(masterPlayer: MasterPlayer): number {
        return masterPlayer.getTsCreate();
    }

    /**
     * Executes the generate tags workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @param tagKeys Provides the tag keys value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateTags(masterPlayer: MasterPlayer, tagKeys: Array<string>): GNArray {
        // Stores the GearN tags value used in the current execution flow.
        let gnTags = new GNArray();

        // Stores the resolved master player settings instance for the current execution flow.
        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
            // Stores the tags settings item value used in the current execution flow.
            let tagsSettingsItem = masterPlayerSettings.tagsSettings[i];

            if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
                // Stores the value value used in the current execution flow.
                let value = masterPlayer.getTag(tagsSettingsItem.key);

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
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generatePlayerBan(masterPlayer: MasterPlayer): GNHashtable {
        // Stores the GearN player ban value used in the current execution flow.
        let gnPlayerBan = new GNHashtable();

        // Stores the player ban value used in the current execution flow.
        let playerBan = masterPlayer.getPlayerBan();

        gnPlayerBan.add(ParameterCode.TsExpire, playerBan.tsExpire);
        gnPlayerBan.add(ParameterCode.Reason, playerBan.reason);

        return gnPlayerBan;
    }

    /**
     * Executes the generate player datas workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @param playerDataKeys Provides the player data keys value used by this operation.
     * @returns Returns the operation result.
     */
    protected generatePlayerDatas(masterPlayer: MasterPlayer, playerDataKeys: Array<string>): GNArray {
        // Stores the GearN player datas value used in the current execution flow.
        let gnPlayerDatas = new GNArray();

        // Stores the resolved master player settings instance for the current execution flow.
        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.playerDatasSettings.length; i++) {
            // Stores the player datas settings item value used in the current execution flow.
            let playerDatasSettingsItem = masterPlayerSettings.playerDatasSettings[i];

            if (playerDataKeys == null || playerDataKeys.indexOf(playerDatasSettingsItem.key) != -1) {
                // Stores the player data value used in the current execution flow.
                let value = masterPlayer.getPlayerData(playerDatasSettingsItem.key);

                // Stores the GearN player data value used in the current execution flow.
                let gnPlayerData = new GNHashtable();

                gnPlayerData.add(ParameterCode.Key, playerDatasSettingsItem.key);
                gnPlayerData.add(ParameterCode.Value, value);

                gnPlayerDatas.add(gnPlayerData);
            }
        }

        return gnPlayerDatas;
    }

    /**
     * Executes the generate player currencies workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @param playerCurrencyKeys Provides the player currency keys value used by this operation.
     * @returns Returns the operation result.
     */
    protected generatePlayerCurrencies(masterPlayer: MasterPlayer, playerCurrencyKeys: Array<string>): GNArray {
        // Stores the GearN player currencies value used in the current execution flow.
        let gnPlayerCurrencies = new GNArray();

        // Stores the resolved master player settings instance for the current execution flow.
        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.playerCurrenciesSettings.length; i++) {
            // Stores the player currencies settings item value used in the current execution flow.
            let playerCurrenciesSettingsItem = masterPlayerSettings.playerCurrenciesSettings[i];

            if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrenciesSettingsItem.key) != -1) {
                // Stores the player currency value used in the current execution flow.
                let playerCurrency = masterPlayer.getPlayerCurrency(playerCurrenciesSettingsItem.key);

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
     * @param masterPlayer Provides the master player value used by this operation.
     * @param playerStatisticsKeys Provides the player statistics keys value used by this operation.
     * @returns Returns the operation result.
     */
    protected generatePlayerStatistics(masterPlayer: MasterPlayer, playerStatisticsKeys: Array<string>): GNArray {
        // Stores the GearN player statistics value used in the current execution flow.
        let gnPlayerStatistics = new GNArray();

        // Stores the resolved master player settings instance for the current execution flow.
        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
            // Stores the player statistics settings item value used in the current execution flow.
            let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings[i];

            if (playerStatisticsKeys == null || playerStatisticsKeys.indexOf(playerStatisticsSettingsItem.key) != -1) {
                // Stores the player statistics value used in the current execution flow.
                let playerStatistics = masterPlayer.getPlayerStatistics(playerStatisticsSettingsItem.key);

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
     * Executes the generate timestamp last login workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateTsLastLogin(masterPlayer: MasterPlayer): number {
        return masterPlayer.getTsLastLogin();
    }

    /**
     * Executes the generate IP address create workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateIpAddressCreate(masterPlayer: MasterPlayer): string {
        return masterPlayer.getIpAddressCreate();
    }

    /**
     * Executes the generate country code workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateCountryCode(masterPlayer: MasterPlayer): string {
        return masterPlayer.getCountryCode();
    }

    /**
     * Executes the generate email workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generateEmail(masterPlayer: MasterPlayer): string {
        return masterPlayer.getEmail();
    }

    /**
     * Executes the generate push notifications workflow.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Returns the operation result.
     */
    protected generatePushNotifications(masterPlayer: MasterPlayer): GNArray {
        // Stores the GearN push notifications value used in the current execution flow.
        let gnPushNotifications = new GNArray();

        // Stores the push notifications value used in the current execution flow.
        let pushNotifications = masterPlayer.getAllPushNotifications();

        for (let i = 0; i < pushNotifications.length; i++) {
            // Stores the push notification value used in the current execution flow.
            let pushNotification = pushNotifications[i];

            // Stores the GearN push notification value used in the current execution flow.
            let gnPushNotification = new GNHashtable();
            gnPushNotification.add(ParameterCode.PushId, pushNotification.pushId);
            gnPushNotification.add(ParameterCode.PlatformType, pushNotification.platformType);
            gnPushNotification.add(ParameterCode.Token, pushNotification.token);

            gnPushNotifications.add(gnPushNotification);
        }

        return gnPushNotifications;
    }
}
