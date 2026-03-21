import { DataValueType } from "./type/DataValueType";

export interface MatchMember {
    // Stores the team ID value used by this contract.
    teamId: string;
    // Indicates whether r ID should be used.
    userId: string;
    // Stores the attribute collection used by this contract.
    attribute: Map<string, DataValueType>;
}
