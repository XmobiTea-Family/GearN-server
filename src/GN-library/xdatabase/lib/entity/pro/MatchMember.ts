import { DataValueType } from "./type/DataValueType";

/**
 * Member assigned to a specific Match after matchmaking has resolved.
 * Distinct from MatchmakingTicketMember (still queueing) — this member's team is final and the match has started.
 */
export interface MatchMember {
	/** Team id assigned to the member by the matchmaking server's balancing algorithm. */
	teamId: string;
	/** Player id participating in the match; used to authenticate the client connection to the match. */
	userId: string;
	/** Extra member attributes (rank, role, skill...) consumed by gameplay/match-server logic. */
	attribute: Map<string, DataValueType>;
}
