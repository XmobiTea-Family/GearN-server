/**
 * Projection options for querying CharacterPlayer from MongoDB.
 * Setting a flag to `true` includes the matching field in the result.
 * Omitted or `false` flags are not added to the projection.
 * The goal is to keep the response payload small when callers only need a subset of the document.
 */
export interface CharacterPlayerFindOptions {
    /** Whether to include `characterId` (the character id). */
    characterId?: boolean;
    /** Whether to include `catalogId` (the character template). */
    catalogId?: boolean;
    /** Whether to include the character's `owner`. */
    owner?: boolean;
    /** Whether to include the soft-delete state (`removeStatus`). */
    removeStatus?: boolean;
    /** Whether to include the segments array (cohort labels). */
    segments?: boolean;
    /** Whether to include custom datas (the DataObjectBase-level extension data). */
    customDatas?: boolean;
    /** Whether to include the character display name. */
    displayName?: boolean;
    /** Whether to include the character avatar. */
    avatar?: boolean;
    /** Whether to include the creation timestamp (`tsCreate`). */
    tsCreate?: boolean;
    /** Whether to include the tags map. */
    tags?: boolean;
    /** Whether to include the active ban (`playerBan`). */
    playerBan?: boolean;
    /** Whether to include the player-scoped custom data list (`playerDatas`). */
    playerDatas?: boolean;
    /** Whether to include the player currency map. */
    playerCurrencies?: boolean;
    /** Whether to include the player statistics map. */
    playerStatistics?: boolean;
    /** Whether to include the player's owned-character list. */
    playerCharacters?: boolean;
    /** Whether to include the player's inventory item list. */
    playerInventories?: boolean;
    /** Whether to include the player's group memberships. */
    playerGroups?: boolean;
    /** Whether to include the player's friend list. */
    playerFriends?: boolean;
    /** Whether to include the most-recent login timestamp. */
    tsLastLogin?: boolean;
    /** Whether to include the IP captured at account creation. */
    ipAddressCreate?: boolean;
    /** Whether to include the country code derived from the account-creation IP. */
    countryCode?: boolean;
}
