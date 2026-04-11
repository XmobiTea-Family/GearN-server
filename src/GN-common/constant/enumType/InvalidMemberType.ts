/**
 * Enumerates validation failure categories reported for invalid request members.
 */
export enum InvalidMemberType {
	/**
	 * The backend rejected the member but did not map it to a more specific validation category.
	 */
	UnknownError = 1,

	/**
	 * The member is required but missing.
	 */
	DataRequired = 2,

	/**
	 * The member type does not match the expected runtime type.
	 */
	TypeInvalid = 3,

	/**
	 * A required string member is null or empty when null is not allowed.
	 */
	StringNull = 4,

	/**
	 * A string member is shorter than the configured minimum length.
	 */
	StringMinLength = 5,

	/**
	 * A string member is longer than the configured maximum length.
	 */
	StringMaxLength = 6,

	/**
	 * A numeric member is lower than the configured minimum value.
	 */
	NumberMinValue = 7,

	/**
	 * A numeric member is higher than the configured maximum value.
	 */
	NumberMaxValue = 8,

	/**
	 * A numeric member must be an integer but received a non-integer value.
	 */
	NumberMustInt = 9,

	/**
	 * A required `GNHashtable` member is null.
	 */
	GNHashtableNull = 10,

	/**
	 * A `GNHashtable` member contains fewer entries than allowed.
	 */
	GNHashtableMinLength = 11,

	/**
	 * A `GNHashtable` member contains more entries than allowed.
	 */
	GNHashtableMaxLength = 12,

	/**
	 * A required `GNArray` member is null.
	 */
	GNArrayNull = 13,

	/**
	 * A `GNArray` member contains fewer items than allowed.
	 */
	GNArrayMinLength = 14,

	/**
	 * A `GNArray` member contains more items than allowed.
	 */
	GNArrayMaxLength = 15,

}
