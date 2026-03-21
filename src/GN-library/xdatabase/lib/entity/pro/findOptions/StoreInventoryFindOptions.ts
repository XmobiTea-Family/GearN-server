export interface StoreInventoryFindOptions {
	// Indicates whether store ID.
	storeId?: boolean,
	// Indicates whether store items.
	storeItems?: boolean,
	// Indicates whether store item type.
	storeItemType?: boolean,
	// Indicates whether store currencies.
	storeCurrencies?: boolean,
	// Indicates whether price currencies.
	priceCurrencies?: boolean,
	// Indicates whether in app purchase.
	inAppPurchase?: boolean,
	// Indicates whether remove status.
	removeStatus?: boolean,

	// Indicates whether display name.
	displayName?: boolean,
	// Indicates whether avatar.
	avatar?: boolean,
	// Indicates whether timestamp create.
	tsCreate?: boolean,
	// Indicates whether tags.
	tags?: boolean,

	// Indicates whether store datas.
	storeDatas?: boolean,
}
