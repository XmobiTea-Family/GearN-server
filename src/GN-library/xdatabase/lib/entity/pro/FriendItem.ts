import { DataValueType } from "./type/DataValueType";

export interface FriendItem {
	friendId: string;
	friendCatalogId: string;
	status: number;	// FriendStatus
	tsLastStatusUpdate: number;
}
