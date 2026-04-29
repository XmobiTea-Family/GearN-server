/**
 * Active ban record applied to a player.
 * Used during login/auth flows; the server compares `tsExpire` with the current time to know whether the ban still applies.
 */
export interface BanItem {
	/** Epoch millisecond at which the ban expires. The ban no longer applies once `Date.now()` >= this value. */
	tsExpire: number;
	/** Reason shown to the player and kept for admin audit trail. */
	reason: string;
}
