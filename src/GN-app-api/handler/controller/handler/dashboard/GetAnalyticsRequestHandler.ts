import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { GNArray, GNHashtable, GNHashtableBuilder } from "./../../../../../GN-common/common/GNData";
import { BooleanDataMember, NumberDataMember } from "./../../../../../GN-common/entity/DataMember";

class GetAnalyticsOperationRequest extends OperationRequest {
    // Stores the timestamp value used by this instance.
    @NumberDataMember({ code: ParameterCode.Timestamp, minValue: 0, isOptional: true })
    public timestamp?: number;

    // Indicates whether analytics item.
    @BooleanDataMember({ code: ParameterCode.AnalyticsItem, isOptional: true })
    public analyticsItem?: boolean;

    // Indicates whether country.
    @BooleanDataMember({ code: ParameterCode.Country, isOptional: true })
    public country?: boolean;

    // Indicates whether request complete.
    @BooleanDataMember({ code: ParameterCode.RequestComplete, isOptional: true })
    public requestComplete?: boolean;

    // Indicates whether operation system.
    @BooleanDataMember({ code: ParameterCode.OperationSystem, isOptional: true })
    public operationSystem?: boolean;

    // Indicates whether database system.
    @BooleanDataMember({ code: ParameterCode.DatabaseSystem, isOptional: true })
    public databaseSystem?: boolean;

    // Indicates whether log database system.
    @BooleanDataMember({ code: ParameterCode.LogDatabaseSystem, isOptional: true })
    public logDatabaseSystem?: boolean;

    // Indicates whether cost.
    @BooleanDataMember({ code: ParameterCode.Cost, isOptional: true })
    public cost?: boolean;

    // Indicates whether monthly cost.
    @BooleanDataMember({ code: ParameterCode.MonthlyCost, isOptional: true })
    public monthlyCost?: boolean;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export interface AnalyticsRequestParams {
    // Indicates whether analytics item.
    analyticsItem: boolean;
    // Indicates whether country.
    country: boolean;
    // Indicates whether request complete.
    requestComplete: boolean;
    // Indicates whether operation system.
    operationSystem: boolean;
    // Indicates whether database system.
    databaseSystem: boolean;
    // Indicates whether log database system.
    logDatabaseSystem: boolean;
    // Indicates whether cost.
    cost: boolean;
    // Indicates whether monthly cost.
    monthlyCost: boolean;
}

export class GetAnalyticsRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetAnalytics;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetAnalyticsOperationRequest;
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

