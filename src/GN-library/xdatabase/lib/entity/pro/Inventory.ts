import * as mongoDB from "mongodb";

import { DataItem } from "./DataItem";
import { DataObjectBase } from "./DataObjectBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";

export class Inventory extends DataObjectBase {
	private static readonly _amount: string = "amount";
	private static readonly _itemId: string = "itemId";
	private static readonly _classId: string = "classId";
	private static readonly _catalogId: string = "catalogId";
	private static readonly _itemType: string = "itemType";
	private static readonly _owner: string = "owner";

	private static readonly _itemDatas: string = "itemDatas";
	private static readonly _itemStatistics: string = "itemStatistics";

	private static readonly _removeStatus: string = "removeStatus";

	private readonly itemId: string;
	private readonly classId: string;
	private readonly catalogId: string;
	private readonly itemType: number;

	private amount: number;

	private owner: OwnerItem;

	private itemDatas: Array<DataItem>;
	private itemStatistics: Map<string, StatisticsItem>;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.itemId = result[Inventory._itemId];
		this.classId = result[Inventory._classId];
		this.catalogId = result[Inventory._catalogId];
		this.itemType = result[Inventory._itemType];

		this.setDocumentInventory(result);
	}

	private setDocumentInventory(result: mongoDB.WithId<mongoDB.Document>) {

		this.amount = result[Inventory._amount];
		this.owner = result[Inventory._owner];
		this.itemDatas = result[Inventory._itemDatas];
		this.itemStatistics = result[Inventory._itemStatistics] != null ? new Map(Object.entries(result[Inventory._itemStatistics])) : null;
		this.removeStatus = result[Inventory._removeStatus];
	}

	public getItemId(): string {
		return this.itemId;
	}

	public getClassId(): string {
		return this.classId;
	}

	public getCatalogId(): string {
		return this.catalogId;
	}

	public getItemType(): number {
		return this.itemType;
	}

	public getAmount(): number {
		return this.amount;
	}

	public setAmount(amount: number): void {
		this.amount = amount;

		this.set(Inventory._amount, this.amount);
	}

	public getOwner(): OwnerItem {
		return this.owner;
	}

	public setOwner(ownerId: string, ownerType: number): void {
		this.owner = {
			id: ownerId,
			type: ownerType,
		};

		this.set(Inventory._owner, this.owner);
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

		this.set(Inventory._itemDatas, this.itemDatas);
	}

	public removeItemData(key: string): void {
		let itemDataItem = this.itemDatas.find(x => x.key == key);
		if (itemDataItem != null) {
			let indexOf = this.itemDatas.indexOf(itemDataItem);
			if (indexOf != -1) {
				this.itemDatas.splice(indexOf, 1);

				return this.set(Inventory._itemDatas, this.itemDatas);
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

	public changeItemStatistics(key: string, value: number, tsLastUpdate: number): void {
		this.itemStatistics.set(key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});

		this.removeSet(Inventory._itemStatistics);
		this.set(Inventory._itemStatistics + DataObjectBase.DOT + key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});
	}

	public removeItemStatistics(key: string): void {
		if (this.itemStatistics.has(key)) {
			this.itemStatistics.delete(key);

			return this.unset(Inventory._itemStatistics + DataObjectBase.DOT + key);
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

		this.set(Inventory._removeStatus, this.removeStatus);
	}
}
