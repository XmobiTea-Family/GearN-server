import * as mongodb from "mongodb";

import { DataObjectBase } from "./DataObjectBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";

/**
 * An item instance in someone's inventory, belonging to an owner (player or group).
 * This is the full entity with amount, owner, item datas, statistics... — distinct from InventoryItem (the lightweight reference).
 */
export class Inventory extends DataObjectBase {
    /** MongoDB field name for the current item amount. */
    private static readonly _amount: string = "amount";
    /** MongoDB field name for itemId (business key identifying the item instance). */
    private static readonly _itemId: string = "itemId";
    /** MongoDB field name for classId (the configuration class the item belongs to). */
    private static readonly _classId: string = "classId";
    /** MongoDB field name for catalogId (the original template the item was created from). */
    private static readonly _catalogId: string = "catalogId";
    /** MongoDB field name for itemType (usage kind: stackable, unique, equippable...). */
    private static readonly _itemType: string = "itemType";
    /** MongoDB field name for the item's owner. */
    private static readonly _owner: string = "owner";

    /** MongoDB field name for the item's custom data array (free-form extensions). */
    private static readonly _itemDatas: string = "itemDatas";
    /** MongoDB field name for the item's statistics map (use count, kill count...). */
    private static readonly _itemStatistics: string = "itemStatistics";

    /** MongoDB field name for the soft-delete state. */
    private static readonly _removeStatus: string = "removeStatus";

    /** Item instance id; immutable after creation, the unique business key. */
    private readonly itemId: string;
    /** Item class id (weapon, armor, consumable...); immutable so the class configuration reference stays accurate. */
    private readonly classId: string;
    /** Catalog (template) id the item was created from; immutable. */
    private readonly catalogId: string;
    /** Item usage kind per the business enum (1 = stackable, 2 = unique, ...); immutable. */
    private readonly itemType: number;

    /** Current item count in this inventory entry; always 1 for unique items. */
    private amount: number;

    /** Current owner of the item (player or group); changes on trade/transfer. */
    private owner: OwnerItem;

    /** Per-item custom data as key-value extensions (e.g. enchant level, durability...). */
    private itemDatas: Map<string, DataValueType>;
    /** Map of per-item statistics (kills, uses...). */
    private itemStatistics: Map<string, StatisticsItem>;

    /** Soft-delete state; null means the item is still active. */
    private removeStatus: RemoveStatusItem;

    /**
     * Initializes a new inventory instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
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
    private setDocumentInventory(result: mongodb.WithId<mongodb.Document>) {
        this.amount = result[Inventory._amount];
        this.owner = result[Inventory._owner];
        this.itemDatas = result[Inventory._itemDatas] != null ? new Map(Object.entries(result[Inventory._itemDatas])) : null;
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
    public changeAmount(amount: number): void {
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
    public getAllItemDatas(): Map<string, DataValueType> {
        return this.itemDatas;
    }

    /**
     * Checks whether item data exists.
     * @param key Provides the key value used by this operation.
     * @returns Returns the operation result.
     */
    public hasItemData(key: string): boolean {
        return this.itemDatas.has(key);
    }

    /**
     * Returns the item data.
     * @param key Provides the key value used by this operation.
     * @returns Returns the item data.
     */
    public getItemData(key: string): DataValueType {
        return this.itemDatas.get(key);
    }

    /**
     * Sets the item data.
     * @param key Provides the key value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    public setItemData(key: string, value: DataValueType): void {
        this.itemDatas.set(key, value);

        this.set(Inventory._itemDatas + DataObjectBase.DOT + key, value);
    }

    /**
     * Removes the item data.
     * @param key Provides the key value used by this operation.
     */
    public removeItemData(key: string): void {
        this.itemDatas.delete(key);

        this.unset(Inventory._itemDatas + DataObjectBase.DOT + key);
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
            value: thisItemStatistics != null ? thisItemStatistics.value + amount : amount,
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
            value: value,
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