        if (!secretInfo.getPermission().dashboard.getAnalytics.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                timestamp: request.timestamp,
                requestParams: {
                    analyticsItem: request.analyticsItem,
                    country: request.country,
                    operationSystem: request.operationSystem,
                    requestComplete: request.requestComplete,
                    databaseSystem: request.databaseSystem,
                    logDatabaseSystem: request.logDatabaseSystem,
                    cost: request.cost,
                    monthlyCost: request.monthlyCost,
                },
            },
            SecretRole.Client,
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
    private async execute(request: { timestamp: number; requestParams: AnalyticsRequestParams }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetAnalytics", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the analytics service value used in the current execution flow.
        let analyticsService = this.gnServer.getAnalyticsService();
        // Stores the big analytics item value used in the current execution flow.
        let bigAnalyticsItem = await analyticsService.getBigAnalyticsItem(request.timestamp);

        if (bigAnalyticsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
            return operationResponse;
        }

        if (request.requestParams.analyticsItem) {
            // Stores the GearN analytics item value used in the current execution flow.
            let gnAnalyticsItem = new GNHashtable();

            gnAnalyticsItem.add(ParameterCode.CCU, bigAnalyticsItem.CCU);
            gnAnalyticsItem.add(ParameterCode.DAU, bigAnalyticsItem.DAU);
            gnAnalyticsItem.add(ParameterCode.DAUSince0h, bigAnalyticsItem.DAUSince0h);
            gnAnalyticsItem.add(ParameterCode.DNU, bigAnalyticsItem.DNU);
            gnAnalyticsItem.add(ParameterCode.DNUSince0h, bigAnalyticsItem.DNUSince0h);
            gnAnalyticsItem.add(ParameterCode.DRT, bigAnalyticsItem.DRT);
            gnAnalyticsItem.add(ParameterCode.DRTSince0h, bigAnalyticsItem.DRTSince0h);
            gnAnalyticsItem.add(ParameterCode.MAU, bigAnalyticsItem.MAU);
            gnAnalyticsItem.add(ParameterCode.MAUSince0h1, bigAnalyticsItem.MAUSince0h1);
            gnAnalyticsItem.add(ParameterCode.MNU, bigAnalyticsItem.MNU);
            gnAnalyticsItem.add(ParameterCode.MNUSince0h1, bigAnalyticsItem.MNUSince0h1);
            gnAnalyticsItem.add(ParameterCode.MRT, bigAnalyticsItem.MRT);
            gnAnalyticsItem.add(ParameterCode.MRTSince0h1, bigAnalyticsItem.MRTSince0h1);
            gnAnalyticsItem.add(ParameterCode.AnalyticsPrice, bigAnalyticsItem.analyticsPrice);

            operationResponse.setParameter(ParameterCode.AnalyticsItem, gnAnalyticsItem);
        }

        if (request.requestParams.country) {
            // Stores the GearN countrys value used in the current execution flow.
            let gnCountrys = new GNArray();

            if (bigAnalyticsItem.country) {
                for (let i = 0; i < bigAnalyticsItem.country.length; i++) {
                    // Stores the country value used in the current execution flow.
                    let country = bigAnalyticsItem.country[i];

                    // Stores the GearN country value used in the current execution flow.
                    let gnCountry = new GNHashtable();

                    gnCountry.add(ParameterCode.CountryCode, country.countryCode);

                    // Stores the GearN regions value used in the current execution flow.
                    let gnRegions = new GNArray();

                    for (let j = 0; j < country.regions.length; j++) {
                        // Stores the region value used in the current execution flow.
                        let region = country.regions[j];

                        // Stores the GearN region value used in the current execution flow.
                        let gnRegion = new GNHashtable();

                        if (!region) continue;
                        gnRegion.add(ParameterCode.RegionCode, region.regionCode);
                        gnRegion.add(ParameterCode.RegionName, region.regionName);
                        gnRegion.add(ParameterCode.CCU, region.ccu);
                        gnRegion.add(ParameterCode.Latitude, region.latidute);
                        gnRegion.add(ParameterCode.Longitude, region.longitude);

                        gnRegions.add(gnRegion);
                    }

                    gnCountry.add(ParameterCode.Regions, gnRegions);

                    gnCountrys.add(gnCountry);
                }
            }

            operationResponse.setParameter(ParameterCode.Country, gnCountrys);
        }

        if (request.requestParams.operationSystem) {
            // Stores the GearN operation system value used in the current execution flow.
            let gnOperationSystem = new GNHashtable();

            if (bigAnalyticsItem.operationSystem) {
                gnOperationSystem.add(ParameterCode.CpuUsage, bigAnalyticsItem.operationSystem.cpuUsage);

                // Stores the GearN memory usage value used in the current execution flow.
                let gnMemoryUsage = new GNHashtable();
                if (bigAnalyticsItem.operationSystem.memoryUsage) {
                    gnMemoryUsage.add(ParameterCode.FreeMemoryInBytes, bigAnalyticsItem.operationSystem.memoryUsage.freeMemoryInBytes);
                    gnMemoryUsage.add(ParameterCode.TotalMemoryInBytes, bigAnalyticsItem.operationSystem.memoryUsage.totalMemoryInBytes);
                }
                gnOperationSystem.add(ParameterCode.MemoryUsage, gnMemoryUsage);

                // Stores the GearN storage usages value used in the current execution flow.
                let gnStorageUsages = new GNArray();
                if (bigAnalyticsItem.operationSystem.storageUsage) {
                    for (let i = 0; i < bigAnalyticsItem.operationSystem.storageUsage.length; i++) {
                        // Stores the storage usage value used in the current execution flow.
                        let storageUsage = bigAnalyticsItem.operationSystem.storageUsage[i];

                        // Stores the GearN storage usage value used in the current execution flow.
                        let gnStorageUsage = new GNHashtable();

                        gnStorageUsage.add(ParameterCode.Name, storageUsage.name);
                        gnStorageUsage.add(ParameterCode.FsTotalSizeInBytes, storageUsage.fsTotalSizeInBytes);
                        gnStorageUsage.add(ParameterCode.FsUsedSizeInBytes, storageUsage.fsUsedSizeInBytes);

                        gnStorageUsages.add(gnStorageUsage);
                    }
                }
                gnOperationSystem.add(ParameterCode.StorageUsage, gnStorageUsages);
            }

            operationResponse.setParameter(ParameterCode.OperationSystem, gnOperationSystem);
        }

        if (request.requestParams.databaseSystem) {
            // Stores the GearN database system value used in the current execution flow.
            let gnDatabaseSystem = new GNHashtable();

            if (bigAnalyticsItem.databaseSystem) {
                gnDatabaseSystem.add(ParameterCode.FsTotalSizeInBytes, bigAnalyticsItem.databaseSystem.fsTotalSizeInBytes);
                gnDatabaseSystem.add(ParameterCode.FsUsedSizeInBytes, bigAnalyticsItem.databaseSystem.fsUsedSizeInBytes);
                gnDatabaseSystem.add(ParameterCode.TotalSizeInBytes, bigAnalyticsItem.databaseSystem.totalSizeInBytes);
                gnDatabaseSystem.add(ParameterCode.Collections, bigAnalyticsItem.databaseSystem.collections);
                gnDatabaseSystem.add(ParameterCode.Objects, bigAnalyticsItem.databaseSystem.objects);
                gnDatabaseSystem.add(ParameterCode.Indexes, bigAnalyticsItem.databaseSystem.indexes);
            }

            operationResponse.setParameter(ParameterCode.DatabaseSystem, gnDatabaseSystem);
        }

        if (request.requestParams.logDatabaseSystem) {
            // Stores the GearN database system value used in the current execution flow.
            let gnDatabaseSystem = new GNHashtable();

            if (bigAnalyticsItem.logDatabaseSystem) {
                gnDatabaseSystem.add(ParameterCode.FsTotalSizeInBytes, bigAnalyticsItem.logDatabaseSystem.fsTotalSizeInBytes);
                gnDatabaseSystem.add(ParameterCode.FsUsedSizeInBytes, bigAnalyticsItem.logDatabaseSystem.fsUsedSizeInBytes);
                gnDatabaseSystem.add(ParameterCode.TotalSizeInBytes, bigAnalyticsItem.logDatabaseSystem.totalSizeInBytes);
                gnDatabaseSystem.add(ParameterCode.Collections, bigAnalyticsItem.logDatabaseSystem.collections);
                gnDatabaseSystem.add(ParameterCode.Objects, bigAnalyticsItem.logDatabaseSystem.objects);
                gnDatabaseSystem.add(ParameterCode.Indexes, bigAnalyticsItem.logDatabaseSystem.indexes);
            }

            operationResponse.setParameter(ParameterCode.LogDatabaseSystem, gnDatabaseSystem);
        }

        if (request.requestParams.requestComplete) {
            // Stores the GearN request complete value used in the current execution flow.
            let gnRequestComplete = new GNArray();

            if (bigAnalyticsItem.requestComplete) {
                for (let i = 0; i < bigAnalyticsItem.requestComplete.length; i++) {
                    // Stores the request complete value used in the current execution flow.
                    let requestComplete = bigAnalyticsItem.requestComplete[i];

                    // Stores the this GearN request complete value used in the current execution flow.
                    let thisGnRequestComplete = new GNHashtable();

                    thisGnRequestComplete.add(ParameterCode.EventName, requestComplete.eventName);

                    // Stores the GearN results value used in the current execution flow.
                    let gnResults = new GNArray();

                    for (let j = 0; j < requestComplete.results.length; j++) {
                        // Stores the result value used in the current execution flow.
                        let result = requestComplete.results[j];

                        // Stores the GearN result value used in the current execution flow.
                        let gnResult = new GNHashtable();

                        gnResult.add(ParameterCode.ErrorCode, result.errorCode);
                        gnResult.add(ParameterCode.Count, result.count);

                        gnResults.add(gnResult);
                    }

                    thisGnRequestComplete.add(ParameterCode.Results, gnResults);

                    gnRequestComplete.add(thisGnRequestComplete);
                }
            }

            operationResponse.setParameter(ParameterCode.RequestComplete, gnRequestComplete);
        }

        if (request.requestParams.cost) {
            // Stores the GearN cost value used in the current execution flow.
            let gnCost = new GNHashtable();

            if (bigAnalyticsItem.cost) {
                gnCost.add(ParameterCode.RequestCount, bigAnalyticsItem.cost.requestCount);
                gnCost.add(ParameterCode.MatchmakingRequestCount, bigAnalyticsItem.cost.matchmakingRequestCount);
                gnCost.add(ParameterCode.CloudScriptGBs, bigAnalyticsItem.cost.cloudScriptGBs);
                gnCost.add(ParameterCode.StorageSizeInBytes, bigAnalyticsItem.cost.storageSizeInBytes);
                gnCost.add(ParameterCode.DataTransferSizeInBytes, bigAnalyticsItem.cost.dataTransferSizeInBytes);
            }

            operationResponse.setParameter(ParameterCode.Cost, gnCost);
        }

        if (request.requestParams.monthlyCost) {
            // Stores the GearN cost value used in the current execution flow.
            let gnCost = new GNHashtable();

            if (bigAnalyticsItem.monthlyCost) {
                gnCost.add(ParameterCode.RequestCount, bigAnalyticsItem.monthlyCost.requestCount);
                gnCost.add(ParameterCode.MatchmakingRequestCount, bigAnalyticsItem.monthlyCost.matchmakingRequestCount);
                gnCost.add(ParameterCode.CloudScriptGBs, bigAnalyticsItem.monthlyCost.cloudScriptGBs);
                gnCost.add(ParameterCode.StorageSizeInBytes, bigAnalyticsItem.monthlyCost.storageSizeInBytes);
                gnCost.add(ParameterCode.DataTransferSizeInBytes, bigAnalyticsItem.monthlyCost.dataTransferSizeInBytes);
            }

            operationResponse.setParameter(ParameterCode.MonthlyCost, gnCost);
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetAnalytics", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
