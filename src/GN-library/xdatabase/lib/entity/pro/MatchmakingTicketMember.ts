import { DataValueType } from "./type/DataValueType";

export interface MatchmakingTicketMember {
	// Indicates whether r ID should be used.
	userId: string;
	// Stores the status value used by this contract.
	status: number;
	// Stores the attribute collection used by this contract.
	attribute: { [k: string]: DataValueType };
	// Stores the attribute for queue collection used by this contract.
	attributeForQueue: { [k: string]: DataValueType };

}
