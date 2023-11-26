import { DataValueType } from "./type/DataValueType";

export interface MatchmakingTicketMember {
    userId: string;
    status: number;
    attribute: { [k: string]: DataValueType };
    attributeForQueue: { [k: string]: DataValueType };

}
