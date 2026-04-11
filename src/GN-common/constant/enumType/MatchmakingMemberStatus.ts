/**
 * Enumerates the state of one member inside a matchmaking ticket.
 */
export enum MatchmakingMemberStatus {
	/**
	 * The member was declared for the ticket but has not joined/confirmed yet.
	 */
	Pending = 1,

	/**
	 * The member successfully joined the ticket.
	 */
	Joined = 2,

	/**
	 * The member canceled participation in the ticket.
	 */
	Canceled = 3,

}
