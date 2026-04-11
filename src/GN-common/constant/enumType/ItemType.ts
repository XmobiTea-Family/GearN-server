/**
 * Enumerates whether an inventory item supports stacking.
 */
export enum ItemType {
	/**
	 * Each item instance is unique and tracked separately.
	 */
	NonStackable = 1,

	/**
	 * Multiple units can be aggregated into a single item amount.
	 */
	Stackable = 2,

}
