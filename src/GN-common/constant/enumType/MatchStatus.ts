/**
 * Enumerates the lifecycle state of a matchmaking ticket.
 */
export enum MatchStatus {
	/**
	 * A match is waiting for server allocation/details.
	 */
	WaitingForServer = 1,

	/**
	 * The match completed successfully and now points to a match.
	 */
	Matched = 2,

	/**
	 * The match was canceled and will not produce a match.
	 */
	Canceled = 3,

}
