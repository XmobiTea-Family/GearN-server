import { xDatetime } from "../../GN-library/xdatetime/lib/xDatetime";
import { ICacheService, CacheItem } from "./ICacheService";
import * as mongoDB from "mongodb";

export interface ICacheServiceController {
    getData<T>(key: string): Promise<T>;

    setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void>;

    removeData(key: string): Promise<boolean>;

    isValid(key: string): Promise<boolean>;

    removeInvalidData(): Promise<number>;
}

export class MemoryCacheServiceController implements ICacheServiceController {
    private dataDic: Map<string, CacheItem>;

    public async getData<T>(key: string): Promise<T> {
        if (!this.dataDic.has(key)) return null;

        return <T>this.dataDic.get(key).getData();
    }

    public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
        if (!this.dataDic.has(key)) this.dataDic.set(key, new CacheItem(tData, expireAfterMs));
        else {
            this.dataDic.get(key).setData(tData, expireAfterMs);
        }
    }

    public async removeData(key: string): Promise<boolean> {
        return this.dataDic.delete(key);
    }

    public async isValid(key: string): Promise<boolean> {
        if (!this.dataDic.has(key)) return false;

        let cacheItem = this.dataDic.get(key);
        if (cacheItem.isExpired()) return false;

        return true;
    }

    public async removeInvalidData(): Promise<number> {
        let removeCount = 0;

        let keys = this.dataDic.keys();

        for (let key in keys) {
            let cacheItem = this.dataDic.get(key);
            if (cacheItem == null || cacheItem.isExpired()) {
                this.dataDic.delete(key);
                removeCount++;
            }
        }

        return removeCount;
    }

    constructor() {
        this.dataDic = new Map();
    }
}

export class MongoDbCacheServiceController implements ICacheServiceController {
    private cacheCollection: mongoDB.Collection<mongoDB.Document>;

    public async getData<T>(key: string): Promise<T> {
        let result = await this.cacheCollection.findOne({ key: key }, {
            projection: {
                data: true
            }
        });

        if (!result) return null;

        return <T>result.data;
    }

    public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
        await this.cacheCollection.updateOne({ key: key }, {
            $set: {
                data: tData,
                tsExpire: xDatetime.getCurrentMilliseconds() + expireAfterMs
            },
        },
        {
            upsert: true,
        });
    }

    public async removeData(key: string): Promise<boolean> {
        let deleteResult = await this.cacheCollection.deleteOne({ key: key });

        return deleteResult.deletedCount > 0;
    }

    public async isValid(key: string): Promise<boolean> {
        let result = await this.cacheCollection.findOne({ key: key }, {
            projection: {
                tsExpire: true
            }
        });

        if (!result) return false;

        if (result.tsExpire < xDatetime.getCurrentMilliseconds()) return false;

        return true;
    }

    public async removeInvalidData(): Promise<number> {
        let deleteResult = await this.cacheCollection.deleteMany({ tsExpire: { $lt: xDatetime.getCurrentMilliseconds() } });
        
        let removeCount = deleteResult.deletedCount;
        return removeCount;
    }

    constructor(cacheCollection: mongoDB.Collection<mongoDB.Document>) {
        this.cacheCollection = cacheCollection;
    }
}

export class CacheService implements ICacheService {
    private cacheServiceController: ICacheServiceController;

    public async getData<T>(key: string): Promise<T> {
        return await this.cacheServiceController.getData<T>(key);
    }

    public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
        return await this.cacheServiceController.setData<T>(key, tData, expireAfterMs);
    }

    public async removeData(key: string): Promise<boolean> {
        return await this.cacheServiceController.removeData(key);
    }

    public async isValid(key: string): Promise<boolean> {
        return await this.cacheServiceController.isValid(key);
    }

    public async removeInvalidData(): Promise<number> {
        return await this.cacheServiceController.removeInvalidData();
    }

    constructor(cacheServiceController: ICacheServiceController) {
        this.cacheServiceController = cacheServiceController;
    }
}
