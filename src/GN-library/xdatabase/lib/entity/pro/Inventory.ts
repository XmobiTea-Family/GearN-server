import * as mongoDB from "mongodb";

import { DataItem } from "./DataItem";
import { DataObjectBase } from "./DataObjectBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";

export class Inventory extends DataObjectBase {
	// Defines the internal field key for amount.
	private static readonly _amount: string = "amount";
	// Defines the internal field key for item ID.
	private static readonly _itemId: string = "itemId";
	// Defines the internal field key for class ID.
	private static readonly _classId: string = "classId";
	// Defines the internal field key for catalog ID.
	private static readonly _catalogId: string = "catalogId";
	// Defines the internal field key for item type.
	private static readonly _itemType: string = "itemType";
	// Defines the internal field key for owner.
	private static readonly _owner: string = "owner";

	// Defines the internal field key for item datas.
	private static readonly _itemDatas: string = "itemDatas";
	// Defines the internal field key for item statistics.
	private static readonly _itemStatistics: string = "itemStatistics";

	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";

	// Stores the item ID value used by this instance.
	private readonly itemId: string;
	// Stores the class ID value used by this instance.
	private readonly classId: string;
	// Stores the catalog ID value used by this instance.
	private readonly catalogId: string;
	// Stores the item type value used by this instance.
	private readonly itemType: number;

	// Stores the amount value used by this instance.
	private amount: number;

	// Stores the owner value used by this instance.
	private owner: OwnerItem;

	// Stores the item datas value used by this instance.
	private itemDatas: Array<DataItem>;
	// Stores the item statistics collection used by this instance.
	private itemStatistics: Map<string, StatisticsItem>;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new inventory instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.itemId = result[Inventory._itemId];
		this.classId = result[Inventory._classId];
		this.catalogId = result[Inventory._catalogId];
		this.itemType = result[Inventory._itemType];

		this.setDocumentInventory(result);
	}

	/**
	 * Sets the document inventory.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentInventory(result: mongoDB.WithId<mongoDB.Document>) {

		this.amount = result[Inventory._amount];
		this.owner = result[Inventory._owner];
		this.itemDatas = result[Inventory._itemDatas];
		this.itemStatistics = result[Inventory._itemStatistics] != null ? new Map(Object.entries(result[Inventory._itemStatistics])) : null;
		this.removeStatus = result[Inventory._removeStatus];
	}

	/**
	 * Returns the item ID.
	 * @returns Returns the item ID.
	 */
	public getItemId(): string {
		return this.itemId;
	}

	/**
	 * Returns the class ID.
	 * @returns Returns the class ID.
	 */
	public getClassId(): string {
		return this.classId;
	}

	/**
	 * Returns the catalog ID.
	 * @returns Returns the catalog ID.
	 */
	public getCatalogId(): string {
		return this.catalogId;
	}

	/**
	 * Returns the item type.
	 * @returns Returns the item type.
	 */
	public getItemType(): number {
		return this.itemType;
	}

	/**
	 * Returns the amount.
	 * @returns Returns the amount.
	 */
	public getAmount(): number {
		return this.amount;
	}

	/**
	 * Sets the amount.
	 * @param amount Provides the amount value used by this operation.
	 */
	public setAmount(amount: number): void {
		this.amount = amount;

		this.set(Inventory._amount, this.amount);
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

		this.set(Inventory._owner, this.owner);
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

		this.set(Inventory._itemDatas, this.itemDatas);
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

				return this.set(Inventory._itemDatas, this.itemDatas);
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
			value: thisItemStatistics != null ? (thisItemStatistics.value + amount) : amount,
			tsLastUpdate: tsLastUpdate,
		});

		// Stores the field value used in the current execution flow.
		const field = Inventory._itemStatistics + DataObjectBase.DOT + key;
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
			tsLastUpdate: tsLastUpdate,
			value: value
		});

		// Stores the field value used in the current execution flow.
		const field = Inventory._itemStatistics + DataObjectBase.DOT + key;
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

			return this.unset(Inventory._itemStatistics + DataObjectBase.DOT + key);
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

		this.set(Inventory._removeStatus, this.removeStatus);
	}
}
