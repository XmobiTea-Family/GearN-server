import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { CharacterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/CharacterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { CharacterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/CharacterPlayerErrorCode";

import { CharacterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { StatisticsAggregationMethod } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsAggregationMethod";

class SetPlayerStatisticsOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: CharacterPlayerParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true })
	playerStatistics: GNArray;

	@StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerStatisticsOperationRequest extends SetPlayerStatisticsOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPlayerStatisticsOperationRequest extends ServerSetPlayerStatisticsOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerStatisticsRequestHandler extends RequestHandler {
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

		if (!secretInfo.getPermission().characterPlayer.setPlayerStatistics.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.playerStatistics, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setPlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.playerStatistics, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.setPlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.playerStatistics, operationRequest);
    }

    private async execute(characterId: string, gameId: string, playerStatistics: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            playerStatistics: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerStatistics = new GNArray();

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < playerStatistics.count(); i++) {
            let gnHashtable = playerStatistics.getGNHashtable(i);

            let key = gnHashtable.getString(CharacterPlayerParameterCode.Key);
            let value = gnHashtable.getNumber(CharacterPlayerParameterCode.Value);
            
            let gnPlayerStatistic = new GNHashtable();
            gnPlayerStatistic.add(CharacterPlayerParameterCode.Key, key);

            if (!characterPlayer.hasPlayerStatistics(key)) {
                if (gnPlayerStatistic.containsKey(CharacterPlayerParameterCode.MaximumValue)) {
                    let maximumValue = gnPlayerStatistic.getNumber(CharacterPlayerParameterCode.MaximumValue);
                    if (value > maximumValue) value = maximumValue;
                }

                if (gnPlayerStatistic.containsKey(CharacterPlayerParameterCode.MinimumValue)) {
                    let minimumValue = gnPlayerStatistic.getNumber(CharacterPlayerParameterCode.MinimumValue);
                    if (value < minimumValue) value = minimumValue;
                }

                characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, value);
            }
            else {
                let playerStatistics = characterPlayer.getPlayerStatistics(key);

                let statisticsAggregationMethod = <StatisticsAggregationMethod>gnHashtable.getNumber(CharacterPlayerParameterCode.StatisticsAggregationMethod);

                if (statisticsAggregationMethod == StatisticsAggregationMethod.Inc) {
                    let newValue = value + playerStatistics.value;

                    if (gnPlayerStatistic.containsKey(CharacterPlayerParameterCode.MaximumValue)) {
                        let maximumValue = gnPlayerStatistic.getNumber(CharacterPlayerParameterCode.MaximumValue);
                        if (newValue > maximumValue) newValue = maximumValue;
                    }
    
                    if (gnPlayerStatistic.containsKey(CharacterPlayerParameterCode.MinimumValue)) {
                        let minimumValue = gnPlayerStatistic.getNumber(CharacterPlayerParameterCode.MinimumValue);
                        if (newValue < minimumValue) newValue = minimumValue;
                    }

                    characterPlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
                    gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, newValue);
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Maximum) {
                    if (value > playerStatistics.value) {
                        characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                        gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, value);
                    }
                    else {
                        gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, playerStatistics.value);
                    }
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Minimum) {
                    if (value < playerStatistics.value) {
                        characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                        gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, value);
                    }
                    else {
                        gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, playerStatistics.value);
                    }
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Set) {
                    if (gnPlayerStatistic.containsKey(CharacterPlayerParameterCode.MaximumValue)) {
                        let maximumValue = gnPlayerStatistic.getNumber(CharacterPlayerParameterCode.MaximumValue);
                        if (value > maximumValue) value = maximumValue;
                    }
    
                    if (gnPlayerStatistic.containsKey(CharacterPlayerParameterCode.MinimumValue)) {
                        let minimumValue = gnPlayerStatistic.getNumber(CharacterPlayerParameterCode.MinimumValue);
                        if (value < minimumValue) value = minimumValue;
                    }

                    characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, value);
                }
            }

            gnPlayerStatistics.add(gnPlayerStatistic);
        }

		characterPlayer.saveAsync();

        gnInfoGetParameters.add(CharacterPlayerParameterCode.PlayerStatistics, gnPlayerStatistics);

        operationResponse.setParameter(CharacterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);

		return operationResponse;
    }
}
