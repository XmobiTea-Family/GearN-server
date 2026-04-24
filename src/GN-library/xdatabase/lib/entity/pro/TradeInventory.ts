import * as mongodb from "mongodb";

import { DataItem } from "./DataItem";
import { DataObjectBase } from "./DataObjectBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";
import { CurrencyItem } from "./CurrencyItem";
import { InventoryItem } from "./InventoryItem";

export class TradeInventory extends DataObjectBase {
	// Defines the internal field key for trade ID.
	private static readonly _tradeId: string = "tradeId";
	// Defines the internal field key for trade items.
	private static readonly _tradeItems: string = "tradeItems";
	// Defines the internal field key for owner.
	private static readonly _owner: string = "owner";
	// Defines the internal field key for buyer.
	private static readonly _buyer: string = "buyer";
	// Defines the internal field key for timestamp buy.
	private static readonly _tsBuy: string = "tsBuy";
	// Defines the internal field key for prices.
	private static readonly _prices: string = "prices";

	// Defines the internal field key for item datas.
	private static readonly _itemDatas: string = "itemDatas";
	// Defines the internal field key for item statistics.
	private static readonly _itemStatistics: string = "itemStatistics";

	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";

	// Stores the trade ID value used by this instance.
	private readonly tradeId: string;

	// Stores the trade items value used by this instance.
	private tradeItems: Array<InventoryItem>;
	// Stores the owner value used by this instance.
	private owner: OwnerItem;
	// Stores the buyer value used by this instance.
	private buyer: OwnerItem;
	// Stores the timestamp buy value used by this instance.
	private tsBuy: number;
	// Stores the prices collection used by this instance.
	private prices: Map<string, CurrencyItem>;

	// Stores the item datas value used by this instance.
	private itemDatas: Array<DataItem>;
	// Stores the item statistics collection used by this instance.
	private itemStatistics: Map<string, StatisticsItem>;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new trade inventory instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.tradeId = result[TradeInventory._tradeId];

