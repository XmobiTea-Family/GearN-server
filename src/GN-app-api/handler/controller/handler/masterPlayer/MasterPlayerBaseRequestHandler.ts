import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export abstract class MasterPlayerBaseRequestHandler extends RequestHandler {
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
			&& infoRequestParam.email
			&& infoRequestParam.pushNotifications;
	}

	protected convertToMasterPlayerFindOptions(infoRequestParam: InfoRequestParam): MasterPlayerFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

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

	protected generateInfoResponseParameters(masterPlayer: MasterPlayer, infoRequestParam: InfoRequestParam): GNHashtable {
		let answer = new GNHashtable();

		if (infoRequestParam.external)
			answer.add(ParameterCode.External, this.generateExternal(masterPlayer));

		if (infoRequestParam.segments)
			answer.add(ParameterCode.Segments, this.generateSegments(masterPlayer));

		if (infoRequestParam.customDatas)
			answer.add(ParameterCode.CustomDatas, this.generateCustomDatas(masterPlayer, infoRequestParam.customDataKeys));

		if (infoRequestParam.displayName)
			answer.add(ParameterCode.DisplayName, this.generateDisplayName(masterPlayer));

		if (infoRequestParam.avatar)
			answer.add(ParameterCode.Avatar, this.generateAvatar(masterPlayer));

		if (infoRequestParam.tsCreate)
			answer.add(ParameterCode.TsCreate, this.generateTsCreate(masterPlayer));

		if (infoRequestParam.tags)
			answer.add(ParameterCode.Tags, this.generateTags(masterPlayer, infoRequestParam.tagKeys));

		if (infoRequestParam.playerBan)
			answer.add(ParameterCode.PlayerBan, this.generatePlayerBan(masterPlayer));

		if (infoRequestParam.playerDatas)
			answer.add(ParameterCode.PlayerDatas, this.generatePlayerDatas(masterPlayer, infoRequestParam.playerDataKeys));

		if (infoRequestParam.playerCurrencies)
			answer.add(ParameterCode.PlayerCurrencies, this.generatePlayerCurrencies(masterPlayer, infoRequestParam.playerCurrencyKeys));

		if (infoRequestParam.playerStatistics)
			answer.add(ParameterCode.PlayerStatistics, this.generatePlayerStatistics(masterPlayer, infoRequestParam.playerStatisticsKeys));

		if (infoRequestParam.tsLastLogin)
			answer.add(ParameterCode.TsLastLogin, this.generateTsLastLogin(masterPlayer));

		if (infoRequestParam.ipAddressCreate)
			answer.add(ParameterCode.IpAddressCreate, this.generateIpAddressCreate(masterPlayer));

		if (infoRequestParam.countryCode)
			answer.add(ParameterCode.CountryCode, this.generateCountryCode(masterPlayer));

		if (infoRequestParam.email)
			answer.add(ParameterCode.Email, this.generateEmail(masterPlayer));

		if (infoRequestParam.pushNotifications)
			answer.add(ParameterCode.PushNotifications, this.generatePushNotifications(masterPlayer));

		return answer;
	}

	protected generateExternal(masterPlayer: MasterPlayer): GNHashtable {
		let gnExternal = new GNHashtable();

		let externalItem = masterPlayer.getExternal();

		if (externalItem.device != null) {
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
			let gnAccount = new GNHashtable();

			if (externalItem.account.username != null) gnAccount.add(ParameterCode.Username, externalItem.account.username);

			gnExternal.add(ParameterCode.Account, gnAccount);
		}

		if (externalItem.custom != null) {
			let gnCustom = new GNHashtable();

			if (externalItem.custom.customId != null) gnCustom.add(ParameterCode.CustomId, externalItem.custom.customId);

			gnExternal.add(ParameterCode.Custom, gnCustom);
		}

		if (externalItem.apple != null) {
			let gnApple = new GNHashtable();

			gnApple.add(ParameterCode.AppleId, externalItem.apple.appleId);
			gnApple.add(ParameterCode.Email, externalItem.apple.email);

			gnExternal.add(ParameterCode.Apple, gnApple);
		}

		if (externalItem.google != null) {
			let gnGoogle = new GNHashtable();

			gnGoogle.add(ParameterCode.GoogleId, externalItem.google.googleId);
			gnGoogle.add(ParameterCode.DisplayName, externalItem.google.displayName);
			gnGoogle.add(ParameterCode.Email, externalItem.google.email);

			gnExternal.add(ParameterCode.Google, gnGoogle);
		}

		if (externalItem.facebook != null) {
			let gnFacebook = new GNHashtable();

			gnFacebook.add(ParameterCode.FacebookId, externalItem.facebook.facebookId);
			gnFacebook.add(ParameterCode.DisplayName, externalItem.facebook.displayName);
			gnFacebook.add(ParameterCode.Email, externalItem.facebook.email);

			gnExternal.add(ParameterCode.Facebook, gnFacebook);
		}

		if (externalItem.genericService != null) {
			let gnGenericServices = new GNArray();

			if (externalItem.genericService.genericServices != null) {

				externalItem.genericService.genericServices.forEach((value, key: string) => {
					let gnGenericService = new GNHashtable();
					gnGenericService.add(ParameterCode.ServiceName, key);
					gnGenericService.add(ParameterCode.ServiceId, value.serviceId);

					gnGenericServices.add(gnGenericService);
				});
			}

			gnExternal.add(ParameterCode.GenericService, gnGenericServices);
		}

		if (externalItem.googlePlayGameService != null) {
			let gnGooglePlayGameService = new GNHashtable();

			gnGooglePlayGameService.add(ParameterCode.PlayerId, externalItem.googlePlayGameService.playerId);
			gnGooglePlayGameService.add(ParameterCode.DisplayName, externalItem.googlePlayGameService.displayName);
			gnGooglePlayGameService.add(ParameterCode.Email, externalItem.googlePlayGameService.email);

			gnExternal.add(ParameterCode.GooglePlayGameService, gnGooglePlayGameService);
		}

		if (externalItem.gameCenter != null) {
			let gnGameCenter = new GNHashtable();

			gnGameCenter.add(ParameterCode.PlayerId, externalItem.gameCenter.playerId);
			gnGameCenter.add(ParameterCode.DisplayName, externalItem.gameCenter.displayName);
			gnGameCenter.add(ParameterCode.Email, externalItem.gameCenter.email);

			gnExternal.add(ParameterCode.GameCenter, gnGameCenter);
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

					gnCustomData.add(ParameterCode.Key, customDatasSettingsItem.key);
					gnCustomData.add(ParameterCode.Value, value);

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

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

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

					gnTag.add(ParameterCode.Key, tagsSettingsItem.key);
					gnTag.add(ParameterCode.Value, value);

					gnTags.add(gnTag);
				}
			}
		}

		return gnTags;
	}

	protected generatePlayerBan(masterPlayer: MasterPlayer): GNHashtable {
		let gnPlayerBan = new GNHashtable();

		let playerBan = masterPlayer.getPlayerBan();

		gnPlayerBan.add(ParameterCode.TsExpire, playerBan.tsExpire);
		gnPlayerBan.add(ParameterCode.Reason, playerBan.reason);

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

					gnPlayerData.add(ParameterCode.Key, playerData.key);
					gnPlayerData.add(ParameterCode.Value, playerData.value);

					gnPlayerDatas.add(gnPlayerData);
				}
			}
		}

		return gnPlayerDatas;
	}

	protected generatePlayerCurrencies(masterPlayer: MasterPlayer, playerCurrencyKeys: Array<string>): GNArray {
		let gnPlayerCurrencies = new GNArray();

		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

		for (let i = 0; i < masterPlayerSettings.playerCurrenciesSettings.length; i++) {
			let playerCurrenciesSettingsItem = masterPlayerSettings.playerCurrenciesSettings[i];

			if (playerCurrencyKeys == null || playerCurrencyKeys.indexOf(playerCurrenciesSettingsItem.key) != -1) {
				let playerCurrency = masterPlayer.getPlayerCurrency(playerCurrenciesSettingsItem.key);

				let gnPlayerCurrency = new GNHashtable();
				gnPlayerCurrency.add(ParameterCode.Key, playerCurrenciesSettingsItem.key);

				if (playerCurrency != null) gnPlayerCurrency.add(ParameterCode.Value, playerCurrency.value);
				else gnPlayerCurrency.add(ParameterCode.Value, playerCurrenciesSettingsItem.initialValue);

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
				gnPlayerStatistic.add(ParameterCode.Key, playerStatisticsSettingsItem.key);

				if (playerStatistics != null) gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);
				else gnPlayerStatistic.add(ParameterCode.Value, playerStatisticsSettingsItem.initialValue);

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

	protected generatePushNotifications(masterPlayer: MasterPlayer): GNArray {
		let gnPushNotifications = new GNArray();

		let pushNotifications = masterPlayer.getAllPushNotifications();

		for (let i = 0; i < pushNotifications.length; i++) {
			let pushNotification = pushNotifications[i];

			let gnPushNotification = new GNHashtable();
			gnPushNotification.add(ParameterCode.PushId, pushNotification.pushId);
			gnPushNotification.add(ParameterCode.PlatformType, pushNotification.platformType);
			gnPushNotification.add(ParameterCode.Token, pushNotification.token);

			gnPushNotifications.add(gnPushNotification);
		}

		return gnPushNotifications;
	}

}
