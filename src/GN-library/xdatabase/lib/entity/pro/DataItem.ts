import { DataValueType } from "./type/DataValueType";

/**
 * Arbitrary key-value data entry attached to an entity (player, group, item, store...).
 * Lets gameplay code persist extension fields without altering the database schema.
 */
export interface DataItem {
	/** Identifier of the data entry, unique within the owner scope (player/group/item/store). */
	key: string;
	/** Data value, accepting any primitive, nested object, or array allowed by `DataValueType`. */
	value: DataValueType;
}
