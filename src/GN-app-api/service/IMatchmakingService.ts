import { DataValueType } from "./../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";

export interface MatchmakingTicketCanMatch {
    // Stores the match ID value used by this contract.
    matchId: string;
    // Stores the queue name value used by this contract.
    queueName: string;
    // Stores the match size value used by this contract.
    matchSize: {
        // Stores the min value used by this contract.
        min: number;
        // Stores the max value used by this contract.
        max: number;
    };
    // Stores the ticket IDs list used by this contract.
    ticketIds: string[];
    // Stores the member IDs list used by this contract.
    memberIds: string[];
    // Stores the temp ticket IDs list used by this contract.
    tempTicketIds: string[];
    // Stores the temp member IDs list used by this contract.
    tempMemberIds: string[];
    // Stores the timestamp create value used by this contract.
    tsCreate: number;
    // Stores the status value used by this contract.
    status: number;
    // Stores the matchmaking ticket teams list used by this contract.
    matchmakingTicketTeams: {
        // Stores the team ID value used by this contract.
        teamId: string;
        // Stores the tickets list used by this contract.
        tickets: {
            // Stores the ticket ID value used by this contract.
            ticketId: string;
            // Stores the member count value used by this contract.
            memberCount: number;
        }[];
        // Stores the members list used by this contract.
        members: {
            // Indicates whether r ID should be used.
            userId: string;
            // Stores the attribute for queue collection used by this contract.
            attributeForQueue: { [k: string]: DataValueType };
        }[];

        // Stores the temp tickets list used by this contract.
        tempTickets: {
            // Stores the ticket ID value used by this contract.
            ticketId: string;
            // Stores the member count value used by this contract.
            memberCount: number;
        }[];
        // Stores the temp members list used by this contract.
        tempMembers: {
            // Indicates whether r ID should be used.
            userId: string;
            // Stores the attribute for queue collection used by this contract.
            attributeForQueue: { [k: string]: DataValueType };
        }[];

        // Stores the team size value used by this contract.
        teamSize: {
            // Stores the min value used by this contract.
            min: number;
            // Stores the max value used by this contract.
            max: number;
        };
    }[];
}

export interface IMatchmakingService {
    /**
     * Executes the handle workflow.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    handle(gameId: string): Promise<MatchmakingTicketCanMatch[]>;
}
