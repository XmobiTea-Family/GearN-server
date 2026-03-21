import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { Group } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class GetStatisticsLeaderboardOperationRequest extends OperationRequest {

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

	// Stores the version value used by this instance.
	@StringDataMember({ code: ParameterCode.Version, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	public version?: string;

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

class ServerGetStatisticsLeaderboardOperationRequest extends GetStatisticsLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardOperationRequest extends ServerGetStatisticsLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetStatisticsLeaderboard;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardOperationRequest;
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
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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
			catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, version: string, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());
		// Stores the group statistics settings item value used in the current execution flow.
		let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == request.key);

		if (groupStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

			return operationResponse;
		}

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		if (!request.version) {
			// Stores the cache key value used in the current execution flow.
			let cacheKey = "groupStatisticsLeaderboard_" + request.key;
			if (request.catalogId) cacheKey += "_" + request.catalogId;

			if (request.loadFromCache) {
				if (request.skip + request.limit > 100) {
					request.loadFromCache = false;
				}
			}

			if (request.loadFromCache) {
				if (!(await cacheData.isValid(cacheKey))) {
					request.loadFromCache = false;
				}
			}

			// Stores the GearN results value used in the current execution flow.
			let gnResults = new GNArray();

			// Stores the groups value used in the current execution flow.
			let groups: Group[];

			if (request.loadFromCache) {
				groups = await cacheData.getData(cacheKey);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= groups.length) break;

					// Stores the group value used in the current execution flow.
					let group = groups[i];

					// Stores the GearN result value used in the current execution flow.
					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i);

					gnResult.add(ParameterCode.GroupId, group.getGroupId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}
			}
			else {
				// Stores the group find options value used in the current execution flow.
				let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

				// Stores the statistics aggregation method value used in the current execution flow.
				let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;
				// Stores the direction value used in the current execution flow.
				let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;

				if (request.skip + request.limit <= 100) {
					groupFindOptions = null;

					groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAsync(request.key, 0, 100, request.catalogId, secretInfo.getGameId(), direction, groupFindOptions);

					for (let i = request.skip; i < request.skip + request.limit; i++) {
						if (i >= groups.length) break;

						// Stores the group value used in the current execution flow.
						let group = groups[i];

						// Stores the GearN result value used in the current execution flow.
						let gnResult = new GNHashtable();

						gnResult.add(ParameterCode.Position, i);

						gnResult.add(ParameterCode.GroupId, group.getGroupId());

						gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

						gnResults.add(gnResult);
					}

					await cacheData.setData(cacheKey, groups, xDatetime.ONE_MINUTE_MILLISECOND * 5);
				}
				else {
					groups = await this.gnServer.getDatabase().loadGroupsLeaderboardWithStatisticsAsync(request.key, request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, groupFindOptions);

					for (let i = 0; i < groups.length; i++) {

						// Stores the group value used in the current execution flow.
						let group = groups[i];

						// Stores the GearN result value used in the current execution flow.
						let gnResult = new GNHashtable();

						gnResult.add(ParameterCode.Position, i + request.skip);

						gnResult.add(ParameterCode.GroupId, group.getGroupId());

						gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

						gnResults.add(gnResult);
					}
				}
			}

			operationResponse.setParameter(ParameterCode.Results, gnResults);
		}
		else {
			// Stores the game ID value used in the current execution flow.
			let gameId = secretInfo.getGameId();
			// Stores the backup statistics leaderboard collection value used in the current execution flow.
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);

			// Stores the key value used in the current execution flow.
			let key = request.key;
			// Stores the version value used in the current execution flow.
			let version = request.version;

			// Stores the cache key value used in the current execution flow.
			let cacheKey = "groupStatisticsLeaderboard_" + key + "_" + version;

			if (!(await cacheData.isValid(cacheKey))) {
				// Stores the result value used in the current execution flow.
				let result = await backupStatisticsLeaderboardCollection.findOne({ key: key, version: version });

				if (result == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VersionInvalid);
					return operationResponse;
				}

				await cacheData.setData(cacheKey, result, xDatetime.ONE_MINUTE_MILLISECOND * 5);
			}

			// Stores the backup data value used in the current execution flow.
			let backupData: {
				// Stores the key value used by this contract.
				key: string,
				// Stores the version value used by this contract.
				version: string,
				// Stores the log value used by this contract.
				log: string,
				// Stores the timestamp create value used by this contract.
				tsCreate: number,
				// Stores the results list used by this contract.
				results: {
					// Stores the position value used by this contract.
					position: number,
					// Stores the group ID value used by this contract.
					groupId: string,
					// Stores the value value used by this contract.
					value: number,
					// Stores the timestamp last update value used by this contract.
					tsLastUpdate: number,
				}[]
			} = await cacheData.getData(cacheKey);


			// Stores the GearN results value used in the current execution flow.
			let gnResults = new GNArray();

			// Stores the group find options value used in the current execution flow.
			let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= backupData.results.length) break;

				// Stores the result value used in the current execution flow.
				let result = backupData.results[i];

				// Stores the GearN result value used in the current execution flow.
				let gnResult = new GNHashtable();

				gnResult.add(ParameterCode.Position, result.position);
				gnResult.add(ParameterCode.BackupValue, result.value);

				gnResult.add(ParameterCode.GroupId, result.groupId);

				// Stores the group value used in the current execution flow.
				let group = groupFindOptions == null ? null
					: await this.gnServer.getDatabase().loadGroupAsync(result.groupId, gameId, groupFindOptions);

				if (group == null) gnResult.add(ParameterCode.InfoResponseParameters, new GNHashtable());
				else gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, gameId));

				gnResults.add(gnResult);
			}

			operationResponse.setParameter(ParameterCode.Results, gnResults);
			operationResponse.setParameter(ParameterCode.TsCreate, backupData.tsCreate);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_GetStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
