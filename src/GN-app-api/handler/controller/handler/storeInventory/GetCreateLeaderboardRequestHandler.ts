import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./../storeInventory/StoreItemBaseRequestHandler";
import { InfoRequestParam } from "./../storeInventory/model/InfoRequestParam";
import { StoreInventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetCreateLeaderboardOperationRequest extends OperationRequest {

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

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetCreateLeaderboardOperationRequest extends GetCreateLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCreateLeaderboardOperationRequest extends ServerGetCreateLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetCreateLeaderboardRequestHandler extends StoreItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetCreateLeaderboard;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetCreateLeaderboardOperationRequest;
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

		if (!secretInfo.getPermission().storeInventory.getCreateLeaderboard.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCreateLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getCreateLeaderboard.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCreateLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getCreateLeaderboard.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetCreateLeaderboard", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the store inventory find options value used in the current execution flow.
		let storeInventoryFindOptions = this.convertToStoreInventoryFindOptions(request.infoRequestParam);

		// Stores the cache key value used in the current execution flow.
		let cacheKey = "storeInventoryCreateLeaderboard";

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

		// Stores the store inventorys value used in the current execution flow.
		let storeInventorys: StoreInventory[];

		if (request.loadFromCache) {
			storeInventorys = await cacheData.getData(cacheKey);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= storeInventorys.length) break;

				// Stores the store inventory value used in the current execution flow.
				let storeInventory = storeInventorys[i];

				// Stores the GearN result value used in the current execution flow.
				let gnResult = new GNHashtable();

				gnResult.add(ParameterCode.Position, i);

				gnResult.add(ParameterCode.StoreId, storeInventory.getStoreId());

				gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, request.infoRequestParam, secretInfo.getGameId()));

				gnResults.add(gnResult);
			}
		}
		else {
			if (request.skip + request.limit <= 100) {
				storeInventoryFindOptions = null;

				storeInventorys = await this.gnServer.getDatabase().storeInventoryRepository.loadStoreInventoriesLeaderboardWithCreateAsync(0, 100, secretInfo.getGameId(), storeInventoryFindOptions);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= storeInventorys.length) break;

					// Stores the store inventory value used in the current execution flow.
					let storeInventory = storeInventorys[i];

					// Stores the GearN result value used in the current execution flow.
					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i);

					gnResult.add(ParameterCode.StoreId, storeInventory.getStoreId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}

				await cacheData.setData(cacheKey, storeInventorys, xDatetime.ONE_MINUTE_MILLISECOND * 5);
			}
			else {
				storeInventorys = await this.gnServer.getDatabase().storeInventoryRepository.loadStoreInventoriesLeaderboardWithCreateAsync(request.skip, request.limit, secretInfo.getGameId(), storeInventoryFindOptions);

				for (let i = 0; i < storeInventorys.length; i++) {

					// Stores the store inventory value used in the current execution flow.
					let storeInventory = storeInventorys[i];

					// Stores the GearN result value used in the current execution flow.
					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i + request.skip);

					gnResult.add(ParameterCode.StoreId, storeInventory.getStoreId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetCreateLeaderboard", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
