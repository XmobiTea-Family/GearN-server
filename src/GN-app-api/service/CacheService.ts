import { CharacterPlayer } from "./../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { ChatMessage } from "./../../GN-library/xdatabase/lib/entity/pro/ChatMessage";
import { GamePlayer } from "./../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { Group } from "./../../GN-library/xdatabase/lib/entity/pro/Group";
import { Inventory } from "./../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { GameItem } from "./../../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";
import { MasterAdminPlayer } from "./../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";
import { MasterGameSettings } from "./../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterGameSettings";
import { SecretInfoItem } from "./../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { MasterPlayer } from "./../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { Match } from "./../../GN-library/xdatabase/lib/entity/pro/Match";
import { MatchmakingTicket } from "./../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { StoreInventory } from "./../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { TradeInventory } from "./../../GN-library/xdatabase/lib/entity/pro/TradeInventory";
import { UploadFileInfo } from "./../../GN-library/xdatabase/lib/entity/pro/UploadFileInfo";
import { xDatabase } from "./../../GN-library/xdatabase/lib/xDatabase";
import { GNServer } from "./../../GNServer";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { ICacheService, CacheItem } from "./ICacheService";
import * as mongodb from "mongodb";

export interface ICacheServiceController {
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

export class MemoryCacheServiceController implements ICacheServiceController {
	// Stores the data dictionary collection used by this instance.
	private dataDic: Map<string, CacheItem>;

	/**
	 * Returns the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the data.
	 */
	public async getData<T>(key: string): Promise<T> {
		if (!this.dataDic.has(key)) return null;

		return <T>this.dataDic.get(key).getData();
	}

	/**
	 * Sets the data.
	 * @param key Provides the key value used by this operation.
	 * @param tData Provides the data value used by this operation.
	 * @param expireAfterMs Provides the expire after milliseconds value used by this operation.
	 */
	public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
		if (!this.dataDic.has(key)) this.dataDic.set(key, new CacheItem(tData, expireAfterMs));
		else {
			this.dataDic.get(key).setData(tData, expireAfterMs);
		}
	}

	/**
	 * Removes the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async removeData(key: string): Promise<boolean> {
		return this.dataDic.delete(key);
	}

	/**
	 * Checks whether valid.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async isValid(key: string): Promise<boolean> {
		if (!this.dataDic.has(key)) return false;

		// Stores the cache item value used in the current execution flow.
		let cacheItem = this.dataDic.get(key);
		if (cacheItem.isExpired()) return false;

		return true;
	}

	/**
	 * Removes the invalid data.
	 * @returns Resolves with the operation result.
	 */
	public async removeInvalidData(): Promise<number> {
		// Stores the remove count value used in the current execution flow.
		let removeCount = 0;

		// Stores the entries value used in the current execution flow.
		let entries = this.dataDic.entries();

		// Stores the keys to remove value used in the current execution flow.
		let keysNeedRemove: string[] = [];

		for (let [key, cacheItem] of entries) {
			if (cacheItem == null || cacheItem.isExpired()) {
				keysNeedRemove.push(key);
				removeCount++;
			}
		}

		for (let key of keysNeedRemove) {
			this.dataDic.delete(key);
		}

		return removeCount;
	}

	/**
	 * Initializes a new memory cache service controller instance.
	 */
	constructor() {
		this.dataDic = new Map();
	}
}

export class MongoDbCacheServiceController implements ICacheServiceController {
	// Stores the cache collection value used by this instance.
	private cacheCollection: mongodb.Collection<mongodb.Document>;
	// Stores the database value used by this instance.
	private database: xDatabase;

