export interface GroupItem {
	// Stores the group ID value used by this contract.
	groupId: string;
	// Stores the catalog ID value used by this contract.
	catalogId: string;
	// Stores the status value used by this contract.
	status: number;		// GroupStatus
	tsLastStatusUpdate: number;
}
