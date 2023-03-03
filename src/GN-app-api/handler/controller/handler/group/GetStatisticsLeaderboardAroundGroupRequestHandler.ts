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

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { Group } from "../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";

class GetStatisticsLeaderboardAroundGroupOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	groupId: string;

	@StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@BooleanDataMember({ code: GNParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	loadFromCache?: boolean;

	@StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	catalogId?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardAroundGroupOperationRequest extends GetStatisticsLeaderboardAroundGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardAroundGroupOperationRequest extends ServerGetStatisticsLeaderboardAroundGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardAroundGroupRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetStatisticsLeaderboardAroundGroup;
	}

	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardAroundGroupOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.getStatisticsLeaderboardAroundGroup);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			groupId: request.groupId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardAroundGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getStatisticsLeaderboardAroundGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			groupId: request.groupId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardAroundGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getStatisticsLeaderboardAroundGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			groupId: request.groupId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetStatisticsLeaderboardAroundGroup", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());
		let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == request.key);

		if (groupStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

        let positionCacheKey = "groupStatisticsLeaderboardAroundPosition_" + request.groupId + "_" + request.key;
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

        let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

        if (request.loadFromCache) {
            if (!(await cacheData.isValid(cacheKey)) || !(await cacheData.isValid(positionCacheKey))) {
                request.loadFromCache = false;
            }
        }

		let gnResults = new GNArray();

        let thisPosition: number;
        let groups: Group[];

        if (request.loadFromCache) {
            thisPosition = await cacheData.getData(positionCacheKey);
            groups = await cacheData.getData(cacheKey);

            for (let i = request.skip; i < request.skip + request.limit; i++) {
                if (i >= groups.length) break;

                let group = groups[i];

                let gnResult = new GNHashtable();

                gnResult.add(GNParameterCode.Position, i + thisPosition);

                gnResult.add(GNParameterCode.GroupId, group.getGroupId());

                gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

                gnResults.add(gnResult);
            }
        }
        else {
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;
            let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

            thisPosition = await this.gnServer.getDatabase().loadPositionGroupLeaderboardWithStatisticsAsync(request.key, request.groupId, request.catalogId, secretInfo.getGameId(), groupStatisticsSettingsItem.initialValue, direction);

            if (thisPosition != -1) {
                await cacheData.setData(positionCacheKey, thisPosition, xDatetime.ONE_MINUTE_MILLISECOND * 5);

                let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

                if (request.skip + request.limit <= 100) {
                    groupFindOptions = null;

                    groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAsync(request.key, thisPosition, 100, request.catalogId, secretInfo.getGameId(), direction, groupFindOptions);

                    for (let i = request.skip; i < request.skip + request.limit; i++) {
                        if (i >= groups.length) break;

                        let group = groups[i];

                        let gnResult = new GNHashtable();

                        gnResult.add(GNParameterCode.Position, i + thisPosition);

                        gnResult.add(GNParameterCode.GroupId, group.getGroupId());

                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

                        gnResults.add(gnResult);
                    }
    
                    await cacheData.setData(cacheKey, groups, xDatetime.ONE_MINUTE_MILLISECOND * 5);
                }
                else {
                    groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, groupFindOptions);

                    for (let i = 0; i < groups.length; i++) {
                        let group = groups[i];

                        let gnResult = new GNHashtable();

                        gnResult.add(GNParameterCode.Position, i + thisPosition + request.skip);

                        gnResult.add(GNParameterCode.GroupId, group.getGroupId());

                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

                        gnResults.add(gnResult);
                    }
                }
            }
        }

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_GetStatisticsLeaderboardAroundGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
