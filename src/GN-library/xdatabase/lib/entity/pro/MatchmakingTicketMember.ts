import { DataValueType } from "./type/DataValueType";

/**
 * Member of a MatchmakingTicket waiting to be matched.
 * Each member maps to one player; once a match is found, members are promoted to MatchMember inside the resulting Match entity.
 */
export interface MatchmakingTicketMember {
	/** Player id queueing inside this ticket. */
	userId: string;
	/** Member readiness state inside the ticket (e.g. pending, ready, accepted, declined). */
	status: number;
	/** Per-player attributes (rank, level, region...) used by the matchmaking engine as matching criteria. */
	attribute: { [k: string]: DataValueType };
	/** Attributes scoped to the current queue, kept separate from `attribute` because each queue may have different requirements. */
	attributeForQueue: { [k: string]: DataValueType };

}
