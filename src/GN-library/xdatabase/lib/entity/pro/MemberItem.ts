/**
 * Member of a Group (guild, clan, party...).
 * Stored in the Group entity's `members` array to know who currently belongs to the group and in what state.
 */
export interface MemberItem {
	/** Player id of the member (matches the player's `userId`). */
	memberId: string;
	/** Membership state inside the group (e.g. leader, officer, member, kicked) per the business-layer enum. */
	status: number;
}
