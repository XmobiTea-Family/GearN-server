/**
 * Lightweight reference to a group the player belongs to.
 * Stored in `playerGroups` on GamePlayerBase so the player's group list can be displayed without querying the group collection.
 */
export interface GroupItem {
    /** Group identifier; used to load the full Group entity when detailed access is needed. */
    groupId: string;
    /** Catalog id describing the group kind (guild, clan, party...). */
    catalogId: string;
    /** Player membership state inside the group, matching the GroupStatus enum (e.g. pending invite, member, left). */
    status: number; // GroupStatus
    /** Epoch ms of the most recent status change; supports filtering and sync of recent updates. */
    tsLastStatusUpdate: number;
}
