/**
 * Enumerates the lifecycle state of a group membership.
 */
export enum GroupStatus {
	/**
	 * The target player/character is already an active member of the group.
	 */
	Member = 1,

	/**
	 * The target is waiting for the group side to accept the join request.
	 */
	WaitingAccept = 2,

	/**
	 * The target already sent a join request and is waiting for approval.
	 */
	SentRequestAndWaitingAccept = 3,

	/**
	 * No active group membership exists.
	 */
	NotMember = 4,

}
