export interface MasterPlayerFindOptions {
	// Indicates whether r ID should be used.
	userId?: boolean,
	// Indicates whether last IP detail.
	lastIPDetail?: boolean,
	// Indicates whether external.
	external?: boolean,
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
	// Indicates whether player ban.
	playerBan?: boolean,
	// Indicates whether player currencies.
	playerCurrencies?: boolean,
	// Indicates whether player statistics.
	playerStatistics?: boolean,
	// Indicates whether player datas.
	playerDatas?: boolean,
	// Indicates whether IP address create.
	ipAddressCreate?: boolean,
	// Indicates whether country code.
	countryCode?: boolean,
	// Indicates whether timestamp last login.
	tsLastLogin?: boolean,
	// Indicates whether email.
	email?: boolean,
	// Indicates whether push notifications.
	pushNotifications?: boolean,
}
