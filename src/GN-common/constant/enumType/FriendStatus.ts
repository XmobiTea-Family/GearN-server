/**
 * Enumerates the lifecycle state of a friend relationship.
 */
export enum FriendStatus {
	/**
	 * The relationship is active and both sides are friends.
	 */
	Friend = 1,

	/**
	 * The current entity is waiting for the other side to accept the incoming request.
	 */
	WaitingAccept = 2,

	/**
	 * The current entity sent the request and is waiting for acceptance.
	 */
	SentRequestAndWaitingAccept = 3,

	/**
	 * No active friend relationship exists.
	 */
	NotFriend = 4,

}
