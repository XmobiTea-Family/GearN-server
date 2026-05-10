/**
 * Projection options for querying Inventory from MongoDB.
 * Useful when listing many items: load just id/amount/owner to keep the payload small, skipping datas/statistics.
 */
export interface InventoryFindOptions {
    /** Whether to include the itemId (instance). */
    itemId?: boolean;
    /** Whether to include the catalogId (item template). */
    catalogId?: boolean;
    /** Whether to include the classId (item grouping). */
    classId?: boolean;
    /** Whether to include the itemType (usage kind). */
    itemType?: boolean;
    /** Whether to include the amount. */
    amount?: boolean;
    /** Whether to include the owner information. */
    owner?: boolean;
    /** Whether to include the soft-delete state. */
    removeStatus?: boolean;

    /** Whether to include the segments array. */
    segments?: boolean;
    /** Whether to include the custom datas (DataObjectBase-level). */
    customDatas?: boolean;
    /** Whether to include the display name (item override). */
    displayName?: boolean;
    /** Whether to include the avatar (icon). */
    avatar?: boolean;
    /** Whether to include the item creation timestamp. */
    tsCreate?: boolean;
    /** Whether to include the tags map. */
    tags?: boolean;

    /** Whether to include the item-scoped custom data list (`itemDatas`). */
    itemDatas?: boolean;
    /** Whether to include the item statistics map (`itemStatistics`). */
    itemStatistics?: boolean;
}
