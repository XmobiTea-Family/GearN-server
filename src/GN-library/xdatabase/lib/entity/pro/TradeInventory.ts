import * as mongoDB from "mongodb";

import { DataItem } from "./DataItem";
import { DataObjectBase } from "./DataObjectBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";
import { CurrencyItem } from "./CurrencyItem";
import { InventoryItem } from "./InventoryItem";

export class TradeInventory extends DataObjectBase {
	private static readonly _tradeId: string = "tradeId";
	private static readonly _tradeItems: string = "tradeItems";
	private static readonly _owner: string = "owner";
	private static readonly _buyer: string = "buyer";
	private static readonly _tsBuy: string = "tsBuy";
	private static readonly _prices: string = "prices";

	private static readonly _itemDatas: string = "itemDatas";
	private static readonly _itemStatistics: string = "itemStatistics";

	private static readonly _removeStatus: string = "removeStatus";

	private readonly tradeId: string;

	private tradeItems: Array<InventoryItem>;
	private owner: OwnerItem;
	private buyer: OwnerItem;
	private tsBuy: number;
	private prices: Map<string, CurrencyItem>;

	private itemDatas: Array<DataItem>;
	private itemStatistics: Map<string, StatisticsItem>;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.tradeId = result[TradeInventory._tradeId];

		this.setDocumentTradeInventory(result);
	}

	private setDocumentTradeInventory(result: mongoDB.WithId<mongoDB.Document>) {

		this.tradeItems = result[TradeInventory._tradeItems];
		this.owner = result[TradeInventory._owner];
		this.buyer = result[TradeInventory._buyer];
		this.tsBuy = result[TradeInventory._tsBuy];
		this.prices = result[TradeInventory._prices] != null ? new Map(Object.entries(result[TradeInventory._prices])) : null;

		this.itemDatas = result[TradeInventory._itemDatas];
		this.itemStatistics = result[TradeInventory._itemStatistics] != null ? new Map(Object.entries(result[TradeInventory._itemStatistics])) : null;

		this.removeStatus = result[TradeInventory._removeStatus];
	}

	public getTradeId(): string {
		return this.tradeId;
	}

	public getAllTradeItems(): Array<InventoryItem> {
		return this.tradeItems;
	}

	public hasTradeItem(itemId: string): boolean {
		return this.tradeItems.find(x => x.itemId == itemId) != null;
	}

	public getTradeItem(itemId: string): InventoryItem {
		return this.tradeItems.find(x => x.itemId == itemId);
	}

	public setTradeItem(itemId: string, catalogId: string, classId: string): void {
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

	public removeTradeItem(itemId: string): void {
		let tradeItem = this.tradeItems.find(x => x.itemId == itemId);
		if (tradeItem != null) {
			let indexOf = this.tradeItems.indexOf(tradeItem);
			if (indexOf != -1) {
				this.tradeItems.splice(indexOf, 1);

				return this.set(TradeInventory._tradeItems, this.tradeItems);
			}
		}

		throw Error("can not found the item to remove");
	}

	public getOwner(): OwnerItem {
		return this.owner;
	}

	public setOwner(ownerId: string, ownerType: number): void {
		this.owner = {
			id: ownerId,
			type: ownerType,
		};

		this.set(TradeInventory._owner, this.owner);
	}

	public getBuyer(): OwnerItem {
		return this.buyer;
	}

	public setBuyer(buyerId: string, buyerType: number): void {
		this.buyer = {
			id: buyerId,
			type: buyerType,
		};

		this.set(TradeInventory._buyer, this.buyer);
	}

	public setTsBuy(tsBuy: number): void {
		this.tsBuy = tsBuy;

		this.set(TradeInventory._tsBuy, this.tsBuy);
	}

	public getAllItemDatas(): Array<DataItem> {
		return this.itemDatas;
	}

	public hasItemData(key: string): boolean {
		return this.getItemData(key) != null;
	}

	public getItemData(key: string): DataItem {
		return this.itemDatas.find(x => x.key == key);
	}

	public setItemData(key: string, value: DataValueType): void {
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

	public removeItemData(key: string): void {
		let itemDataItem = this.itemDatas.find(x => x.key == key);
		if (itemDataItem != null) {
			let indexOf = this.itemDatas.indexOf(itemDataItem);
			if (indexOf != -1) {
				this.itemDatas.splice(indexOf, 1);

				return this.set(TradeInventory._itemDatas, this.itemDatas);
			}
		}

		throw Error("can not found the key to remove");
	}

	public getAllItemStatistics(): Map<string, StatisticsItem> {
		return this.itemStatistics;
	}

	public hasItemStatistics(key: string): boolean {
		return this.itemStatistics.has(key);
	}

	public getItemStatistics(key: string): StatisticsItem {
		return this.itemStatistics.get(key);
	}

	public setItemStatistics(key: string, value: number, tsLastUpdate: number): void {
		this.itemStatistics.set(key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});

		this.removeSet(TradeInventory._itemStatistics);
		this.set(TradeInventory._itemStatistics + DataObjectBase.DOT + key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});
	}

	public removeItemStatistics(key: string): void {
		if (this.itemStatistics.has(key)) {
			this.itemStatistics.delete(key);

			return this.unset(TradeInventory._itemStatistics + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}

	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(TradeInventory._removeStatus, this.removeStatus);
	}

	public getAllPrices(): Map<string, CurrencyItem> {
		return this.prices;
	}

	public hasPrice(key: string): boolean {
		return this.prices.has(key);
	}

	public getPrice(key: string): CurrencyItem {
		return this.prices.get(key);
	}

	public setPrice(key: string, value: number): void {
		this.prices.set(key, {
			value: value
		});

		this.removeSet(TradeInventory._prices);
		this.set(TradeInventory._prices + DataObjectBase.DOT + key, {
			value: value
		});
	}

	public removePrice(key: string): void {
		if (this.prices.has(key)) {
			this.prices.delete(key);

			return this.unset(TradeInventory._prices + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}
}
