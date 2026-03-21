export interface InventoryFindOptions {
	// Indicates whether item ID.
	itemId?: boolean,
	// Indicates whether catalog ID.
	catalogId?: boolean,
	// Indicates whether class ID.
	classId?: boolean,
	// Indicates whether item type.
	itemType?: boolean,
	// Indicates whether amount.
	amount?: boolean,
	// Indicates whether owner.
	owner?: boolean,
	// Indicates whether remove status.
	removeStatus?: boolean,

	// Indicates whether segments.
	segments?: boolean,
	// Indicates whether custom datas.
	customDatas?: boolean,
	// Indicates whether display name.
	displayName?: boolean,
	// Indicates whether avatar.
	avatar?: boolean,
	// Indicates whether timestamp create.
	tsCreate?: boolean,
	// Indicates whether tags.
	tags?: boolean,

	// Indicates whether item datas.
	itemDatas?: boolean,
	// Indicates whether item statistics.
	itemStatistics?: boolean,
}
