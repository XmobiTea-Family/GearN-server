/**
 * Enumerates how a configured data item can be written after creation.
 */
export enum PermissionDataItem {
	/**
	 * The value can be read but should not be overridden by normal write flows.
	 */
	ReadOnly = 1,

	/**
	 * The value can be written again and override the previous value.
	 */
	CanOverride = 2,

}
