import { xDatetime } from "./../../xdatetime/lib/xDatetime";

export class xCacheItem {
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
