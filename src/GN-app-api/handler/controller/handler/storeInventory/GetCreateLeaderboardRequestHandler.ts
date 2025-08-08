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
import { StoreItemBaseRequestHandler } from "./../storeInventory/StoreItemBaseRequestHandler";
import { InfoRequestParam } from "./../storeInventory/model/InfoRequestParam";
import { StoreInventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetCreateLeaderboardOperationRequest extends OperationRequest {

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	public loadFromCache?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetCreateLeaderboardOperationRequest extends GetCreateLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCreateLeaderboardOperationRequest extends ServerGetCreateLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetCreateLeaderboardRequestHandler extends StoreItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetCreateLeaderboard;
	}

	public override getCommonOperationRequest() {
		return GetCreateLeaderboardOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	private async execute(request: { skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetCreateLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let storeInventoryFindOptions = this.convertToStoreInventoryFindOptions(request.infoRequestParam);

		let cacheKey = "storeInventoryCreateLeaderboard";

		if (request.loadFromCache) {
			if (request.skip + request.limit > 100) {
				request.loadFromCache = false;
			}
		}

		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		if (request.loadFromCache) {
			if (!(await cacheData.isValid(cacheKey))) {
				request.loadFromCache = false;
			}
		}

		let gnResults = new GNArray();

		let storeInventorys: StoreInventory[];

		if (request.loadFromCache) {
			storeInventorys = await cacheData.getData(cacheKey);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= storeInventorys.length) break;

				let storeInventory = storeInventorys[i];

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

				storeInventorys = await this.gnServer.getDatabase().loadStoreInventoriesLeaderboardWithCreateAsync(0, 100, secretInfo.getGameId(), storeInventoryFindOptions);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= storeInventorys.length) break;

					let storeInventory = storeInventorys[i];

					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i);

					gnResult.add(ParameterCode.StoreId, storeInventory.getStoreId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}

				await cacheData.setData(cacheKey, storeInventorys, xDatetime.ONE_MINUTE_MILLISECOND * 5);
			}
			else {
				storeInventorys = await this.gnServer.getDatabase().loadStoreInventoriesLeaderboardWithCreateAsync(request.skip, request.limit, secretInfo.getGameId(), storeInventoryFindOptions);

				for (let i = 0; i < storeInventorys.length; i++) {

					let storeInventory = storeInventorys[i];

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

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetCreateLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
