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
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { Md5Generate } from "./../../../../../GN-common/helper/Md5Generate";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { StoreReceiveType } from "../../../../../GN-common/constant/enumType/StoreReceiveType";

class ValidateGooglePlayStoreReceiptOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.Receipt, minLength: 10, maxLength: 2048, mustNonNull: true })
    receipt: string;

    @StringDataMember({ code: GNParameterCode.OwnerId, minLength: 10, maxLength: 11, mustNonNull: true })
    id: string;

    @NumberDataMember({ code: GNParameterCode.OwnerType, mustInt: true })
    type: number;

    @StringDataMember({ code: GNParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    log?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerValidateGooglePlayStoreReceiptOperationRequest extends ValidateGooglePlayStoreReceiptOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminValidateGooglePlayStoreReceiptOperationRequest extends ServerValidateGooglePlayStoreReceiptOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class ValidateGooglePlayStoreReceiptRequestHandler extends StoreItemBaseRequestHandler {
    public override getCode() {
        return OperationCode.ValidateGooglePlayStoreReceipt;
    }

    public override getCommonOperationRequest() {
        return ValidateGooglePlayStoreReceiptOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = false;

        if (secretInfo.getPermission().storeInventory.validateGooglePlayStoreReceipt.otherSelfEnable) {
            allowMethod = true;
        }
        else if (secretInfo.getPermission().storeInventory.validateGooglePlayStoreReceipt.selfEnable) {
            if (request.type == <number>OwnerType.CharacterPlayer) {
                let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

                if (gamePlayer != null) {
                    if (gamePlayer.hasPlayerCharacter(request.id)) {
                        allowMethod = true;
                    }
                }
            }
            else if (request.type == <number>OwnerType.GamePlayer) {
                if (request.id == authInfo.getUserId()) {
                    allowMethod = true;
                }
            }
            else if (request.type == <number>OwnerType.Group) {
                let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

                if (gamePlayer != null) {
                    let groupItem = gamePlayer.getPlayerGroup(request.id);

                    if (groupItem != null && groupItem.status == <number>GroupStatus.Member) {
                        allowMethod = true;
                    }
                }
            }
        }

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            receipt: request.receipt,
            id: request.id,
            type: request.type,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerValidateGooglePlayStoreReceiptOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.validateGooglePlayStoreReceipt.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            receipt: request.receipt,
            id: request.id,
            type: request.type,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminValidateGooglePlayStoreReceiptOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.validateGooglePlayStoreReceipt.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            receipt: request.receipt,
            id: request.id,
            type: request.type,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { receipt: string, id: string, type: number, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_ValidateGooglePlayStoreReceipt", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let productId: string;
        let payload: string;
        let transactionId: string;

        try {
            let receiptJson = JSON.parse(request.receipt);

            let store = receiptJson["Store"];
            if (store != "GooglePlayStore") {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.StoreInvalid);
                return operationResponse;
            }

            payload = receiptJson["Payload"];

            let receiptResult = await this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", secretInfo.getGameId()).findOne({
                payloadMd5: Md5Generate.getMd5(payload)
            });

            if (receiptResult != null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ReceiptInvalid);
                return operationResponse;
            }

            transactionId = receiptJson["TransactionID"];

            let receiptStatus = await this.gnServer.getGoogleService().validateReceipt(payload);
            if (!receiptStatus.success) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ReceiptInvalid);
                return operationResponse;
            }

            productId = receiptStatus.productId;
        }
        catch (err) {
            Debug.logException(err);

            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExceptionWhenValidateReceipt);
            return operationResponse;
        }

        let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryByGooglePlayStoreAsync(productId, secretInfo.getGameId(), null);

        if (storeInventory == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.StoreItemNotFound);
            return operationResponse;
        }

        if (storeInventory.getRemoveStatus().tsRemove != 0) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.StoreItemHadBeenRemove);
            return operationResponse;
        }

        this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", secretInfo.getGameId()).insertOne({
            payloadMd5: Md5Generate.getMd5(payload),
            transactionId: transactionId,
            payload: payload,
            buyer: {
                id: request.id,
                type: request.type
            },
            tsCreate: xDatetime.getCurrentMilliseconds(),
            productId: productId,
            store: "GooglePlayStore",
        });

        let priceCurrencyStartValues: {
            key: string,
            value: number,
        }[] = [];

        let priceCurrencyAmountValues: {
            key: string,
            value: number,
        }[] = [];

        let priceCurrencyFinalValues: {
            key: string,
            value: number,
        }[] = [];

        let storeCurrencyStartValues: {
            key: string,
            value: number,
        }[] = [];

        let storeCurrencyAmountValues: {
            key: string,
            value: number,
        }[] = [];

        let storeCurrencyFinalValues: {
            key: string,
            value: number,
        }[] = [];

        let storeItemFinalValues: {
            catalogId: string,
            classId: string,
            itemId: string,
        }[] = [];

        let allStoreCurrencies = storeInventory.getAllStoreCurrencies();
        let allStoreItems = storeInventory.getAllStoreItems();

        if (request.type == <number>OwnerType.CharacterPlayer) {
            let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.id, secretInfo.getGameId(), {
                playerCurrencies: true,
                playerInventories: true,
            });

            if (characterPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.BuyerNotFound);
                return operationResponse;
            }

            let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

            let gnInfoResponseParameters = new GNHashtable();

            let gnPlayerCurrencies = new GNArray();
            let gnPlayerInventories = new GNArray();

            {
                for (let i = 0; i < allStoreItems.length; i++) {
                    let storeItem = allStoreItems[i];

                    let playerItemCatalogSettingsItem = characterPlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

                    if (playerItemCatalogSettingsItem != null) {
                        let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
                        if (itemClassSettingsItem != null) {
                            let inventory = await this.grantItem(storeItem.catalogId, storeItem.classId, storeItem.amount, playerItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
                            characterPlayer.setPlayerInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

                            let gnPlayerInventory = new GNHashtable();

                            gnPlayerInventory.add(GNParameterCode.ItemId, inventory.getItemId());
                            gnPlayerInventory.add(GNParameterCode.CatalogId, inventory.getCatalogId());
                            gnPlayerInventory.add(GNParameterCode.ClassId, inventory.getClassId());

                            gnPlayerInventories.add(gnPlayerInventory);

                            storeItemFinalValues.push({
                                catalogId: inventory.getCatalogId(),
                                classId: inventory.getClassId(),
                                itemId: inventory.getItemId(),
                            });
                        }
                    }
                }
            }

            {
                for (let i = 0; i < allStoreCurrencies.length; i++) {
                    let storeCurrency = allStoreCurrencies[i];

                    storeCurrencyAmountValues.push({
                        key: storeCurrency.key,
                        value: storeCurrency.value,
                    });

                    if (!characterPlayer.hasPlayerCurrency(storeCurrency.key)) {

                        let playerCurrencySettingsItem = characterPlayerSettings.playerCurrencySettings.find(x => x.key == storeCurrency.key);
                        if (playerCurrencySettingsItem != null) {
                            characterPlayer.setPlayerCurrency(storeCurrency.key, playerCurrencySettingsItem.initialValue);
                        }
                        else {
                            characterPlayer.setPlayerCurrency(storeCurrency.key, 0);
                        }
                    }

                    let playerCurrency = characterPlayer.getPlayerCurrency(storeCurrency.key);

                    storeCurrencyStartValues.push({
                        key: storeCurrency.key,
                        value: playerCurrency.value,
                    });

                    let oldValue = playerCurrency.value;
                    let serverValue = playerCurrency.value + storeCurrency.value;
                    characterPlayer.setPlayerCurrency(storeCurrency.key, serverValue);

                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(GNParameterCode.Key, storeCurrency.key);
                    gnPlayerCurrency.add(GNParameterCode.Value, serverValue);

                    storeCurrencyFinalValues.push({
                        key: storeCurrency.key,
                        value: serverValue,
                    });

                    gnPlayerCurrencies.add(gnPlayerCurrency);

                    this.gnServer.getDatabase().insertCharacterPlayerCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "ValidateGooglePlayStore " + storeInventory.getStoreId() + ", log: " + request.log);
                }
            }

            characterPlayer.saveAsync();

            gnInfoResponseParameters.add(GNParameterCode.Currencies, gnPlayerCurrencies);
            gnInfoResponseParameters.add(GNParameterCode.Inventories, gnPlayerInventories);

            operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        }
        else if (request.type == <number>OwnerType.GamePlayer) {
            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.id, secretInfo.getGameId(), {
                playerCurrencies: true,
                playerInventories: true,
            });

            if (gamePlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.BuyerNotFound);
                return operationResponse;
            }

            let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

            let gnInfoResponseParameters = new GNHashtable();

            let gnPlayerCurrencies = new GNArray();
            let gnPlayerInventories = new GNArray();

            {
                for (let i = 0; i < allStoreItems.length; i++) {
                    let storeItem = allStoreItems[i];

                    let playerItemCatalogSettingsItem = gamePlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

                    if (playerItemCatalogSettingsItem != null) {
                        let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
                        if (itemClassSettingsItem != null) {
                            let inventory = await this.grantItem(storeItem.catalogId, storeItem.classId, storeItem.amount, playerItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
                            gamePlayer.setPlayerInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

                            let gnPlayerInventory = new GNHashtable();

                            gnPlayerInventory.add(GNParameterCode.ItemId, inventory.getItemId());
                            gnPlayerInventory.add(GNParameterCode.CatalogId, inventory.getCatalogId());
                            gnPlayerInventory.add(GNParameterCode.ClassId, inventory.getClassId());

                            gnPlayerInventories.add(gnPlayerInventory);

                            storeItemFinalValues.push({
                                catalogId: inventory.getCatalogId(),
                                classId: inventory.getClassId(),
                                itemId: inventory.getItemId(),
                            });
                        }
                    }
                }
            }

            {
                for (let i = 0; i < allStoreCurrencies.length; i++) {
                    let storeCurrency = allStoreCurrencies[i];

                    storeCurrencyAmountValues.push({
                        key: storeCurrency.key,
                        value: storeCurrency.value,
                    });

                    if (!gamePlayer.hasPlayerCurrency(storeCurrency.key)) {

                        let playerCurrencySettingsItem = gamePlayerSettings.playerCurrencySettings.find(x => x.key == storeCurrency.key);
                        if (playerCurrencySettingsItem != null) {
                            gamePlayer.setPlayerCurrency(storeCurrency.key, playerCurrencySettingsItem.initialValue);
                        }
                        else {
                            gamePlayer.setPlayerCurrency(storeCurrency.key, 0);
                        }
                    }

                    let playerCurrency = gamePlayer.getPlayerCurrency(storeCurrency.key);

                    storeCurrencyStartValues.push({
                        key: storeCurrency.key,
                        value: playerCurrency.value,
                    });

                    let oldValue = playerCurrency.value;
                    let serverValue = playerCurrency.value + storeCurrency.value;
                    gamePlayer.setPlayerCurrency(storeCurrency.key, serverValue);

                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(GNParameterCode.Key, storeCurrency.key);
                    gnPlayerCurrency.add(GNParameterCode.Value, serverValue);

                    storeCurrencyFinalValues.push({
                        key: storeCurrency.key,
                        value: serverValue,
                    });

                    gnPlayerCurrencies.add(gnPlayerCurrency);

                    this.gnServer.getDatabase().insertGamePlayerCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "ValidateGooglePlayStore " + storeInventory.getStoreId() + ", log: " + request.log);
                }
            }

            gamePlayer.saveAsync();

            gnInfoResponseParameters.add(GNParameterCode.Currencies, gnPlayerCurrencies);
            gnInfoResponseParameters.add(GNParameterCode.Inventories, gnPlayerInventories);

            operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        }
        else if (request.type == <number>OwnerType.Group) {
            let group = await this.gnServer.getDatabase().loadGroupAsync(request.id, secretInfo.getGameId(), {
                groupCurrencies: true,
                groupInventories: true,
            });

            if (group == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.BuyerNotFound);
                return operationResponse;
            }

            let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

            let gnInfoResponseParameters = new GNHashtable();

            let gnCurrencies = new GNArray();
            let gnInventories = new GNArray();

            {
                for (let i = 0; i < allStoreItems.length; i++) {
                    let storeItem = allStoreItems[i];

                    let groupItemCatalogSettingsItem = groupSettings.groupItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

                    if (groupItemCatalogSettingsItem != null) {
                        let itemClassSettingsItem = groupItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
                        if (itemClassSettingsItem != null) {
                            let inventory = await this.grantItem(storeItem.catalogId, storeItem.classId, storeItem.amount, groupItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
                            group.setGroupInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

                            let gnGroupInventory = new GNHashtable();

                            gnGroupInventory.add(GNParameterCode.ItemId, inventory.getItemId());
                            gnGroupInventory.add(GNParameterCode.CatalogId, inventory.getCatalogId());
                            gnGroupInventory.add(GNParameterCode.ClassId, inventory.getClassId());

                            gnInventories.add(gnGroupInventory);

                            storeItemFinalValues.push({
                                catalogId: inventory.getCatalogId(),
                                classId: inventory.getClassId(),
                                itemId: inventory.getItemId(),
                            });
                        }
                    }
                }
            }

            {
                for (let i = 0; i < allStoreCurrencies.length; i++) {
                    let storeCurrency = allStoreCurrencies[i];

                    storeCurrencyAmountValues.push({
                        key: storeCurrency.key,
                        value: storeCurrency.value,
                    });

                    if (!group.hasGroupCurrency(storeCurrency.key)) {

                        let groupCurrencySettingsItem = groupSettings.groupCurrencySettings.find(x => x.key == storeCurrency.key);
                        if (groupCurrencySettingsItem != null) {
                            group.setGroupCurrency(storeCurrency.key, groupCurrencySettingsItem.initialValue);
                        }
                        else {
                            group.setGroupCurrency(storeCurrency.key, 0);
                        }
                    }

                    let groupCurrency = group.getGroupCurrency(storeCurrency.key);

                    storeCurrencyStartValues.push({
                        key: storeCurrency.key,
                        value: groupCurrency.value,
                    });

                    let oldValue = groupCurrency.value;
                    let serverValue = groupCurrency.value + storeCurrency.value;
                    group.setGroupCurrency(storeCurrency.key, serverValue);

                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(GNParameterCode.Key, storeCurrency.key);
                    gnPlayerCurrency.add(GNParameterCode.Value, serverValue);

                    storeCurrencyFinalValues.push({
                        key: storeCurrency.key,
                        value: serverValue,
                    });

                    this.gnServer.getDatabase().insertGroupCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "ValidateGooglePlayStore " + storeInventory.getStoreId() + ", log: " + request.log);
                    gnCurrencies.add(gnPlayerCurrency);
                }
            }

            group.saveAsync();

            gnInfoResponseParameters.add(GNParameterCode.Currencies, gnCurrencies);
            gnInfoResponseParameters.add(GNParameterCode.Inventories, gnInventories);

            operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        }

        this.gnServer.getDatabase().insertStoreInventoryLogAsync(storeInventory.getStoreId(), secretInfo.getGameId(), request.id, request.type, priceCurrencyStartValues, priceCurrencyAmountValues, priceCurrencyFinalValues, storeCurrencyStartValues, storeCurrencyAmountValues, storeCurrencyFinalValues, storeItemFinalValues, transactionId, <number>StoreReceiveType.GooglePlayStore, request.log);

        let inAppPurchase = storeInventory.getInAppPurchase();
        if (inAppPurchase.analyticsPrice) {
            this.gnServer.getDatabase().systemCollection("StoreAnalytics").insertOne({
                tsCreate: xDatetime.getCurrentMilliseconds(),
                price: inAppPurchase.analyticsPrice,
                storeId: storeInventory.getStoreId(),
            });
        }

        operationResponse.setParameter(GNParameterCode.StoreCurrencies, this.generateStoreCurrencies(storeInventory));
        operationResponse.setParameter(GNParameterCode.StoreItems, this.generateStoreItems(storeInventory));
        operationResponse.setParameter(GNParameterCode.PriceCurrencies, this.generatePriceCurrencies(storeInventory));

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_ValidateGooglePlayStoreReceipt", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
