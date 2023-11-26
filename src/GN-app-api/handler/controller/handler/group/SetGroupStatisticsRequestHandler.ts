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

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { GroupStatisticsParam } from "./model/GroupStatisticsParam";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class SetGroupStatisticsOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
    groupId: string;

    @GNArrayDataMember({ code: GNParameterCode.GroupStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupStatisticsParam })
    groupStatisticsParams: Array<GroupStatisticsParam>;

    @StringDataMember({ code: GNParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    log?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetGroupStatisticsOperationRequest extends SetGroupStatisticsOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetGroupStatisticsOperationRequest extends ServerSetGroupStatisticsOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetGroupStatisticsRequestHandler extends GroupBaseRequestHandler {
    public override getCode() {
        return OperationCode.SetGroupStatistics;
    }

    public override getCommonOperationRequest() {
        return SetGroupStatisticsOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setGroupStatistics);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            groupStatisticsParams: request.groupStatisticsParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetGroupStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.setGroupStatistics.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            groupStatisticsParams: request.groupStatisticsParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetGroupStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.setGroupStatistics.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            groupStatisticsParams: request.groupStatisticsParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { groupId: string, groupStatisticsParams: Array<GroupStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetGroupStatistics", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let groupFindOptions: GroupFindOptions = {
            groupStatistics: true,
        }

        let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

        if (group == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GroupNotFound);
            return operationResponse;
        }

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

        let gnInfoResponseParameters = new GNHashtable();
        let gnGroupStatistics = new GNArray();

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < request.groupStatisticsParams.length; i++) {
            let groupStatisticsParam = request.groupStatisticsParams[i];

            let key = groupStatisticsParam.key;

            let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == key);
            if (groupStatisticsSettingsItem == null) continue;

            let value = groupStatisticsParam.value;

            let gnGroupStatistic = new GNHashtable();
            gnGroupStatistic.add(GNParameterCode.Key, key);

            if (!group.hasGroupStatistics(key))
                group.setGroupStatistics(key, groupStatisticsSettingsItem.initialValue, currentMilliseconds);

            let groupStatistics = group.getGroupStatistics(key);
            let oldValue = groupStatistics.value;

            let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;

            if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
                let newValue = value + groupStatistics.value;

                if (groupStatisticsSettingsItem.maximumValue != null) {
                    if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
                }

                if (groupStatisticsSettingsItem.minimumValue != null) {
                    if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
                }

                group.setGroupStatistics(key, newValue, currentMilliseconds);
                gnGroupStatistic.add(GNParameterCode.Value, newValue);

                this.gnServer.getDatabase().insertGroupStatisticsLogAsync(request.groupId, secretInfo.getGameId(), key, groupStatisticsParam.value, oldValue, newValue, request.log);
            }
            else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
                if (value > groupStatistics.value) {
                    if (groupStatisticsSettingsItem.maximumValue != null) {
                        if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
                    }

                    if (groupStatisticsSettingsItem.minimumValue != null) {
                        if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
                    }

                    group.setGroupStatistics(key, value, currentMilliseconds);
                    gnGroupStatistic.add(GNParameterCode.Value, value);

                    this.gnServer.getDatabase().insertGroupStatisticsLogAsync(request.groupId, secretInfo.getGameId(), key, groupStatisticsParam.value, oldValue, value, request.log);
                }
                else {
                    if (groupStatisticsSettingsItem.maximumValue != null) {
                        if (groupStatistics.value > groupStatisticsSettingsItem.maximumValue) {
                            groupStatistics.value = groupStatisticsSettingsItem.maximumValue;
                            group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
                        }
                    }

                    if (groupStatisticsSettingsItem.minimumValue != null) {
                        if (groupStatistics.value < groupStatisticsSettingsItem.minimumValue) {
                            groupStatistics.value = groupStatisticsSettingsItem.minimumValue;
                            group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
                        }
                    }

                    gnGroupStatistic.add(GNParameterCode.Value, groupStatistics.value);

                    this.gnServer.getDatabase().insertGroupStatisticsLogAsync(request.groupId, secretInfo.getGameId(), key, groupStatisticsParam.value, oldValue, groupStatistics.value, request.log);
                }
            }
            else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
                if (value < groupStatistics.value) {
                    if (groupStatisticsSettingsItem.maximumValue != null) {
                        if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
                    }

                    if (groupStatisticsSettingsItem.minimumValue != null) {
                        if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
                    }

                    group.setGroupStatistics(key, value, currentMilliseconds);
                    gnGroupStatistic.add(GNParameterCode.Value, value);

                    this.gnServer.getDatabase().insertGroupStatisticsLogAsync(request.groupId, secretInfo.getGameId(), key, groupStatisticsParam.value, oldValue, value, request.log);
                }
                else {
                    if (groupStatisticsSettingsItem.maximumValue != null) {
                        if (groupStatistics.value > groupStatisticsSettingsItem.maximumValue) {
                            groupStatistics.value = groupStatisticsSettingsItem.maximumValue;
                            group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
                        }
                    }

                    if (groupStatisticsSettingsItem.minimumValue != null) {
                        if (groupStatistics.value < groupStatisticsSettingsItem.minimumValue) {
                            groupStatistics.value = groupStatisticsSettingsItem.minimumValue;
                            group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
                        }
                    }

                    gnGroupStatistic.add(GNParameterCode.Value, groupStatistics.value);

                    this.gnServer.getDatabase().insertGroupStatisticsLogAsync(request.groupId, secretInfo.getGameId(), key, groupStatisticsParam.value, oldValue, groupStatistics.value, request.log);
                }
            }
            else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
                if (groupStatisticsSettingsItem.maximumValue != null) {
                    if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
                }

                if (groupStatisticsSettingsItem.minimumValue != null) {
                    if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
                }

                group.setGroupStatistics(key, value, currentMilliseconds);
                gnGroupStatistic.add(GNParameterCode.Value, value);

                this.gnServer.getDatabase().insertGroupStatisticsLogAsync(request.groupId, secretInfo.getGameId(), key, groupStatisticsParam.value, oldValue, value, request.log);
            }

            gnGroupStatistics.add(gnGroupStatistic);
        }

        group.saveAsync();

        gnInfoResponseParameters.add(GNParameterCode.GroupStatistics, gnGroupStatistics);

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_SetGroupStatistics", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
