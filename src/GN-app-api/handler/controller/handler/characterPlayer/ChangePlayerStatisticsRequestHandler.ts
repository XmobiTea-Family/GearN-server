import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { PlayerStatisticsParam } from "./model/PlayerStatisticsParam";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";

class ChangePlayerStatisticsOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

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

export class ChangePlayerStatisticsRequestHandler extends CharacterPlayerBaseRequestHandler {

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

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.changePlayerStatistics);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.changePlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.changePlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerStatistics: request.playerStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, playerStatistics: Array<PlayerStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_ChangePlayerStatistics", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerStatistics: true,
		}

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnPlayerStatistics = new GNArray();

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		for (let i = 0; i < request.playerStatistics.length; i++) {
			let playerStatisticsParam = request.playerStatistics[i];

			let key = playerStatisticsParam.key;

			let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);
			if (playerStatisticsSettingsItem == null) continue;

			let value = playerStatisticsParam.value;

			let gnPlayerStatistic = new GNHashtable();
			gnPlayerStatistic.add(ParameterCode.Key, key);

			if (!characterPlayer.hasPlayerStatistics(key))
				characterPlayer.changePlayerStatistics(key, playerStatisticsSettingsItem.initialValue, currentMilliseconds);

			let playerStatistics = characterPlayer.getPlayerStatistics(key);
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

				characterPlayer.changePlayerStatistics(key, newValue, currentMilliseconds);
				gnPlayerStatistic.add(ParameterCode.Value, newValue);

				this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, newValue, request.log);
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
				if (value > playerStatistics.value) {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
					}

					characterPlayer.changePlayerStatistics(key, value, currentMilliseconds);
					gnPlayerStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
							characterPlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
							characterPlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

					this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
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

					characterPlayer.changePlayerStatistics(key, value, currentMilliseconds);
					gnPlayerStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (playerStatisticsSettingsItem.maximumValue != null) {
						if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
							characterPlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					if (playerStatisticsSettingsItem.minimumValue != null) {
						if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
							playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
							characterPlayer.changePlayerStatistics(key, playerStatistics.value, currentMilliseconds);
						}
					}

					gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

					this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
				if (playerStatisticsSettingsItem.maximumValue != null) {
					if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
				}

				if (playerStatisticsSettingsItem.minimumValue != null) {
					if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
				}

				characterPlayer.changePlayerStatistics(key, value, currentMilliseconds);
				gnPlayerStatistic.add(ParameterCode.Value, value);

				this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
			}

			gnPlayerStatistics.add(gnPlayerStatistic);
		}

		characterPlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerStatistics, gnPlayerStatistics);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_ChangePlayerStatistics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
