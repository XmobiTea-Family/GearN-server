export interface GroupFindOptions {
    groupId?: boolean,
    groupCatalogId?: boolean,
    maxMembers?: boolean,
    members?: boolean,
    removeStatus?: boolean,

    segments?: boolean,
    scriptData?: boolean,
    privateData?: boolean,
    displayName?: boolean,
    avatar?: boolean,
    tsCreate?: boolean,
    tags?: boolean,
    
    groupDatas?: boolean,
    groupCurrencies?: boolean,
    groupStatistics?: boolean,
    groupInventories?: boolean,
}
