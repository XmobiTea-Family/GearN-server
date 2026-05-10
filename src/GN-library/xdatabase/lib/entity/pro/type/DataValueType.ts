/**
 * Versatile data type that can store configuration values or arbitrary data attached to players/game objects.
 * Supports primitives (string, number, boolean, null), nested key-value objects, and arrays of the same union.
 * Used for custom data fields, matchmaking attributes, and other dynamic values persisted in MongoDB.
 */
export type DataValueType = string | number | boolean | null | { [k: string]: DataValueType } | Array<DataValueType>;
