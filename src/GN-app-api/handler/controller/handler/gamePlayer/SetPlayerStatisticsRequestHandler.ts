import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GamePlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/GamePlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GamePlayerErrorCode } from "../../../../../GN-common/constant/errorCode/GamePlayerErrorCode";

import { GamePlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { StatisticsAggregationMethod } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsAggregationMethod";

class SetPlayerStatisticsOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: GamePlayerParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true })
	playerStatistics: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerStatisticsOperationRequest extends SetPlayerStatisticsOperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

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

		if (!secretInfo.getPermission().gamePlayer.setPlayerStatistics.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), secretInfo.getGameId(), request.playerStatistics, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.setPlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.playerStatistics, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.setPlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.playerStatistics, operationRequest);
    }

    private async execute(userId: string, gameId: string, playerStatistics: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerStatistics: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);

		if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerStatistics = new GNArray();

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < playerStatistics.count(); i++) {
            let gnHashtable = playerStatistics.getGNHashtable(i);

            let key = gnHashtable.getString(GamePlayerParameterCode.Key);
            let value = gnHashtable.getNumber(GamePlayerParameterCode.Value);
            
            let gnPlayerStatistic = new GNHashtable();
            gnPlayerStatistic.add(GamePlayerParameterCode.Key, key);

            if (!gamePlayer.hasPlayerStatistics(key)) {
                if (gnPlayerStatistic.containsKey(GamePlayerParameterCode.MaximumValue)) {
                    let maximumValue = gnPlayerStatistic.getNumber(GamePlayerParameterCode.MaximumValue);
                    if (value > maximumValue) value = maximumValue;
                }

                if (gnPlayerStatistic.containsKey(GamePlayerParameterCode.MinimumValue)) {
                    let minimumValue = gnPlayerStatistic.getNumber(GamePlayerParameterCode.MinimumValue);
                    if (value < minimumValue) value = minimumValue;
                }

                gamePlayer.setPlayerStatistics(key, value, currentMilliseconds);
                gnPlayerStatistic.add(GamePlayerParameterCode.Value, value);
            }
            else {
                let playerStatistics = gamePlayer.getPlayerStatistics(key);

                let statisticsAggregationMethod = <StatisticsAggregationMethod>gnHashtable.getNumber(GamePlayerParameterCode.StatisticsAggregationMethod);

                if (statisticsAggregationMethod == StatisticsAggregationMethod.Inc) {
                    let newValue = value + playerStatistics.value;

                    if (gnPlayerStatistic.containsKey(GamePlayerParameterCode.MaximumValue)) {
                        let maximumValue = gnPlayerStatistic.getNumber(GamePlayerParameterCode.MaximumValue);
                        if (newValue > maximumValue) newValue = maximumValue;
                    }
    
                    if (gnPlayerStatistic.containsKey(GamePlayerParameterCode.MinimumValue)) {
                        let minimumValue = gnPlayerStatistic.getNumber(GamePlayerParameterCode.MinimumValue);
                        if (newValue < minimumValue) newValue = minimumValue;
                    }

                    gamePlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
                    gnPlayerStatistic.add(GamePlayerParameterCode.Value, newValue);
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Maximum) {
                    if (value > playerStatistics.value) {
                        gamePlayer.setPlayerStatistics(key, value, currentMilliseconds);
                        gnPlayerStatistic.add(GamePlayerParameterCode.Value, value);
                    }
                    else {
                        gnPlayerStatistic.add(GamePlayerParameterCode.Value, playerStatistics.value);
                    }
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Minimum) {
                    if (value < playerStatistics.value) {
                        gamePlayer.setPlayerStatistics(key, value, currentMilliseconds);
                        gnPlayerStatistic.add(GamePlayerParameterCode.Value, value);
                    }
                    else {
                        gnPlayerStatistic.add(GamePlayerParameterCode.Value, playerStatistics.value);
                    }
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Set) {
                    if (gnPlayerStatistic.containsKey(GamePlayerParameterCode.MaximumValue)) {
                        let maximumValue = gnPlayerStatistic.getNumber(GamePlayerParameterCode.MaximumValue);
                        if (value > maximumValue) value = maximumValue;
                    }
    
                    if (gnPlayerStatistic.containsKey(GamePlayerParameterCode.MinimumValue)) {
                        let minimumValue = gnPlayerStatistic.getNumber(GamePlayerParameterCode.MinimumValue);
                        if (value < minimumValue) value = minimumValue;
                    }

                    gamePlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(GamePlayerParameterCode.Value, value);
                }
            }

            gnPlayerStatistics.add(gnPlayerStatistic);
        }

		gamePlayer.saveAsync();

        gnInfoGetParameters.add(GamePlayerParameterCode.PlayerStatistics, gnPlayerStatistics);

        operationResponse.setParameter(GamePlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.Ok);

		return operationResponse;
    }
}
