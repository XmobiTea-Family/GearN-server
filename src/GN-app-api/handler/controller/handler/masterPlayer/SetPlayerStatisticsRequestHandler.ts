import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { StatisticsAggregationMethod } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsAggregationMethod";

class SetPlayerStatisticsOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: MasterPlayerParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true })
	playerStatistics: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerStatisticsOperationRequest extends SetPlayerStatisticsOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
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

		if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), request.playerStatistics, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.playerStatistics, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPlayerStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.playerStatistics, operationRequest);
    }

    private async execute(userId: string, playerStatistics: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerStatistics: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerStatistics = new GNArray();

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < playerStatistics.count(); i++) {
            let gnHashtable = playerStatistics.getGNHashtable(i);

            let key = gnHashtable.getString(MasterPlayerParameterCode.Key);
            let value = gnHashtable.getNumber(MasterPlayerParameterCode.Value);
            
            let gnPlayerStatistic = new GNHashtable();
            gnPlayerStatistic.add(MasterPlayerParameterCode.Key, key);

            if (!masterPlayer.hasPlayerStatistics(key)) {
                if (gnPlayerStatistic.containsKey(MasterPlayerParameterCode.MaximumValue)) {
                    let maximumValue = gnPlayerStatistic.getNumber(MasterPlayerParameterCode.MaximumValue);
                    if (value > maximumValue) value = maximumValue;
                }

                if (gnPlayerStatistic.containsKey(MasterPlayerParameterCode.MinimumValue)) {
                    let minimumValue = gnPlayerStatistic.getNumber(MasterPlayerParameterCode.MinimumValue);
                    if (value < minimumValue) value = minimumValue;
                }

                masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                gnPlayerStatistic.add(MasterPlayerParameterCode.Value, value);
            }
            else {
                let playerStatistics = masterPlayer.getPlayerStatistics(key);

                let statisticsAggregationMethod = <StatisticsAggregationMethod>gnHashtable.getNumber(MasterPlayerParameterCode.StatisticsAggregationMethod);

                if (statisticsAggregationMethod == StatisticsAggregationMethod.Inc) {
                    let newValue = value + playerStatistics.value;

                    if (gnPlayerStatistic.containsKey(MasterPlayerParameterCode.MaximumValue)) {
                        let maximumValue = gnPlayerStatistic.getNumber(MasterPlayerParameterCode.MaximumValue);
                        if (newValue > maximumValue) newValue = maximumValue;
                    }
    
                    if (gnPlayerStatistic.containsKey(MasterPlayerParameterCode.MinimumValue)) {
                        let minimumValue = gnPlayerStatistic.getNumber(MasterPlayerParameterCode.MinimumValue);
                        if (newValue < minimumValue) newValue = minimumValue;
                    }

                    masterPlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
                    gnPlayerStatistic.add(MasterPlayerParameterCode.Value, newValue);
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Maximum) {
                    if (value > playerStatistics.value) {
                        masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                        gnPlayerStatistic.add(MasterPlayerParameterCode.Value, value);
                    }
                    else {
                        gnPlayerStatistic.add(MasterPlayerParameterCode.Value, playerStatistics.value);
                    }
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Minimum) {
                    if (value < playerStatistics.value) {
                        masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                        gnPlayerStatistic.add(MasterPlayerParameterCode.Value, value);
                    }
                    else {
                        gnPlayerStatistic.add(MasterPlayerParameterCode.Value, playerStatistics.value);
                    }
                }
                else if (statisticsAggregationMethod == StatisticsAggregationMethod.Set) {
                    if (gnPlayerStatistic.containsKey(MasterPlayerParameterCode.MaximumValue)) {
                        let maximumValue = gnPlayerStatistic.getNumber(MasterPlayerParameterCode.MaximumValue);
                        if (value > maximumValue) value = maximumValue;
                    }
    
                    if (gnPlayerStatistic.containsKey(MasterPlayerParameterCode.MinimumValue)) {
                        let minimumValue = gnPlayerStatistic.getNumber(MasterPlayerParameterCode.MinimumValue);
                        if (value < minimumValue) value = minimumValue;
                    }

                    masterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(MasterPlayerParameterCode.Value, value);
                }
            }

            gnPlayerStatistics.add(gnPlayerStatistic);
        }

		masterPlayer.saveAsync();

        gnInfoGetParameters.add(MasterPlayerParameterCode.PlayerStatistics, gnPlayerStatistics);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);

		return operationResponse;
    }
}
