import * as mongodb from "mongodb";

import { DataObjectBase } from "./DataObjectBase";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { DataItem } from "./DataItem";
import { DataValueType } from "./type/DataValueType";

interface StoreInventoryItem {
	// Stores the catalog ID value used by this contract.
	catalogId: string;
	// Stores the class ID value used by this contract.
	classId: string;
	// Stores the amount value used by this contract.
	amount: number;
}

interface CurrencyItem {
	// Stores the key value used by this contract.
	key: string;
	// Stores the value value used by this contract.
	value: number;
}

interface InAppPurchase {
	// Stores the apple app store ID value used by this contract.
	appleAppStoreId: string,
	// Stores the google play store ID value used by this contract.
	googlePlayStoreId: string,
	// Stores the facebook store ID value used by this contract.
	facebookStoreId: string,
	// Stores the analytics price value used by this contract.
	analyticsPrice: number,
}

export class StoreInventory extends DataObjectBase {
	// Defines the internal field key for store ID.
	private static readonly _storeId: string = "storeId";
	// Defines the internal field key for store item type.
	private static readonly _storeItemType: string = "storeItemType";

	// Defines the internal field key for store items.
	private static readonly _storeItems: string = "storeItems";
	// Defines the internal field key for store currencies.
	private static readonly _storeCurrencies: string = "storeCurrencies";

	// Defines the internal field key for price currencies.
	private static readonly _priceCurrencies: string = "priceCurrencies";
	// Defines the internal field key for in app purchase.
	private static readonly _inAppPurchase: string = "inAppPurchase";

	// Defines the internal field key for store datas.
	private static readonly _storeDatas: string = "storeDatas";

	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";

	// Stores the store ID value used by this instance.
	private readonly storeId: string;

	// Stores the store items value used by this instance.
	private storeItems: Array<StoreInventoryItem>;
	// Stores the store item type value used by this instance.
	private storeItemType: number;
	// Stores the store currencies value used by this instance.
	private storeCurrencies: Array<CurrencyItem>;

	// Stores the price currencies value used by this instance.
	private priceCurrencies: Array<CurrencyItem>;
	// Stores the in app purchase value used by this instance.
	private inAppPurchase: InAppPurchase;

	// Stores the store datas value used by this instance.
	private storeDatas: Array<DataItem>;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new store inventory instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.storeId = result[StoreInventory._storeId];

