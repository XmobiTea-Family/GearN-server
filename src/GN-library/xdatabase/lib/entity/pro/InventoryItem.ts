/**
 * Lightweight reference to an inventory item owned by an entity (player, group...).
 * Used to display inventory listings without loading the full Inventory entity for each item.
 */
export interface InventoryItem {
	/** Unique item instance id; used to load the full Inventory entity for detailed operations. */
	itemId: string;
	/** Catalog id identifying the item template (sword_001, potion_hp...). */
	catalogId: string;
	/** Class id grouping items by configuration (weapon, armor, consumable...). */
	classId: string;
}
