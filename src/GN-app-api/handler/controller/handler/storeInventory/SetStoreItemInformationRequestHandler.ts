import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { StoreDataParam } from "./model/StoreDataParam";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { StoreItemParam } from "./model/StoreItemParam";
import { CurrencyParam } from "./model/CurrencyParam";
import { AvatarParam } from "./model/AvatarParam";
import { TagParam } from "./model/TagParam";
import { InAppPurchaseParam } from "./model/InAppPurchaseParam";

class SetStoreItemInformationOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.StoreId, minLength: 10, maxLength: 10, mustNonNull: true })
    storeId: string;

    @GNArrayDataMember({ code: GNParameterCode.StoreDatas, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: StoreDataParam })
    storeDataParams?: Array<StoreDataParam>;

    @GNArrayDataMember({ code: GNParameterCode.StoreItems, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: StoreItemParam })
    storeItemParams?: Array<StoreItemParam>;

    @GNArrayDataMember({ code: GNParameterCode.StoreCurrencies, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: CurrencyParam })
    storeCurrencyParams?: Array<CurrencyParam>;

    @GNArrayDataMember({ code: GNParameterCode.PriceCurrencies, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: CurrencyParam })
    priceCurrencyParams?: Array<CurrencyParam>;

    @GNHashtableDataMember({ code: GNParameterCode.InAppPurchase, mustNonNull: true, isOptional: true, })
    inAppPurchaseParam?: InAppPurchaseParam;

    @StringDataMember({ code: GNParameterCode.DisplayName, mustNonNull: true, isOptional: true, })
    displayName?: string;

    @GNHashtableDataMember({ code: GNParameterCode.Avatar, mustNonNull: true, isOptional: true, })
    avatarParam?: AvatarParam;

    @GNArrayDataMember({ code: GNParameterCode.Tags, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: TagParam })
    tagParams?: Array<TagParam>;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetStoreItemInformationOperationRequest extends SetStoreItemInformationOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetStoreItemInformationOperationRequest extends ServerSetStoreItemInformationOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetStoreItemInformationRequestHandler extends StoreItemBaseRequestHandler {
    public override getCode() {
        return OperationCode.SetStoreItemInformation;
    }

    public override getCommonOperationRequest() {
        return SetStoreItemInformationOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.setStoreItemInformation.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            storeId: request.storeId,
            storeDataParams: request.storeDataParams,
            storeItemParams: request.storeItemParams,
            storeCurrencyParams: request.storeCurrencyParams,
            priceCurrencyParams: request.priceCurrencyParams,
            inAppPurchaseParam: request.inAppPurchaseParam,
            displayName: request.displayName,
            avatarParam: request.avatarParam,
            tagParams: request.tagParams,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetStoreItemInformationOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.setStoreItemInformation.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            storeId: request.storeId,
            storeDataParams: request.storeDataParams,
            storeItemParams: request.storeItemParams,
            storeCurrencyParams: request.storeCurrencyParams,
            priceCurrencyParams: request.priceCurrencyParams,
            inAppPurchaseParam: request.inAppPurchaseParam,
            displayName: request.displayName,
            avatarParam: request.avatarParam,
            tagParams: request.tagParams,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetStoreItemInformationOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.setStoreItemInformation.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            storeId: request.storeId,
            storeDataParams: request.storeDataParams,
            storeItemParams: request.storeItemParams,
            storeCurrencyParams: request.storeCurrencyParams,
            priceCurrencyParams: request.priceCurrencyParams,
            inAppPurchaseParam: request.inAppPurchaseParam,
            displayName: request.displayName,
            avatarParam: request.avatarParam,
            tagParams: request.tagParams,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { storeId: string, storeDataParams: Array<StoreDataParam>, storeItemParams: Array<StoreItemParam>, storeCurrencyParams: Array<CurrencyParam>, priceCurrencyParams: Array<CurrencyParam>, inAppPurchaseParam: InAppPurchaseParam, displayName: string, avatarParam: AvatarParam, tagParams: Array<TagParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_SetStoreItemInformation", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(request.storeId, secretInfo.getGameId(), null);

        if (storeInventory == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.StoreItemNotFound);
            return operationResponse;
        }

        if (request.storeDataParams) {
            storeInventory.clearStoreDatas();
            for (let i = 0; i < request.storeDataParams.length; i++) {
                let storeDataParam = request.storeDataParams[i];

                let value = storeDataParam.value;

                if (value != null && value instanceof GNData) {
                    value = (value as GNData).toData();
                }

                storeInventory.setStoreData(storeDataParam.key, value as DataValueType);
            }
        }

        if (request.storeItemParams != null) {
            storeInventory.clearStoreItems();
            for (let i = 0; i < request.storeItemParams.length; i++) {
                let storeItemParam = request.storeItemParams[i];
                storeInventory.setStoreItem(storeItemParam.catalogId, storeItemParam.classId, storeItemParam.amount);
            }
        }

        if (request.storeCurrencyParams != null) {
            storeInventory.clearStoreCurrencies();
            for (let i = 0; i < request.storeCurrencyParams.length; i++) {
                let storeCurrencyParam = request.storeCurrencyParams[i];
                storeInventory.setStoreCurrency(storeCurrencyParam.key, storeCurrencyParam.value);
            }
        }

        if (request.priceCurrencyParams != null) {
            storeInventory.clearPriceCurrencies();
            for (let i = 0; i < request.priceCurrencyParams.length; i++) {
                let priceCurrencyParam = request.priceCurrencyParams[i];
                storeInventory.setPriceCurrency(priceCurrencyParam.key, priceCurrencyParam.value);
            }
        }

        if (request.inAppPurchaseParam != null) {
            let inAppPurchase = storeInventory.getInAppPurchase();

            storeInventory.setInAppPurchase({
                appleAppStoreId: request.inAppPurchaseParam.appleAppStoreId ?? inAppPurchase.appleAppStoreId,
                facebookStoreId: request.inAppPurchaseParam.facebookStoreId ?? inAppPurchase.facebookStoreId,
                googlePlayStoreId: request.inAppPurchaseParam.googlePlayStoreId ?? inAppPurchase.googlePlayStoreId,
                analyticsPrice: request.inAppPurchaseParam.analyticsPrice ?? inAppPurchase.analyticsPrice,
            });
        }

        if (request.displayName != null) {
            storeInventory.setDisplayName(request.displayName);
        }

        if (request.avatarParam != null) {
            storeInventory.setAvatar(request.avatarParam.type, request.avatarParam.value);
        }

        if (request.tagParams != null) {
            storeInventory.clearTags();
            for (let i = 0; i < request.tagParams.length; i++) {
                let tagParam = request.tagParams[i];
                storeInventory.setTag(tagParam.key, tagParam.value);
            }
        }

        storeInventory.saveAsync();

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, {
            storeItems: true,
            storeCurrencies: true,
            priceCurrencies: true,
            inAppPurchase: true,
            removeStatus: true,
            displayName: true,
            avatar: true,
            tsCreate: true,
            tags: true,
            storeDatas: true,
        }, secretInfo.getGameId()));

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_SetStoreItemInformation", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
