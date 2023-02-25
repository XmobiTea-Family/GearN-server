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
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";

class GrantStoreItemOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true, isOptional: true })
    storeId?: string;

    @StringDataMember({ code: GNParameterCode.DisplayName, defaultValue: "", isOptional: true })
    displayName?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGrantStoreItemOperationRequest extends GrantStoreItemOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGrantStoreItemOperationRequest extends ServerGrantStoreItemOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GrantStoreItemRequestHandler extends StoreItemBaseRequestHandler {
    public override getCode() {
        return OperationCode.GrantStoreItem;
    }

    public override getCommonOperationRequest() {
        return GrantStoreItemOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.grantStoreItem.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            storeId: request.storeId,
            displayName: request.displayName,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGrantStoreItemOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.grantStoreItem.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            storeId: request.storeId,
            displayName: request.displayName,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGrantStoreItemOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.grantStoreItem.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            storeId: request.storeId,
            displayName: request.displayName,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { storeId: string, displayName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GrantStoreItem", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let storeId = request.storeId ?? StringUtility.generateRandomString(10, this.gnServer.getIdTypeCase());

        let oldStoreInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(storeId, secretInfo.getGameId(), {
            storeId: true,
        });

        if (oldStoreInventory != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.StoreItemHadExists);
        }

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        let result = {} as any;
        result["storeId"] = storeId;
        result["storeItems"] = [];
        result["storeCurrencies"] = [];
        result["priceCurrencies"] = [];
        result["packageId"] = null;
        result["storeDatas"] = [];
        result["removeStatus"] = { "tsRemove": 0, "reason": "" };
        result["segments"] = [];
        result["customDatas"] = {};
        result["inAppPurchase"] = {};
        result["tsCreate"] = currentMilliseconds;
        result["displayName"] = request.displayName;
        result["displayNameNormalize"] = DisplayNameUtility.normalizeString(request.displayName);
        result["avatar"] = { "type": 0, "value": "0" };
        result["tags"] = {};

        this.gnServer.getDatabase().createStoreInventoryAsync(result, secretInfo.getGameId());

        operationResponse.setParameter(GNParameterCode.StoreId, storeId);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GrantStoreItem", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
