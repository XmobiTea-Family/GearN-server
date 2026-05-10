import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { Group } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetStatisticsLeaderboardAroundGroupOperationRequest extends OperationRequest {
    // Stores the group ID value used by this instance.
    @StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
    public groupId: string;

    // Stores the key value used by this instance.
    @StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
    public key: string;

    // Stores the info request parameter value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
    public infoRequestParam: InfoRequestParam;

    // Stores the skip value used by this instance.
    @NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
    public skip?: number;

    // Stores the limit value used by this instance.
    @NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    public limit?: number;

    // Indicates whether load from cache.
    @BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
    public loadFromCache?: boolean;

    // Stores the catalog ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
    public catalogId?: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetStatisticsLeaderboardAroundGroupOperationRequest extends GetStatisticsLeaderboardAroundGroupOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetStatisticsLeaderboardAroundGroupOperationRequest extends ServerGetStatisticsLeaderboardAroundGroupOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetStatisticsLeaderboardAroundGroupRequestHandler extends GroupBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetStatisticsLeaderboardAroundGroup;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetStatisticsLeaderboardAroundGroupOperationRequest;
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

        // Tracks whether method is allowed.
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.getStatisticsLeaderboardAroundGroup);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                groupId: request.groupId,
                key: request.key,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
                loadFromCache: request.loadFromCache,
                catalogId: request.catalogId,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardAroundGroupOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getStatisticsLeaderboardAroundGroup.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                groupId: request.groupId,
                key: request.key,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
                loadFromCache: request.loadFromCache,
                catalogId: request.catalogId,
            },
            SecretRole.Server,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardAroundGroupOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getStatisticsLeaderboardAroundGroup.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                groupId: request.groupId,
                key: request.key,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
                loadFromCache: request.loadFromCache,
                catalogId: request.catalogId,
            },
            SecretRole.Admin,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { groupId: string; key: string; skip: number; limit: number; infoRequestParam: InfoRequestParam; loadFromCache: boolean; catalogId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetStatisticsLeaderboardAroundGroup", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the resolved group settings instance for the current execution flow.
        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());
        // Stores the group statistics settings item value used in the current execution flow.
        let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find((x) => x.key == request.key);

        if (groupStatisticsSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

            return operationResponse;
        }

        // Stores the position cache key value used in the current execution flow.
        let positionCacheKey = "groupStatisticsLeaderboardAroundPosition_" + request.groupId + "_" + request.key;
        // Stores the cache key value used in the current execution flow.
        let cacheKey = "groupStatisticsLeaderboardAround_" + request.groupId + "_" + request.key;
        if (request.catalogId) {
            cacheKey += "_" + request.catalogId;
            positionCacheKey += "_" + request.catalogId;
        }

        if (request.loadFromCache) {
            if (request.skip + request.limit > 100) {
                request.loadFromCache = false;
            }
        }

        // Stores the cache data value used in the current execution flow.
        let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

        if (request.loadFromCache) {
            if (!(await cacheData.isValid(cacheKey)) || !(await cacheData.isValid(positionCacheKey))) {
                request.loadFromCache = false;
            }
        }

        // Stores the GearN results value used in the current execution flow.
        let gnResults = new GNArray();

        // Stores the this position value used in the current execution flow.
        let thisPosition: number;
        // Stores the groups value used in the current execution flow.
        let groups: Group[];

        if (request.loadFromCache) {
            thisPosition = await cacheData.getData(positionCacheKey);
            groups = await cacheData.getData(cacheKey);

            for (let i = request.skip; i < request.skip + request.limit; i++) {
                if (i >= groups.length) break;

                // Stores the group value used in the current execution flow.
                let group = groups[i];

                // Stores the GearN result value used in the current execution flow.
                let gnResult = new GNHashtable();

                gnResult.add(ParameterCode.Position, i + thisPosition);

                gnResult.add(ParameterCode.GroupId, group.getGroupId());

                gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

                gnResults.add(gnResult);
            }
        } else {
            // Stores the statistics aggregation method value used in the current execution flow.
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;
            // Stores the direction value used in the current execution flow.
            let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

            thisPosition = await this.gnServer.getDatabase().groupRepository.loadPositionGroupLeaderboardWithStatisticsAsync(request.key, request.groupId, request.catalogId, secretInfo.getGameId(), groupStatisticsSettingsItem.initialValue, direction);

            if (thisPosition != -1) {
                await cacheData.setData(positionCacheKey, thisPosition, xDatetime.ONE_MINUTE_MILLISECOND * 5);

                // Stores the group find options value used in the current execution flow.
                let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

                if (request.skip + request.limit <= 100) {
                    groupFindOptions = null;

                    groups = await this.gnServer.getDatabase().groupRepository.loadGroupsLeaderboardWithStatisticsAsync(request.key, thisPosition, 100, request.catalogId, secretInfo.getGameId(), direction, groupFindOptions);

                    for (let i = request.skip; i < request.skip + request.limit; i++) {
                        if (i >= groups.length) break;

                        // Stores the group value used in the current execution flow.
                        let group = groups[i];

                        // Stores the GearN result value used in the current execution flow.
                        let gnResult = new GNHashtable();

                        gnResult.add(ParameterCode.Position, i + thisPosition);

                        gnResult.add(ParameterCode.GroupId, group.getGroupId());

                        gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

                        gnResults.add(gnResult);
                    }

                    await cacheData.setData(cacheKey, groups, xDatetime.ONE_MINUTE_MILLISECOND * 5);
                } else {
                    groups = await this.gnServer.getDatabase().groupRepository.loadGroupsLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, groupFindOptions);

                    for (let i = 0; i < groups.length; i++) {
                        // Stores the group value used in the current execution flow.
                        let group = groups[i];

                        // Stores the GearN result value used in the current execution flow.
                        let gnResult = new GNHashtable();

                        gnResult.add(ParameterCode.Position, i + thisPosition + request.skip);

                        gnResult.add(ParameterCode.GroupId, group.getGroupId());

                        gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

                        gnResults.add(gnResult);
                    }
                }
            }
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_GetStatisticsLeaderboardAroundGroup", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
