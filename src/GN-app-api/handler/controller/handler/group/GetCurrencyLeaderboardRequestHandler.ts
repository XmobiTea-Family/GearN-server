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

class GetCurrencyLeaderboardOperationRequest extends OperationRequest {

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

class ServerGetCurrencyLeaderboardOperationRequest extends GetCurrencyLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCurrencyLeaderboardOperationRequest extends ServerGetCurrencyLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetCurrencyLeaderboardRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetCurrencyLeaderboard;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetCurrencyLeaderboardOperationRequest;
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

		if (!secretInfo.getPermission().group.getCurrencyLeaderboard.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCurrencyLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getCurrencyLeaderboard.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCurrencyLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getCurrencyLeaderboard.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
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
	private async execute(request: { key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetCurrencyLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());
		// Stores the group currencies settings item value used in the current execution flow.
		let groupCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings.find(x => x.key == request.key);

		if (groupCurrenciesSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

			return operationResponse;
		}

		// Stores the cache key value used in the current execution flow.
		let cacheKey = "groupCurrencyLeaderboard_" + request.key;
		if (request.catalogId) cacheKey += "_" + request.catalogId;

		if (request.loadFromCache) {
			if (request.skip + request.limit > 100) {
				request.loadFromCache = false;
			}
		}

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

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

			if (request.skip + request.limit <= 100) {
				groupFindOptions = null;

				groups = await this.gnServer.getDatabase().groupRepository.loadGroupsLeaderboardWithCurrenciesAsync(request.key, 0, 100, request.catalogId, secretInfo.getGameId(), groupFindOptions);

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
				groups = await this.gnServer.getDatabase().groupRepository.loadGroupsLeaderboardWithCurrenciesAsync(request.key, request.skip, request.limit, request.catalogId, secretInfo.getGameId(), groupFindOptions);

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

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_GetCurrencyLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
