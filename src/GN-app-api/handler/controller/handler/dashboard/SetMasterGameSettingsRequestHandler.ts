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
import { ThirtPartyParam } from "./model/ThirtPartyParam";
import { MasterPlayerSettingsParam } from "./model/MasterPlayerSettingsParam";
import { EmailSettingsParam } from "./model/EmailSettingsParam";
import { PushNotificationSettingsParam } from "./model/PushNotificationSettingsParam";
import { GoogleService } from "./../../../../service/GoogleService";
import { FacebookService } from "./../../../../service/FacebookService";
import { AppleService } from "./../../../../service/AppleService";
import { xCurrencySettings } from "./../../../../../GN-library/xsettings/lib/entity/xCurrencySettings";
import { xStatisticsSettings } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsSettings";
import { xTagSettings } from "./../../../../../GN-library/xsettings/lib/entity/xTagSettings";
import { xDataSettings } from "./../../../../../GN-library/xsettings/lib/entity/xDataSettings";
import { xGenericServiceSettings } from "./../../../../../GN-library/xsettings/lib/entity/xGenericServiceSettings";
import { GameCenterService } from "./../../../../service/GameCenterService";
import { GooglePlayGameService } from "./../../../../service/GooglePlayGameService";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { PushNotificationService } from "./../../../../service/PushNotificationService";
import { EmailService } from "./../../../../service/EmailService";

class SetMasterGameSettingsOperationRequest extends OperationRequest {

	@GNHashtableDataMember({ code: ParameterCode.ThirtPartySettings, isOptional: true })
	public thirtPartySettings?: ThirtPartyParam;

