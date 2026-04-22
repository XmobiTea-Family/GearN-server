import * as mongoDB from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { StoreInventory } from "./entity/pro/StoreInventory";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { StoreInventoryFindOptions } from "./entity/pro/findOptions/StoreInventoryFindOptions";

export class StoreInventoryRepository extends AbstractBaseRepository {
	/**
	 * Creates the store inventory async.
	 * @param result Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createStoreInventoryAsync(result: any, gameId: string): Promise<StoreInventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		await collection.insertOne(result);
		return new StoreInventory(result, collection);
	}

	/**
	 * Loads the store inventory async.
	 * @param storeId Provides the store ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param storeInventoryFindOptions Provides the store inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadStoreInventoryAsync(storeId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ storeId: storeId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	/**
	 * Returns the store inventory used async.
	 * @param storeId Provides the store ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the store inventory used async.
	 */
	public async getStoreInventoryUsedAsync(storeId: string, gameId: string): Promise<{ storeId: string, useIds: { id: string, type: number, tsCreate: number }[] }> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ storeId: storeId });

		return result as any;
	}

	/**
	 * Executes the insert store inventory used async workflow asynchronously.
	 * @param storeId Provides the store ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param ownerId Provides the owner ID value used by this operation.
	 * @param ownerType Provides the owner type value used by this operation.
	 */
	public async insertStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string, ownerType: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		await collection.updateOne({ storeId: storeId }, {
			$push: {
				useIds: {
					id: ownerId,
					type: ownerType,
					tsCreate: xDatetime.getCurrentMilliseconds(),
				}
			} as any
		}, {
			upsert: true,
		});
	}

	/**
	 * Removes the store inventory used async.
	 * @param storeId Provides the store ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param ownerIds Provides the owner IDs value used by this operation.
	 */
	public async removeStoreInventoryUsedAsync(storeId: string, gameId: string, ownerIds: string[]) {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		if (ownerIds == null) {
			await collection.deleteOne({ storeId: storeId });
		}
		else {
			await collection.updateOne({ storeId: storeId }, {
				$pull: {
					useIds: {
						id: { $in: ownerIds },
					}
				} as any
			});
		}
	}

	/**
	 * Returns the count store inventory used async.
	 * @param storeId Provides the store ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param ownerId Provides the owner ID value used by this operation.
	 * @returns Returns the count store inventory used async.
	 */
	public async getCountStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		// Stores the count value used in the current execution flow.
		let count = await collection.countDocuments({
			storeId: storeId,
			useIds: { $elemMatch: { id: ownerId } }
		});

		return count;
	}

	/**
	 * Loads the store inventory by facebook store async.
	 * @param productId Provides the product ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param storeInventoryFindOptions Provides the store inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadStoreInventoryByFacebookStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ "inAppPurchase.facebookStoreId": productId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	/**
	 * Loads the store inventory by apple app store async.
	 * @param productId Provides the product ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param storeInventoryFindOptions Provides the store inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadStoreInventoryByAppleAppStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ "inAppPurchase.appleAppStoreId": productId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	/**
	 * Loads the store inventory by google play store async.
	 * @param productId Provides the product ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param storeInventoryFindOptions Provides the store inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadStoreInventoryByGooglePlayStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ "inAppPurchase.googlePlayStoreId": productId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	/**
	 * Loads the store inventories leaderboard with create async.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param storeInventoryFindOptions Provides the store inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadStoreInventoriesLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<Array<StoreInventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["_id"] = -1;

		// Stores the results value used in the current execution flow.
		let results = await collection.find({}, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToStoreInventories(results, collection);
	}

	/**
	 * Loads the store inventories with tag async.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param storeInventoryFindOptions Provides the store inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadStoreInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<Array<StoreInventory>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("StoreInventory", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["tags." + key] = value;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(storeInventoryFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToStoreInventories(results, collection);
	}

	/**
	 * Executes the insert store inventory log async workflow asynchronously.
	 * @param storeId Provides the store ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param id Provides the ID value used by this operation.
	 * @param type Provides the type value used by this operation.
	 * @param priceCurrencyStartValues Provides the price currency start values value used by this operation.
	 * @param priceCurrencyAmountValues Provides the price currency amount values value used by this operation.
	 * @param priceCurrencyFinalValues Provides the price currency final values value used by this operation.
	 * @param storeCurrencyStartValues Provides the store currency start values value used by this operation.
	 * @param storeCurrencyAmountValues Provides the store currency amount values value used by this operation.
	 * @param storeCurrencyFinalValues Provides the store currency final values value used by this operation.
	 * @param storeItemFinalValues Provides the store item final values value used by this operation.
	 * @param transactionId Provides the transaction ID value used by this operation.
	 * @param storeReceiveType Provides the store receive type value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertStoreInventoryLogAsync(storeId: string, gameId: string, id: string, type: number,
		priceCurrencyStartValues: { key: string, value: number }[],
		priceCurrencyAmountValues: { key: string, value: number }[],
		priceCurrencyFinalValues: { key: string, value: number }[],
		storeCurrencyStartValues: { key: string, value: number }[],
		storeCurrencyAmountValues: { key: string, value: number }[],
		storeCurrencyFinalValues: { key: string, value: number }[],
		storeItemFinalValues: { catalogId: string, classId: string, itemId: string }[],
		transactionId: string, storeReceiveType: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("StoreInventory.StoreLog", gameId);

		await collection.insertOne({
			storeId: storeId,
			id: id,
			type: type,
			priceCurrencyStartValues: priceCurrencyStartValues,
			priceCurrencyAmountValues: priceCurrencyAmountValues,
			priceCurrencyFinalValues: priceCurrencyFinalValues,
			storeCurrencyStartValues: storeCurrencyStartValues,
			storeCurrencyAmountValues: storeCurrencyAmountValues,
			storeCurrencyFinalValues: storeCurrencyFinalValues,
			storeItemFinalValues: storeItemFinalValues,
			transactionId: transactionId,
			storeReceiveType: storeReceiveType,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Returns the store inventory log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async getStoreInventoryLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("StoreInventory.StoreLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Converts the to store inventories.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToStoreInventories(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<StoreInventory>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<StoreInventory> = [];

		while (await results.hasNext()) {
			answer.push(new StoreInventory(await results.next(), collection));
		}

		return answer;
	}

	/**
	 * Returns the find options.
	 * @param findOptions Provides the find options value used by this operation.
	 * @returns Returns the find options.
	 */
	private getFindOptions(findOptions: StoreInventoryFindOptions): { [k: string]: boolean } {
		if (findOptions == null) return null;

		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: boolean } = {};

		if (findOptions.storeId) answer["storeId"] = true;
		if (findOptions.storeItems) answer["storeItems"] = true;
		if (findOptions.storeItemType) answer["storeItemType"] = true;
		if (findOptions.storeCurrencies) answer["storeCurrencies"] = true;
		if (findOptions.priceCurrencies) answer["priceCurrencies"] = true;
		if (findOptions.inAppPurchase) answer["inAppPurchase"] = true;
		if (findOptions.removeStatus) answer["removeStatus"] = true;
		if (findOptions.displayName) answer["displayName"] = true;
		if (findOptions.avatar) answer["avatar"] = true;
		if (findOptions.tsCreate) answer["tsCreate"] = true;
		if (findOptions.tags) answer["tags"] = true;
		if (findOptions.storeDatas) answer["storeDatas"] = true;

		return answer;
	}

}
