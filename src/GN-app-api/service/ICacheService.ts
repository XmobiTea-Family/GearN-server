import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class CacheItem {
    private tsExpire: number;
    private tData: any;

    constructor(tData: any, expireAfterMs: number) {
        this.tData = tData;
        this.tsExpire = xDatetime.getCurrentMilliseconds() + expireAfterMs;
    }

    public setData(tData: any, expireAfterMs: number) {
        this.tData = tData;
        this.tsExpire = xDatetime.getCurrentMilliseconds() + expireAfterMs;
    }

    public isExpired(): boolean {
        return this.tsExpire < xDatetime.getCurrentMilliseconds();
    }

    public getData(): any {
        return this.tData;
    }

}

export interface ICacheService {
    getData<T>(key: string): Promise<T>;

    setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void>;

    removeData(key: string): Promise<boolean>;

    isValid(key: string): Promise<boolean>;

    removeInvalidData(): Promise<number>;

}
