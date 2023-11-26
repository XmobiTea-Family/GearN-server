import { RequestHandler } from "./../base/RequestHandler";

import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

class LoginBaseOperationRequest extends OperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class LoginBaseRequestHandler extends RequestHandler {
    public override getCode() {
        return 0;
    }

    public override getCommonOperationRequest() {
        return LoginBaseOperationRequest;
    }

    private isGetAll(infoRequestParam: InfoRequestParam): boolean {
        return infoRequestParam.external
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
            && infoRequestParam.tsLastLogin
            && infoRequestParam.ipAddressCreate
            && infoRequestParam.countryCode
            && infoRequestParam.email;
    }

    protected convertToMasterPlayerFindOptions(infoRequestParam: InfoRequestParam): MasterPlayerFindOptions {
        if (this.isGetAll(infoRequestParam)) return null;

        let answer: MasterPlayerFindOptions = {};
        answer.userId = true;
        answer.lastIPDetail = true;

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

        answer.playerBan = true;

        return answer;
    }

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
    }

    protected generateInfoResponseParameters(masterPlayer: MasterPlayer, infoRequestParam: InfoRequestParam): GNHashtable {
        let answer = new GNHashtable();

        if (infoRequestParam.external)
            answer.add(GNParameterCode.External, this.generateExternal(masterPlayer));

        if (infoRequestParam.segments)
            answer.add(GNParameterCode.Segments, this.generateSegments(masterPlayer));

        if (infoRequestParam.customDatas)
            answer.add(GNParameterCode.CustomDatas, this.generateCustomDatas(masterPlayer, infoRequestParam.customDataKeys));

        if (infoRequestParam.displayName)
            answer.add(GNParameterCode.DisplayName, this.generateDisplayName(masterPlayer));

        if (infoRequestParam.avatar)
            answer.add(GNParameterCode.Avatar, this.generateAvatar(masterPlayer));

        if (infoRequestParam.tsCreate)
            answer.add(GNParameterCode.TsCreate, this.generateTsCreate(masterPlayer));

        if (infoRequestParam.tags)
            answer.add(GNParameterCode.Tags, this.generateTags(masterPlayer, infoRequestParam.tagKeys));

        if (infoRequestParam.playerBan)
            answer.add(GNParameterCode.PlayerBan, this.generatePlayerBan(masterPlayer));

        if (infoRequestParam.playerDatas)
            answer.add(GNParameterCode.PlayerDatas, this.generatePlayerDatas(masterPlayer, infoRequestParam.playerDataKeys));

        if (infoRequestParam.playerCurrencies)
            answer.add(GNParameterCode.PlayerCurrencies, this.generatePlayerCurrencies(masterPlayer, infoRequestParam.playerCurrencyKeys));

        if (infoRequestParam.playerStatistics)
            answer.add(GNParameterCode.PlayerStatistics, this.generatePlayerStatistics(masterPlayer, infoRequestParam.playerStatisticsKeys));

        if (infoRequestParam.tsLastLogin)
            answer.add(GNParameterCode.TsLastLogin, this.generateTsLastLogin(masterPlayer));

        if (infoRequestParam.ipAddressCreate)
            answer.add(GNParameterCode.IpAddressCreate, this.generateIpAddressCreate(masterPlayer));

        if (infoRequestParam.countryCode)
            answer.add(GNParameterCode.CountryCode, this.generateCountryCode(masterPlayer));

        if (infoRequestParam.email)
            answer.add(GNParameterCode.Email, this.generateEmail(masterPlayer));

        return answer;
    }

    protected generateExternal(masterPlayer: MasterPlayer): GNHashtable {
        let gnExternal = new GNHashtable();

        let externalItem = masterPlayer.getExternal();

        if (externalItem.device != null) {
            let gnDevice = new GNHashtable();

            if (externalItem.device.customDeviceId != null) gnDevice.add(GNParameterCode.CustomDeviceId, externalItem.device.customDeviceId);
            if (externalItem.device.androidDeviceId != null) gnDevice.add(GNParameterCode.AndroidDeviceId, externalItem.device.androidDeviceId);
            if (externalItem.device.iOSDeviceId != null) gnDevice.add(GNParameterCode.iOSDeviceId, externalItem.device.iOSDeviceId);
            if (externalItem.device.windowsPhoneDeviceId != null) gnDevice.add(GNParameterCode.WindowsPhoneDeviceId, externalItem.device.windowsPhoneDeviceId);
            if (externalItem.device.windowsDeviceId != null) gnDevice.add(GNParameterCode.WindowsDeviceId, externalItem.device.windowsDeviceId);
            if (externalItem.device.linuxDeviceId != null) gnDevice.add(GNParameterCode.LinuxDeviceId, externalItem.device.linuxDeviceId);
            if (externalItem.device.macOSDeviceId != null) gnDevice.add(GNParameterCode.MacOSDeviceId, externalItem.device.macOSDeviceId);
            if (externalItem.device.editorDeviceId != null) gnDevice.add(GNParameterCode.EditorDeviceId, externalItem.device.editorDeviceId);

            gnExternal.add(GNParameterCode.Device, gnDevice);
        }

        if (externalItem.account != null) {
            let gnAccount = new GNHashtable();

            if (externalItem.account.username != null) gnAccount.add(GNParameterCode.Username, externalItem.account.username);

            gnExternal.add(GNParameterCode.Account, gnAccount);
        }

        if (externalItem.custom != null) {
            let gnCustom = new GNHashtable();

            if (externalItem.custom.customId != null) gnCustom.add(GNParameterCode.CustomId, externalItem.custom.customId);

            gnExternal.add(GNParameterCode.Custom, gnCustom);
        }

        if (externalItem.apple != null) {
            let gnApple = new GNHashtable();

            gnApple.add(GNParameterCode.AppleId, externalItem.apple.appleId);
            gnApple.add(GNParameterCode.Email, externalItem.apple.email);

            gnExternal.add(GNParameterCode.Apple, gnApple);
        }

        if (externalItem.google != null) {
            let gnGoogle = new GNHashtable();

            gnGoogle.add(GNParameterCode.GoogleId, externalItem.google.googleId);
            gnGoogle.add(GNParameterCode.DisplayName, externalItem.google.displayName);
            gnGoogle.add(GNParameterCode.Email, externalItem.google.email);

            gnExternal.add(GNParameterCode.Google, gnGoogle);
        }

        if (externalItem.facebook != null) {
            let gnFacebook = new GNHashtable();

            gnFacebook.add(GNParameterCode.FacebookId, externalItem.facebook.facebookId);
            gnFacebook.add(GNParameterCode.DisplayName, externalItem.facebook.displayName);
            gnFacebook.add(GNParameterCode.Email, externalItem.facebook.email);

            gnExternal.add(GNParameterCode.Facebook, gnFacebook);
        }

        if (externalItem.genericService != null) {
            let gnGenericServices = new GNArray();

            if (externalItem.genericService.genericServices != null) {

                externalItem.genericService.genericServices.forEach((value, key: string) => {
                    let gnGenericService = new GNHashtable();
                    gnGenericService.add(GNParameterCode.ServiceName, key);
                    gnGenericService.add(GNParameterCode.ServiceId, value.serviceId);

                    gnGenericServices.add(gnGenericService);
                });
            }

            gnExternal.add(GNParameterCode.GenericService, gnGenericServices);
        }

        if (externalItem.googlePlayGameService != null) {
            let gnGooglePlayGameService = new GNHashtable();

            gnGooglePlayGameService.add(GNParameterCode.PlayerId, externalItem.googlePlayGameService.playerId);
            gnGooglePlayGameService.add(GNParameterCode.DisplayName, externalItem.googlePlayGameService.displayName);
            gnGooglePlayGameService.add(GNParameterCode.Email, externalItem.googlePlayGameService.email);

            gnExternal.add(GNParameterCode.GooglePlayGameService, gnGooglePlayGameService);
        }

        if (externalItem.gameCenter != null) {
            let gnGameCenter = new GNHashtable();

            gnGameCenter.add(GNParameterCode.PlayerId, externalItem.gameCenter.playerId);
            gnGameCenter.add(GNParameterCode.DisplayName, externalItem.gameCenter.displayName);
            gnGameCenter.add(GNParameterCode.Email, externalItem.gameCenter.email);

            gnExternal.add(GNParameterCode.GameCenter, gnGameCenter);
        }

        return gnExternal;
    }

    protected generateSegments(masterPlayer: MasterPlayer): string[] {
        return masterPlayer.getAllSegments();
    }

    protected generateCustomDatas(masterPlayer: MasterPlayer, customDataKeys: Array<string>): GNArray {
        let gnCustomDatas = new GNArray();

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.customDatasSettings.length; i++) {
            let customDatasSettingsItem = masterPlayerSettings.customDatasSettings[i];

            if (customDataKeys == null || customDataKeys.indexOf(customDatasSettingsItem.key) != -1) {
                let value = masterPlayer.getCustomData(customDatasSettingsItem.key);

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

    protected generateDisplayName(masterPlayer: MasterPlayer): string {
        return masterPlayer.getDisplayName();
    }

    protected generateAvatar(masterPlayer: MasterPlayer): GNHashtable {
        let gnAvatar = new GNHashtable();

        let avatar = masterPlayer.getAvatar();

        gnAvatar.add(GNParameterCode.Type, avatar.type);
        gnAvatar.add(GNParameterCode.Value, avatar.value);

        return gnAvatar;
    }

    protected generateTsCreate(masterPlayer: MasterPlayer): number {
        return masterPlayer.getTsCreate();
    }

    protected generateTags(masterPlayer: MasterPlayer, tagKeys: Array<string>): GNArray {
        let gnTags = new GNArray();

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
            let tagsSettingsItem = masterPlayerSettings.tagsSettings[i];

            if (tagKeys == null || tagKeys.indexOf(tagsSettingsItem.key) != -1) {
                let value = masterPlayer.getTag(tagsSettingsItem.key);

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

    protected generatePlayerBan(masterPlayer: MasterPlayer): GNHashtable {
        let gnPlayerBan = new GNHashtable();

        let playerBan = masterPlayer.getPlayerBan();

        gnPlayerBan.add(GNParameterCode.TsExpire, playerBan.tsExpire);
        gnPlayerBan.add(GNParameterCode.Reason, playerBan.reason);

        return gnPlayerBan;
    }

    protected generatePlayerDatas(masterPlayer: MasterPlayer, playerDataKeys: Array<string>): GNArray {
        let gnPlayerDatas = new GNArray();

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.playerDatasSettings.length; i++) {
            let playerDatasSettingsItem = masterPlayerSettings.playerDatasSettings[i];

            if (playerDataKeys == null || playerDataKeys.indexOf(playerDatasSettingsItem.key) != -1) {
                let playerData = masterPlayer.getPlayerData(playerDatasSettingsItem.key);

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

    protected generatePlayerCurrencies(masterPlayer: MasterPlayer, playerCurrencyKeys: Array<string>): GNArray {
        let gnPlayerCurrencies = new GNArray();

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.playerCurrencySettings.length; i++) {
            let playerCurrencySettingsItem = masterPlayerSettings.playerCurrencySettings[i];

            if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrencySettingsItem.key) != -1) {
                let playerCurrency = masterPlayer.getPlayerCurrency(playerCurrencySettingsItem.key);

                let gnPlayerCurrency = new GNHashtable();
                gnPlayerCurrency.add(GNParameterCode.Key, playerCurrencySettingsItem.key);

                if (playerCurrency != null) gnPlayerCurrency.add(GNParameterCode.Value, playerCurrency.value);
                else gnPlayerCurrency.add(GNParameterCode.Value, playerCurrencySettingsItem.initialValue);

                gnPlayerCurrencies.add(gnPlayerCurrency);
            }
        }

        return gnPlayerCurrencies;
    }

    protected generatePlayerStatistics(masterPlayer: MasterPlayer, playerStatisticsKeys: Array<string>): GNArray {
        let gnPlayerStatistics = new GNArray();

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
            let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings[i];

            if (playerStatisticsKeys == null || playerStatisticsKeys.indexOf(playerStatisticsSettingsItem.key) != -1) {
                let playerStatistics = masterPlayer.getPlayerStatistics(playerStatisticsSettingsItem.key);

                let gnPlayerStatistic = new GNHashtable();
                gnPlayerStatistic.add(GNParameterCode.Key, playerStatisticsSettingsItem.key);

                if (playerStatistics != null) gnPlayerStatistic.add(GNParameterCode.Value, playerStatistics.value);
                else gnPlayerStatistic.add(GNParameterCode.Value, playerStatisticsSettingsItem.initialValue);

                gnPlayerStatistics.add(gnPlayerStatistic);
            }
        }

        return gnPlayerStatistics;
    }

    protected generateTsLastLogin(masterPlayer: MasterPlayer): number {
        return masterPlayer.getTsLastLogin();
    }

    protected generateIpAddressCreate(masterPlayer: MasterPlayer): string {
        return masterPlayer.getIpAddressCreate();
    }

    protected generateCountryCode(masterPlayer: MasterPlayer): string {
        return masterPlayer.getCountryCode();
    }

    protected generateEmail(masterPlayer: MasterPlayer): string {
        return masterPlayer.getEmail();
    }

    protected setupAuthInfo(operationResponse: OperationResponse, masterPlayer: MasterPlayer, secretInfo: SecretInfo) {
        let userId = masterPlayer.getUserId();
        operationResponse.setParameter(ParameterCode.UserId, userId);

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        let playerBan = masterPlayer.getPlayerBan();

        if (playerBan.tsExpire != 0) {
            if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {

                operationResponse.setParameter(GNParameterCode.PlayerBan, this.generatePlayerBan(masterPlayer));
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.PlayerBan);

                return;
            }
        }

        let newAuthInfo = this.gnServer.getApiMiddleware().generateAuthInfo({
            userId: userId,
            secretKey: secretInfo.getSecretKey(),
            gnToken: null
        });

        operationResponse.setParameter(ParameterCode.AuthToken, newAuthInfo.getAuthToken());
    }

    protected generateNewMasterPlayerResult(ipAddressCreate: string) {

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let answer = {} as any;

        answer["userId"] = StringUtility.generateRandomString(10, this.gnServer.getIdTypeCase());
        answer["external"] = {};
        answer["segments"] = [];
        answer["customDatas"] = {};
        answer["displayName"] = "";
        answer["displayNameNormalize"] = "";
        answer["avatar"] = { "type": 0, "value": "0" };
        answer["tsCreate"] = currentMilliseconds;
        answer["tags"] = {};
        answer["playerBan"] = { "tsExpire": 0, "reason": "" };
        answer["playerDatas"] = [];
        answer["playerCurrencies"] = {};
        answer["playerStatistics"] = {};
        answer["tsLastLogin"] = currentMilliseconds;
        answer["ipAddressCreate"] = ipAddressCreate;
        answer["lastIPDetail"] = {
            "ipAddress": ipAddressCreate,
            "countryCode": "Unknown",
            "regionCode": "Unknown",
        };
        answer["countryCode"] = "";
        answer["email"] = "";

        return answer;
    }


}
