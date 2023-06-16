import { RequestHandler } from "./../base/RequestHandler";

import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { AuthenticateParameterCode } from "./../../../../../GN-common/constant/parameterCode/AuthenticateParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { MasterPlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { CurrencyItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/CurrencyItem";
import { StatisticsItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsItem";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { CountryCodeType } from "../../../../../GN-common/constant/enumType/CountryCodeType";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";

class LoginBaseOperationRequest extends OperationRequest {
	public isValidRequest() {
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

    protected convertToMasterPlayerFindOptions(infoGetParameters: GNHashtable): MasterPlayerFindOptions {
		if (infoGetParameters.count() == 0) return null;

		let answer: MasterPlayerFindOptions = {};

		let external = infoGetParameters.getBoolean(AuthenticateParameterCode.External);
		let segments = infoGetParameters.getBoolean(AuthenticateParameterCode.Segments);
		let scriptData = infoGetParameters.getBoolean(AuthenticateParameterCode.ScriptData);
		let privateData = infoGetParameters.getBoolean(AuthenticateParameterCode.PrivateData);
		let displayName = infoGetParameters.getBoolean(AuthenticateParameterCode.DisplayName);
		let avatar = infoGetParameters.getBoolean(AuthenticateParameterCode.Avatar);
		let tsCreate = infoGetParameters.getBoolean(AuthenticateParameterCode.TsCreate);
		let tags = infoGetParameters.getBoolean(AuthenticateParameterCode.Tags);
		let playerBan = infoGetParameters.getBoolean(AuthenticateParameterCode.PlayerBan);
		let playerDatas = infoGetParameters.getBoolean(AuthenticateParameterCode.PlayerDatas);
		let playerCurrencies = infoGetParameters.getBoolean(AuthenticateParameterCode.PlayerCurrencies);
		let playerStatistics = infoGetParameters.getBoolean(AuthenticateParameterCode.PlayerStatistics);
		let tsLastLogin = infoGetParameters.getBoolean(AuthenticateParameterCode.TsLastLogin);
		let ipAddressCreate = infoGetParameters.getBoolean(AuthenticateParameterCode.IpAddressCreate);
		let countryCode = infoGetParameters.getBoolean(AuthenticateParameterCode.CountryCode);

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

    protected generateMasterPlayerOperationResponse(masterPlayer: MasterPlayer, masterPlayerFindOptions: MasterPlayerFindOptions, infoGetParameters: GNHashtable): GNHashtable {
		let answer = new GNHashtable();

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.external) {
            let gnExternal = new GNHashtable();

            let externalItem = masterPlayer.getExternal();

            if (externalItem.device != null) {
                let gnDevice = new GNHashtable();

                if (externalItem.device.customDeviceId != null) gnDevice.add(AuthenticateParameterCode.CustomDeviceId, externalItem.device.customDeviceId);
                if (externalItem.device.androidDeviceId != null) gnDevice.add(AuthenticateParameterCode.AndroidDeviceId, externalItem.device.androidDeviceId);
                if (externalItem.device.iOSDeviceId != null) gnDevice.add(AuthenticateParameterCode.iOSDeviceId, externalItem.device.iOSDeviceId);
                if (externalItem.device.windowsPhoneDeviceId != null) gnDevice.add(AuthenticateParameterCode.WindowsPhoneDeviceId, externalItem.device.windowsPhoneDeviceId);
                if (externalItem.device.windowsDeviceId != null) gnDevice.add(AuthenticateParameterCode.WindowsDeviceId, externalItem.device.windowsDeviceId);
                if (externalItem.device.linuxDeviceId != null) gnDevice.add(AuthenticateParameterCode.LinuxDeviceId, externalItem.device.linuxDeviceId);
                if (externalItem.device.macOSDeviceId != null) gnDevice.add(AuthenticateParameterCode.MacOSDeviceId, externalItem.device.macOSDeviceId);
                if (externalItem.device.editorDeviceId != null) gnDevice.add(AuthenticateParameterCode.EditorDeviceId, externalItem.device.editorDeviceId);

                gnExternal.add(AuthenticateParameterCode.Device, gnDevice);
            }
            
            if (externalItem.account != null) {
                let gnAccount = new GNHashtable();

                if (externalItem.account.username != null) gnAccount.add(AuthenticateParameterCode.Username, externalItem.account.username);

                gnExternal.add(AuthenticateParameterCode.Account, gnAccount);
            }

            if (externalItem.custom != null) {
                let gnCustom = new GNHashtable();

                if (externalItem.custom.customId != null) gnCustom.add(AuthenticateParameterCode.CustomId, externalItem.custom.customId);

                gnExternal.add(AuthenticateParameterCode.Custom, gnCustom);
            }

            if (externalItem.apple != null) {
                let gnApple = new GNHashtable();

                if (externalItem.apple.appleId != null) gnApple.add(AuthenticateParameterCode.AppleId, externalItem.apple.appleId);

                gnExternal.add(AuthenticateParameterCode.Apple, gnApple);
            }

            if (externalItem.google != null) {
                let gnGoogle = new GNHashtable();

                if (externalItem.google.googleId != null) gnGoogle.add(AuthenticateParameterCode.GoogleId, externalItem.google.googleId);

                gnExternal.add(AuthenticateParameterCode.Custom, gnGoogle);
            }

            if (externalItem.facebook != null) {
                let gnFacebook = new GNHashtable();

                if (externalItem.facebook.facebookId != null) gnFacebook.add(AuthenticateParameterCode.FacebookId, externalItem.facebook.facebookId);

                gnExternal.add(AuthenticateParameterCode.Facebook, gnFacebook);
            }

            if (externalItem.genericService != null) {
                let gnGenericServices = new GNArray();

                if (externalItem.genericService.genericServices != null) {

                    externalItem.genericService.genericServices.forEach((value, key: string) => {
                        let gnGenericService = new GNHashtable();
                        gnGenericService.add(AuthenticateParameterCode.ServiceName, key);
                        gnGenericService.add(AuthenticateParameterCode.ServiceId, value.serviceId);

                        gnGenericServices.add(gnGenericService);
                    });
                }

                gnExternal.add(AuthenticateParameterCode.GenericService, gnGenericServices);
            }

            answer.add(AuthenticateParameterCode.External, gnExternal);
        }

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.segments)
            answer.add(AuthenticateParameterCode.Segments, masterPlayer.getAllSegments());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.scriptData)
            answer.add(AuthenticateParameterCode.ScriptData, masterPlayer.getAllScriptData());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.privateData)
            answer.add(AuthenticateParameterCode.PrivateData, masterPlayer.getAllPrivateData());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.displayName)
            answer.add(AuthenticateParameterCode.DisplayName, masterPlayer.getDisplayName());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.avatar) {
            let avatar = masterPlayer.getAvatar();

            let gnAvatar = new GNHashtable();
            gnAvatar.add(AuthenticateParameterCode.Type, avatar.type);
            gnAvatar.add(AuthenticateParameterCode.Value, avatar.value);

            answer.add(AuthenticateParameterCode.Avatar, gnAvatar);
        }

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.tsCreate)
            answer.add(AuthenticateParameterCode.TsCreate, masterPlayer.getTsCreate());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.tags) {
            let tags = masterPlayer.getAllTags();
            let gnTags = new GNArray();
            tags.forEach((value: string | number | boolean, key: string) => {
                let gnTag = new GNHashtable();

                gnTag.add(AuthenticateParameterCode.Name, key);
                gnTag.add(AuthenticateParameterCode.Value, value);

                gnTags.add(gnTag);
            });
            answer.add(AuthenticateParameterCode.Tags, gnTags);
        }

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.playerBan) {
            let playerBan = masterPlayer.getPlayerBan();
            let gnPlayerBan = new GNHashtable();
            gnPlayerBan.add(AuthenticateParameterCode.TsExpire, playerBan.tsExpire);

            if (playerBan.reason != null) gnPlayerBan.add(AuthenticateParameterCode.Reason, playerBan.reason);
            answer.add(AuthenticateParameterCode.PlayerBan, gnPlayerBan);
        }

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.playerDatas) {
            let playerDatas = masterPlayer.getAllPlayerDatas();
            let gnInfoGetParameterDataKey = infoGetParameters.getGNArray(AuthenticateParameterCode.DataKeys);
            let gnPlayerDatas = new GNArray();

            for (let i = 0; i < playerDatas.length; i++) {
                let playerData = playerDatas[i];

                if (gnInfoGetParameterDataKey == null || gnInfoGetParameterDataKey.indexOf(playerData.key) != -1) {
                    let gnPlayerData = new GNHashtable();

                    gnPlayerData.add(AuthenticateParameterCode.Key, playerData.key);
                    gnPlayerData.add(AuthenticateParameterCode.Value, playerData.value);
                    gnPlayerData.add(AuthenticateParameterCode.Permission, playerData.permission);

                    gnPlayerDatas.add(gnPlayerData);
                }
            }

            answer.add(AuthenticateParameterCode.PlayerDatas, gnPlayerDatas);
        }

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.playerCurrencies) {
            let playerCurrencies = masterPlayer.getAllPlayerCurrencies();
            let gnInfoGetParameterCurrencyKey = infoGetParameters.getGNArray(AuthenticateParameterCode.CurrencyKeys);

            let gnPlayerCurrencies = new GNArray();

            playerCurrencies.forEach((value: CurrencyItem, key: string) => {
                if (gnInfoGetParameterCurrencyKey == null || gnInfoGetParameterCurrencyKey.indexOf(key) != -1) {
                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(AuthenticateParameterCode.Key, key);
                    gnPlayerCurrency.add(AuthenticateParameterCode.Value, value.value);

                    gnPlayerCurrencies.add(gnPlayerCurrency);
                }
            });

            answer.add(AuthenticateParameterCode.PlayerCurrencies, gnPlayerCurrencies);
        }

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.playerStatistics) {
            let playerStatistics = masterPlayer.getAllPlayerStatistics();
            let gnInfoGetParameterStatisticsKey = infoGetParameters.getGNArray(AuthenticateParameterCode.StatisticsKeys);

            let gnPlayerStatistics = new GNArray();

            playerStatistics.forEach((value: StatisticsItem, key: string) => {
                if (gnInfoGetParameterStatisticsKey == null || gnInfoGetParameterStatisticsKey.indexOf(key) != -1) {
                    let gnPlayerStatistic = new GNHashtable();

                    gnPlayerStatistic.add(AuthenticateParameterCode.Key, key);
                    gnPlayerStatistic.add(AuthenticateParameterCode.Value, value.value);

                    gnPlayerStatistics.add(gnPlayerStatistic);
                }
            });

            answer.add(AuthenticateParameterCode.PlayerStatistics, gnPlayerStatistics);
        }
        
        if (masterPlayerFindOptions == null || masterPlayerFindOptions.tsLastLogin)
            answer.add(AuthenticateParameterCode.TsLastLogin, masterPlayer.getTsLastLogin());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.ipAddressCreate)
            answer.add(AuthenticateParameterCode.IpAddressCreate, masterPlayer.getIpAddressCreate());

        if (masterPlayerFindOptions == null || masterPlayerFindOptions.countryCode)
            answer.add(AuthenticateParameterCode.CountryCode, masterPlayer.getCountryCode());

		return answer;
	}

    protected setupAuthInfo(operationResponse: OperationResponse, masterPlayer: MasterPlayer) {
        let userId = masterPlayer.getUserId();

        masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
        masterPlayer.saveAsync();

		let oldAuthInfo = this.gnServer.getApiMiddleware().getAuthInfoByUserId(userId);

		if (oldAuthInfo) {
			oldAuthInfo.setOtherUserLogin(true);
			this.gnServer.getApiMiddleware().updateAuthInfo(oldAuthInfo);
		}

		let newAuth = AuthInfo.Builder()
			.setUserId(userId)
			.setSocketId('')
			.setSocketRoomIds([])
			.build();
		let newAuthInfo = this.gnServer.getApiMiddleware().generateAuthToken(newAuth);

		operationResponse.setParameter(ParameterCode.AuthToken, newAuthInfo.getAuthToken());
	}

    protected generateNewMasterPlayerResult(ipAddressCreate: string) {

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let answer = {} as any;

        answer["userId"] = this.getUserId();
        answer["external"] = {};
        answer["segments"] = [];
        answer["scriptData"] = {};
        answer["privateData"] = {};
        answer["displayName"] = "";
        answer["avatar"] = { "type": 0, "value": "0"};
        answer["tsCreate"] = currentMilliseconds;
        answer["tags"] = [];
        answer["playerBan"] = {"tsExpire": 0, "reason": ""};
        answer["playerDatas"] = [];
        answer["playerCurrencies"] = {};
        answer["playerStatistics"] = {};
        answer["tsLastLogin"] = currentMilliseconds;
        answer["ipAddressCreate"] = ipAddressCreate;
        answer["countryCode"] = <number>CountryCodeType.Unknown;

        return answer;
    }

    private getUserId(): string {
        return "";
    }
}