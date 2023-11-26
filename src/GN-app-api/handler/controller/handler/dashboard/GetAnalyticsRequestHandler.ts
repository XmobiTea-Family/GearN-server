import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable, GNHashtableBuilder } from "./../../../../../GN-common/common/GNData";
import { BooleanDataMember, NumberDataMember } from "../../../../../GN-common/entity/DataMember";

class GetAnalyticsOperationRequest extends OperationRequest {
	@NumberDataMember({ code: GNParameterCode.Timestamp, minValue: 0, isOptional: true })
	timestamp?: number;

	@BooleanDataMember({ code: GNParameterCode.AnalyticsItem, isOptional: true })
	analyticsItem?: boolean;

	@BooleanDataMember({ code: GNParameterCode.Country, isOptional: true })
	country?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export interface AnalyticsRequestParams {
    analyticsItem: boolean;
    country: boolean;
    
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
			return this.newInvalidRequestParameters(operationRequest);
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

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let analyticsService = this.gnServer.getAnalyticsService();
		let bigAnalyticsItem = await analyticsService.getBigAnalyticsItem(request.timestamp);

		if (bigAnalyticsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ItemNotFound);
			return operationResponse;
		}

        if (request.requestParams.analyticsItem) {
            let gnAnalyticsItem = new GNHashtable();

            gnAnalyticsItem.add(GNParameterCode.CCU, bigAnalyticsItem.CCU);
            gnAnalyticsItem.add(GNParameterCode.DAU, bigAnalyticsItem.DAU);
            gnAnalyticsItem.add(GNParameterCode.DAUSince0h, bigAnalyticsItem.DAUSince0h);
            gnAnalyticsItem.add(GNParameterCode.DNU, bigAnalyticsItem.DNU);
            gnAnalyticsItem.add(GNParameterCode.DNUSince0h, bigAnalyticsItem.DNUSince0h);
            gnAnalyticsItem.add(GNParameterCode.DRT, bigAnalyticsItem.DRT);
            gnAnalyticsItem.add(GNParameterCode.DRTSince0h, bigAnalyticsItem.DRTSince0h);
            gnAnalyticsItem.add(GNParameterCode.MAU, bigAnalyticsItem.MAU);
            gnAnalyticsItem.add(GNParameterCode.MAUSince0h1, bigAnalyticsItem.MAUSince0h1);
            gnAnalyticsItem.add(GNParameterCode.MNU, bigAnalyticsItem.MNU);
            gnAnalyticsItem.add(GNParameterCode.MNUSince0h1, bigAnalyticsItem.MNUSince0h1);
            gnAnalyticsItem.add(GNParameterCode.MRT, bigAnalyticsItem.MRT);
            gnAnalyticsItem.add(GNParameterCode.MRTSince0h1, bigAnalyticsItem.MRTSince0h1);
            gnAnalyticsItem.add(GNParameterCode.AnalyticsPrice, bigAnalyticsItem.analyticsPrice);

            operationResponse.setParameter(GNParameterCode.AnalyticsItem, gnAnalyticsItem);
        }

        if (request.requestParams.country) {
            let gnCountrys = new GNArray();

            if (bigAnalyticsItem.country) {
                for (let i = 0; i < bigAnalyticsItem.country.length; i++) {
                    let country = bigAnalyticsItem.country[i];
    
                    let gnCountry = new GNHashtable();
    
                    gnCountry.add(GNParameterCode.CountryCode, country.countryCode);
    
                    let gnRegions = new GNArray();
    
                    for (let j = 0; j < country.regions.length; j++) {
                        let region = country.regions[j];
    
                        let gnRegion = new GNHashtable();
    
                        if (!region) continue;
                        gnRegion.add(GNParameterCode.RegionCode, region.regionCode);
                        gnRegion.add(GNParameterCode.RegionName, region.regionName);
                        gnRegion.add(GNParameterCode.CCU, region.ccu);
                        gnRegion.add(GNParameterCode.Latitude, region.latidute);
                        gnRegion.add(GNParameterCode.Longitude, region.longitude);
    
                        gnRegions.add(gnRegion);
                    }
    
                    gnCountry.add(GNParameterCode.Regions, gnRegions);
    
                    gnCountrys.add(gnCountry);
                }
            }
    
            operationResponse.setParameter(GNParameterCode.Country, gnCountrys);
        }

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetAnalytics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
