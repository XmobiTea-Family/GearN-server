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

class SetPlayerStatisticsOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@GNArrayDataMember({ code: ParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerStatisticsParam })
	public playerStatisticsParams: Array<PlayerStatisticsParam>;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerStatisticsOperationRequest extends SetPlayerStatisticsOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPlayerStatisticsOperationRequest extends ServerSetPlayerStatisticsOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerStatisticsRequestHandler extends MasterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.SetPlayerStatistics;
	}

	public override getCommonOperationRequest() {
		return SetPlayerStatisticsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			playerStatisticsParams: request.playerStatisticsParams,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerStatisticsParams: request.playerStatisticsParams,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerStatisticsParams: request.playerStatisticsParams,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, playerStatisticsParams: Array<PlayerStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_SetPlayerStatistics", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerStatistics: true,
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

		let gnInfoResponseParameters = new GNHashtable();
		let gnPlayerStatistics = new GNArray();

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		for (let i = 0; i < request.playerStatisticsParams.length; i++) {
			let playerStatisticsParam = request.playerStatisticsParams[i];

			let key = playerStatisticsParam.key;

			let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);
			if (playerStatisticsSettingsItem == null) continue;

			let value = playerStatisticsParam.value;

			let gnPlayerStatistic = new GNHashtable();
			gnPlayerStatistic.add(ParameterCode.Key, key);

			if (!masterPlayer.hasPlayerStatistics(key))
				masterPlayer.setPlayerStatistics(key, playerStatisticsSettingsItem.initialValue, currentMilliseconds);

			let playerStatistics = masterPlayer.getPlayerStatistics(key);
			let oldValue = playerStatistics.value;

			let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

			if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
				let newValue = value + playerStatistics.value;

				if (playerStatisticsSettingsItem.maximumValue != null) {
					if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
				}

				if (playerStatisticsSettingsItem.minimumValue != null) {
					if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
				}

				masterPlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
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

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_SetPlayerStatistics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
