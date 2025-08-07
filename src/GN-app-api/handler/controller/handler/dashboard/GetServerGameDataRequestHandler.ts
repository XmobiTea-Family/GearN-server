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
import { RequestHandler } from "./../base/RequestHandler";
import { GNServer } from "./../../../../../GNServer";

class GetServerGameDataOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	gameId: string;

	@BooleanDataMember({ code: ParameterCode.MasterPlayerCount, isOptional: true })
	masterPlayerCount?: boolean;

	@BooleanDataMember({ code: ParameterCode.GamePlayerCount, isOptional: true })
	gamePlayerCount?: boolean;

	@BooleanDataMember({ code: ParameterCode.CharacterPlayerCount, isOptional: true })
	characterPlayerCount?: boolean;

	@BooleanDataMember({ code: ParameterCode.InventoryCount, isOptional: true })
	inventoryCount?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreInventoryCount, isOptional: true })
	storeInventoryCount?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupCount, isOptional: true })
	groupCount?: boolean;

	@BooleanDataMember({ code: ParameterCode.Country, isOptional: true })
	country?: boolean;

	@BooleanDataMember({ code: ParameterCode.Version, isOptional: true })
	version?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export interface ServerGameDataRequestParams {
	masterPlayerCount: boolean;
	gamePlayerCount: boolean;
	characterPlayerCount: boolean;
	inventoryCount: boolean;
	storeInventoryCount: boolean;
	groupCount: boolean;
	country: boolean;
	version: boolean;

}

export class GetServerGameDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetServerGameData;
	}

	public override getCommonOperationRequest() {
		return GetServerGameDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getServerGameData.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			gameId: request.gameId,
			requestParams: {
				masterPlayerCount: request.masterPlayerCount,
				gamePlayerCount: request.gamePlayerCount,
				characterPlayerCount: request.characterPlayerCount,
				inventoryCount: request.inventoryCount,
				groupCount: request.groupCount,
				storeInventoryCount: request.storeInventoryCount,
				country: request.country,
				version: request.version,
			}
		}, secretInfo, operationRequest);
	}

	private async execute(request: { gameId: string, requestParams: ServerGameDataRequestParams }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetServerGameData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let requestParams = request.requestParams;
		if (requestParams.masterPlayerCount) {
			let masterPlayerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");
			operationResponse.setParameter(ParameterCode.MasterPlayerCount, await masterPlayerCollection.countDocuments());
		}

		let gameId = request.gameId;

		if (requestParams.gamePlayerCount) {
			let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
			operationResponse.setParameter(ParameterCode.GamePlayerCount, await gamePlayerCollection.countDocuments());
		}

		if (requestParams.characterPlayerCount) {
			let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
			operationResponse.setParameter(ParameterCode.CharacterPlayerCount, await characterPlayerCollection.countDocuments());
		}

		if (requestParams.inventoryCount) {
			let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
			operationResponse.setParameter(ParameterCode.InventoryCount, await inventoryCollection.countDocuments());
		}

		if (requestParams.storeInventoryCount) {
			let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);
			operationResponse.setParameter(ParameterCode.StoreInventoryCount, await storeInventoryCollection.countDocuments());
		}

		if (requestParams.groupCount) {
			let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);
			operationResponse.setParameter(ParameterCode.GroupCount, await groupCollection.countDocuments());
		}

		if (requestParams.country) {
			// [ { countryCode: "", regions: [{regionCode: "", "lat": 0, "lon": 0, ccu: 0}]} ]

			let gnCountrys = new GNArray();

			let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");

			let results = await countryRegionCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let regions = result["regions"];
				let nameRegions = result["nameRegions"];
				let ipAddressRegions = result["ipAddressRegions"];

				if (!regions || !nameRegions || !ipAddressRegions) continue;

				let gnCountry = new GNHashtable();

				gnCountry.add(ParameterCode.CountryCode, result["countryCode"]);

				let gnRegions = new GNArray();

				let regionKeys = Object.keys(regions);

				for (let i = 0; i < regionKeys.length; i++) {
					let key = regionKeys[i];
					let ipAddressRegion = ipAddressRegions[key];
					if (!ipAddressRegion) continue;

					let gnRegion = new GNHashtable();

					let region = regions[key];

					if (!region) continue;
					gnRegion.add(ParameterCode.RegionCode, key);
					gnRegion.add(ParameterCode.RegionName, nameRegions[key]);
					gnRegion.add(ParameterCode.CCU, Object.keys(region).length);

					let ipAddressRegionIPKeys = Object.keys(ipAddressRegion);
					let ipAddressRegionIPKey = ipAddressRegionIPKeys[0];
					if (ipAddressRegionIPKey) {
						let ipAddressRegionIP = ipAddressRegion[ipAddressRegionIPKey];

						gnRegion.add(ParameterCode.Latitude, ipAddressRegionIP["latitude"]);
						gnRegion.add(ParameterCode.Longitude, ipAddressRegionIP["longitude"]);
					}

					gnRegions.add(gnRegion);
				}

				gnCountry.add(ParameterCode.Regions, gnRegions);

				gnCountrys.add(gnCountry);
			}

			operationResponse.setParameter(ParameterCode.Country, gnCountrys);
		}

		if (requestParams.version) {
			operationResponse.setParameter(ParameterCode.Version, GNServer.getServerVersion());
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetServerGameData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
