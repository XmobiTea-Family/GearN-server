import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { ErrorCode } from "../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { PlayerStatisticsParam } from "./model/PlayerStatisticsParam";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";

class ChangePlayerStatisticsOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@GNArrayDataMember({ code: ParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerStatisticsParam })
	public playerStatistics: Array<PlayerStatisticsParam>;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerChangePlayerStatisticsOperationRequest extends ChangePlayerStatisticsOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangePlayerStatisticsOperationRequest extends ServerChangePlayerStatisticsOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangePlayerStatisticsRequestHandler extends GamePlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.ChangePlayerStatistics;
	}

	public override getCommonOperationRequest() {
		return ChangePlayerStatisticsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.changePlayerStatistics.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.changePlayerStatistics.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.changePlayerStatistics.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.changePlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.changePlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, playerStatistics: Array<PlayerStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_ChangePlayerStatistics", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerStatistics: true,
		}

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnPlayerStatistics = new GNArray();

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		for (let i = 0; i < request.playerStatistics.length; i++) {
			let playerStatisticsParam = request.playerStatistics[i];

			let key = playerStatisticsParam.key;

			let playerStatisticsSettingsItem = gamePlayerSettings.playerStatisticsSettings.find(x => x.key == key);
			if (playerStatisticsSettingsItem == null) continue;

			let value = playerStatisticsParam.value;

			let gnPlayerStatistic = new GNHashtable();
			gnPlayerStatistic.add(ParameterCode.Key, key);

			if (!gamePlayer.hasPlayerStatistics(key))
				gamePlayer.changePlayerStatistics(key, playerStatisticsSettingsItem.initialValue, currentMilliseconds);

			let playerStatistics = gamePlayer.getPlayerStatistics(key);
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

				gamePlayer.changePlayerStatistics(key, newValue, currentMilliseconds);
				gnPlayerStatistic.add(ParameterCode.Value, newValue);

				this.gnServer.getDatabase().insertGamePlayerStatisticsLogAsync(request.userId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, newValue, request.log);
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
				if (value > playerStatistics.value) {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
					}

					gamePlayer.changePlayerStatistics(key, value, currentMilliseconds);
					gnPlayerStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertGamePlayerStatisticsLogAsync(request.userId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
							gamePlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
							gamePlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

					this.gnServer.getDatabase().insertGamePlayerStatisticsLogAsync(request.userId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
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

					gamePlayer.changePlayerStatistics(key, value, currentMilliseconds);
					gnPlayerStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertGamePlayerStatisticsLogAsync(request.userId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
							gamePlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
							gamePlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

					this.gnServer.getDatabase().insertGamePlayerStatisticsLogAsync(request.userId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
				if (playerStatisticsSettingsItem.maximumValue != null) {
					if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
				}

				if (playerStatisticsSettingsItem.minimumValue != null) {
					if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
				}

				gamePlayer.changePlayerStatistics(key, value, currentMilliseconds);
				gnPlayerStatistic.add(ParameterCode.Value, value);

				this.gnServer.getDatabase().insertGamePlayerStatisticsLogAsync(request.userId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
			}

			gnPlayerStatistics.add(gnPlayerStatistic);
		}

		gamePlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerStatistics, gnPlayerStatistics);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_ChangePlayerStatistics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
