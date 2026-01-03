import { CharacterPlayer } from "../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { ChatMessage } from "../../GN-library/xdatabase/lib/entity/pro/ChatMessage";
import { GamePlayer } from "../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { Group } from "../../GN-library/xdatabase/lib/entity/pro/Group";
import { Inventory } from "../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { GameItem } from "../../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";
import { MasterAdminPlayer } from "../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";
import { MasterGameSettings } from "../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterGameSettings";
import { SecretInfoItem } from "../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { MasterPlayer } from "../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { Match } from "../../GN-library/xdatabase/lib/entity/pro/Match";
import { MatchmakingTicket } from "../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { StoreInventory } from "../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { TradeInventory } from "../../GN-library/xdatabase/lib/entity/pro/TradeInventory";
import { UploadFileInfo } from "../../GN-library/xdatabase/lib/entity/pro/UploadFileInfo";
import { xDatabase } from "../../GN-library/xdatabase/lib/xDatabase";
import { GNServer } from "../../GNServer";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
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

		let entries = this.dataDic.entries();

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

	constructor() {
		this.dataDic = new Map();
	}
}

export class MongoDbCacheServiceController implements ICacheServiceController {
	private cacheCollection: mongoDB.Collection<mongoDB.Document>;
	private database: xDatabase;

	public async getData<T>(key: string): Promise<T> {
		let result = await this.cacheCollection.findOne({ key: key }, {
			projection: {
				data: true
			}
		});

		if (!result) return null;

		let tData = result.data;

		if (tData != null && typeof tData == "object" && Array.isArray(tData)) {
			for (let i = 0; i < tData.length; i++) {
				const childData = tData[i];

				if (childData.__collectionName) {
					const modelNameSpls = childData.__collectionName.split('.');
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

	public async setData<T>(key: string, tData: T, expireAfterMs: number): Promise<void> {
		if (tData != null && typeof tData == "object" && Array.isArray(tData)) {
			for (let i = 0; i < tData.length; i++) {
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

	constructor(cacheCollection: mongoDB.Collection<mongoDB.Document>, database: xDatabase) {
		this.cacheCollection = cacheCollection;
		this.database = database;
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
