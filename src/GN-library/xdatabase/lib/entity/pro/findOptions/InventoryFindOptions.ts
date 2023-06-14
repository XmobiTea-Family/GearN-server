export interface InventoryFindOptions {
    itemId?: boolean,
    itemCatalogId?: boolean,
    itemType?: boolean,
    owner?: boolean,
    removeStatus?: boolean,

    segments?: boolean,
    scriptData?: boolean,
    privateData?: boolean,
    displayName?: boolean,
    avatar?: boolean,
    tsCreate?: boolean,
    tags?: boolean,
    
    itemDatas?: boolean,
    itemStatistics?: boolean,
}
