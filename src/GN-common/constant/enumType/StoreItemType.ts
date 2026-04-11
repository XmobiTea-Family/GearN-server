/**
 * Enumerates whether a store item can be purchased once or many times.
 */
export enum StoreItemType {
	/**
	 * The buyer should only own one persistent purchase of this item.
	 */
	NonConsumable = 1,

	/**
	 * The item can be purchased repeatedly and consumed.
	 */
	Consumable = 2,

}
