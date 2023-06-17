import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { StatisticsItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsItem";
import { MasterPlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { CurrencyItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/CurrencyItem";

class GetPlayersBaseOperationRequest extends OperationRequest {
	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersBaseRequestHandler extends RequestHandler {
	public override getCode() {
		return 0;
	}

	public override getCommonOperationRequest() {
		return GetPlayersBaseOperationRequest;
	}

	protected convertToMasterPlayerFindOptions(infoGetParameters: GNHashtable): MasterPlayerFindOptions {
		if (infoGetParameters.count() == 0) return null;

		let answer: MasterPlayerFindOptions = {};

        answer.userId = true;

		let external = infoGetParameters.getBoolean(MasterPlayerParameterCode.External);
		let segments = infoGetParameters.getBoolean(MasterPlayerParameterCode.Segments);
		let scriptData = infoGetParameters.getBoolean(MasterPlayerParameterCode.ScriptData);
		let privateData = infoGetParameters.getBoolean(MasterPlayerParameterCode.PrivateData);
		let displayName = infoGetParameters.getBoolean(MasterPlayerParameterCode.DisplayName);
		let avatar = infoGetParameters.getBoolean(MasterPlayerParameterCode.Avatar);
		let tsCreate = infoGetParameters.getBoolean(MasterPlayerParameterCode.TsCreate);
		let tags = infoGetParameters.getBoolean(MasterPlayerParameterCode.Tags);
		let playerBan = infoGetParameters.getBoolean(MasterPlayerParameterCode.PlayerBan);
		let playerDatas = infoGetParameters.getBoolean(MasterPlayerParameterCode.PlayerDatas);
		let playerCurrencies = infoGetParameters.getBoolean(MasterPlayerParameterCode.PlayerCurrencies);
		let playerStatistics = infoGetParameters.getBoolean(MasterPlayerParameterCode.PlayerStatistics);
		let tsLastLogin = infoGetParameters.getBoolean(MasterPlayerParameterCode.TsLastLogin);
		let ipAddressCreate = infoGetParameters.getBoolean(MasterPlayerParameterCode.IpAddressCreate);
		let countryCode = infoGetParameters.getBoolean(MasterPlayerParameterCode.CountryCode);

		if (external) answer.external = true;
		if (segments) answer.segments = true;
		if (scriptData) answer.scriptData = true;
		if (privateData) answer.privateData = true;
		if (displayName) answer.displayName = true;
		if (avatar) answer.avatar = true;
		if (tsCreate) answer.tsCreate = true;
		if (tags) answer.tags = true;
		if (playerBan) answer.playerBan = true;
		if (playerDatas) answer.playerDatas = true;
		if (playerCurrencies) answer.playerCurrencies = true;
		if (playerStatistics) answer.playerStatistics = true;
		if (tsLastLogin) answer.tsLastLogin = true;
		if (ipAddressCreate) answer.ipAddressCreate = true;
		if (countryCode) answer.countryCode = true;

		return answer;
	}

	protected generateMasterPlayerOperationResponse(masterPlayer: MasterPlayer, masterPlayerFindOptions: MasterPlayerFindOptions, infoGetParameters: GNHashtable, secretInfo: SecretInfo): GNHashtable {
		let answer = new GNHashtable();

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.external) && secretInfo.getPermission().masterPlayer.getExternal.otherSelfEnable) {
            let gnExternal = new GNHashtable();

            let externalItem = masterPlayer.getExternal();

            if (externalItem.device != null) {
                let gnDevice = new GNHashtable();

                if (externalItem.device.customDeviceId != null) gnDevice.add(MasterPlayerParameterCode.CustomDeviceId, externalItem.device.customDeviceId);
                if (externalItem.device.androidDeviceId != null) gnDevice.add(MasterPlayerParameterCode.AndroidDeviceId, externalItem.device.androidDeviceId);
                if (externalItem.device.iOSDeviceId != null) gnDevice.add(MasterPlayerParameterCode.iOSDeviceId, externalItem.device.iOSDeviceId);
                if (externalItem.device.windowsPhoneDeviceId != null) gnDevice.add(MasterPlayerParameterCode.WindowsPhoneDeviceId, externalItem.device.windowsPhoneDeviceId);
                if (externalItem.device.windowsDeviceId != null) gnDevice.add(MasterPlayerParameterCode.WindowsDeviceId, externalItem.device.windowsDeviceId);
                if (externalItem.device.linuxDeviceId != null) gnDevice.add(MasterPlayerParameterCode.LinuxDeviceId, externalItem.device.linuxDeviceId);
                if (externalItem.device.macOSDeviceId != null) gnDevice.add(MasterPlayerParameterCode.MacOSDeviceId, externalItem.device.macOSDeviceId);
                if (externalItem.device.editorDeviceId != null) gnDevice.add(MasterPlayerParameterCode.EditorDeviceId, externalItem.device.editorDeviceId);

                gnExternal.add(MasterPlayerParameterCode.Device, gnDevice);
            }
            
            if (externalItem.account != null) {
                let gnAccount = new GNHashtable();

                if (externalItem.account.username != null) gnAccount.add(MasterPlayerParameterCode.Username, externalItem.account.username);

                gnExternal.add(MasterPlayerParameterCode.Account, gnAccount);
            }

            if (externalItem.custom != null) {
                let gnCustom = new GNHashtable();

                if (externalItem.custom.customId != null) gnCustom.add(MasterPlayerParameterCode.CustomId, externalItem.custom.customId);

                gnExternal.add(MasterPlayerParameterCode.Custom, gnCustom);
            }

            if (externalItem.apple != null) {
                let gnApple = new GNHashtable();

                if (externalItem.apple.appleId != null) gnApple.add(MasterPlayerParameterCode.AppleId, externalItem.apple.appleId);

                gnExternal.add(MasterPlayerParameterCode.Apple, gnApple);
            }

            if (externalItem.google != null) {
                let gnGoogle = new GNHashtable();

                if (externalItem.google.googleId != null) gnGoogle.add(MasterPlayerParameterCode.GoogleId, externalItem.google.googleId);

                gnExternal.add(MasterPlayerParameterCode.Custom, gnGoogle);
            }

            if (externalItem.facebook != null) {
                let gnFacebook = new GNHashtable();

                if (externalItem.facebook.facebookId != null) gnFacebook.add(MasterPlayerParameterCode.FacebookId, externalItem.facebook.facebookId);

                gnExternal.add(MasterPlayerParameterCode.Facebook, gnFacebook);
            }

            if (externalItem.genericService != null) {
                let gnGenericServices = new GNArray();

                if (externalItem.genericService.genericServices != null) {

                    externalItem.genericService.genericServices.forEach((value, key: string) => {
                        let gnGenericService = new GNHashtable();
                        gnGenericService.add(MasterPlayerParameterCode.ServiceName, key);
                        gnGenericService.add(MasterPlayerParameterCode.ServiceId, value.serviceId);

                        gnGenericServices.add(gnGenericService);
                    });
                }

                gnExternal.add(MasterPlayerParameterCode.GenericService, gnGenericServices);
            }

            answer.add(MasterPlayerParameterCode.External, gnExternal);
        }

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.segments) && secretInfo.getPermission().masterPlayer.getSegment.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.Segments, masterPlayer.getAllSegments());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.scriptData) && secretInfo.getPermission().masterPlayer.getScriptData.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.ScriptData, masterPlayer.getAllScriptData());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.privateData) && secretInfo.getPermission().masterPlayer.getPrivateData.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.PrivateData, masterPlayer.getAllPrivateData());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.displayName) && secretInfo.getPermission().masterPlayer.getDisplayName.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.DisplayName, masterPlayer.getDisplayName());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.avatar) && secretInfo.getPermission().masterPlayer.getAvatar.otherSelfEnable) {
            let avatar = masterPlayer.getAvatar();

            let gnAvatar = new GNHashtable();
            gnAvatar.add(MasterPlayerParameterCode.Type, avatar.type);
            gnAvatar.add(MasterPlayerParameterCode.Value, avatar.value);

            answer.add(MasterPlayerParameterCode.Avatar, gnAvatar);
        }

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.tsCreate) && secretInfo.getPermission().masterPlayer.getTsCreate.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.TsCreate, masterPlayer.getTsCreate());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.tags) && secretInfo.getPermission().masterPlayer.getTag.otherSelfEnable) {
            let tags = masterPlayer.getAllTags();
            let gnTags = new GNArray();
            tags.forEach((value: string | number | boolean, key: string) => {
                let gnTag = new GNHashtable();

                gnTag.add(MasterPlayerParameterCode.Key, key);
                gnTag.add(MasterPlayerParameterCode.Value, value);

                gnTags.add(gnTag);
            });
            answer.add(MasterPlayerParameterCode.Tags, gnTags);
        }

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.playerBan) && secretInfo.getPermission().masterPlayer.getPlayerBan.otherSelfEnable) {
            let playerBan = masterPlayer.getPlayerBan();
            let gnPlayerBan = new GNHashtable();
            gnPlayerBan.add(MasterPlayerParameterCode.TsExpire, playerBan.tsExpire);

            if (playerBan.reason != null) gnPlayerBan.add(MasterPlayerParameterCode.Reason, playerBan.reason);
            answer.add(MasterPlayerParameterCode.PlayerBan, gnPlayerBan);
        }

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.playerDatas) && secretInfo.getPermission().masterPlayer.getPlayerData.otherSelfEnable) {
            let playerDatas = masterPlayer.getAllPlayerDatas();
            let gnInfoGetParameterDataKey = infoGetParameters.getGNArray(MasterPlayerParameterCode.DataKeys);
            let gnPlayerDatas = new GNArray();

            for (let i = 0; i < playerDatas.length; i++) {
                let playerData = playerDatas[i];

                if (gnInfoGetParameterDataKey == null || gnInfoGetParameterDataKey.indexOf(playerData.key) != -1) {
                    let gnPlayerData = new GNHashtable();

                    gnPlayerData.add(MasterPlayerParameterCode.Key, playerData.key);
                    gnPlayerData.add(MasterPlayerParameterCode.Value, playerData.value);
                    gnPlayerData.add(MasterPlayerParameterCode.Permission, playerData.permission);

                    gnPlayerDatas.add(gnPlayerData);
                }
            }

            answer.add(MasterPlayerParameterCode.PlayerDatas, gnPlayerDatas);
        }

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.playerCurrencies) && secretInfo.getPermission().masterPlayer.getPlayerCurrency.otherSelfEnable) {
            let playerCurrencies = masterPlayer.getAllPlayerCurrencies();
            let gnInfoGetParameterCurrencyKey = infoGetParameters.getGNArray(MasterPlayerParameterCode.CurrencyKeys);

            let gnPlayerCurrencies = new GNArray();

            playerCurrencies.forEach((value: CurrencyItem, key: string) => {
                if (gnInfoGetParameterCurrencyKey == null || gnInfoGetParameterCurrencyKey.indexOf(key) != -1) {
                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(MasterPlayerParameterCode.Key, key);
                    gnPlayerCurrency.add(MasterPlayerParameterCode.Value, value.value);

                    gnPlayerCurrencies.add(gnPlayerCurrency);
                }
            });

            answer.add(MasterPlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);
        }

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.playerStatistics) && secretInfo.getPermission().masterPlayer.getPlayerStatistics.otherSelfEnable) {
            let playerStatistics = masterPlayer.getAllPlayerStatistics();
            let gnInfoGetParameterStatisticsKey = infoGetParameters.getGNArray(MasterPlayerParameterCode.StatisticsKeys);

            let gnPlayerStatistics = new GNArray();

            playerStatistics.forEach((value: StatisticsItem, key: string) => {
                if (gnInfoGetParameterStatisticsKey == null || gnInfoGetParameterStatisticsKey.indexOf(key) != -1) {
                    let gnPlayerStatistic = new GNHashtable();

                    gnPlayerStatistic.add(MasterPlayerParameterCode.Key, key);
                    gnPlayerStatistic.add(MasterPlayerParameterCode.Value, value.value);

                    gnPlayerStatistics.add(gnPlayerStatistic);
                }
            });

            answer.add(MasterPlayerParameterCode.PlayerStatistics, gnPlayerStatistics);
        }
        
        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.tsLastLogin) && secretInfo.getPermission().masterPlayer.getTsLastLogin.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.TsLastLogin, masterPlayer.getTsLastLogin());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.ipAddressCreate) && secretInfo.getPermission().masterPlayer.getIpAddressCreate.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.IpAddressCreate, masterPlayer.getIpAddressCreate());

        if ((masterPlayerFindOptions == null || masterPlayerFindOptions.countryCode) && secretInfo.getPermission().masterPlayer.getCountryCode.otherSelfEnable)
            answer.add(MasterPlayerParameterCode.CountryCode, masterPlayer.getCountryCode());

		return answer;
	}
}
