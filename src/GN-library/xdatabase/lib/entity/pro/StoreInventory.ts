import * as mongoDB from "mongodb";

import { DataObjectBase } from "./DataObjectBase";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { DataItem } from "./DataItem";
import { DataValueType } from "./type/DataValueType";

interface StoreInventoryItem {
	catalogId: string;
	classId: string;
	amount: number;
}

interface CurrencyItem {
	key: string;
	value: number;
}

interface InAppPurchase {
	appleAppStoreId: string,
	googlePlayStoreId: string,
	facebookStoreId: string,
	analyticsPrice: number,
}

export class StoreInventory extends DataObjectBase {
	private static readonly _storeId: string = "storeId";
	private static readonly _storeItemType: string = "storeItemType";

	private static readonly _storeItems: string = "storeItems";
	private static readonly _storeCurrencies: string = "storeCurrencies";

	private static readonly _priceCurrencies: string = "priceCurrencies";
	private static readonly _inAppPurchase: string = "inAppPurchase";

	private static readonly _storeDatas: string = "storeDatas";

	private static readonly _removeStatus: string = "removeStatus";

	private readonly storeId: string;

	private storeItems: Array<StoreInventoryItem>;
	private storeItemType: number;
	private storeCurrencies: Array<CurrencyItem>;

	private priceCurrencies: Array<CurrencyItem>;
	private inAppPurchase: InAppPurchase;

	private storeDatas: Array<DataItem>;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.storeId = result[StoreInventory._storeId];

