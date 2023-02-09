export interface InventoryFindOptions {
    itemId?: boolean,
    catalogId?: boolean,
    classId?: boolean,
    itemType?: boolean,
    amount?: boolean,
    owner?: boolean,
    removeStatus?: boolean,

    segments?: boolean,
    customDatas?: boolean,
    displayName?: boolean,
    avatar?: boolean,
    tsCreate?: boolean,
    tags?: boolean,

    itemDatas?: boolean,
    itemStatistics?: boolean,
}
