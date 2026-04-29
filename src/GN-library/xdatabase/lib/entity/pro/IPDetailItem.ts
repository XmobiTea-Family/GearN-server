/**
 * Snapshot of a player's IP details captured at a point in time (typically the most recent login).
 * Used for geographic analytics, fraud risk control, and applying region-specific policies.
 */
export interface IPDetailItem {
	/** IPv4/IPv6 address recorded from the login session. */
	ipAddress: string;
	/** ISO 3166-1 alpha-2 country code (e.g. VN, US) inferred from the IP via GeoIP. */
	countryCode: string;
	/** Region/state code inferred from the IP (per the GeoIP provider taxonomy). */
	regionCode: string;
}
