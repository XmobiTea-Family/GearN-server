export interface GroupFindOptions {
	// Indicates whether group ID.
	groupId?: boolean,
	// Indicates whether group type.
	groupType?: boolean,
	// Indicates whether catalog ID.
	catalogId?: boolean,
	// Indicates whether members.
	members?: boolean,
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

	// Indicates whether group datas.
	groupDatas?: boolean,
	// Indicates whether group currencies.
	groupCurrencies?: boolean,
	// Indicates whether group statistics.
	groupStatistics?: boolean,
	// Indicates whether group inventories.
	groupInventories?: boolean,
}
