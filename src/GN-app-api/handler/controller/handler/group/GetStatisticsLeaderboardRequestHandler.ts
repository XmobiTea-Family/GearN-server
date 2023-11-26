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
import { Group } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class GetStatisticsLeaderboardOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 5, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@BooleanDataMember({ code: GNParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	loadFromCache?: boolean;

    @StringDataMember({ code: GNParameterCode.Version, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
    version?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardOperationRequest extends GetStatisticsLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardOperationRequest extends ServerGetStatisticsLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardRequestHandler extends GroupBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetStatisticsLeaderboard;
	}

	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getStatisticsLeaderboard.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getStatisticsLeaderboard.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getStatisticsLeaderboard.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, version: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

		let masterGroupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());
		let groupStatisticsSettingsItem = masterGroupSettings.groupStatisticsSettings.find(x => x.key == request.key);

		if (groupStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

		if (!request.version) {
			let cacheKey = "groupStatisticsLeaderboard_" + request.key;

			if (request.loadFromCache) {
				if (request.skip + request.limit > 100) {
					request.loadFromCache = false;
				}
			}
	
			if (request.loadFromCache) {
				if (!this.gnServer.getCacheData().isValid(cacheKey)) {
					request.loadFromCache = false;
				}
			}
	
			let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;
			let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;
	
			let gnResults = new GNArray();
	
			let groups: Group[];
	
			if (request.loadFromCache) {
				groups = this.gnServer.getCacheData().getData(cacheKey);
	
				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= groups.length) break;
	
					let group = groups[i];
	
					let gnResult = new GNHashtable();
	
					gnResult.add(GNParameterCode.Position, i);
	
					gnResult.add(GNParameterCode.GroupId, group.getGroupId());
	
					gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));
	
					gnResults.add(gnResult);
				}
			}
			else {
				if (request.skip + request.limit <= 100) {
					groupFindOptions = null;
	
					groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAsync(request.key, 0, 100, secretInfo.getGameId(), direction, groupFindOptions);
	
					for (let i = request.skip; i < request.skip + request.limit; i++) {
						if (i >= groups.length) break;
	
						let group = groups[i];
	
						let gnResult = new GNHashtable();
	
						gnResult.add(GNParameterCode.Position, i);
	
						gnResult.add(GNParameterCode.GroupId, group.getGroupId());
	
						gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));
	
						gnResults.add(gnResult);
					}
	
					this.gnServer.getCacheData().setData(cacheKey, groups, xDatetime.ONE_MINUTE_MILLISECOND * 5);
				}
				else {
					groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAsync(request.key, request.skip, request.limit, secretInfo.getGameId(), direction, groupFindOptions);
	
					for (let i = 0; i < groups.length; i++) {
	
						let group = groups[i];
	
						let gnResult = new GNHashtable();
	
						gnResult.add(GNParameterCode.Position, i + request.skip);
	
						gnResult.add(GNParameterCode.GroupId, group.getGroupId());
	
						gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));
	
						gnResults.add(gnResult);
					}
				}
			}
	
			operationResponse.setParameter(GNParameterCode.Results, gnResults);
		}
		else {
			let gameId = secretInfo.getGameId();
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemGameCollection("Group.StatisticsBackup", gameId);

			let key =  request.key;
			let version =  request.version;

			let cacheKey = "groupStatisticsLeaderboard_" + key + "_" + version;
	
			if (!this.gnServer.getCacheData().isValid(cacheKey)) {
				let result = backupStatisticsLeaderboardCollection.findOne({ key: key, version: version });

				if (result == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.VersionInvalid);
					return operationResponse;
				}

				this.gnServer.getCacheData().setData(cacheKey, result, xDatetime.ONE_DAY_MILLISECOND * 7);
			}
			
			let backupData: {
				key: string,
				version: string,
				log: string,
				tsCreate: number,
				results: {
					position: number,
					groupId: string,
					value: number,
					tsLastUpdate: number,
				}[]
			} = this.gnServer.getCacheData().getData(cacheKey);
			

			let gnResults = new GNArray();
	
			let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= backupData.results.length) break;

				let result = backupData.results[i];

				let gnResult = new GNHashtable();

				gnResult.add(GNParameterCode.Position, result.position);
				gnResult.add(GNParameterCode.BackupValue, result.value);
	
				gnResult.add(GNParameterCode.GroupId, result.groupId);

				let group = groupFindOptions == null ? null
					: await this.gnServer.getDatabase().loadGroupAsync(result.groupId, gameId, groupFindOptions);

				if (group == null) gnResult.add(GNParameterCode.InfoResponseParameters, new GNHashtable());
				else gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, gameId));

				gnResults.add(gnResult);
			}
	
			operationResponse.setParameter(GNParameterCode.Results, gnResults);
			operationResponse.setParameter(GNParameterCode.TsCreate, backupData.tsCreate);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_GetStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
