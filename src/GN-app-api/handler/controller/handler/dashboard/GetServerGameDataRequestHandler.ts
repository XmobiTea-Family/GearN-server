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

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNServer } from "../../../../../GNServer";

class GetServerGameDataOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
    gameId: string;

    @BooleanDataMember({ code: GNParameterCode.MasterPlayerCount, isOptional: true })
    masterPlayerCount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.GamePlayerCount, isOptional: true })
    gamePlayerCount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.CharacterPlayerCount, isOptional: true })
    characterPlayerCount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.InventoryCount, isOptional: true })
    inventoryCount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.StoreInventoryCount, isOptional: true })
    storeInventoryCount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.GroupCount, isOptional: true })
    groupCount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Country, isOptional: true })
    country?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Version, isOptional: true })
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

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let requestParams = request.requestParams;
        if (requestParams.masterPlayerCount) {
            let masterPlayerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");
            operationResponse.setParameter(GNParameterCode.MasterPlayerCount, await masterPlayerCollection.countDocuments());
        }

        let gameId = request.gameId;

        if (requestParams.gamePlayerCount) {
            let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId);
            operationResponse.setParameter(GNParameterCode.GamePlayerCount, await gamePlayerCollection.countDocuments());
        }

        if (requestParams.characterPlayerCount) {
            let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId);
            operationResponse.setParameter(GNParameterCode.CharacterPlayerCount, await characterPlayerCollection.countDocuments());
        }

        if (requestParams.inventoryCount) {
            let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", gameId);
            operationResponse.setParameter(GNParameterCode.InventoryCount, await inventoryCollection.countDocuments());
        }

        if (requestParams.storeInventoryCount) {
            let storeInventoryCollection = this.gnServer.getDatabase().systemGameCollection("StoreInventory", gameId);
            operationResponse.setParameter(GNParameterCode.StoreInventoryCount, await storeInventoryCollection.countDocuments());
        }

        if (requestParams.groupCount) {
            let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", gameId);
            operationResponse.setParameter(GNParameterCode.GroupCount, await groupCollection.countDocuments());
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

                gnCountry.add(GNParameterCode.CountryCode, result["countryCode"]);

                let gnRegions = new GNArray();

                let regionKeys = Object.keys(regions);

                for (let i = 0; i < regionKeys.length; i++) {
                    let key = regionKeys[i];
                    let ipAddressRegion = ipAddressRegions[key];
                    if (!ipAddressRegion) continue;

                    let gnRegion = new GNHashtable();

                    let region = regions[key];

                    if (!region) continue;
                    gnRegion.add(GNParameterCode.RegionCode, key);
                    gnRegion.add(GNParameterCode.RegionName, nameRegions[key]);
                    gnRegion.add(GNParameterCode.CCU, Object.keys(region).length);

                    let ipAddressRegionIPKeys = Object.keys(ipAddressRegion);
                    let ipAddressRegionIPKey = ipAddressRegionIPKeys[0];
                    if (ipAddressRegionIPKey) {
                        let ipAddressRegionIP = ipAddressRegion[ipAddressRegionIPKey];

                        gnRegion.add(GNParameterCode.Latitude, ipAddressRegionIP["latitude"]);
                        gnRegion.add(GNParameterCode.Longitude, ipAddressRegionIP["longitude"]);
                    }

                    gnRegions.add(gnRegion);
                }

                gnCountry.add(GNParameterCode.Regions, gnRegions);

                gnCountrys.add(gnCountry);
            }

            operationResponse.setParameter(GNParameterCode.Country, gnCountrys);
        }

        if (requestParams.version) {
            operationResponse.setParameter(GNParameterCode.Version, GNServer.getServerVersion());
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetServerGameData", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
