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

	@NumberDataMember({ code: ParameterCode.Timestamp, minValue: 0, isOptional: true })
	public timestamp?: number;

	@BooleanDataMember({ code: ParameterCode.AnalyticsItem, isOptional: true })
	public analyticsItem?: boolean;

	@BooleanDataMember({ code: ParameterCode.Country, isOptional: true })
	public country?: boolean;

	@BooleanDataMember({ code: ParameterCode.RequestComplete, isOptional: true })
	public requestComplete?: boolean;

	@BooleanDataMember({ code: ParameterCode.OperationSystem, isOptional: true })
	public operationSystem?: boolean;

	@BooleanDataMember({ code: ParameterCode.DatabaseSystem, isOptional: true })
	public databaseSystem?: boolean;

	@BooleanDataMember({ code: ParameterCode.LogDatabaseSystem, isOptional: true })
	public logDatabaseSystem?: boolean;

	@BooleanDataMember({ code: ParameterCode.Cost, isOptional: true })
	public cost?: boolean;

	@BooleanDataMember({ code: ParameterCode.MonthlyCost, isOptional: true })
	public monthlyCost?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export interface AnalyticsRequestParams {
	analyticsItem: boolean;
	country: boolean;
	requestComplete: boolean;
	operationSystem: boolean;
	databaseSystem: boolean;
	logDatabaseSystem: boolean;
	cost: boolean;
	monthlyCost: boolean;
}

export class GetAnalyticsRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetAnalytics;
	}

	public override getCommonOperationRequest() {
		return GetAnalyticsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterAdmin.getAnalytics.selfEnable) {
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
				}
			},
			secretInfo,
			operationRequest
		);
	}

	private async execute(request: { timestamp: number, requestParams: AnalyticsRequestParams }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetAnalytics", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let analyticsService = this.gnServer.getAnalyticsService();
		let bigAnalyticsItem = await analyticsService.getBigAnalyticsItem(request.timestamp);

		if (bigAnalyticsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		if (request.requestParams.analyticsItem) {
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
			let gnCountrys = new GNArray();

			if (bigAnalyticsItem.country) {
				for (let i = 0; i < bigAnalyticsItem.country.length; i++) {
					let country = bigAnalyticsItem.country[i];

					let gnCountry = new GNHashtable();

					gnCountry.add(ParameterCode.CountryCode, country.countryCode);

					let gnRegions = new GNArray();

					for (let j = 0; j < country.regions.length; j++) {
						let region = country.regions[j];

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
			let gnOperationSystem = new GNHashtable();

			if (bigAnalyticsItem.operationSystem) {
				gnOperationSystem.add(ParameterCode.CpuUsage, bigAnalyticsItem.operationSystem.cpuUsage);

				let gnMemoryUsage = new GNHashtable();
				if (bigAnalyticsItem.operationSystem.memoryUsage) {
					gnMemoryUsage.add(ParameterCode.FreeMemoryInBytes, bigAnalyticsItem.operationSystem.memoryUsage.freeMemoryInBytes);
					gnMemoryUsage.add(ParameterCode.TotalMemoryInBytes, bigAnalyticsItem.operationSystem.memoryUsage.totalMemoryInBytes);
				}
				gnOperationSystem.add(ParameterCode.MemoryUsage, gnMemoryUsage);

				let gnStorageUsages = new GNArray();
				if (bigAnalyticsItem.operationSystem.storageUsage) {
					for (let i = 0; i < bigAnalyticsItem.operationSystem.storageUsage.length; i++) {
						let storageUsage = bigAnalyticsItem.operationSystem.storageUsage[i];

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
			let gnDatabaseSystem = new GNHashtable();

			if (bigAnalyticsItem.operationSystem) {
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
			let gnDatabaseSystem = new GNHashtable();

			if (bigAnalyticsItem.operationSystem) {
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
			let gnRequestComplete = new GNArray();

			if (bigAnalyticsItem.requestComplete) {
				for (let i = 0; i < bigAnalyticsItem.requestComplete.length; i++) {
					let requestComplete = bigAnalyticsItem.requestComplete[i];

					let thisGnRequestComplete = new GNHashtable();

					thisGnRequestComplete.add(ParameterCode.EventName, requestComplete.eventName);

					let gnResults = new GNArray();

					for (let j = 0; j < requestComplete.results.length; j++) {
						let result = requestComplete.results[j];

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

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetAnalytics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
