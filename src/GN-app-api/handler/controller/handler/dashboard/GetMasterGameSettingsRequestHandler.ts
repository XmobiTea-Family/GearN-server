import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

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

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

        let result = await collection.findOne({ type: "masterGameSettings" });

        let masterGameSettings = new MasterGameSettings(result, collection);

        let thirtPartySettings = masterGameSettings.getThirtPartySettings();

        let gnThirtPartySettings = new GNHashtable();

        if (thirtPartySettings.googleSettings != null) {
            let gnGoogleSettings = new GNHashtable();

            gnGoogleSettings.add(GNParameterCode.GoogleClientId, thirtPartySettings.googleSettings.googleClientId);
            gnGoogleSettings.add(GNParameterCode.PackageId, thirtPartySettings.googleSettings.packageId);
            gnGoogleSettings.add(GNParameterCode.PublicRSAKey, thirtPartySettings.googleSettings.publicRSAKey);

            gnThirtPartySettings.add(GNParameterCode.GoogleSettings, gnGoogleSettings);
        }

        if (thirtPartySettings.facebookSettings != null) {
            let gnFacebookSettings = new GNHashtable();

            gnFacebookSettings.add(GNParameterCode.FacebookAppId, thirtPartySettings.facebookSettings.facebookAppId);
            gnFacebookSettings.add(GNParameterCode.PackageId, thirtPartySettings.facebookSettings.packageId);
            gnFacebookSettings.add(GNParameterCode.FacebookInappSecret, thirtPartySettings.facebookSettings.facebookInappSecret);
            gnFacebookSettings.add(GNParameterCode.FacebookAppToken, thirtPartySettings.facebookSettings.facebookAppToken);

            gnThirtPartySettings.add(GNParameterCode.FacebookSettings, gnFacebookSettings);
        }

        if (thirtPartySettings.appleSettings != null) {
            let gnAppleSettings = new GNHashtable();

            gnAppleSettings.add(GNParameterCode.AppleClientId, thirtPartySettings.appleSettings.appleClientId);
            gnAppleSettings.add(GNParameterCode.SandboxEnable, thirtPartySettings.appleSettings.sandboxEnable);
            gnAppleSettings.add(GNParameterCode.IssuerId, thirtPartySettings.appleSettings.issuerId);
            gnAppleSettings.add(GNParameterCode.KeyId, thirtPartySettings.appleSettings.keyId);
            gnAppleSettings.add(GNParameterCode.P8Content, thirtPartySettings.appleSettings.p8Content);

            gnThirtPartySettings.add(GNParameterCode.AppleSettings, gnAppleSettings);
        }

        if (thirtPartySettings.googlePlayGameSettings != null) {
            let gnGooglePlayGameSettings = new GNHashtable();

            gnGooglePlayGameSettings.add(GNParameterCode.ApplicationId, thirtPartySettings.googlePlayGameSettings.applicationId);
            gnGooglePlayGameSettings.add(GNParameterCode.ClientId, thirtPartySettings.googlePlayGameSettings.clientId);
            gnGooglePlayGameSettings.add(GNParameterCode.ClientSecret, thirtPartySettings.googlePlayGameSettings.clientSecret);
            gnGooglePlayGameSettings.add(GNParameterCode.RedirectUri, thirtPartySettings.googlePlayGameSettings.redirectUri);

            gnThirtPartySettings.add(GNParameterCode.GooglePlayGameSettings, gnGooglePlayGameSettings);
        }

        if (thirtPartySettings.gameCenterSettings != null) {
            let gnGameCenterSettings = new GNHashtable();

            gnGameCenterSettings.add(GNParameterCode.PackageId, thirtPartySettings.gameCenterSettings.packageId);

            gnThirtPartySettings.add(GNParameterCode.GameCenterSettings, gnGameCenterSettings);
        }

        operationResponse.setParameter(GNParameterCode.ThirtPartySettings, gnThirtPartySettings);

        let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();

        let gnMasterPlayerSettings = new GNHashtable();

        {
            let gnGenericServiceSettings = new GNArray();

            for (let i = 0; i < masterPlayerSettings.genericServiceSettings.length; i++) {
                let genericServiceSetting = masterPlayerSettings.genericServiceSettings[i];

                let gnGenericServiceSetting = new GNHashtable();

                gnGenericServiceSetting.add(GNParameterCode.ServiceName, genericServiceSetting.serviceName);

                gnGenericServiceSettings.add(gnGenericServiceSetting);
            }

            gnMasterPlayerSettings.add(GNParameterCode.GenericServiceSettings, gnGenericServiceSettings);
        }

        {
            let gnPlayerCurrencySettings = new GNArray();

            for (let i = 0; i < masterPlayerSettings.playerCurrencySettings.length; i++) {
                let playerCurrencySetting = masterPlayerSettings.playerCurrencySettings[i];

                let gnPlayerCurrencySetting = new GNHashtable();

                gnPlayerCurrencySetting.add(GNParameterCode.Key, playerCurrencySetting.key);
                gnPlayerCurrencySetting.add(GNParameterCode.InitialValue, playerCurrencySetting.initialValue);
                gnPlayerCurrencySetting.add(GNParameterCode.DisplayName, playerCurrencySetting.displayName);
                gnPlayerCurrencySetting.add(GNParameterCode.Index, playerCurrencySetting.index);

                gnPlayerCurrencySettings.add(gnPlayerCurrencySetting);
            }

            gnMasterPlayerSettings.add(GNParameterCode.CurrencySettings, gnPlayerCurrencySettings);
        }

        {
            let gnPlayerStatisticsSettings = new GNArray();

            for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
                let playerStatisticsSetting = masterPlayerSettings.playerStatisticsSettings[i];

                let gnPlayerStatisticsSetting = new GNHashtable();

                gnPlayerStatisticsSetting.add(GNParameterCode.Key, playerStatisticsSetting.key);
                gnPlayerStatisticsSetting.add(GNParameterCode.StatisticsAggregationMethod, playerStatisticsSetting.statisticsAggregationMethod);
                gnPlayerStatisticsSetting.add(GNParameterCode.MinimumValue, playerStatisticsSetting.minimumValue);
                gnPlayerStatisticsSetting.add(GNParameterCode.MaximumValue, playerStatisticsSetting.maximumValue);
                gnPlayerStatisticsSetting.add(GNParameterCode.InitialValue, playerStatisticsSetting.initialValue);
                gnPlayerStatisticsSetting.add(GNParameterCode.DisplayName, playerStatisticsSetting.displayName);
                gnPlayerStatisticsSetting.add(GNParameterCode.Index, playerStatisticsSetting.index);

                gnPlayerStatisticsSettings.add(gnPlayerStatisticsSetting);
            }

            gnMasterPlayerSettings.add(GNParameterCode.StatisticsSettings, gnPlayerStatisticsSettings);
        }

        {
            let gnPlayerDatasSettings = new GNArray();

            for (let i = 0; i < masterPlayerSettings.playerDatasSettings.length; i++) {
                let playerDatasSetting = masterPlayerSettings.playerDatasSettings[i];

                let gnPlayerDatasSetting = new GNHashtable();

                gnPlayerDatasSetting.add(GNParameterCode.Key, playerDatasSetting.key);
                gnPlayerDatasSetting.add(GNParameterCode.Permission, playerDatasSetting.permission);

                gnPlayerDatasSettings.add(gnPlayerDatasSetting);
            }

            gnMasterPlayerSettings.add(GNParameterCode.DatasSettings, gnPlayerDatasSettings);
        }

        {
            let gnCustomDatasSettings = new GNArray();

            for (let i = 0; i < masterPlayerSettings.customDatasSettings.length; i++) {
                let customDatasSetting = masterPlayerSettings.customDatasSettings[i];

                let gnCustomDatasSetting = new GNHashtable();

                gnCustomDatasSetting.add(GNParameterCode.Key, customDatasSetting.key);
                gnCustomDatasSetting.add(GNParameterCode.Permission, customDatasSetting.permission);

                gnCustomDatasSettings.add(gnCustomDatasSetting);
            }

            gnMasterPlayerSettings.add(GNParameterCode.CustomDatasSettings, gnCustomDatasSettings);
        }

        {
            let gnTagsSettings = new GNArray();

            for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
                let tagsSetting = masterPlayerSettings.tagsSettings[i];

                let gnTagsSetting = new GNHashtable();

                gnTagsSetting.add(GNParameterCode.Key, tagsSetting.key);
                gnTagsSetting.add(GNParameterCode.DisplayName, tagsSetting.displayName);
                gnTagsSetting.add(GNParameterCode.Index, tagsSetting.index);

                gnTagsSettings.add(gnTagsSetting);
            }

            gnMasterPlayerSettings.add(GNParameterCode.TagsSettings, gnTagsSettings);
        }

        operationResponse.setParameter(GNParameterCode.MasterPlayerSettings, gnMasterPlayerSettings);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetMasterGameSetings", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
