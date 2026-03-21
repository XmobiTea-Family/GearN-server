export class EnumUtility {
	// Stores the enum key cache collection used by this instance.
	private static enumKeyCache: Map<object, string[]> = new Map();

	/**
	 * Returns the enum keys.
	 * @param enumType Provides the enum type value used by this operation.
	 * @returns Returns the enum keys.
	 */
	private static getEnumKeys(enumType: object): string[] {
		// Stores the keys value used in the current execution flow.
		let keys = this.enumKeyCache.get(enumType);
		if (!keys) {
			keys = Object.keys(enumType).filter(key => isNaN(Number(key)));
			this.enumKeyCache.set(enumType, keys);
		}
		return keys;
	}

	/**
	 * Executes the parse workflow.
	 * @param enumType Provides the enum type value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param ignoreCase Provides the ignore case value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static parse<T extends Record<string, number | string>>(enumType: T, value: string, ignoreCase?: boolean): T[keyof T] {
		if (!ignoreCase) {
			if (value in enumType) {
				return enumType[value as keyof T];
			}
		}
		else {
			// Stores the normalized value value used in the current execution flow.
			let normalizedValue = value.toUpperCase();
			// Stores the enum keys value used in the current execution flow.
			let enumKeys = this.getEnumKeys(enumType);

			for (const key of enumKeys) {
				if (key.toUpperCase() === normalizedValue) {
					return enumType[key as keyof T];
				}
			}
		}

		return null;
	}

	/**
	 * Executes the to string workflow.
	 * @param enumType Provides the enum type value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static toString<T extends Record<string, number | string>>(enumType: T, value: T[keyof T]): string {
		// Stores the enum keys value used in the current execution flow.
		let enumKeys = this.getEnumKeys(enumType);

		// Stores the key value used in the current execution flow.
		const key = enumKeys.find(k => enumType[k as keyof T] === value);
		return key ?? null;
	}

}
