/**
 * Projection options for querying Group from MongoDB.
 * Lets callers pick the fields they actually need; especially useful when listing groups (no need for inventory/statistics).
 */
export interface GroupFindOptions {
    /** Whether to include the groupId. */
    groupId?: boolean;
    /** Whether to include the group kind (`groupType`). */
    groupType?: boolean;
    /** Whether to include the catalogId (group template). */
    catalogId?: boolean;
    /** Whether to include the group member list. */
    members?: boolean;
    /** Whether to include the soft-delete state. */
    removeStatus?: boolean;

    /** Whether to include the segments array (cohort labels). */
    segments?: boolean;
    /** Whether to include the custom datas (DataObjectBase-level). */
    customDatas?: boolean;
    /** Whether to include the group display name. */
    displayName?: boolean;
    /** Whether to include the group avatar. */
    avatar?: boolean;
    /** Whether to include the group creation timestamp. */
    tsCreate?: boolean;
    /** Whether to include the tags map. */
    tags?: boolean;

    /** Whether to include the group-scoped custom data list (`groupDatas`). */
    groupDatas?: boolean;
    /** Whether to include the group currency map. */
    groupCurrencies?: boolean;
    /** Whether to include the group statistics map. */
    groupStatistics?: boolean;
    /** Whether to include the group-shared inventory list. */
    groupInventories?: boolean;
}
