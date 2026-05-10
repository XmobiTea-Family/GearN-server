/**
 * Polymorphic owner reference for entities that may belong to several kinds of subject (player, group, system...).
 * Used by Inventory, TradeInventory, ChatMessage, CharacterPlayer to discriminate the owner kind.
 */
export interface OwnerItem {
    /** Owner identifier (userId for a player, groupId for a group, ...). */
    id: string;
    /** Owner kind per the OwnerType enum (1 = player, 2 = group...). Determines how `id` should be interpreted. */
    type: number;
}