		this.setDocumentStoreInventory(result);
	}

	private setDocumentStoreInventory(result: mongoDB.WithId<mongoDB.Document>) {
		this.storeItemType = result[StoreInventory._storeItemType];
		this.storeItems = result[StoreInventory._storeItems];
		this.storeCurrencies = result[StoreInventory._storeCurrencies];
		this.priceCurrencies = result[StoreInventory._priceCurrencies];
		this.inAppPurchase = result[StoreInventory._inAppPurchase];

		this.storeDatas = result[StoreInventory._storeDatas];

		this.removeStatus = result[StoreInventory._removeStatus];
	}

	public getStoreId(): string {
		return this.storeId;
	}

	public getAllStoreItems(): Array<StoreInventoryItem> {
		return this.storeItems;
	}

	public clearStoreItems(): void {
		this.storeItems.length = 0;

		this.set(StoreInventory._storeItems, this.storeItems);
	}

	public hasStoreItem(catalogId: string, classId: string): boolean {
		return this.storeItems.find(x => x.catalogId == catalogId && x.classId == classId) != null;
	}

	public setStoreItem(catalogId: string, classId: string, amount: number): void {
		let storeItem = this.storeItems.find(x => x.catalogId == catalogId && x.classId == classId);
		if (storeItem == null) {
			storeItem = {
				catalogId: catalogId,
				classId: classId,
				amount: amount,
			}

			this.storeItems.push(storeItem);
		}
		else {
			storeItem.amount = amount;
		}

		this.set(StoreInventory._storeItems, this.storeItems);
	}

	public removeStoreItem(catalogId: string, classId: string): void {
		let storeItem = this.storeItems.find(x => x.catalogId == catalogId && x.classId == classId);
		if (storeItem != null) {
			let indexOf = this.storeItems.indexOf(storeItem);
			if (indexOf != -1) {
				this.storeItems.splice(indexOf, 1);

				return this.set(StoreInventory._storeItems, this.storeItems);
			}
		}

		throw Error("can not found the item to remove");
	}

	public getAllStoreCurrencies(): Array<CurrencyItem> {
		return this.storeCurrencies;
	}

	public clearStoreCurrencies(): void {
		this.storeCurrencies.length = 0;

		this.set(StoreInventory._storeCurrencies, this.storeCurrencies);
	}

	public hasStoreCurrency(key: string): boolean {
		return this.storeCurrencies.find(x => x.key == key) != null;
	}

	public setStoreCurrency(key: string, value: number): void {
		let storeCurrency = this.storeCurrencies.find(x => x.key == key);
		if (storeCurrency == null) {
			storeCurrency = {
				key: key,
				value: value,
			}

			this.storeCurrencies.push(storeCurrency);
		}
		else {
			storeCurrency.value = value;
		}

		this.set(StoreInventory._storeCurrencies, this.storeCurrencies);
	}

	public removeStoreCurrency(key: string): void {
		let storeCurrency = this.storeCurrencies.find(x => x.key == key);
		if (storeCurrency != null) {
			let indexOf = this.storeCurrencies.indexOf(storeCurrency);
			if (indexOf != -1) {
				this.storeCurrencies.splice(indexOf, 1);

				return this.set(StoreInventory._storeCurrencies, this.storeCurrencies);
			}
		}

		throw Error("can not found the item to remove");
	}

	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(StoreInventory._removeStatus, this.removeStatus);
	}

	public getAllPriceCurrencies(): Array<CurrencyItem> {
		return this.priceCurrencies;
	}

	public clearPriceCurrencies(): void {
		this.priceCurrencies.length = 0;

		this.set(StoreInventory._priceCurrencies, this.priceCurrencies);
	}

	public getPriceCurrency(key: string): CurrencyItem {
		return this.priceCurrencies.find(x => x.key == key);
	}

	public hasPriceCurrency(key: string): boolean {
		return this.getPriceCurrency(key) != null;
	}

	public setPriceCurrency(key: string, value: number): void {
		let priceCurrency = this.priceCurrencies.find(x => x.key == key);
		if (priceCurrency == null) {
			priceCurrency = {
				key: key,
				value: value,
			}

			this.priceCurrencies.push(priceCurrency);
		}
		else {
			priceCurrency.value = value;
		}

		this.set(StoreInventory._priceCurrencies, this.priceCurrencies);
	}

	public removePriceCurrency(key: string): void {
		let priceCurrency = this.priceCurrencies.find(x => x.key == key);
		if (priceCurrency != null) {
			let indexOf = this.priceCurrencies.indexOf(priceCurrency);
			if (indexOf != -1) {
				this.priceCurrencies.splice(indexOf, 1);

				return this.set(StoreInventory._priceCurrencies, this.priceCurrencies);
			}
		}

		throw Error("can not found the item to remove");
	}

	public setInAppPurchase(inAppPurchase: InAppPurchase): void {
		this.inAppPurchase = inAppPurchase;

		this.set(StoreInventory._inAppPurchase, this.inAppPurchase);
	}

	public getInAppPurchase(): InAppPurchase {
		return this.inAppPurchase;
	}

	public getAllStoreDatas(): Array<DataItem> {
		return this.storeDatas;
	}

	public clearStoreDatas(): void {
		this.storeDatas.length = 0;

		this.set(StoreInventory._storeDatas, this.storeDatas);
	}

	public hasStoreData(key: string): boolean {
		return this.getStoreData(key) != null;
	}

	public getStoreData(key: string): DataItem {
		return this.storeDatas.find(x => x.key == key);
	}

	public setStoreData(key: string, value: DataValueType): void {
		let itemDataItem = this.storeDatas.find(x => x.key == key);
		if (itemDataItem == null) {
			itemDataItem = {
				key: key,
				value: value,
			}

			this.storeDatas.push(itemDataItem);
		}
		else {
			itemDataItem.value = value;
		}

		this.set(StoreInventory._storeDatas, this.storeDatas);
	}

	public removeStoreData(key: string): void {
		let itemDataItem = this.storeDatas.find(x => x.key == key);
		if (itemDataItem != null) {
			let indexOf = this.storeDatas.indexOf(itemDataItem);
			if (indexOf != -1) {
				this.storeDatas.splice(indexOf, 1);

				return this.set(StoreInventory._storeDatas, this.storeDatas);
			}
		}

		throw Error("can not found the key to remove");
	}

    public getStoreItemType(): number {
        return this.storeItemType;
    }

    public setStoreItemType(storeItemType: number) {
        this.storeItemType = storeItemType;

        this.set(StoreInventory._storeItemType, this.storeItemType);
    }

}
