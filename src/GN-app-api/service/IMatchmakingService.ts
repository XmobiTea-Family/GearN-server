import { DataValueType } from "../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";

export interface MatchmakingTicketCanMatch {
	matchId: string;
	queueName: string;
	matchSize: {
		min: number;
		max: number;
	};
	ticketIds: string[];
	memberIds: string[];
	tempTicketIds: string[];
	tempMemberIds: string[];
	tsCreate: number;
	status: number;
	matchmakingTicketTeams: {
		teamId: string,
		tickets: {
			ticketId: string;
			memberCount: number;
		}[];
		members: {
			userId: string;
			attributeForQueue: { [k: string]: DataValueType };
		}[];

		tempTickets: {
			ticketId: string;
			memberCount: number;
		}[],
		tempMembers: {
			userId: string;
			attributeForQueue: { [k: string]: DataValueType };
		}[],

		teamSize: {
			min: number;
			max: number;
		};
	}[];
}

export interface IMatchmakingService {
	handle(gameId: string): Promise<MatchmakingTicketCanMatch[]>;
}
