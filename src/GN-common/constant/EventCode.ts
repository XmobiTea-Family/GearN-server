/**
 * Enumerates server event codes pushed through the authenticated socket channel.
 * These names are consumed by the event-handler layer to route realtime updates.
 */
export class EventCode {
	/**
	 * Realtime update for game-player friend relationships.
	 */
	public static readonly OnGamePlayerFriendUpdate: string = "onGamePlayerFriendUpdate";

	/**
	 * Realtime update for character-player friend relationships.
	 */
	public static readonly OnCharacterPlayerFriendUpdate: string = "onCharacterPlayerFriendUpdate";

	/**
	 * Realtime update for game-player group relationships.
	 */
	public static readonly OnGamePlayerGroupUpdate: string = "onGamePlayerGroupUpdate";

	/**
	 * Realtime update for the member list of a group.
	 */
	public static readonly OnGroupMemberUpdate: string = "onGroupMemberUpdate";

	/**
	 * Realtime update for group chat/message pushes.
	 */
	public static readonly OnGroupMessageUpdate: string = "onGroupMessageUpdate";

	/**
	 * Realtime update for character-player group relationships.
	 */
	public static readonly OnCharacterPlayerGroupUpdate: string = "onCharacterPlayerGroupUpdate";

}
