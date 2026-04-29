/**
 * Projection options for querying StoreInventory from MongoDB.
 * Useful for store listings — skip irrelevant fields to keep response sizes small.
 */
export interface StoreInventoryFindOptions {
	/** Whether to include the storeId. */
	storeId?: boolean,
	/** Whether to include the items the store sells. */
	storeItems?: boolean,
	/** Whether to include the storeItemType (store entry kind). */
	storeItemType?: boolean,
	/** Whether to include the currencies granted on purchase (`storeCurrencies`). */
	storeCurrencies?: boolean,
	/** Whether to include the price currencies (`priceCurrencies`). */
	priceCurrencies?: boolean,
	/** Whether to include the IAP configuration. */
	inAppPurchase?: boolean,
	/** Whether to include the soft-delete state (store entry disabled). */
	removeStatus?: boolean,

	/** Whether to include the store entry display name. */
	displayName?: boolean,
	/** Whether to include the store entry avatar/icon. */
	avatar?: boolean,
	/** Whether to include the store entry creation timestamp. */
	tsCreate?: boolean,
	/** Whether to include the tags map. */
	tags?: boolean,

	/** Whether to include the store-scoped custom data list (`storeDatas`). */
	storeDatas?: boolean,
}
