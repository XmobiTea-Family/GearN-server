export class EnumUtility {
	private static enumKeyCache: Map<object, string[]> = new Map();

	private static getEnumKeys(enumType: object): string[] {
		let keys = this.enumKeyCache.get(enumType);
		if (!keys) {
			keys = Object.keys(enumType).filter(key => isNaN(Number(key)));
			this.enumKeyCache.set(enumType, keys);
		}
		return keys;
	}

	public static parse<T extends Record<string, number | string>>(enumType: T, value: string, ignoreCase?: boolean): T[keyof T] {
		if (!ignoreCase) {
			if (value in enumType) {
				return enumType[value as keyof T];
			}
		}
		else {
			let normalizedValue = value.toUpperCase();
			let enumKeys = this.getEnumKeys(enumType);

			for (const key of enumKeys) {
				if (key.toUpperCase() === normalizedValue) {
					return enumType[key as keyof T];
				}
			}
		}

		return null;
	}

	public static toString<T extends Record<string, number | string>>(enumType: T, value: T[keyof T]): string {
		let enumKeys = this.getEnumKeys(enumType);

		const key = enumKeys.find(k => enumType[k as keyof T] === value);
		return key ?? null;
	}

}
