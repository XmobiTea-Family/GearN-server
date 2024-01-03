import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { StoreInventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/StoreInventoryFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { StoreInventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { Inventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";

export abstract class StoreItemBaseRequestHandler extends RequestHandler {
    private isGetAll(infoRequestParam: InfoRequestParam): boolean {
        return infoRequestParam.storeItems
            && infoRequestParam.storeItemType
            && infoRequestParam.storeCurrencies
            && infoRequestParam.priceCurrencies
            && infoRequestParam.inAppPurchase
            && infoRequestParam.removeStatus

            && infoRequestParam.displayName
            && infoRequestParam.avatar
            && infoRequestParam.tsCreate
            && infoRequestParam.tags

            && infoRequestParam.storeDatas;
    }

    protected async grantItem(catalogId: string, classId: string, amount: number, itemType: number, id: string, type: number, gameId: string): Promise<Inventory> {
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        let storeId = StringUtility.generateRandomString(12, this.gnServer.getIdTypeCase());
        // o day can tao 1 dong 
        let result = {} as any;
        result["storeId"] = storeId;
        result["catalogId"] = catalogId;
        result["classId"] = classId;
        result["amount"] = amount;
        result["itemType"] = itemType;
        result["owner"] = { "id": id, "type": type };
        result["itemDatas"] = [];
        result["itemStatistics"] = {};
        result["removeStatus"] = { "tsRemove": 0, "reason": "" };
        result["segments"] = [];
        result["customDatas"] = {};
        result["tsCreate"] = currentMilliseconds;
        result["displayName"] = "";
        result["displayNameNormalize"] = "";
        result["avatar"] = { "type": 0, "value": "0" };
        result["tags"] = {};

        let inventory = await this.gnServer.getDatabase().createInventoryAsync(result, gameId);
        return inventory;
    }

    protected convertToStoreInventoryFindOptions(infoRequestParam: InfoRequestParam): StoreInventoryFindOptions {
        if (this.isGetAll(infoRequestParam)) return null;

        let answer: StoreInventoryFindOptions = {};
        answer.storeId = true;

        if (infoRequestParam.storeItems) answer.storeItems = infoRequestParam.storeItems;
        if (infoRequestParam.storeItemType) answer.storeItemType = infoRequestParam.storeItemType;
        if (infoRequestParam.storeCurrencies) answer.storeCurrencies = infoRequestParam.storeCurrencies;
        if (infoRequestParam.priceCurrencies) answer.priceCurrencies = infoRequestParam.priceCurrencies;
        if (infoRequestParam.inAppPurchase) answer.inAppPurchase = infoRequestParam.inAppPurchase;
        if (infoRequestParam.removeStatus) answer.removeStatus = infoRequestParam.removeStatus;

        if (infoRequestParam.displayName) answer.displayName = infoRequestParam.displayName;
        if (infoRequestParam.avatar) answer.avatar = infoRequestParam.avatar;
        if (infoRequestParam.tsCreate) answer.tsCreate = infoRequestParam.tsCreate;
        if (infoRequestParam.tags) answer.tags = infoRequestParam.tags;

        if (infoRequestParam.storeDatas) answer.storeDatas = infoRequestParam.storeDatas;

        return answer;
    }

    protected generateInfoResponseParameters(storeInventory: StoreInventory, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
        let answer = new GNHashtable();

        if (infoRequestParam.storeItems)
            answer.add(GNParameterCode.StoreItems, this.generateStoreItems(storeInventory));

        if (infoRequestParam.storeItemType)
            answer.add(GNParameterCode.StoreItemType, this.generateStoreItemType(storeInventory));

        if (infoRequestParam.storeCurrencies)
            answer.add(GNParameterCode.StoreCurrencies, this.generateStoreCurrencies(storeInventory));

        if (infoRequestParam.priceCurrencies)
            answer.add(GNParameterCode.PriceCurrencies, this.generatePriceCurrencies(storeInventory));

        if (infoRequestParam.inAppPurchase)
            answer.add(GNParameterCode.InAppPurchase, this.generateInAppPurchase(storeInventory));

        if (infoRequestParam.removeStatus)
            answer.add(GNParameterCode.RemoveStatus, this.generateRemoveStatus(storeInventory));

        if (infoRequestParam.displayName)
            answer.add(GNParameterCode.DisplayName, this.generateDisplayName(storeInventory));

        if (infoRequestParam.avatar)
            answer.add(GNParameterCode.Avatar, this.generateAvatar(storeInventory));

        if (infoRequestParam.tsCreate)
            answer.add(GNParameterCode.TsCreate, this.generateTsCreate(storeInventory));

        if (infoRequestParam.tags)
            answer.add(GNParameterCode.Tags, this.generateTags(storeInventory));

        if (infoRequestParam.storeDatas)
            answer.add(GNParameterCode.StoreDatas, this.generateStoreDatas(storeInventory));

        return answer;
    }

    protected generateStoreItems(storeInventory: StoreInventory): GNArray {
        let gnStoreItems = new GNArray();

        let allStoreItems = storeInventory.getAllStoreItems();

        for (let i = 0; i < allStoreItems.length; i++) {
            let storeItem = allStoreItems[i];

            let gnStoreItem = new GNHashtable();

            gnStoreItem.add(GNParameterCode.CatalogId, storeItem.catalogId);
            gnStoreItem.add(GNParameterCode.ClassId, storeItem.classId);
            gnStoreItem.add(GNParameterCode.Amount, storeItem.amount);

            gnStoreItems.add(gnStoreItem);
        }

        return gnStoreItems;
    }

    protected generateStoreItemType(storeInventory: StoreInventory): number {
        return storeInventory.getStoreItemType();
    }

    protected generateStoreCurrencies(storeInventory: StoreInventory): GNArray {
        let gnStoreCurrenciess = new GNArray();

        let allStoreCurrencies = storeInventory.getAllStoreCurrencies();

        for (let i = 0; i < allStoreCurrencies.length; i++) {
            let storeCurrency = allStoreCurrencies[i];

            let gnStoreCurrency = new GNHashtable();

            gnStoreCurrency.add(GNParameterCode.Key, storeCurrency.key);
            gnStoreCurrency.add(GNParameterCode.Value, storeCurrency.value);

            gnStoreCurrenciess.add(gnStoreCurrency);
        }

        return gnStoreCurrenciess;
    }

    protected generatePriceCurrencies(storeInventory: StoreInventory): GNArray {
        let gnPriceCurrenciess = new GNArray();

        let allPriceCurrencies = storeInventory.getAllPriceCurrencies();

        for (let i = 0; i < allPriceCurrencies.length; i++) {
            let priceCurrency = allPriceCurrencies[i];

            let gnPriceCurrency = new GNHashtable();

            gnPriceCurrency.add(GNParameterCode.Key, priceCurrency.key);
            gnPriceCurrency.add(GNParameterCode.Value, priceCurrency.value);

            gnPriceCurrenciess.add(gnPriceCurrency);
        }

        return gnPriceCurrenciess;
    }

    protected generateInAppPurchase(storeInventory: StoreInventory): GNHashtable {
        let gnInAppPurchase = new GNHashtable();

        let inAppPurchase = storeInventory.getInAppPurchase();

        gnInAppPurchase.add(GNParameterCode.FacebookStoreId, inAppPurchase.facebookStoreId);
        gnInAppPurchase.add(GNParameterCode.AppleAppStoreId, inAppPurchase.appleAppStoreId);
        gnInAppPurchase.add(GNParameterCode.GooglePlayStoreId, inAppPurchase.googlePlayStoreId);
        gnInAppPurchase.add(GNParameterCode.AnalyticsPrice, inAppPurchase.analyticsPrice);

        return gnInAppPurchase;
    }

    protected generateRemoveStatus(storeInventory: StoreInventory): GNHashtable {
        let removeStatus = storeInventory.getRemoveStatus();

        let gnRemoveStatus = new GNHashtable();

        gnRemoveStatus.add(GNParameterCode.TsRemove, removeStatus.tsRemove);
        gnRemoveStatus.add(GNParameterCode.Reason, removeStatus.reason);

        return gnRemoveStatus;
    }

    protected generateDisplayName(storeInventory: StoreInventory): string {
        return storeInventory.getDisplayName();
    }

    protected generateAvatar(storeInventory: StoreInventory): GNHashtable {
        let avatar = storeInventory.getAvatar();

        let gnAvatar = new GNHashtable();

        gnAvatar.add(GNParameterCode.Type, avatar.type);
        gnAvatar.add(GNParameterCode.Value, avatar.value);

        return gnAvatar;
    }

    protected generateTsCreate(storeInventory: StoreInventory): number {
        return storeInventory.getTsCreate();
    }

    protected generateTags(storeInventory: StoreInventory): GNArray {
        let gnTags = new GNArray();

        let allTags = storeInventory.getAllTags();

        allTags.forEach((value: string, key: string) => {
            let gnTag = new GNHashtable();

            gnTag.add(GNParameterCode.Key, key);
            gnTag.add(GNParameterCode.Value, value);

            gnTags.add(gnTag);
        });

        return gnTags;
    }

    protected generateStoreDatas(storeInventory: StoreInventory): GNArray {
        let gnStoreDatas = new GNArray();

        let allStoreDatas = storeInventory.getAllStoreDatas();

        for (let i = 0; i < allStoreDatas.length; i++) {
            let storeData = allStoreDatas[i];

            let gnStoreData = new GNHashtable();

            gnStoreData.add(GNParameterCode.Key, storeData.key);
            gnStoreData.add(GNParameterCode.Value, storeData.value);

            gnStoreDatas.add(gnStoreData);
        }

        return gnStoreDatas;
    }
}
