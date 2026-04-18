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

	// Stores the thirt party settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ThirtPartySettings, isOptional: true })
	public thirtPartySettings?: ThirtPartyParam;

	// Stores the master player settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.MasterPlayerSettings, isOptional: true })
	public masterPlayerSettings?: MasterPlayerSettingsParam;

	// Stores the email settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.EmailSettings, isOptional: true })
	public emailSettings?: EmailSettingsParam;

	// Stores the push notification settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.PushNotificationSettings, isOptional: true })
	public pushNotificationSettings?: PushNotificationSettingsParam;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetMasterGameSettingsRequestHandler extends RequestHandler {

	private static readonly GenericServiceNameValidRegex = /^[a-zA-Z0-9_-]+$/;

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetMasterGameSettings;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetMasterGameSettingsOperationRequest;
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

		if (request.masterPlayerSettings) {
			if (request.masterPlayerSettings.genericServiceSettings != null) {
				for (const genericServiceSetting of request.masterPlayerSettings.genericServiceSettings) {
					if (!SetMasterGameSettingsRequestHandler.GenericServiceNameValidRegex.test(genericServiceSetting.serviceName)) {
						return this.newInvalidRequestParameters(request, "can not use special characters in generic service name " + genericServiceSetting.serviceName);
					}
				}
			}
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { thirtPartySettings: ThirtPartyParam, masterPlayerSettings: MasterPlayerSettingsParam, emailSettings: EmailSettingsParam, pushNotificationSettings: PushNotificationSettingsParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetMasterGameSettings", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("dashboard_SetMasterGameSettings", request);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetMasterGameSettings", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Executes the apply settings workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 */
	private async applySettings(request: { thirtPartySettings: ThirtPartyParam, masterPlayerSettings: MasterPlayerSettingsParam, emailSettings: EmailSettingsParam, pushNotificationSettings: PushNotificationSettingsParam }) {

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "masterGameSettings" });

		// Stores the resolved master game settings instance for the current execution flow.
		let masterGameSettings = new MasterGameSettings(result, collection);

		if (request.thirtPartySettings != null) {
			// Stores the resolved thirt party settings instance for the current execution flow.
			let thirtPartySettings = masterGameSettings.getThirtPartySettings();

			if (request.thirtPartySettings.googleSettings != null) {
				thirtPartySettings.googleSettings.googleClientId = request.thirtPartySettings.googleSettings.googleClientId;
				thirtPartySettings.googleSettings.packageId = request.thirtPartySettings.googleSettings.packageId;
				thirtPartySettings.googleSettings.publicRSAKey = request.thirtPartySettings.googleSettings.publicRSAKey;

				(<GoogleService>this.gnServer.getGoogleService()).init({
					googleClientId: thirtPartySettings.googleSettings.googleClientId,
					packageId: thirtPartySettings.googleSettings.packageId,
					publicRSAKey: thirtPartySettings.googleSettings.publicRSAKey,
				});
			}

			if (request.thirtPartySettings.facebookSettings != null) {
				thirtPartySettings.facebookSettings.facebookAppId = request.thirtPartySettings.facebookSettings.facebookAppId;
				thirtPartySettings.facebookSettings.facebookAppToken = request.thirtPartySettings.facebookSettings.facebookAppToken;
				thirtPartySettings.facebookSettings.facebookInappSecret = request.thirtPartySettings.facebookSettings.facebookInappSecret;

				(<FacebookService>this.gnServer.getFacebookService()).init({
					facebookAppId: thirtPartySettings.facebookSettings.facebookAppId,
					facebookAppToken: thirtPartySettings.facebookSettings.facebookAppToken,
					facebookInappSecret: thirtPartySettings.facebookSettings.facebookInappSecret,
				});
			}

			if (request.thirtPartySettings.appleSettings != null) {
				thirtPartySettings.appleSettings.appleClientId = request.thirtPartySettings.appleSettings.appleClientId;
				thirtPartySettings.appleSettings.issuerId = request.thirtPartySettings.appleSettings.issuerId;
				thirtPartySettings.appleSettings.keyId = request.thirtPartySettings.appleSettings.keyId;
				thirtPartySettings.appleSettings.p8Content = request.thirtPartySettings.appleSettings.p8Content;
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
				thirtPartySettings.gameCenterSettings.packageId = request.thirtPartySettings.gameCenterSettings.packageId;

				(<GameCenterService>this.gnServer.getGameCenterService()).init({
					bundleId: thirtPartySettings.gameCenterSettings.packageId,
				});
			}

			if (request.thirtPartySettings.googlePlayGameSettings != null) {
				thirtPartySettings.googlePlayGameSettings.applicationId = request.thirtPartySettings.googlePlayGameSettings.applicationId;
				thirtPartySettings.googlePlayGameSettings.clientId = request.thirtPartySettings.googlePlayGameSettings.clientId;
				thirtPartySettings.googlePlayGameSettings.clientSecret = request.thirtPartySettings.googlePlayGameSettings.clientSecret;
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
			// Stores the resolved master player settings instance for the current execution flow.
			let masterPlayerSettings = masterGameSettings.getMasterPlayerSettings();
			// Stores the master player collection value used in the current execution flow.
			let masterPlayerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");

			if (request.masterPlayerSettings.genericServiceSettings != null) {
				// Stores the resolved generic service settings instance for the current execution flow.
				let genericServiceSettings = new Array<xGenericServiceSettings>();

				// Stores the remove key lst value used in the current execution flow.
				let removeKeyLst = new Array<string>();
				// Stores the add key lst value used in the current execution flow.
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.genericServiceSettings.length; i++) {
					// Stores the generic service setting value used in the current execution flow.
					let genericServiceSetting = masterPlayerSettings.genericServiceSettings[i];
					removeKeyLst.push(genericServiceSetting.serviceName);
				}

				for (let i = 0; i < request.masterPlayerSettings.genericServiceSettings.length; i++) {
					// Stores the generic service setting value used in the current execution flow.
					let genericServiceSetting = request.masterPlayerSettings.genericServiceSettings[i];

					genericServiceSettings.push({
						serviceName: genericServiceSetting.serviceName
					});

					addKeyLst.push(genericServiceSetting.serviceName);
				}

				this.gnServer.getGNSettings().getMasterPlayerSettings().genericServiceSettings = genericServiceSettings;

				for (let i = 0; i < addKeyLst.length; i++) {
					// Stores the key value used in the current execution flow.
					let key = addKeyLst[i];

					// Stores the remove index of value used in the current execution flow.
					let removeIndexOf = removeKeyLst.indexOf(key);

					if (removeIndexOf != -1) {
						removeKeyLst.splice(removeIndexOf, 1);

						addKeyLst.splice(i, 1);
						i -= 1;
					}
				}

				if (this.gnServer.isPrimary()) {
					for (let i = 0; i < removeKeyLst.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = removeKeyLst[i];
						masterPlayerCollection.dropIndex("external.genericService.genericServices." + key + ".serviceId_1");
					}

					for (let i = 0; i < addKeyLst.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = addKeyLst[i];
						// Stores the index doc value used in the current execution flow.
						let indexDoc = {} as any;
						indexDoc["external.genericService.genericServices." + key + ".serviceId"] = 1;

						masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: "external.genericService.genericServices." + key + ".serviceId_1" });
					}
				}

				masterPlayerSettings.genericServiceSettings = genericServiceSettings;
			}

			if (request.masterPlayerSettings.playerCurrenciesSettings != null) {
				// Stores the resolved player currencies settings instance for the current execution flow.
				let playerCurrenciesSettings = new Array<xCurrencySettings>();

				// Stores the remove key lst value used in the current execution flow.
				let removeKeyLst = new Array<string>();
				// Stores the add key lst value used in the current execution flow.
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.playerCurrenciesSettings.length; i++) {
					// Stores the player currencies setting value used in the current execution flow.
					let playerCurrenciesSetting = masterPlayerSettings.playerCurrenciesSettings[i];
					removeKeyLst.push(playerCurrenciesSetting.key);
				}

				for (let i = 0; i < request.masterPlayerSettings.playerCurrenciesSettings.length; i++) {
					// Stores the player currencies setting value used in the current execution flow.
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
					// Stores the key value used in the current execution flow.
					let key = addKeyLst[i];

					// Stores the remove index of value used in the current execution flow.
					let removeIndexOf = removeKeyLst.indexOf(key);

					if (removeIndexOf != -1) {
						removeKeyLst.splice(removeIndexOf, 1);

						addKeyLst.splice(i, 1);
						i -= 1;
					}
				}

				if (this.gnServer.isPrimary()) {
					for (let i = 0; i < removeKeyLst.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = removeKeyLst[i];

						// Stores the index name value used in the current execution flow.
						let indexName = "playerCurrencies." + key + ".value_-1";
						masterPlayerCollection.dropIndex(indexName);

						Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
					}

					for (let i = 0; i < addKeyLst.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = addKeyLst[i];
						// Stores the index doc value used in the current execution flow.
						let indexDoc = {} as any;
						indexDoc["playerCurrencies." + key + ".value"] = -1;

						// Stores the index name value used in the current execution flow.
						let indexName = "playerCurrencies." + key + ".value_-1";
						masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

						Debug.log("[GearN] [Database] create new index " + indexName + " at " + masterPlayerCollection.collectionName);
					}
				}

				masterPlayerSettings.playerCurrenciesSettings = playerCurrenciesSettings;
			}

			if (request.masterPlayerSettings.playerStatisticsSettings != null) {
				// Stores the resolved player statistics settings instance for the current execution flow.
				let playerStatisticsSettings = new Array<xStatisticsSettings>();

				// Stores the remove key asc lst value used in the current execution flow.
				let removeKeyAscLst = new Array<string>();
				// Stores the remove key lst value used in the current execution flow.
				let removeKeyLst = removeKeyAscLst;//new Array<string>();

				let addKeyAscLst = new Array<string>();
				// Stores the add key lst value used in the current execution flow.
				let addKeyLst = addKeyAscLst;//new Array<string>();

				for (let i = 0; i < masterPlayerSettings.playerStatisticsSettings.length; i++) {
					// Stores the player statistics setting value used in the current execution flow.
					let playerStatisticsSetting = masterPlayerSettings.playerStatisticsSettings[i];

					if (playerStatisticsSetting.index) {
						if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum)
							removeKeyAscLst.push(playerStatisticsSetting.key);
						else removeKeyLst.push(playerStatisticsSetting.key);
					}
				}

				for (let i = 0; i < request.masterPlayerSettings.playerStatisticsSettings.length; i++) {
					// Stores the player statistics setting value used in the current execution flow.
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
						// Stores the key value used in the current execution flow.
						let key = addKeyLst[i];

						// Stores the remove index of value used in the current execution flow.
						let removeIndexOf = removeKeyLst.indexOf(key);

						if (removeIndexOf != -1) {
							removeKeyLst.splice(removeIndexOf, 1);

							addKeyLst.splice(i, 1);
							i -= 1;
						}
					}

					if (this.gnServer.isPrimary()) {
						for (let i = 0; i < removeKeyLst.length; i++) {
							// Stores the key value used in the current execution flow.
							let key = removeKeyLst[i];

							// Stores the index name value used in the current execution flow.
							let indexName = "playerStatistics." + key + ".value_-1";
							masterPlayerCollection.dropIndex(indexName);

							Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
						}

						for (let i = 0; i < addKeyLst.length; i++) {
							// Stores the key value used in the current execution flow.
							let key = addKeyLst[i];
							// Stores the index doc value used in the current execution flow.
							let indexDoc = {} as any;
							indexDoc["playerStatistics." + key + ".value"] = -1;

							// Stores the index name value used in the current execution flow.
							let indexName = "playerStatistics." + key + ".value_-1";
							masterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

							Debug.log("[GearN] [Database] create new index " + indexName + " at " + masterPlayerCollection.collectionName);
						}
					}
				}

				masterPlayerSettings.playerStatisticsSettings = playerStatisticsSettings;
			}

			if (request.masterPlayerSettings.playerDatasSettings != null) {
				// Stores the resolved player datas settings instance for the current execution flow.
				let playerDatasSettings = new Array<xDataSettings>();

				for (let i = 0; i < request.masterPlayerSettings.playerDatasSettings.length; i++) {
					// Stores the player datas setting value used in the current execution flow.
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
				// Stores the resolved player datas settings instance for the current execution flow.
				let playerDatasSettings = new Array<xDataSettings>();

				for (let i = 0; i < request.masterPlayerSettings.customDatasSettings.length; i++) {
					// Stores the custom datas setting value used in the current execution flow.
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
				// Stores the resolved tags settings instance for the current execution flow.
				let tagsSettings = new Array<xTagSettings>();

				// Stores the remove key lst value used in the current execution flow.
				let removeKeyLst = new Array<string>();
				// Stores the add key lst value used in the current execution flow.
				let addKeyLst = new Array<string>();

				for (let i = 0; i < masterPlayerSettings.tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
					let tagsSetting = masterPlayerSettings.tagsSettings[i];
					removeKeyLst.push(tagsSetting.key);
				}

				for (let i = 0; i < request.masterPlayerSettings.tagsSettings.length; i++) {
					// Stores the tags setting value used in the current execution flow.
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
					// Stores the key value used in the current execution flow.
					let key = addKeyLst[i];

					// Stores the remove index of value used in the current execution flow.
					let removeIndexOf = removeKeyLst.indexOf(key);

					if (removeIndexOf != -1) {
						removeKeyLst.splice(removeIndexOf, 1);

						addKeyLst.splice(i, 1);
						i -= 1;
					}
				}

				if (this.gnServer.isPrimary()) {
					for (let i = 0; i < removeKeyLst.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = removeKeyLst[i];

						// Stores the index name value used in the current execution flow.
						let indexName = "tags." + key + "_1";
						masterPlayerCollection.dropIndex(indexName);

						Debug.log("[GearN] [Database] drop index " + indexName + " at " + masterPlayerCollection.collectionName);
					}

					for (let i = 0; i < addKeyLst.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = addKeyLst[i];
						// Stores the index doc value used in the current execution flow.
						let indexDoc = {} as any;
						indexDoc["tags." + key] = 1;

						// Stores the index name value used in the current execution flow.
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
			// Stores the resolved email settings instance for the current execution flow.
			let emailSettings = masterGameSettings.getEmailSettings();

			emailSettings.sendFrom = request.emailSettings.sendFrom;
			emailSettings.secure = request.emailSettings.secure;
			emailSettings.host = request.emailSettings.host;
			emailSettings.port = request.emailSettings.port;
			emailSettings.username = request.emailSettings.username;
			emailSettings.password = request.emailSettings.password;

			(<EmailService>this.gnServer.getEmailService()).init(emailSettings.host, emailSettings.port, emailSettings.secure, emailSettings.username, emailSettings.password, emailSettings.sendFrom);
			(<EmailService>this.gnServer.getEmailService()).run();

			masterGameSettings.setEmailSettings(emailSettings);
		}

		if (request.pushNotificationSettings != null) {
			// Stores the resolved push notification settings instance for the current execution flow.
			let pushNotificationSettings = masterGameSettings.getPushNotificationSettings();

			pushNotificationSettings.projectId = request.pushNotificationSettings.projectId;
			pushNotificationSettings.clientEmail = request.pushNotificationSettings.clientEmail;
			pushNotificationSettings.privateKey = request.pushNotificationSettings.privateKey;

			(<PushNotificationService>this.gnServer.getPushNotificationService()).init(pushNotificationSettings.projectId, pushNotificationSettings.clientEmail, pushNotificationSettings.privateKey);
			(<PushNotificationService>this.gnServer.getPushNotificationService()).run();

			masterGameSettings.setPushNotificationSettings(pushNotificationSettings);
		}

		if (this.gnServer.isPrimary())
			masterGameSettings.saveAsync();
	}

	/**
	 * Executes the init workflow.
	 */
	protected override init(): void {
		// Stores the thiz value used in the current execution flow.
		let thiz = this;
		this.gnServer.getHttpApp().getClusterHandler().onEvent("dashboard_SetMasterGameSettings", data => {
			thiz.applySettings(data);
		});
	}
}
