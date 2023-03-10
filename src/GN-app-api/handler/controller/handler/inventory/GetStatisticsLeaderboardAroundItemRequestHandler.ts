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
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { Inventory } from "../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";

class GetStatisticsLeaderboardAroundItemOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	itemId: string;

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

class ServerGetStatisticsLeaderboardAroundItemOperationRequest extends GetStatisticsLeaderboardAroundItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardAroundItemOperationRequest extends ServerGetStatisticsLeaderboardAroundItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardAroundItemRequestHandler extends ItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetStatisticsLeaderboardAroundItem;
	}

	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardAroundItemOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.getStatisticsLeaderboardAroundItem);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardAroundItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getStatisticsLeaderboardAroundItem.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardAroundItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getStatisticsLeaderboardAroundItem.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { itemId: string, key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_GetStatisticsLeaderboardAroundItem", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(secretInfo.getGameId());
		let inventoryStatisticsSettingsItem = inventorySettings.inventoryStatisticsSettings.find(x => x.key == request.key);

		if (inventoryStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

        let positionCacheKey = "inventoryStatisticsLeaderboardAroundPosition_" + request.itemId + "_" + request.key;
        let cacheKey = "inventoryStatisticsLeaderboardAround_" + request.itemId + "_" + request.key;
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
		let inventories: Inventory[];

        if (request.loadFromCache) {
            thisPosition = await cacheData.getData(positionCacheKey);
            inventories = await cacheData.getData(cacheKey);

            for (let i = request.skip; i < request.skip + request.limit; i++) {
                if (i >= inventories.length) break;

                let inventory = inventories[i];

                let gnResult = new GNHashtable();

                gnResult.add(GNParameterCode.Position, i + thisPosition);

                gnResult.add(GNParameterCode.ItemId, inventory.getItemId());

                gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(inventory, request.infoRequestParam, secretInfo.getGameId()));

                gnResults.add(gnResult);
            }
        }
        else {
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>inventoryStatisticsSettingsItem.statisticsAggregationMethod;
            let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;
    
            thisPosition = await this.gnServer.getDatabase().loadPositionInventoryLeaderboardWithStatisticsAsync(request.key, request.itemId, request.catalogId, secretInfo.getGameId(), inventoryStatisticsSettingsItem.initialValue, direction);
    
            if (thisPosition != -1) {
                await cacheData.setData(positionCacheKey, thisPosition, xDatetime.ONE_MINUTE_MILLISECOND * 5);

                let inventoryFindOptions = this.convertToInventoryFindOptions(request.infoRequestParam);

                if (request.skip + request.limit <= 100) {
                    inventoryFindOptions = null;
    
                    inventories = await this.gnServer.getDatabase().loadInventoriesLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, inventoryFindOptions);
    
                    for (let i = request.skip; i < request.skip + request.limit; i++) {
                        if (i >= inventories.length) break;
    
                        let inventory = inventories[i];
    
                        let gnResult = new GNHashtable();
    
                        gnResult.add(GNParameterCode.Position, i + thisPosition);
    
                        gnResult.add(GNParameterCode.ItemId, inventory.getItemId());
    
                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(inventory, request.infoRequestParam, secretInfo.getGameId()));
    
                        gnResults.add(gnResult);
                    }
    
                    await cacheData.setData(cacheKey, inventories, xDatetime.ONE_MINUTE_MILLISECOND * 5);
                }
                else {
                    inventories = await this.gnServer.getDatabase().loadInventoriesLeaderboardWithStatisticsAsync(request.key, thisPosition + request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, inventoryFindOptions);
    
                    for (let i = 0; i < inventories.length; i++) {
    
                        let inventory = inventories[i];
    
                        let gnResult = new GNHashtable();
    
                        gnResult.add(GNParameterCode.Position, i + thisPosition + request.skip);
    
                        gnResult.add(GNParameterCode.ItemId, inventory.getItemId());
    
                        gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(inventory, request.infoRequestParam, secretInfo.getGameId()));
    
                        gnResults.add(gnResult);
                    }
                }
            }
        }

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_GetStatisticsLeaderboardAroundItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
