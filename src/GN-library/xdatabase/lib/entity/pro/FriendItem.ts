export interface FriendItem {
	// Stores the friend ID value used by this contract.
	friendId: string;
	// Stores the catalog ID value used by this contract.
	catalogId: string;
	// Stores the status value used by this contract.
	status: number;	// FriendStatus
	tsLastStatusUpdate: number;
}