		this.setDocumentTradeInventory(result);
	}

	/**
	 * Sets the document trade inventory.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentTradeInventory(result: mongodb.WithId<mongodb.Document>) {

		this.tradeItems = result[TradeInventory._tradeItems];
		this.owner = result[TradeInventory._owner];
		this.buyer = result[TradeInventory._buyer];
		this.tsBuy = result[TradeInventory._tsBuy];
		this.prices = result[TradeInventory._prices] != null ? new Map(Object.entries(result[TradeInventory._prices])) : null;

		this.itemDatas = result[TradeInventory._itemDatas];
		this.itemStatistics = result[TradeInventory._itemStatistics] != null ? new Map(Object.entries(result[TradeInventory._itemStatistics])) : null;

		this.removeStatus = result[TradeInventory._removeStatus];
	}

	/**
	 * Returns the trade ID.
	 * @returns Returns the trade ID.
	 */
	public getTradeId(): string {
		return this.tradeId;
	}

	/**
	 * Returns all trade items.
	 * @returns Returns all trade items.
	 */
	public getAllTradeItems(): Array<InventoryItem> {
		return this.tradeItems;
	}

	/**
	 * Checks whether trade item exists.
	 * @param itemId Provides the item ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasTradeItem(itemId: string): boolean {
		return this.tradeItems.find(x => x.itemId == itemId) != null;
	}

	/**
	 * Returns the trade item.
	 * @param itemId Provides the item ID value used by this operation.
	 * @returns Returns the trade item.
	 */
	public getTradeItem(itemId: string): InventoryItem {
		return this.tradeItems.find(x => x.itemId == itemId);
	}

	/**
	 * Sets the trade item.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 */
	public setTradeItem(itemId: string, catalogId: string, classId: string): void {
		// Stores the trade item value used in the current execution flow.
		let tradeItem = this.tradeItems.find(x => x.itemId == itemId);
		if (tradeItem == null) {
			tradeItem = {
				itemId: itemId,
				catalogId: catalogId,
				classId: classId,
			}

			this.tradeItems.push(tradeItem);
		}
		else {
			tradeItem.catalogId = catalogId;
			tradeItem.classId = classId;
		}

		this.set(TradeInventory._tradeItems, this.tradeItems);
	}

	/**
	 * Removes the trade item.
	 * @param itemId Provides the item ID value used by this operation.
	 */
	public removeTradeItem(itemId: string): void {
		// Stores the trade item value used in the current execution flow.
		let tradeItem = this.tradeItems.find(x => x.itemId == itemId);
		if (tradeItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.tradeItems.indexOf(tradeItem);
			if (indexOf != -1) {
				this.tradeItems.splice(indexOf, 1);

				return this.set(TradeInventory._tradeItems, this.tradeItems);
			}
		}

		throw Error("can not found the item to remove");
	}

	/**
	 * Returns the owner.
	 * @returns Returns the owner.
	 */
	public getOwner(): OwnerItem {
		return this.owner;
	}

	/**
	 * Sets the owner.
	 * @param ownerId Provides the owner ID value used by this operation.
	 * @param ownerType Provides the owner type value used by this operation.
	 */
	public setOwner(ownerId: string, ownerType: number): void {
		this.owner = {
			id: ownerId,
			type: ownerType,
		};

		this.set(TradeInventory._owner, this.owner);
	}

	/**
	 * Returns the buyer.
	 * @returns Returns the buyer.
	 */
	public getBuyer(): OwnerItem {
		return this.buyer;
	}

	/**
	 * Sets the buyer.
	 * @param buyerId Provides the buyer ID value used by this operation.
	 * @param buyerType Provides the buyer type value used by this operation.
	 */
	public setBuyer(buyerId: string, buyerType: number): void {
		this.buyer = {
			id: buyerId,
			type: buyerType,
		};

		this.set(TradeInventory._buyer, this.buyer);
	}

	/**
	 * Sets the timestamp buy.
	 * @param tsBuy Provides the timestamp buy value used by this operation.
	 */
	public setTsBuy(tsBuy: number): void {
		this.tsBuy = tsBuy;

		this.set(TradeInventory._tsBuy, this.tsBuy);
	}

	/**
	 * Returns all item datas.
	 * @returns Returns all item datas.
	 */
	public getAllItemDatas(): Array<DataItem> {
		return this.itemDatas;
	}

	/**
	 * Checks whether item data exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasItemData(key: string): boolean {
		return this.getItemData(key) != null;
	}

	/**
	 * Returns the item data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the item data.
	 */
	public getItemData(key: string): DataItem {
		return this.itemDatas.find(x => x.key == key);
	}

	/**
	 * Sets the item data.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setItemData(key: string, value: DataValueType): void {
		// Stores the item data item value used in the current execution flow.
		let itemDataItem = this.itemDatas.find(x => x.key == key);
		if (itemDataItem == null) {
			itemDataItem = {
				key: key,
				value: value,
			}

			this.itemDatas.push(itemDataItem);
		}
		else {
			itemDataItem.value = value;
		}

		this.set(TradeInventory._itemDatas, this.itemDatas);
	}

	/**
	 * Removes the item data.
	 * @param key Provides the key value used by this operation.
	 */
	public removeItemData(key: string): void {
		// Stores the item data item value used in the current execution flow.
		let itemDataItem = this.itemDatas.find(x => x.key == key);
		if (itemDataItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.itemDatas.indexOf(itemDataItem);
			if (indexOf != -1) {
				this.itemDatas.splice(indexOf, 1);

				return this.set(TradeInventory._itemDatas, this.itemDatas);
			}
		}

		throw Error("can not found the key to remove");
	}

	/**
	 * Returns all item statistics.
	 * @returns Returns all item statistics.
	 */
	public getAllItemStatistics(): Map<string, StatisticsItem> {
		return this.itemStatistics;
	}

	/**
	 * Checks whether item statistics exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasItemStatistics(key: string): boolean {
		return this.itemStatistics.has(key);
	}

	/**
	 * Returns the item statistics.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the item statistics.
	 */
	public getItemStatistics(key: string): StatisticsItem {
		return this.itemStatistics.get(key);
	}

	/**
	 * Changes the item statistics.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public changeItemStatistics(key: string, amount: number, tsLastUpdate: number): void {
		// Stores the this item statistics value used in the current execution flow.
		const thisItemStatistics = this.itemStatistics.get(key);
		this.itemStatistics.set(key, {
			value: (thisItemStatistics != null) ? (thisItemStatistics.value + amount) : amount,
			tsLastUpdate: tsLastUpdate,
		});

		// Stores the field value used in the current execution flow.
		const field = TradeInventory._itemStatistics + DataObjectBase.DOT + key;
		this.removeSet(field);
		this.inc(field + DataObjectBase.DOT + "value", amount);
		this.set(field + DataObjectBase.DOT + "tsLastUpdate", tsLastUpdate);
	}

	/**
	 * Sets the item statistics.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public setItemStatistics(key: string, value: number, tsLastUpdate: number): void {
		this.itemStatistics.set(key, {
			value: value,
			tsLastUpdate: tsLastUpdate,
		});

		// Stores the field value used in the current execution flow.
		const field = TradeInventory._itemStatistics + DataObjectBase.DOT + key;
		this.removeInc(field + DataObjectBase.DOT + "value");
		this.removeSet(field + DataObjectBase.DOT + "tsLastUpdate");
		this.set(field, {
			value: value,
			tsLastUpdate: tsLastUpdate,
		});
	}

	/**
	 * Removes the item statistics.
	 * @param key Provides the key value used by this operation.
	 */
	public removeItemStatistics(key: string): void {
		if (this.itemStatistics.has(key)) {
			this.itemStatistics.delete(key);

			return this.unset(TradeInventory._itemStatistics + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
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

		this.set(TradeInventory._removeStatus, this.removeStatus);
	}

	/**
	 * Returns all prices.
	 * @returns Returns all prices.
	 */
	public getAllPrices(): Map<string, CurrencyItem> {
		return this.prices;
	}

	/**
	 * Checks whether price exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPrice(key: string): boolean {
		return this.prices.has(key);
	}

	/**
	 * Returns the price.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the price.
	 */
	public getPrice(key: string): CurrencyItem {
		return this.prices.get(key);
	}

	/**
	 * Sets the price.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setPrice(key: string, value: number): void {
		this.prices.set(key, {
			value: value
		});

		this.set(TradeInventory._prices + DataObjectBase.DOT + key, {
			value: value
		});
	}

	/**
	 * Removes the price.
	 * @param key Provides the key value used by this operation.
	 */
	public removePrice(key: string): void {
		if (this.prices.has(key)) {
			this.prices.delete(key);

			return this.unset(TradeInventory._prices + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}
}
