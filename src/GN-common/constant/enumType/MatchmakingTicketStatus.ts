/**
 * Enumerates the lifecycle state of a matchmaking ticket.
 */
export enum MatchmakingTicketStatus {
	/**
	 * The ticket is still waiting for all declared members to join.
	 */
	WaitingForMembers = 1,

	/**
	 * The ticket is complete and waiting for the matchmaking engine to find a match.
	 */
	WaitingForMatch = 2,

	/**
	 * A match was found and the backend is waiting for server allocation/details.
	 */
	WaitingForServer = 3,

	/**
	 * The ticket completed successfully and now points to a match.
	 */
	Matched = 4,

	/**
	 * The ticket was canceled and will not produce a match.
	 */
	Canceled = 5,

}
