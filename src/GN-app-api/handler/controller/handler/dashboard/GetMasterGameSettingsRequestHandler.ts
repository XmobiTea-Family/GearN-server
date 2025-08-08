import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterGameSettings } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterGameSettings";

class GetMasterGameSettingsOperationRequest extends OperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetMasterGameSettingsRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetMasterGameSettings;
	}

	public override getCommonOperationRequest() {
		return GetMasterGameSettingsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getMasterGameSettings.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	private async execute(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetMasterGameSettings", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "masterGameSettings" });

		let masterGameSettings = new MasterGameSettings(result, collection);

		{
			let thirtPartySettings = masterGameSettings.getThirtPartySettings();

			let gnThirtPartySettings = new GNHashtable();

			if (thirtPartySettings.googleSettings != null) {
				let gnGoogleSettings = new GNHashtable();

				gnGoogleSettings.add(ParameterCode.GoogleClientId, thirtPartySettings.googleSettings.googleClientId);
				gnGoogleSettings.add(ParameterCode.PackageId, thirtPartySettings.googleSettings.packageId);
				gnGoogleSettings.add(ParameterCode.PublicRSAKey, thirtPartySettings.googleSettings.publicRSAKey);

				gnThirtPartySettings.add(ParameterCode.GoogleSettings, gnGoogleSettings);
			}

			if (thirtPartySettings.facebookSettings != null) {
				let gnFacebookSettings = new GNHashtable();

				gnFacebookSettings.add(ParameterCode.FacebookAppId, thirtPartySettings.facebookSettings.facebookAppId);
				gnFacebookSettings.add(ParameterCode.PackageId, thirtPartySettings.facebookSettings.packageId);
				gnFacebookSettings.add(ParameterCode.FacebookInappSecret, thirtPartySettings.facebookSettings.facebookInappSecret);
				gnFacebookSettings.add(ParameterCode.FacebookAppToken, thirtPartySettings.facebookSettings.facebookAppToken);

				gnThirtPartySettings.add(ParameterCode.FacebookSettings, gnFacebookSettings);
			}

			if (thirtPartySettings.appleSettings != null) {
				let gnAppleSettings = new GNHashtable();

				gnAppleSettings.add(ParameterCode.AppleClientId, thirtPartySettings.appleSettings.appleClientId);
				gnAppleSettings.add(ParameterCode.SandboxEnable, thirtPartySettings.appleSettings.sandboxEnable);
				gnAppleSettings.add(ParameterCode.IssuerId, thirtPartySettings.appleSettings.issuerId);
				gnAppleSettings.add(ParameterCode.KeyId, thirtPartySettings.appleSettings.keyId);
				gnAppleSettings.add(ParameterCode.P8Content, thirtPartySettings.appleSettings.p8Content);

				gnThirtPartySettings.add(ParameterCode.AppleSettings, gnAppleSettings);
			}

			if (thirtPartySettings.googlePlayGameSettings != null) {
				let gnGooglePlayGameSettings = new GNHashtable();

				gnGooglePlayGameSettings.add(ParameterCode.ApplicationId, thirtPartySettings.googlePlayGameSettings.applicationId);
				gnGooglePlayGameSettings.add(ParameterCode.ClientId, thirtPartySettings.googlePlayGameSettings.clientId);
				gnGooglePlayGameSettings.add(ParameterCode.ClientSecret, thirtPartySettings.googlePlayGameSettings.clientSecret);
				gnGooglePlayGameSettings.add(ParameterCode.RedirectUri, thirtPartySettings.googlePlayGameSettings.redirectUri);

				gnThirtPartySettings.add(ParameterCode.GooglePlayGameSettings, gnGooglePlayGameSettings);
			}

			if (thirtPartySettings.gameCenterSettings != null) {
				let gnGameCenterSettings = new GNHashtable();

				gnGameCenterSettings.add(ParameterCode.PackageId, thirtPartySettings.gameCenterSettings.packageId);

				gnThirtPartySettings.add(ParameterCode.GameCenterSettings, gnGameCenterSettings);
			}

			operationResponse.setParameter(ParameterCode.ThirtPartySettings, gnThirtPartySettings);
		}

		{
			let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();

			let gnMasterPlayerSettings = new GNHashtable();

			{
				let gnGenericServiceSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.genericServiceSettings.length; i++) {
					let genericServiceSetting = masterPlayerSettings.genericServiceSettings[i];

					let gnGenericServiceSetting = new GNHashtable();

					gnGenericServiceSetting.add(ParameterCode.ServiceName, genericServiceSetting.serviceName);

					gnGenericServiceSettings.add(gnGenericServiceSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.GenericServiceSettings, gnGenericServiceSettings);
			}

			{
				let gnPlayerCurrencySettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.playerCurrencySettings.length; i++) {
					let playerCurrencySetting = masterPlayerSettings.playerCurrencySettings[i];

					let gnPlayerCurrencySetting = new GNHashtable();

					gnPlayerCurrencySetting.add(ParameterCode.Key, playerCurrencySetting.key);
					gnPlayerCurrencySetting.add(ParameterCode.InitialValue, playerCurrencySetting.initialValue);
					gnPlayerCurrencySetting.add(ParameterCode.Description, playerCurrencySetting.description);
					gnPlayerCurrencySetting.add(ParameterCode.Index, playerCurrencySetting.index);

					gnPlayerCurrencySettings.add(gnPlayerCurrencySetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.CurrencySettings, gnPlayerCurrencySettings);
			}

			{
				let gnPlayerStatisticsSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = masterPlayerSettings.playerStatisticsSettings[i];

					let gnPlayerStatisticsSetting = new GNHashtable();

					gnPlayerStatisticsSetting.add(ParameterCode.Key, playerStatisticsSetting.key);
					gnPlayerStatisticsSetting.add(ParameterCode.StatisticsAggregationMethod, playerStatisticsSetting.statisticsAggregationMethod);
					gnPlayerStatisticsSetting.add(ParameterCode.MinimumValue, playerStatisticsSetting.minimumValue);
					gnPlayerStatisticsSetting.add(ParameterCode.MaximumValue, playerStatisticsSetting.maximumValue);
					gnPlayerStatisticsSetting.add(ParameterCode.InitialValue, playerStatisticsSetting.initialValue);
					gnPlayerStatisticsSetting.add(ParameterCode.Description, playerStatisticsSetting.description);
					gnPlayerStatisticsSetting.add(ParameterCode.Index, playerStatisticsSetting.index);

					gnPlayerStatisticsSettings.add(gnPlayerStatisticsSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.StatisticsSettings, gnPlayerStatisticsSettings);
			}

			{
				let gnPlayerDatasSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.playerDatasSettings.length; i++) {
					let playerDatasSetting = masterPlayerSettings.playerDatasSettings[i];

					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(ParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(ParameterCode.Permission, playerDatasSetting.permission);
					gnPlayerDatasSetting.add(ParameterCode.Description, playerDatasSetting.description);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.DatasSettings, gnPlayerDatasSettings);
			}

			{
				let gnCustomDatasSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.customDatasSettings.length; i++) {
					let customDatasSetting = masterPlayerSettings.customDatasSettings[i];

					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				let gnTagsSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
					let tagsSetting = masterPlayerSettings.tagsSettings[i];

					let gnTagsSetting = new GNHashtable();

					gnTagsSetting.add(ParameterCode.Key, tagsSetting.key);
					gnTagsSetting.add(ParameterCode.Description, tagsSetting.description);
					gnTagsSetting.add(ParameterCode.Index, tagsSetting.index);

					gnTagsSettings.add(gnTagsSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.TagsSettings, gnTagsSettings);
			}

			operationResponse.setParameter(ParameterCode.MasterPlayerSettings, gnMasterPlayerSettings);
		}

		{
			let emailSettings = masterGameSettings.getEmailSettings();

			let gnEmailSettings = new GNHashtable();
			gnEmailSettings.add(ParameterCode.SendFrom, emailSettings.sendFrom);
			gnEmailSettings.add(ParameterCode.Host, emailSettings.host);
			gnEmailSettings.add(ParameterCode.Port, emailSettings.port);
			gnEmailSettings.add(ParameterCode.Secure, emailSettings.secure);
			gnEmailSettings.add(ParameterCode.Username, emailSettings.username);
			gnEmailSettings.add(ParameterCode.Password, emailSettings.password);

			operationResponse.setParameter(ParameterCode.EmailSettings, gnEmailSettings);
		}

		{
			let pushNotificationSettings = masterGameSettings.getPushNotificationSettings();

			let gnPushNotificationSettings = new GNHashtable();
			gnPushNotificationSettings.add(ParameterCode.ProjectId, pushNotificationSettings.projectId);
			gnPushNotificationSettings.add(ParameterCode.ClientEmail, pushNotificationSettings.clientEmail);
			gnPushNotificationSettings.add(ParameterCode.PrivateKey, pushNotificationSettings.privateKey);

			operationResponse.setParameter(ParameterCode.PushNotificationSettings, gnPushNotificationSettings);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetMasterGameSetings", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
