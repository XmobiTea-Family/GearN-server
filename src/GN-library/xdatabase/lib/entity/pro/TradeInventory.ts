import * as mongodb from "mongodb";

import { DataObjectBase } from "./DataObjectBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";
import { CurrencyItem } from "./CurrencyItem";
import { InventoryItem } from "./InventoryItem";

/**
 * A trade/sale of items between two owners in the player-to-player marketplace.
 * Holds the listed items, the asking price, seller/buyer and the completion timestamp.
 */
export class TradeInventory extends DataObjectBase {
    /** MongoDB field name for tradeId — the trade's unique business key. */
    private static readonly _tradeId: string = "tradeId";
    /** MongoDB field name for the items listed for sale/trade. */
    private static readonly _tradeItems: string = "tradeItems";
    /** MongoDB field name for the owner (the seller). */
    private static readonly _owner: string = "owner";
    /** MongoDB field name for the buyer (filled in once the trade completes). */
    private static readonly _buyer: string = "buyer";
    /** MongoDB field name for the trade-completion timestamp. */
    private static readonly _tsBuy: string = "tsBuy";
    /** MongoDB field name for the price map keyed by currency. */
    private static readonly _prices: string = "prices";

    /** MongoDB field name for the trade-scoped custom data list. */
    private static readonly _itemDatas: string = "itemDatas";
    /** MongoDB field name for the trade-related statistics map. */
    private static readonly _itemStatistics: string = "itemStatistics";

    /** MongoDB field name for the soft-delete state (trade cancelled/expired). */
    private static readonly _removeStatus: string = "removeStatus";

    /** Trade id; the unique business key; immutable after creation. */
    private readonly tradeId: string;

    /** Items listed for sale/trade in this transaction. */
    private tradeItems: Array<InventoryItem>;
    /** Owner (seller) — owns the items in `tradeItems` until the trade completes. */
    private owner: OwnerItem;
    /** Buyer — populated once the trade completes; null while the trade is still open. */
    private buyer: OwnerItem;
    /** Epoch ms at which the trade completed; null while the trade is still open. */
    private tsBuy: number;
    /** Price map keyed by currency code; value is the required amount. A trade can demand multiple currencies. */
    private prices: Map<string, CurrencyItem>;

    /** Trade-scoped key-value custom data (e.g. a note from the seller). */
    private itemDatas: Map<string, DataValueType>;
    /** Statistics map related to this trade. */
    private itemStatistics: Map<string, StatisticsItem>;

    /** Soft-delete state; present when the trade is cancelled or expired. */
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

        this.itemDatas = result[TradeInventory._itemDatas] != null ? new Map(Object.entries(result[TradeInventory._itemDatas])) : null;
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
        return this.tradeItems.find((x) => x.itemId == itemId) != null;
    }

    /**
     * Returns the trade item.
     * @param itemId Provides the item ID value used by this operation.
     * @returns Returns the trade item.
     */
    public getTradeItem(itemId: string): InventoryItem {
        return this.tradeItems.find((x) => x.itemId == itemId);
    }

    /**
     * Sets the trade item.
     * @param itemId Provides the item ID value used by this operation.
     * @param catalogId Provides the catalog ID value used by this operation.
     * @param classId Provides the class ID value used by this operation.
     */
    public setTradeItem(itemId: string, catalogId: string, classId: string): void {
        // Stores the trade item value used in the current execution flow.
        let tradeItem = this.tradeItems.find((x) => x.itemId == itemId);
        if (tradeItem == null) {
            tradeItem = {
                itemId: itemId,
                catalogId: catalogId,
                classId: classId,
            };

            this.tradeItems.push(tradeItem);
        } else {
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
        let tradeItem = this.tradeItems.find((x) => x.itemId == itemId);
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
    public getAllItemDatas(): Map<string, DataValueType> {
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

        this.set(TradeInventory._itemDatas + DataObjectBase.DOT + key, value);
    }

    /**
     * Removes the item data.
     * @param key Provides the key value used by this operation.
     */
    public removeItemData(key: string): void {
        this.itemDatas.delete(key);

        this.unset(TradeInventory._itemDatas + DataObjectBase.DOT + key);
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
            value: value,
        });

        this.set(TradeInventory._prices + DataObjectBase.DOT + key, {
            value: value,
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
