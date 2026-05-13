/**
 * Projection options for querying GamePlayer from MongoDB.
 * Lets callers load only the profile, or the full characters/inventories/groups/friends surface as needed.
 */
export interface GamePlayerFindOptions {
    /** Whether to include the userId (player id within the game). */
    userId?: boolean;
    /** Whether to include the segments array. */
    segments?: boolean;
    /** Whether to include the custom datas (DataObjectBase-level). */
    customDatas?: boolean;
    /** Whether to include the display name. */
    displayName?: boolean;
    /** Whether to include the avatar. */
    avatar?: boolean;
    /** Whether to include the in-game player creation timestamp. */
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
