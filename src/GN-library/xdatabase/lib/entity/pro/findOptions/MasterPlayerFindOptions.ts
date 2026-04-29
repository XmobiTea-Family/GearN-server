/**
 * Projection options for querying MasterPlayer (the system-wide player) from MongoDB.
 * Lets callers load only the basic profile, or the full external/email/push surface as needed.
 */
export interface MasterPlayerFindOptions {
	/** Whether to include the master userId. */
	userId?: boolean,
	/** Whether to include the most-recent login IP/region (`lastIPDetail`). */
	lastIPDetail?: boolean,
	/** Whether to include the external identity sources (device, social, account). */
	external?: boolean,
	/** Whether to include the segments array (cohort labels). */
	segments?: boolean,
	/** Whether to include the custom datas. */
	customDatas?: boolean,
	/** Whether to include the display name. */
	displayName?: boolean,
	/** Whether to include the avatar. */
	avatar?: boolean,
	/** Whether to include the account creation timestamp. */
	tsCreate?: boolean,
	/** Whether to include the tags map. */
	tags?: boolean,
	/** Whether to include the active ban (`playerBan`). */
	playerBan?: boolean,
	/** Whether to include the player currency map. */
	playerCurrencies?: boolean,
	/** Whether to include the player statistics map. */
	playerStatistics?: boolean,
	/** Whether to include the player-scoped custom data list (`playerDatas`). */
	playerDatas?: boolean,
	/** Whether to include the IP captured at account creation. */
	ipAddressCreate?: boolean,
	/** Whether to include the country code derived from the account-creation IP. */
	countryCode?: boolean,
	/** Whether to include the most-recent login timestamp. */
	tsLastLogin?: boolean,
	/** Whether to include the contact email. */
	email?: boolean,
	/** Whether to include the push-notification device list. */
	pushNotifications?: boolean,
}
