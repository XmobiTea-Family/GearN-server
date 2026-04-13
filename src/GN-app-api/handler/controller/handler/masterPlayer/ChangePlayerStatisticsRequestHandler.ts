import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { PlayerStatisticsParam } from "./model/PlayerStatisticsParam";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class ChangePlayerStatisticsOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the player statistics value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerStatisticsParam })
	public playerStatistics: Array<PlayerStatisticsParam>;

	// Stores the log value used by this instance.
	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerChangePlayerStatisticsOperationRequest extends ChangePlayerStatisticsOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangePlayerStatisticsOperationRequest extends ServerChangePlayerStatisticsOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangePlayerStatisticsRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ChangePlayerStatistics;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ChangePlayerStatisticsOperationRequest;
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

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.changePlayerStatistics.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.changePlayerStatistics.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.changePlayerStatistics.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.changePlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.changePlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, playerStatistics: Array<PlayerStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_ChangePlayerStatistics", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved master player settings instance for the current execution flow.
		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

		for (let i = 0; i < request.playerStatistics.length; i++) {
			// Stores the player statistics parameter value used in the current execution flow.
			let playerStatisticsParam = request.playerStatistics[i];

			// Stores the key value used in the current execution flow.
			let key = playerStatisticsParam.key;

			// Stores the player statistics settings item value used in the current execution flow.
			let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);
			if (playerStatisticsSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("StatisticsKey not found " + key);
				return operationResponse;
			}
		}

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerStatistics: true,
		}

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN player statistics value used in the current execution flow.
		let gnPlayerStatistics = new GNArray();

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		for (let i = 0; i < request.playerStatistics.length; i++) {
			// Stores the player statistics parameter value used in the current execution flow.
			let playerStatisticsParam = request.playerStatistics[i];

			// Stores the key value used in the current execution flow.
			let key = playerStatisticsParam.key;

			// Stores the player statistics settings item value used in the current execution flow.
			let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);
			if (playerStatisticsSettingsItem == null) continue;

			// Stores the value value used in the current execution flow.
			let value = playerStatisticsParam.value;

			// Stores the GearN player statistic value used in the current execution flow.
			let gnPlayerStatistic = new GNHashtable();
			gnPlayerStatistic.add(ParameterCode.Key, key);

			// Tracks whether set player statistics should be used.
			let useSetPlayerStatistics = false;
			if (!masterPlayer.hasPlayerStatistics(key)) {
				useSetPlayerStatistics = true;
				masterPlayer.setPlayerStatistics(key, playerStatisticsSettingsItem.initialValue, currentMilliseconds);
			}

			// Stores the player statistics value used in the current execution flow.
			let playerStatistics = masterPlayer.getPlayerStatistics(key);
			// Stores the old value value used in the current execution flow.
			let oldValue = playerStatistics.value;

			// Stores the statistics aggregation method value used in the current execution flow.
			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

			if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
				// Stores the new value value used in the current execution flow.
				let newValue = value + playerStatistics.value;

				if (playerStatisticsSettingsItem.maximumValue != null) {
					if (newValue > playerStatisticsSettingsItem.maximumValue) {
						useSetPlayerStatistics = true;
						newValue = playerStatisticsSettingsItem.maximumValue;
					}
				}

				if (playerStatisticsSettingsItem.minimumValue != null) {
					if (newValue < playerStatisticsSettingsItem.minimumValue) {
						useSetPlayerStatistics = true;
						newValue = playerStatisticsSettingsItem.minimumValue;
					}
				}

				if (useSetPlayerStatistics) {
					masterPlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
				}
				else {
					masterPlayer.changePlayerStatistics(key, value, currentMilliseconds);
				}

				gnPlayerStatistic.add(ParameterCode.Value, newValue);

				this.gnServer.getDatabase().insertMasterPlayerStatisticsLogAsync(request.userId, key, playerStatisticsParam.value, oldValue, newValue, request.log);
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
				if (value > playerStatistics.value) {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
					}

					masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
					gnPlayerStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertMasterPlayerStatisticsLogAsync(request.userId, key, playerStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
							masterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
							masterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

					this.gnServer.getDatabase().insertMasterPlayerStatisticsLogAsync(request.userId, key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
				if (value < playerStatistics.value) {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
					}

					masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
					gnPlayerStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertMasterPlayerStatisticsLogAsync(request.userId, key, playerStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
							masterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
							masterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

					this.gnServer.getDatabase().insertMasterPlayerStatisticsLogAsync(request.userId, key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
				if (playerStatisticsSettingsItem.maximumValue != null) {
					if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
				}

				if (playerStatisticsSettingsItem.minimumValue != null) {
					if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
				}

				masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
				gnPlayerStatistic.add(ParameterCode.Value, value);

				this.gnServer.getDatabase().insertMasterPlayerStatisticsLogAsync(request.userId, key, playerStatisticsParam.value, oldValue, value, request.log);
			}

			gnPlayerStatistics.add(gnPlayerStatistic);
		}

		masterPlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerStatistics, gnPlayerStatistics);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_ChangePlayerStatistics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
