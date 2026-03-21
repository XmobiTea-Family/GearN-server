import { DataValueType } from "./type/DataValueType";

export interface DataItem {
	// Stores the key value used by this contract.
	key: string;
	// Stores the value value used by this contract.
	value: DataValueType;
}