	@GNHashtableDataMember({ code: ParameterCode.MasterPlayerSettings, isOptional: true })
	public masterPlayerSettings?: MasterPlayerSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.EmailSettings, isOptional: true })
	public emailSettings?: EmailSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.PushNotificationSettings, isOptional: true })
	public pushNotificationSettings?: PushNotificationSettingsParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetMasterGameSettingsRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.SetMasterGameSettings;
	}

	public override getCommonOperationRequest() {
		return SetMasterGameSettingsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.setMasterGameSettings.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			thirtPartySettings: request.thirtPartySettings,
			masterPlayerSettings: request.masterPlayerSettings,
			emailSettings: request.emailSettings,
			pushNotificationSettings: request.pushNotificationSettings,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { thirtPartySettings: ThirtPartyParam, masterPlayerSettings: MasterPlayerSettingsParam, emailSettings: EmailSettingsParam, pushNotificationSettings: PushNotificationSettingsParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetMasterGameSettings", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("dashboard_SetMasterGameSettings", request);
		await this.applySettings(request);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetMasterGameSettings", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	private async applySettings(request: { thirtPartySettings: ThirtPartyParam, masterPlayerSettings: MasterPlayerSettingsParam, emailSettings: EmailSettingsParam, pushNotificationSettings: PushNotificationSettingsParam }) {

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "masterGameSettings" });

		let masterGameSettings = new MasterGameSettings(result, collection);

		if (request.thirtPartySettings != null) {
			let thirtPartySettings = masterGameSettings.getThirtPartySettings();

			if (request.thirtPartySettings.googleSettings != null) {
				if (request.thirtPartySettings.googleSettings.googleClientId != null)
					thirtPartySettings.googleSettings.googleClientId = request.thirtPartySettings.googleSettings.googleClientId;

				if (request.thirtPartySettings.googleSettings.packageId != null)
					thirtPartySettings.googleSettings.packageId = request.thirtPartySettings.googleSettings.packageId;

				if (request.thirtPartySettings.googleSettings.publicRSAKey != null)
					thirtPartySettings.googleSettings.publicRSAKey = request.thirtPartySettings.googleSettings.publicRSAKey;

				(<GoogleService>this.gnServer.getGoogleService()).init({
					googleClientId: thirtPartySettings.googleSettings.googleClientId,
					packageId: thirtPartySettings.googleSettings.packageId,
					publicRSAKey: thirtPartySettings.googleSettings.publicRSAKey,
				});
			}

			if (request.thirtPartySettings.facebookSettings != null) {
				if (request.thirtPartySettings.facebookSettings.facebookAppId != null)
					thirtPartySettings.facebookSettings.facebookAppId = request.thirtPartySettings.facebookSettings.facebookAppId;

				if (request.thirtPartySettings.facebookSettings.facebookAppToken != null)
					thirtPartySettings.facebookSettings.facebookAppToken = request.thirtPartySettings.facebookSettings.facebookAppToken;

				if (request.thirtPartySettings.facebookSettings.facebookInappSecret != null)
					thirtPartySettings.facebookSettings.facebookInappSecret = request.thirtPartySettings.facebookSettings.facebookInappSecret;

				(<FacebookService>this.gnServer.getFacebookService()).init({
					facebookAppId: thirtPartySettings.facebookSettings.facebookAppId,
					facebookAppToken: thirtPartySettings.facebookSettings.facebookAppToken,
					facebookInappSecret: thirtPartySettings.facebookSettings.facebookInappSecret,
				});
			}

			if (request.thirtPartySettings.appleSettings != null) {
				if (request.thirtPartySettings.appleSettings.appleClientId != null)
					thirtPartySettings.appleSettings.appleClientId = request.thirtPartySettings.appleSettings.appleClientId;

				if (request.thirtPartySettings.appleSettings.issuerId != null)
					thirtPartySettings.appleSettings.issuerId = request.thirtPartySettings.appleSettings.issuerId;

				if (request.thirtPartySettings.appleSettings.keyId != null)
					thirtPartySettings.appleSettings.keyId = request.thirtPartySettings.appleSettings.keyId;

				if (request.thirtPartySettings.appleSettings.p8Content != null)
					thirtPartySettings.appleSettings.p8Content = request.thirtPartySettings.appleSettings.p8Content;

				if (request.thirtPartySettings.appleSettings.sandboxEnable != null)
					thirtPartySettings.appleSettings.sandboxEnable = request.thirtPartySettings.appleSettings.sandboxEnable;

				(<AppleService>this.gnServer.getAppleService()).init({
					appleClientId: thirtPartySettings.appleSettings.appleClientId,
					sandboxEnable: thirtPartySettings.appleSettings.sandboxEnable,
					issuerId: thirtPartySettings.appleSettings.issuerId,
					keyId: thirtPartySettings.appleSettings.keyId,
					p8Content: thirtPartySettings.appleSettings.p8Content,
				});
			}

			if (request.thirtPartySettings.gameCenterSettings != null) {
				if (request.thirtPartySettings.gameCenterSettings.packageId != null)
					thirtPartySettings.gameCenterSettings.packageId = request.thirtPartySettings.gameCenterSettings.packageId;

				(<GameCenterService>this.gnServer.getGameCenterService()).init({
					bundleId: thirtPartySettings.gameCenterSettings.packageId,
				});
			}

			if (request.thirtPartySettings.googlePlayGameSettings != null) {
				if (request.thirtPartySettings.googlePlayGameSettings.applicationId != null)
					thirtPartySettings.googlePlayGameSettings.applicationId = request.thirtPartySettings.googlePlayGameSettings.applicationId;

				if (request.thirtPartySettings.googlePlayGameSettings.clientId != null)
					thirtPartySettings.googlePlayGameSettings.clientId = request.thirtPartySettings.googlePlayGameSettings.clientId;

				if (request.thirtPartySettings.googlePlayGameSettings.clientSecret != null)
					thirtPartySettings.googlePlayGameSettings.clientSecret = request.thirtPartySettings.googlePlayGameSettings.clientSecret;

				if (request.thirtPartySettings.googlePlayGameSettings.redirectUri != null)
					thirtPartySettings.googlePlayGameSettings.redirectUri = request.thirtPartySettings.googlePlayGameSettings.redirectUri;

				(<GooglePlayGameService>this.gnServer.getGooglePlayGameService()).init({
					applicationId: thirtPartySettings.googlePlayGameSettings.applicationId,
					clientId: thirtPartySettings.googlePlayGameSettings.clientId,
					clientSecret: thirtPartySettings.googlePlayGameSettings.clientSecret,
					redirectUri: thirtPartySettings.googlePlayGameSettings.redirectUri,
				});
			}

			masterGameSettings.setThirtPartySettings(thirtPartySettings);
		}

		if (request.masterPlayerSettings != null) {
			let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();
			let masterPlayerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");

			if (request.masterPlayerSettings.genericServiceSettings != null) {
				let genericServiceSettings = new Array<xGenericServiceSettings>();

				let removeKeyLst = new Array<string>();
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.genericServiceSettings.length; i++) {
					let genericServiceSetting = masterPlayerSettings.genericServiceSettings[i];
					removeKeyLst.push(genericServiceSetting.serviceName);
				}

				for (let i = 0; i < request.masterPlayerSettings.genericServiceSettings.length; i++) {
					let genericServiceSetting = request.masterPlayerSettings.genericServiceSettings[i];

					genericServiceSettings.push({
						serviceName: genericServiceSetting.serviceName
					});

					addKeyLst.push(genericServiceSetting.serviceName);
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().genericServiceSettings = genericServiceSettings;

				for (let i = 0; i < addKeyLst.length; i++) {
					let key = addKeyLst[i];

					let removeIndexOf = removeKeyLst.indexOf(key);

					if (removeIndexOf != -1) {
						removeKeyLst.splice(removeIndexOf, 1);

						addKeyLst.splice(i, 1);
						i -= 1;
					}
				}

				if (this.gnServer.isPrimary()) {
					for (let i = 0; i < removeKeyLst.length; i++) {
						let key = removeKeyLst[i];
						masterPlayerCollection.dropIndex("external.genericService.genericServices." + key + ".serviceId_1");
					}

					for (let i = 0; i < addKeyLst.length; i++) {
						let key = addKeyLst[i];
						let indexDoc = {} as any;
						indexDoc["external.genericService.genericServices." + key + ".serviceId"] = 1;

						masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: "external.genericService.genericServices." + key + ".serviceId_1" });
					}
				}

				masterPlayerSettings.genericServiceSettings = genericServiceSettings;
			}

			if (request.masterPlayerSettings.playerCurrenciesSettings != null) {
				let playerCurrenciesSettings = new Array<xCurrencySettings>();

				let removeKeyLst = new Array<string>();
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.playerCurrenciesSettings.length; i++) {
					let playerCurrenciesSetting = masterPlayerSettings.playerCurrenciesSettings[i];
					removeKeyLst.push(playerCurrenciesSetting.key);
				}

				for (let i = 0; i < request.masterPlayerSettings.playerCurrenciesSettings.length; i++) {
					let playerCurrenciesSetting = request.masterPlayerSettings.playerCurrenciesSettings[i];

					playerCurrenciesSettings.push({
						key: playerCurrenciesSetting.key,
						initialValue: playerCurrenciesSetting.initialValue,
						description: playerCurrenciesSetting.description,
						index: playerCurrenciesSetting.index,
					});

					if (playerCurrenciesSetting.index)
						addKeyLst.push(playerCurrenciesSetting.key);
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().playerCurrenciesSettings = playerCurrenciesSettings;

				for (let i = 0; i < addKeyLst.length; i++) {
					let key = addKeyLst[i];

					let removeIndexOf = removeKeyLst.indexOf(key);

					if (removeIndexOf != -1) {
						removeKeyLst.splice(removeIndexOf, 1);

						addKeyLst.splice(i, 1);
						i -= 1;
					}
				}

				if (this.gnServer.isPrimary()) {
					for (let i = 0; i < removeKeyLst.length; i++) {
						let key = removeKeyLst[i];

						let indexName = "playerCurrencies." + key + ".value_-1";
						masterPlayerCollection.dropIndex(indexName);

						Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
					}

					for (let i = 0; i < addKeyLst.length; i++) {
						let key = addKeyLst[i];
						let indexDoc = {} as any;
						indexDoc["playerCurrencies." + key + ".value"] = -1;

						let indexName = "playerCurrencies." + key + ".value_-1";
						masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

						Debug.log("[GearN] [Database] create new index " + indexName + " at " + masterPlayerCollection.collectionName);
					}
				}

				masterPlayerSettings.playerCurrenciesSettings = playerCurrenciesSettings;
			}

			if (request.masterPlayerSettings.playerStatisticsSettings != null) {
				let playerStatisticsSettings = new Array<xStatisticsSettings>();

				let removeKeyAscLst = new Array<string>();
				let removeKeyLst = new Array<string>();

				let addKeyAscLst = new Array<string>();
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = masterPlayerSettings.playerStatisticsSettings[i];

					if (playerStatisticsSetting.index) {
						if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum)
							removeKeyAscLst.push(playerStatisticsSetting.key);
						else removeKeyLst.push(playerStatisticsSetting.key);
					}
				}

				for (let i = 0; i < request.masterPlayerSettings.playerStatisticsSettings.length; i++) {
					let playerStatisticsSetting = request.masterPlayerSettings.playerStatisticsSettings[i];

					playerStatisticsSettings.push({
						key: playerStatisticsSetting.key,
						statisticsAggregationMethod: playerStatisticsSetting.statisticsAggregationMethod,
						maximumValue: playerStatisticsSetting.maximumValue,
						minimumValue: playerStatisticsSetting.minimumValue,
						initialValue: playerStatisticsSetting.initialValue,
						description: playerStatisticsSetting.description,
						index: playerStatisticsSetting.index,
					});

					if (playerStatisticsSetting.index) {
						if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum)
							addKeyAscLst.push(playerStatisticsSetting.key);
						else addKeyLst.push(playerStatisticsSetting.key);
					}
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().playerStatisticsSettings = playerStatisticsSettings;

				{
					for (let i = 0; i < addKeyLst.length; i++) {
						let key = addKeyLst[i];

						let removeIndexOf = removeKeyLst.indexOf(key);

						if (removeIndexOf != -1) {
							removeKeyLst.splice(removeIndexOf, 1);

							addKeyLst.splice(i, 1);
							i -= 1;
						}
					}

					if (this.gnServer.isPrimary()) {
						for (let i = 0; i < removeKeyLst.length; i++) {
							let key = removeKeyLst[i];

							let indexName = "playerStatistics." + key + ".value_-1_playerStatistics." + key + ".tsLastUpdate_1";
							masterPlayerCollection.dropIndex(indexName);

							Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
						}

						for (let i = 0; i < addKeyLst.length; i++) {
							let key = addKeyLst[i];
							let indexDoc = {} as any;
							indexDoc["playerStatistics." + key + ".value"] = -1;
							indexDoc["playerStatistics." + key + ".tsLastUpdate"] = 1;

							let indexName = "playerStatistics." + key + ".value_-1_playerStatistics." + key + ".tsLastUpdate_1";
							masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

							Debug.log("[GearN] [Database] create new index " + indexName + " at " + masterPlayerCollection.collectionName);
						}
					}
				}

				{
					for (let i = 0; i < addKeyAscLst.length; i++) {
						let key = addKeyAscLst[i];

						let removeIndexOf = removeKeyAscLst.indexOf(key);

						if (removeIndexOf != -1) {
							removeKeyAscLst.splice(removeIndexOf, 1);

							addKeyAscLst.splice(i, 1);
							i -= 1;
						}
					}

					if (this.gnServer.isPrimary()) {
						for (let i = 0; i < removeKeyAscLst.length; i++) {
							let key = removeKeyAscLst[i];

							let indexName = "playerStatistics." + key + ".value_1_playerStatistics." + key + ".tsLastUpdate_1";
							masterPlayerCollection.dropIndex(indexName);

							Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
						}

						for (let i = 0; i < addKeyAscLst.length; i++) {
							let key = addKeyAscLst[i];
							let indexDoc = {} as any;
							indexDoc["playerStatistics." + key + ".value"] = 1;
							indexDoc["playerStatistics." + key + ".tsLastUpdate"] = 1;

							let indexName = "playerStatistics." + key + ".value_1_playerStatistics." + key + ".tsLastUpdate_1";
							masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

							Debug.log("[GearN] [Database] create new index " + indexName + " at " + masterPlayerCollection.collectionName);
						}
					}
				}

				masterPlayerSettings.playerStatisticsSettings = playerStatisticsSettings;
			}

			if (request.masterPlayerSettings.playerDatasSettings != null) {
				let playerDatasSettings = new Array<xDataSettings>();

				for (let i = 0; i < request.masterPlayerSettings.playerDatasSettings.length; i++) {
					let playerDatasSetting = request.masterPlayerSettings.playerDatasSettings[i];

					playerDatasSettings.push({
						key: playerDatasSetting.key,
						permission: playerDatasSetting.permission,
						description: playerDatasSetting.description,
					});
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().playerDatasSettings = playerDatasSettings;
				masterPlayerSettings.playerDatasSettings = playerDatasSettings;
			}

			if (request.masterPlayerSettings.customDatasSettings != null) {
				let playerDatasSettings = new Array<xDataSettings>();

				for (let i = 0; i < request.masterPlayerSettings.customDatasSettings.length; i++) {
					let customDatasSetting = request.masterPlayerSettings.customDatasSettings[i];

					playerDatasSettings.push({
						key: customDatasSetting.key,
						permission: customDatasSetting.permission,
						description: customDatasSetting.description,
					});
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().customDatasSettings = playerDatasSettings;
				masterPlayerSettings.customDatasSettings = playerDatasSettings;
			}

			if (request.masterPlayerSettings.tagsSettings != null) {
				let tagsSettings = new Array<xTagSettings>();

				let removeKeyLst = new Array<string>();
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
					let tagsSetting = masterPlayerSettings.tagsSettings[i];
					removeKeyLst.push(tagsSetting.key);
				}

				for (let i = 0; i < request.masterPlayerSettings.tagsSettings.length; i++) {
					let tagsSetting = request.masterPlayerSettings.tagsSettings[i];

					tagsSettings.push({
						key: tagsSetting.key,
						description: tagsSetting.description,
						index: tagsSetting.index,
					});

					if (tagsSetting.index)
						addKeyLst.push(tagsSetting.key);

					addKeyLst.push(tagsSetting.key);
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().tagsSettings = tagsSettings;

				for (let i = 0; i < addKeyLst.length; i++) {
					let key = addKeyLst[i];

					let removeIndexOf = removeKeyLst.indexOf(key);

					if (removeIndexOf != -1) {
						removeKeyLst.splice(removeIndexOf, 1);

						addKeyLst.splice(i, 1);
						i -= 1;
					}
				}

				if (this.gnServer.isPrimary()) {
					for (let i = 0; i < removeKeyLst.length; i++) {
						let key = removeKeyLst[i];

						let indexName = "tags." + key + "_1";
						masterPlayerCollection.dropIndex(indexName);

						Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
					}

					for (let i = 0; i < addKeyLst.length; i++) {
						let key = addKeyLst[i];
						let indexDoc = {} as any;
						indexDoc["tags." + key] = 1;

						let indexName = "tags." + key + "_1";
						masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

						Debug.log("[GearN] [Database] create new index " + indexName + " at " + masterPlayerCollection.collectionName);
					}
				}

				masterPlayerSettings.tagsSettings = tagsSettings;
			}

			masterGameSettings.setMasterPlayerSettings(masterPlayerSettings);
		}

		if (request.emailSettings != null) {
			let emailSettings = masterGameSettings.getEmailSettings();

			if (request.emailSettings.sendFrom) emailSettings.sendFrom = request.emailSettings.sendFrom;
			if (request.emailSettings.secure != null) emailSettings.secure = request.emailSettings.secure;
			if (request.emailSettings.host) emailSettings.host = request.emailSettings.host;
			if (request.emailSettings.port) emailSettings.port = request.emailSettings.port;
			if (request.emailSettings.username) emailSettings.username = request.emailSettings.username;
			if (request.emailSettings.password) emailSettings.password = request.emailSettings.password;

			(<EmailService>this.gnServer.getEmailService()).init(emailSettings.host, emailSettings.port, emailSettings.secure, emailSettings.username, emailSettings.password, emailSettings.sendFrom);
			(<EmailService>this.gnServer.getEmailService()).run();

			masterGameSettings.setEmailSettings(emailSettings);
		}

		if (request.pushNotificationSettings != null) {
			let pushNotificationSettings = masterGameSettings.getPushNotificationSettings();

			if (request.pushNotificationSettings.projectId) pushNotificationSettings.projectId = request.pushNotificationSettings.projectId;
			if (request.pushNotificationSettings.clientEmail) pushNotificationSettings.clientEmail = request.pushNotificationSettings.clientEmail;
			if (request.pushNotificationSettings.privateKey) pushNotificationSettings.privateKey = request.pushNotificationSettings.privateKey;

			(<PushNotificationService>this.gnServer.getPushNotificationService()).init(request.pushNotificationSettings.projectId, request.pushNotificationSettings.clientEmail, request.pushNotificationSettings.privateKey);
			(<PushNotificationService>this.gnServer.getPushNotificationService()).run();

			masterGameSettings.setPushNotificationSettings(pushNotificationSettings);
		}

		masterGameSettings.saveAsync();
	}

	protected override init(): void {
		let thiz = this;
		this.gnServer.getHttpApp().getClusterHandler().onEvent("dashboard_SetMasterGameSettings", data => {
			thiz.applySettings(data);
		});
	}
}
