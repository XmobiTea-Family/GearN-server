export interface GroupFindOptions {
	groupId?: boolean,
	groupType?: boolean,
	catalogId?: boolean,
	members?: boolean,
	removeStatus?: boolean,

	segments?: boolean,
	customDatas?: boolean,
	displayName?: boolean,
	avatar?: boolean,
	tsCreate?: boolean,
	tags?: boolean,

	groupDatas?: boolean,
	groupCurrencies?: boolean,
	groupStatistics?: boolean,
	groupInventories?: boolean,
}
