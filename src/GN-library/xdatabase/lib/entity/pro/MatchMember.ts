import { DataValueType } from "./type/DataValueType";

export interface MatchMember {
    teamId: string;
    userId: string;
    attribute: Map<string, DataValueType>;
}
