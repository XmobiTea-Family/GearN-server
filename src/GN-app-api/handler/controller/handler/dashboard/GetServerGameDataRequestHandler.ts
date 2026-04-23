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

	// Stores the game ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

	// Indicates whether master player count.
	@BooleanDataMember({ code: ParameterCode.MasterPlayerCount, isOptional: true })
	public masterPlayerCount?: boolean;

	// Indicates whether game player count.
	@BooleanDataMember({ code: ParameterCode.GamePlayerCount, isOptional: true })
	public gamePlayerCount?: boolean;

	// Indicates whether character player count.
	@BooleanDataMember({ code: ParameterCode.CharacterPlayerCount, isOptional: true })
	public characterPlayerCount?: boolean;

	// Indicates whether inventory count.
	@BooleanDataMember({ code: ParameterCode.InventoryCount, isOptional: true })
	public inventoryCount?: boolean;

	// Indicates whether store inventory count.
	@BooleanDataMember({ code: ParameterCode.StoreInventoryCount, isOptional: true })
	public storeInventoryCount?: boolean;

	// Indicates whether group count.
	@BooleanDataMember({ code: ParameterCode.GroupCount, isOptional: true })
	public groupCount?: boolean;

	// Indicates whether country.
	@BooleanDataMember({ code: ParameterCode.Country, isOptional: true })
	public country?: boolean;

	// Indicates whether version.
	@BooleanDataMember({ code: ParameterCode.Version, isOptional: true })
	public version?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export interface ServerGameDataRequestParams {
	// Indicates whether master player count.
	masterPlayerCount: boolean;
	// Indicates whether game player count.
	gamePlayerCount: boolean;
	// Indicates whether character player count.
	characterPlayerCount: boolean;
	// Indicates whether inventory count.
	inventoryCount: boolean;
	// Indicates whether store inventory count.
	storeInventoryCount: boolean;
	// Indicates whether group count.
	groupCount: boolean;
	// Indicates whether country.
	country: boolean;
	// Indicates whether version.
	version: boolean;

}

export class GetServerGameDataRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetServerGameData;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetServerGameDataOperationRequest;
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
		}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { gameId: string, requestParams: ServerGameDataRequestParams }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetServerGameData", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the request parameters value used in the current execution flow.
		let requestParams = request.requestParams;
		if (requestParams.masterPlayerCount) {
			// Stores the master player collection value used in the current execution flow.
			let masterPlayerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");
			operationResponse.setParameter(ParameterCode.MasterPlayerCount, await masterPlayerCollection.countDocuments());
		}

		// Stores the game ID value used in the current execution flow.
		let gameId = request.gameId;

		if (requestParams.gamePlayerCount) {
			// Stores the game player collection value used in the current execution flow.
			let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
			operationResponse.setParameter(ParameterCode.GamePlayerCount, await gamePlayerCollection.countDocuments());
		}

		if (requestParams.characterPlayerCount) {
			// Stores the character player collection value used in the current execution flow.
			let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
			operationResponse.setParameter(ParameterCode.CharacterPlayerCount, await characterPlayerCollection.countDocuments());
		}

		if (requestParams.inventoryCount) {
			// Stores the inventory collection value used in the current execution flow.
			let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
			operationResponse.setParameter(ParameterCode.InventoryCount, await inventoryCollection.countDocuments());
		}

		if (requestParams.storeInventoryCount) {
			// Stores the store inventory collection value used in the current execution flow.
			let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);
			operationResponse.setParameter(ParameterCode.StoreInventoryCount, await storeInventoryCollection.countDocuments());
		}

		if (requestParams.groupCount) {
			// Stores the group collection value used in the current execution flow.
			let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);
			operationResponse.setParameter(ParameterCode.GroupCount, await groupCollection.countDocuments());
		}

		if (requestParams.country) {
			// [ { countryCode: "", regions: [{regionCode: "", "lat": 0, "lon": 0, ccu: 0}]} ]

			let gnCountrys = new GNArray();

			// Stores the country region collection value used in the current execution flow.
			let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");

			// Stores the results value used in the current execution flow.
			let results = await countryRegionCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the regions value used in the current execution flow.
				let regions = result["regions"];
				// Stores the name regions value used in the current execution flow.
				let nameRegions = result["nameRegions"];
				// Stores the IP address regions value used in the current execution flow.
				let ipAddressRegions = result["ipAddressRegions"];

				if (!regions || !nameRegions || !ipAddressRegions) continue;

				// Stores the GearN country value used in the current execution flow.
				let gnCountry = new GNHashtable();

				gnCountry.add(ParameterCode.CountryCode, result["countryCode"]);

				// Stores the GearN regions value used in the current execution flow.
				let gnRegions = new GNArray();

				// Stores the region keys value used in the current execution flow.
				let regionKeys = Object.keys(regions);

				for (let i = 0; i < regionKeys.length; i++) {
					// Stores the key value used in the current execution flow.
					let key = regionKeys[i];
					// Stores the IP address region value used in the current execution flow.
					let ipAddressRegion = ipAddressRegions[key];
					if (!ipAddressRegion) continue;

					// Stores the GearN region value used in the current execution flow.
					let gnRegion = new GNHashtable();

					// Stores the region value used in the current execution flow.
					let region = regions[key];

					if (!region) continue;
					gnRegion.add(ParameterCode.RegionCode, key);
					gnRegion.add(ParameterCode.RegionName, nameRegions[key]);
					gnRegion.add(ParameterCode.CCU, Object.keys(region).length);

					// Stores the IP address region IP keys value used in the current execution flow.
					let ipAddressRegionIPKeys = Object.keys(ipAddressRegion);
					// Stores the IP address region IP key value used in the current execution flow.
					let ipAddressRegionIPKey = ipAddressRegionIPKeys[0];
					if (ipAddressRegionIPKey) {
						// Stores the IP address region IP value used in the current execution flow.
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

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetServerGameData", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
