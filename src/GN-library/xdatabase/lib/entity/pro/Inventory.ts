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
	private static readonly _itemCatalogId: string = "itemCatalogId";
	private static readonly _itemType: string = "itemType";
	private static readonly _owner: string = "owner";

	private static readonly _itemDatas: string = "itemDatas";
	private static readonly _itemStatistics: string = "itemStatistics";

	private static readonly _removeStatus: string = "removeStatus";

	private readonly itemId: string;
	private itemCatalogId: string;
	private itemType: number;

	private amount: number;

	private owner: OwnerItem;

	private itemDatas: Array<DataItem>;
	private itemStatistics: Map<string, StatisticsItem>;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.itemId = result[Inventory._itemId];

		this.setDocumentInventory(result);
	}

	private setDocumentInventory(result: mongoDB.WithId<mongoDB.Document>) {
		this.itemCatalogId = result[Inventory._itemCatalogId];
		this.itemType = result[Inventory._itemType];
		this.amount = result[Inventory._amount];
		this.owner = result[Inventory._owner];
		this.itemDatas = result[Inventory._itemDatas];
		this.itemStatistics = result[Inventory._itemStatistics];
		this.removeStatus = result[Inventory._removeStatus];
	}

	public getItemId(): string {
		return this.itemId;
	}

	public getItemCatalogId(): string {
		return this.itemCatalogId;
	}

	public setItemCatalogId(itemCatalogId: string): void {
		this.itemCatalogId = itemCatalogId;

		this.set(Inventory._itemCatalogId, this.itemCatalogId);
	}

	public getItemType(): number {
		return this.itemType;
	}

	public setItemType(itemType: number): void {
		this.itemType = itemType;

		this.set(Inventory._itemType, this.itemType);
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

    public setItemData(key: string, value: DataValueType, permission: number): void {
        let itemDataItem = this.itemDatas.find(x => x.key == key);
		if (itemDataItem == null) {
			itemDataItem = {
				key: key,
				value: value,
				permission: permission,
			}

			this.itemDatas.push(itemDataItem);
		}
		else {
			itemDataItem.value = value;
			itemDataItem.permission = permission;
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

    public setItemStatistics(key: string, value: number, tsLastUpdate: number): void {
        this.itemStatistics.set(key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});
		
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
