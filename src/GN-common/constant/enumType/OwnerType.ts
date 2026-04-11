/**
 * Enumerates which top-level entity currently owns another resource.
 */
export enum OwnerType {
	/**
	 * The owner is a master-player account.
	 */
	MasterPlayer = 1,

	/**
	 * The owner is a game-player entity.
	 */
	GamePlayer = 2,

	/**
	 * The owner is a character-player entity.
	 */
	CharacterPlayer = 3,

	/**
	 * The owner is a group entity.
	 */
	Group = 4,

	/**
	 * The owner is another inventory item.
	 */
	Inventory = 5,

	/**
	 * The owner is a store-inventory entity.
	 */
	StoreInventory = 6,

}
