import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class CacheItem {
	// Stores the timestamp expire value used by this instance.
	private tsExpire: number;
	// Stores the data value used by this instance.
	private tData: any;

	/**
	 * Initializes a new cache item instance.
	 * @param tData Provides the data value used by this operation.
	 * @param expireAfterMs Provides the expire after milliseconds value used by this operation.
	 */
	constructor(tData: any, expireAfterMs: number) {
		this.tData = tData;
		this.tsExpire = xDatetime.getCurrentMilliseconds() + expireAfterMs;
	}

	/**
	 * Sets the data.
	 * @param tData Provides the data value used by this operation.
	 * @param expireAfterMs Provides the expire after milliseconds value used by this operation.
	 */
	public setData(tData: any, expireAfterMs: number) {
		this.tData = tData;
		this.tsExpire = xDatetime.getCurrentMilliseconds() + expireAfterMs;
	}

	/**
	 * Checks whether expired.
	 * @returns Returns the operation result.
	 */
	public isExpired(): boolean {
		return this.tsExpire < xDatetime.getCurrentMilliseconds();
	}

	/**
	 * Returns the data.
	 * @returns Returns the data.
	 */
	public getData(): any {
		return this.tData;
	}

}

export interface ICacheService {
	/**
	 * Returns the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the data.
	 */
	getData<T>(key: string): Promise<T>;

	/**
	 * Sets the data.
	 * @param key Provides the key value used by this operation.
	 * @param tData Provides the data value used by this operation.
	 * @param expireAfterMs Provides the expire after milliseconds value used by this operation.
	 */
	setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void>;

	/**
	 * Removes the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	removeData(key: string): Promise<boolean>;

	/**
	 * Checks whether valid.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	isValid(key: string): Promise<boolean>;

	/**
	 * Removes the invalid data.
	 * @returns Resolves with the operation result.
	 */
	removeInvalidData(): Promise<number>;

}