		this.setDocumentStoreInventory(result);
	}

	/**
	 * Sets the document store inventory.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentStoreInventory(result: mongodb.WithId<mongodb.Document>) {
		this.storeItemType = result[StoreInventory._storeItemType];
		this.storeItems = result[StoreInventory._storeItems];
		this.storeCurrencies = result[StoreInventory._storeCurrencies];
		this.priceCurrencies = result[StoreInventory._priceCurrencies];
		this.inAppPurchase = result[StoreInventory._inAppPurchase];

		this.storeDatas = result[StoreInventory._storeDatas];

		this.removeStatus = result[StoreInventory._removeStatus];
	}

	/**
	 * Returns the store ID.
	 * @returns Returns the store ID.
	 */
	public getStoreId(): string {
		return this.storeId;
	}

	/**
	 * Returns all store items.
	 * @returns Returns all store items.
	 */
	public getAllStoreItems(): Array<StoreInventoryItem> {
		return this.storeItems;
	}

	/**
	 * Executes the clear store items workflow.
	 */
	public clearStoreItems(): void {
		this.storeItems.length = 0;

		this.set(StoreInventory._storeItems, this.storeItems);
	}

	/**
	 * Checks whether store item exists.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasStoreItem(catalogId: string, classId: string): boolean {
		return this.storeItems.find(x => x.catalogId == catalogId && x.classId == classId) != null;
	}

	/**
	 * Sets the store item.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 */
	public setStoreItem(catalogId: string, classId: string, amount: number): void {
		// Stores the store item value used in the current execution flow.
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

	/**
	 * Removes the store item.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 */
	public removeStoreItem(catalogId: string, classId: string): void {
		// Stores the store item value used in the current execution flow.
		let storeItem = this.storeItems.find(x => x.catalogId == catalogId && x.classId == classId);
		if (storeItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.storeItems.indexOf(storeItem);
			if (indexOf != -1) {
				this.storeItems.splice(indexOf, 1);

				return this.set(StoreInventory._storeItems, this.storeItems);
			}
		}

		throw Error("can not found the item to remove");
	}

	/**
	 * Returns all store currencies.
	 * @returns Returns all store currencies.
	 */
	public getAllStoreCurrencies(): Array<CurrencyItem> {
		return this.storeCurrencies;
	}

	/**
	 * Executes the clear store currencies workflow.
	 */
	public clearStoreCurrencies(): void {
		this.storeCurrencies.length = 0;

		this.set(StoreInventory._storeCurrencies, this.storeCurrencies);
	}

	/**
	 * Checks whether store currency exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasStoreCurrency(key: string): boolean {
		return this.storeCurrencies.find(x => x.key == key) != null;
	}

	/**
	 * Sets the store currency.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setStoreCurrency(key: string, value: number): void {
		// Stores the store currency value used in the current execution flow.
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

	/**
	 * Removes the store currency.
	 * @param key Provides the key value used by this operation.
	 */
	public removeStoreCurrency(key: string): void {
		// Stores the store currency value used in the current execution flow.
		let storeCurrency = this.storeCurrencies.find(x => x.key == key);
		if (storeCurrency != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.storeCurrencies.indexOf(storeCurrency);
			if (indexOf != -1) {
				this.storeCurrencies.splice(indexOf, 1);

				return this.set(StoreInventory._storeCurrencies, this.storeCurrencies);
			}
		}

		throw Error("can not found the item to remove");
	}

	/**
	 * Returns the remove status.
	 * @returns Returns the remove status.
	 */
	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	/**
	 * Sets the remove status.
	 * @param tsRemove Provides the timestamp remove value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(StoreInventory._removeStatus, this.removeStatus);
	}

	/**
	 * Returns all price currencies.
	 * @returns Returns all price currencies.
	 */
	public getAllPriceCurrencies(): Array<CurrencyItem> {
		return this.priceCurrencies;
	}

	/**
	 * Executes the clear price currencies workflow.
	 */
	public clearPriceCurrencies(): void {
		this.priceCurrencies.length = 0;

		this.set(StoreInventory._priceCurrencies, this.priceCurrencies);
	}

	/**
	 * Returns the price currency.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the price currency.
	 */
	public getPriceCurrency(key: string): CurrencyItem {
		return this.priceCurrencies.find(x => x.key == key);
	}

	/**
	 * Checks whether price currency exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPriceCurrency(key: string): boolean {
		return this.getPriceCurrency(key) != null;
	}

	/**
	 * Sets the price currency.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setPriceCurrency(key: string, value: number): void {
		// Stores the price currency value used in the current execution flow.
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

	/**
	 * Removes the price currency.
	 * @param key Provides the key value used by this operation.
	 */
	public removePriceCurrency(key: string): void {
		// Stores the price currency value used in the current execution flow.
		let priceCurrency = this.priceCurrencies.find(x => x.key == key);
		if (priceCurrency != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.priceCurrencies.indexOf(priceCurrency);
			if (indexOf != -1) {
				this.priceCurrencies.splice(indexOf, 1);

				return this.set(StoreInventory._priceCurrencies, this.priceCurrencies);
			}
		}

		throw Error("can not found the item to remove");
	}

	/**
	 * Sets the in app purchase.
	 * @param inAppPurchase Provides the in app purchase value used by this operation.
	 */
	public setInAppPurchase(inAppPurchase: InAppPurchase): void {
		this.inAppPurchase = inAppPurchase;

		this.set(StoreInventory._inAppPurchase, this.inAppPurchase);
	}

	/**
	 * Returns the in app purchase.
	 * @returns Returns the in app purchase.
	 */
	public getInAppPurchase(): InAppPurchase {
		return this.inAppPurchase;
	}

	/**
	 * Returns all store datas.
	 * @returns Returns all store datas.
	 */
	public getAllStoreDatas(): Array<DataItem> {
		return this.storeDatas;
	}

	/**
	 * Executes the clear store datas workflow.
	 */
	public clearStoreDatas(): void {
		this.storeDatas.length = 0;

		this.set(StoreInventory._storeDatas, this.storeDatas);
	}

	/**
	 * Checks whether store data exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasStoreData(key: string): boolean {
		return this.getStoreData(key) != null;
	}

	/**
	 * Returns the store data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the store data.
	 */
	public getStoreData(key: string): DataItem {
		return this.storeDatas.find(x => x.key == key);
	}

	/**
	 * Sets the store data.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setStoreData(key: string, value: DataValueType): void {
		// Stores the item data item value used in the current execution flow.
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

	/**
	 * Removes the store data.
	 * @param key Provides the key value used by this operation.
	 */
	public removeStoreData(key: string): void {
		// Stores the item data item value used in the current execution flow.
		let itemDataItem = this.storeDatas.find(x => x.key == key);
		if (itemDataItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.storeDatas.indexOf(itemDataItem);
			if (indexOf != -1) {
				this.storeDatas.splice(indexOf, 1);

				return this.set(StoreInventory._storeDatas, this.storeDatas);
			}
		}

		throw Error("can not found the key to remove");
	}

    /**
     * Returns the store item type.
     * @returns Returns the store item type.
     */
    public getStoreItemType(): number {
        return this.storeItemType;
    }

    /**
     * Sets the store item type.
     * @param storeItemType Provides the store item type value used by this operation.
     */
    public setStoreItemType(storeItemType: number) {
        this.storeItemType = storeItemType;

        this.set(StoreInventory._storeItemType, this.storeItemType);
    }

}
