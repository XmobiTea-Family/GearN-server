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

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetMasterGameSettingsRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetMasterGameSettings;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetMasterGameSettingsOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().dashboard.getMasterGameSettings.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetMasterGameSettings", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "masterGameSettings" });

		// Stores the resolved master game settings instance for the current execution flow.
		let masterGameSettings = new MasterGameSettings(result, collection);

		{
			// Stores the resolved thirt party settings instance for the current execution flow.
			let thirtPartySettings = masterGameSettings.getThirtPartySettings();

			// Stores the resolved GearN thirt party settings instance for the current execution flow.
			let gnThirtPartySettings = new GNHashtable();

			if (thirtPartySettings.googleSettings != null) {
				// Stores the resolved GearN google settings instance for the current execution flow.
				let gnGoogleSettings = new GNHashtable();

				gnGoogleSettings.add(ParameterCode.GoogleClientId, thirtPartySettings.googleSettings.googleClientId);
				gnGoogleSettings.add(ParameterCode.PackageId, thirtPartySettings.googleSettings.packageId);
				gnGoogleSettings.add(ParameterCode.PublicRSAKey, thirtPartySettings.googleSettings.publicRSAKey);

				gnThirtPartySettings.add(ParameterCode.GoogleSettings, gnGoogleSettings);
			}

			if (thirtPartySettings.facebookSettings != null) {
				// Stores the resolved GearN facebook settings instance for the current execution flow.
				let gnFacebookSettings = new GNHashtable();

				gnFacebookSettings.add(ParameterCode.FacebookAppId, thirtPartySettings.facebookSettings.facebookAppId);
				gnFacebookSettings.add(ParameterCode.PackageId, thirtPartySettings.facebookSettings.packageId);
				gnFacebookSettings.add(ParameterCode.FacebookInappSecret, thirtPartySettings.facebookSettings.facebookInappSecret);
				gnFacebookSettings.add(ParameterCode.FacebookAppToken, thirtPartySettings.facebookSettings.facebookAppToken);

				gnThirtPartySettings.add(ParameterCode.FacebookSettings, gnFacebookSettings);
			}

			if (thirtPartySettings.appleSettings != null) {
				// Stores the resolved GearN apple settings instance for the current execution flow.
				let gnAppleSettings = new GNHashtable();

				gnAppleSettings.add(ParameterCode.AppleClientId, thirtPartySettings.appleSettings.appleClientId);
				gnAppleSettings.add(ParameterCode.SandboxEnable, thirtPartySettings.appleSettings.sandboxEnable);
				gnAppleSettings.add(ParameterCode.IssuerId, thirtPartySettings.appleSettings.issuerId);
				gnAppleSettings.add(ParameterCode.KeyId, thirtPartySettings.appleSettings.keyId);
				gnAppleSettings.add(ParameterCode.P8Content, thirtPartySettings.appleSettings.p8Content);

				gnThirtPartySettings.add(ParameterCode.AppleSettings, gnAppleSettings);
			}

			if (thirtPartySettings.googlePlayGameSettings != null) {
				// Stores the resolved GearN google play game settings instance for the current execution flow.
				let gnGooglePlayGameSettings = new GNHashtable();

				gnGooglePlayGameSettings.add(ParameterCode.ApplicationId, thirtPartySettings.googlePlayGameSettings.applicationId);
				gnGooglePlayGameSettings.add(ParameterCode.ClientId, thirtPartySettings.googlePlayGameSettings.clientId);
				gnGooglePlayGameSettings.add(ParameterCode.ClientSecret, thirtPartySettings.googlePlayGameSettings.clientSecret);
				gnGooglePlayGameSettings.add(ParameterCode.RedirectUri, thirtPartySettings.googlePlayGameSettings.redirectUri);

				gnThirtPartySettings.add(ParameterCode.GooglePlayGameSettings, gnGooglePlayGameSettings);
			}

			if (thirtPartySettings.gameCenterSettings != null) {
				// Stores the resolved GearN game center settings instance for the current execution flow.
				let gnGameCenterSettings = new GNHashtable();

				gnGameCenterSettings.add(ParameterCode.PackageId, thirtPartySettings.gameCenterSettings.packageId);

				gnThirtPartySettings.add(ParameterCode.GameCenterSettings, gnGameCenterSettings);
			}

			operationResponse.setParameter(ParameterCode.ThirtPartySettings, gnThirtPartySettings);
		}

		{
			// Stores the resolved master player settings instance for the current execution flow.
			let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();

			// Stores the resolved GearN master player settings instance for the current execution flow.
			let gnMasterPlayerSettings = new GNHashtable();

			{
				// Stores the resolved GearN generic service settings instance for the current execution flow.
				let gnGenericServiceSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.genericServiceSettings.length; i++) {
					// Stores the generic service setting value used in the current execution flow.
					let genericServiceSetting = masterPlayerSettings.genericServiceSettings[i];

					// Stores the GearN generic service setting value used in the current execution flow.
					let gnGenericServiceSetting = new GNHashtable();

					gnGenericServiceSetting.add(ParameterCode.ServiceName, genericServiceSetting.serviceName);

					gnGenericServiceSettings.add(gnGenericServiceSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.GenericServiceSettings, gnGenericServiceSettings);
			}

			{
				// Stores the resolved GearN player currencies settings instance for the current execution flow.
				let gnPlayerCurrenciesSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.playerCurrenciesSettings.length; i++) {
					// Stores the player currencies setting value used in the current execution flow.
					let playerCurrenciesSetting = masterPlayerSettings.playerCurrenciesSettings[i];

					// Stores the GearN player currencies setting value used in the current execution flow.
					let gnPlayerCurrenciesSetting = new GNHashtable();

					gnPlayerCurrenciesSetting.add(ParameterCode.Key, playerCurrenciesSetting.key);
					gnPlayerCurrenciesSetting.add(ParameterCode.InitialValue, playerCurrenciesSetting.initialValue);
					gnPlayerCurrenciesSetting.add(ParameterCode.Description, playerCurrenciesSetting.description);
					gnPlayerCurrenciesSetting.add(ParameterCode.Index, playerCurrenciesSetting.index);

					gnPlayerCurrenciesSettings.add(gnPlayerCurrenciesSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.PlayerCurrenciesSettings, gnPlayerCurrenciesSettings);
			}

			{
				// Stores the resolved GearN player statistics settings instance for the current execution flow.
				let gnPlayerStatisticsSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
					// Stores the player statistics setting value used in the current execution flow.
					let playerStatisticsSetting = masterPlayerSettings.playerStatisticsSettings[i];

					// Stores the GearN player statistics setting value used in the current execution flow.
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

				gnMasterPlayerSettings.add(ParameterCode.PlayerStatisticsSettings, gnPlayerStatisticsSettings);
			}

			{
				// Stores the resolved GearN player datas settings instance for the current execution flow.
				let gnPlayerDatasSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.playerDatasSettings.length; i++) {
					// Stores the player datas setting value used in the current execution flow.
					let playerDatasSetting = masterPlayerSettings.playerDatasSettings[i];

					// Stores the GearN player datas setting value used in the current execution flow.
					let gnPlayerDatasSetting = new GNHashtable();

					gnPlayerDatasSetting.add(ParameterCode.Key, playerDatasSetting.key);
					gnPlayerDatasSetting.add(ParameterCode.Permission, playerDatasSetting.permission);
					gnPlayerDatasSetting.add(ParameterCode.Description, playerDatasSetting.description);

					gnPlayerDatasSettings.add(gnPlayerDatasSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.PlayerDatasSettings, gnPlayerDatasSettings);
			}

			{
				// Stores the resolved GearN custom datas settings instance for the current execution flow.
				let gnCustomDatasSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.customDatasSettings.length; i++) {
					// Stores the custom datas setting value used in the current execution flow.
					let customDatasSetting = masterPlayerSettings.customDatasSettings[i];

					// Stores the GearN custom datas setting value used in the current execution flow.
					let gnCustomDatasSetting = new GNHashtable();

					gnCustomDatasSetting.add(ParameterCode.Key, customDatasSetting.key);
					gnCustomDatasSetting.add(ParameterCode.Permission, customDatasSetting.permission);
					gnCustomDatasSetting.add(ParameterCode.Description, customDatasSetting.description);

					gnCustomDatasSettings.add(gnCustomDatasSetting);
				}

				gnMasterPlayerSettings.add(ParameterCode.CustomDatasSettings, gnCustomDatasSettings);
			}

			{
				// Stores the resolved GearN tags settings instance for the current execution flow.
				let gnTagsSettings = new GNArray();

				for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
					let tagsSetting = masterPlayerSettings.tagsSettings[i];

					// Stores the GearN tags setting value used in the current execution flow.
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
			// Stores the resolved email settings instance for the current execution flow.
			let emailSettings = masterGameSettings.getEmailSettings();

			// Stores the resolved GearN email settings instance for the current execution flow.
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
			// Stores the resolved push notification settings instance for the current execution flow.
			let pushNotificationSettings = masterGameSettings.getPushNotificationSettings();

			// Stores the resolved GearN push notification settings instance for the current execution flow.
			let gnPushNotificationSettings = new GNHashtable();
			gnPushNotificationSettings.add(ParameterCode.ProjectId, pushNotificationSettings.projectId);
			gnPushNotificationSettings.add(ParameterCode.ClientEmail, pushNotificationSettings.clientEmail);
			gnPushNotificationSettings.add(ParameterCode.PrivateKey, pushNotificationSettings.privateKey);

			operationResponse.setParameter(ParameterCode.PushNotificationSettings, gnPushNotificationSettings);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetMasterGameSettings", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
