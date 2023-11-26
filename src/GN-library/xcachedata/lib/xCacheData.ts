import { xCacheItem } from "./xCacheItem";

export class xCacheData {
	private dataDic: Map<string, xCacheItem>;

	public hasData(key: string): boolean {
		return this.dataDic.has(key);
	}

	public getData<T>(key: string): T {
		if (!this.dataDic.has(key)) return null;

		return <T>this.dataDic.get(key).getData();
	}

	public setData<T>(key: string, tData: T, expireAfterMs: number): void {
		if (!this.dataDic.has(key)) this.dataDic.set(key, new xCacheItem(tData, expireAfterMs));
		else {
			this.dataDic.get(key).setData(tData, expireAfterMs);
		}
	}

	public removeData(key: string): boolean {
		return this.dataDic.delete(key);
	}

	public isValid(key: string) {
		if (!this.dataDic.has(key)) return false;

		let cacheItem = this.dataDic.get(key);
		if (cacheItem.isExpired()) return false;

		return true;
	}

	constructor() {
		this.dataDic = new Map();
	}

}
