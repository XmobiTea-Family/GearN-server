import * as mongodb from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { Inventory } from "./entity/pro/Inventory";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { InventoryFindOptions } from "./entity/pro/findOptions/InventoryFindOptions";
import { ItemType } from "./../../../GN-common/constant/enumType/ItemType";
import { OwnerItem } from "./entity/pro/OwnerItem";
import { DataValueType } from "./entity/pro/type/DataValueType";
import { StatisticsItem } from "./entity/pro/StatisticsItem";
import { RemoveStatusItem } from "./entity/pro/RemoveStatusItem";
import { AvatarItem } from "./entity/pro/AvatarItem";

export class InventoryRepository extends AbstractBaseRepository {
	/**
	 * Creates the inventory async.
	 * @param rawInventory Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createInventoryAsync(rawInventory: mongodb.WithId<mongodb.BSON.Document> & {
		itemId: string;
		catalogId: string;
		classId: string;
		amount: number;
		itemType: ItemType;
		owner: OwnerItem;
		itemDatas: Record<string, DataValueType>;
		itemStatistics: Record<string, StatisticsItem>;
		removeStatus: RemoveStatusItem;
		segments: string[];
		customDatas: Record<string, DataValueType>;
		tsCreate: number;
		displayName: string;
		displayNameNormalize: string;
		avatar: AvatarItem;
		tags: Record<string, string>;
	}, gameId: string, session?: mongodb.ClientSession): Promise<Inventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		await collection.insertOne(rawInventory, {
			session: session,
		});
		return new Inventory(rawInventory, collection);
	}

	/**
	 * Loads the inventory async.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoryAsync(itemId: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ itemId: itemId }, {
			projection: this.getFindOptions(inventoryFindOptions)
		});

		if (result) {
			return new Inventory(result, collection);
		}

		return null;
	}

	/**
	 * Loads the inventories leaderboard with create async.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoriesLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["_id"] = -1;

		// Stores the results value used in the current execution flow.
		let results = await collection.find({}, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	/**
	 * Loads the inventories with display name normalize regex async.
	 * @param keyword Provides the keyword value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoriesWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(inventoryFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	/**
	 * Loads the inventories leaderboard with statistics async.
	 * @param key Provides the key value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoriesLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["itemStatistics." + key + ".value"] = direction;
		// $sort["itemStatistics." + key + ".tsLastUpdate"] = 1;

		let $filter = {} as any;
		if (catalogId) {
			$filter["catalogId"] = catalogId;
		}

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	/**
	 * Loads the inventories leaderboard with statistics all async.
	 * @param key Provides the key value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoriesLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["itemStatistics." + key + ".value"] = { $ne: null };
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["itemStatistics." + key + ".value"] = direction;
		// $sort["itemStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).sort($sort);
		return this.convertToInventories(results, collection);
	}

	/**
	 * Loads the position inventory leaderboard with statistics async.
	 * @param key Provides the key value used by this operation.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param initialValue Provides the initial value value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionInventoryLeaderboardWithStatisticsAsync(key: string, itemId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions: InventoryFindOptions = {
			itemStatistics: true,
			catalogId: true,
		};

		// Stores the this inventory value used in the current execution flow.
		let thisInventory = await this.loadInventoryAsync(itemId, gameId, inventoryFindOptions);
		if (thisInventory == null) return -1;
		if (catalogId && thisInventory.getCatalogId() != catalogId) return -1;

		// Stores the score value used in the current execution flow.
		let score = initialValue;
		// Stores the timestamp last update value used in the current execution flow.
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		// Stores the item statistics value used in the current execution flow.
		let itemStatistics = thisInventory.getItemStatistics(key);
		if (itemStatistics != null) {
			score = itemStatistics.value;
			tsLastUpdate = itemStatistics.tsLastUpdate;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		if (direction == -1) {
			// let condition1 = {} as any;
			// let condition2 = {} as any;

			$filter["itemStatistics." + key + ".value"] = { $gt: score };
			// condition2["itemStatistics." + key + ".value"] = score;
			// condition2["itemStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			// $filter.$or = [condition1, condition2];
		}
		else {
			// let condition1 = {} as any;
			// let condition2 = {} as any;

			$filter["itemStatistics." + key + ".value"] = { $lt: score };
			// condition2["itemStatistics." + key + ".value"] = score;
			// condition2["itemStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			// $filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	/**
	 * Loads the inventories with segment async.
	 * @param segment Provides the segment value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoriesWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(inventoryFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	/**
	 * Loads the inventories with tag async.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["tags." + key] = value;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(inventoryFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	/**
	 * Executes the insert inventory statistics log async workflow asynchronously.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertInventoryStatisticsLogAsync(itemId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Inventory.StatisticsLog", gameId);

		await collection.insertOne({
			itemId: itemId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Executes the insert inventory statistics logs async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	public async insertInventoryStatisticsLogsAsync(requests: { itemId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Inventory.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	/**
	 * Loads the inventory statistics log async.
	 * @param filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadInventoryStatisticsLogAsync(filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Inventory.StatisticsLog", gameId);

		return await collection.find(filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Converts the to inventories.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToInventories(results: mongodb.FindCursor<mongodb.WithId<mongodb.Document>>, collection: mongodb.Collection<mongodb.Document>): Promise<Array<Inventory>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<Inventory> = [];

		while (await results.hasNext()) {
			answer.push(new Inventory(await results.next(), collection));
		}

		return answer;
	}

	/**
	 * Returns the find options.
	 * @param findOptions Provides the find options value used by this operation.
	 * @returns Returns the find options.
	 */
	private getFindOptions(findOptions: InventoryFindOptions): { [k: string]: boolean } {
		if (findOptions == null) return null;

		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: boolean } = {};

		if (findOptions.itemId) answer["itemId"] = true;
		if (findOptions.catalogId) answer["catalogId"] = true;
		if (findOptions.classId) answer["classId"] = true;
		if (findOptions.itemType) answer["itemType"] = true;
		if (findOptions.amount) answer["amount"] = true;
		if (findOptions.owner) answer["owner"] = true;
		if (findOptions.removeStatus) answer["removeStatus"] = true;
		if (findOptions.segments) answer["segments"] = true;
		if (findOptions.customDatas) answer["customDatas"] = true;
		if (findOptions.displayName) answer["displayName"] = true;
		if (findOptions.avatar) answer["avatar"] = true;
		if (findOptions.tsCreate) answer["tsCreate"] = true;
		if (findOptions.tags) answer["tags"] = true;
		if (findOptions.itemDatas) answer["itemDatas"] = true;
		if (findOptions.itemStatistics) answer["itemStatistics"] = true;

		return answer;
	}

}
