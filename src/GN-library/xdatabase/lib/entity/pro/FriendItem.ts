/**
 * Friend relationship record between the current player and another player.
 * Stored in `playerFriends` on GamePlayerBase to look up friend relationships quickly.
 */
export interface FriendItem {
    /** Identifier of the befriended player (the other player's `userId`). */
    friendId: string;
    /** Catalog id describing the friend relation kind (e.g. close-friend, blocked) when the system models multiple tiers. */
    catalogId: string;
    /** Current relationship state matching the FriendStatus enum (e.g. pending, accepted, blocked). */
    status: number; // FriendStatus
    /** Epoch ms of the last `status` change; used for timeline display and recent-change filtering. */
    tsLastStatusUpdate: number;
}