	/**
	 * Returns the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the data.
	 */
	public async getData<T>(key: string): Promise<T> {
		// Stores the result value used in the current execution flow.
		let result = await this.cacheCollection.findOne({ key: key }, {
			projection: {
				data: true
			}
		});

		if (!result) return null;

		// Stores the data value used in the current execution flow.
		let tData = result.data;

		if (tData != null && typeof tData == "object" && Array.isArray(tData)) {
			for (let i = 0; i < tData.length; i++) {
				// Stores the child data value used in the current execution flow.
				const childData = tData[i];

				if (childData.__collectionName) {
					// Stores the model name parts value used in the current execution flow.
					const modelNameSpls = childData.__collectionName.split('.');
					// Stores the model name value used in the current execution flow.
					const modelName = modelNameSpls[modelNameSpls.length - 1];

					if (modelName) {
						if (modelName == "Message") {
							tData[i] = new ChatMessage(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "Group") {
							tData[i] = new Group(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "Inventory") {
							tData[i] = new Inventory(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "MasterPlayer") {
							tData[i] = new MasterPlayer(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "CharacterPlayer") {
							tData[i] = new CharacterPlayer(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "GamePlayer") {
							tData[i] = new GamePlayer(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "StoreInventory") {
							tData[i] = new StoreInventory(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "TradeInventory") {
							tData[i] = new TradeInventory(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "Match") {
							tData[i] = new Match(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "MatchmakingTicket") {
							tData[i] = new MatchmakingTicket(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "UploadFileInfo") {
							tData[i] = new UploadFileInfo(childData.originResult, this.database.collection(childData.__collectionName));
						}
						else if (modelName == "MasterAdmin") {
							if (childData.originResult.type == "gameSettings") {
								tData[i] = new GameItem(childData.originResult, this.database.collection(childData.__collectionName));
							}
							else if (childData.originResult.type == "account") {
								tData[i] = new MasterAdminPlayer(childData.originResult, this.database.collection(childData.__collectionName));
							}
							else if (childData.originResult.type == "masterGameSettings") {
								tData[i] = new MasterGameSettings(childData.originResult, this.database.collection(childData.__collectionName));
							}
							else if (childData.originResult.type == "secretInfo") {
								tData[i] = new SecretInfoItem(childData.originResult, this.database.collection(childData.__collectionName));
							}
						}
					}

				}
			}
		}

		return <T>tData;
	}

	/**
	 * Sets the data.
	 * @param key Provides the key value used by this operation.
	 * @param tData Provides the data value used by this operation.
	 * @param expireAfterMs Provides the expire after milliseconds value used by this operation.
	 */
	public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
		if (tData != null && typeof tData == "object" && Array.isArray(tData)) {
			for (let i = 0; i < tData.length; i++) {
				// Stores the child data value used in the current execution flow.
				const childData = tData[i];
				if (childData.collection) {
					tData[i] = {
						originResult: childData.originResult,
						__collectionName: childData.collection.collectionName,
					}
				}
			}
		}

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

	/**
	 * Removes the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async removeData(key: string): Promise<boolean> {
		// Stores the delete result value used in the current execution flow.
		let deleteResult = await this.cacheCollection.deleteOne({ key: key });

		return deleteResult.deletedCount > 0;
	}

	/**
	 * Checks whether valid.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async isValid(key: string): Promise<boolean> {
		// Stores the result value used in the current execution flow.
		let result = await this.cacheCollection.findOne({ key: key }, {
			projection: {
				tsExpire: true
			}
		});

		if (!result) return false;

		if (result.tsExpire < xDatetime.getCurrentMilliseconds()) return false;

		return true;
	}

	/**
	 * Removes the invalid data.
	 * @returns Resolves with the operation result.
	 */
	public async removeInvalidData(): Promise<number> {
		// Stores the delete result value used in the current execution flow.
		let deleteResult = await this.cacheCollection.deleteMany({ tsExpire: { $lt: xDatetime.getCurrentMilliseconds() } });

		// Stores the remove count value used in the current execution flow.
		let removeCount = deleteResult.deletedCount;
		return removeCount;
	}

	/**
	 * Initializes a new mongo database cache service controller instance.
	 * @param cacheCollection Provides the cache collection used by this operation.
	 * @param database Provides the database value used by this operation.
	 */
	constructor(cacheCollection: mongodb.Collection<mongodb.Document>, database: xDatabase) {
		this.cacheCollection = cacheCollection;
		this.database = database;
	}
}

export class CacheService implements ICacheService {
	// Stores the cache service controller value used by this instance.
	private cacheServiceController: ICacheServiceController;

	/**
	 * Returns the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the data.
	 */
	public async getData<T>(key: string): Promise<T> {
		return await this.cacheServiceController.getData<T>(key);
	}

	/**
	 * Sets the data.
	 * @param key Provides the key value used by this operation.
	 * @param tData Provides the data value used by this operation.
	 * @param expireAfterMs Provides the expire after milliseconds value used by this operation.
	 */
	public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
		return await this.cacheServiceController.setData<T>(key, tData, expireAfterMs);
	}

	/**
	 * Removes the data.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async removeData(key: string): Promise<boolean> {
		return await this.cacheServiceController.removeData(key);
	}

	/**
	 * Checks whether valid.
	 * @param key Provides the key value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async isValid(key: string): Promise<boolean> {
		return await this.cacheServiceController.isValid(key);
	}

	/**
	 * Removes the invalid data.
	 * @returns Resolves with the operation result.
	 */
	public async removeInvalidData(): Promise<number> {
		return await this.cacheServiceController.removeInvalidData();
	}

	/**
	 * Initializes a new cache service instance.
	 * @param cacheServiceController Provides the cache service controller used by this operation.
	 */
	constructor(cacheServiceController: ICacheServiceController) {
		this.cacheServiceController = cacheServiceController;
	}
}
