import * as mongodb from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { StoreInventory } from "./entity/pro/StoreInventory";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { StoreInventoryFindOptions } from "./entity/pro/findOptions/StoreInventoryFindOptions";
import { AvatarItem } from "./entity/pro/AvatarItem";
import { DataValueType } from "./entity/pro/type/DataValueType";
import { StoreItemType } from "./../../../GN-common/constant/enumType/StoreItemType";
import { RemoveStatusItem } from "./entity/pro/RemoveStatusItem";

export class StoreInventoryRepository extends AbstractBaseRepository {
    /**
     * Creates the store inventory async.
     * @param rawStoreInventory Provides the result value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async createStoreInventoryAsync(
        rawStoreInventory: mongodb.WithId<mongodb.Document> & {
            storeId: string;
            storeItems: {
                /** Catalog id of the item being sold (the item template). */
                catalogId: string;
                /** Class id of the item; used to load the right class configuration when granting it to the buyer. */
                classId: string;
                /** Amount of the item granted to the buyer for each successful purchase. */
                amount: number;
            }[];
            storeItemType: StoreItemType;
            storeCurrencies: {
                /** Currency code (gold, gem, ticket...). */
                key: string;
                /** Currency amount (granted on purchase, or the price). */
                value: number;
            }[];
            priceCurrencies: {
                /** Currency code (gold, gem, ticket...). */
                key: string;
                /** Currency amount (granted on purchase, or the price). */
                value: number;
            }[];
            storeDatas: Record<string, DataValueType>;
            removeStatus: RemoveStatusItem;
            segments: string[];
            customDatas: Record<string, DataValueType>;
            inAppPurchase: {
                /** Product id registered on the Apple App Store; matches the SKU in App Store Connect. */
                appleAppStoreId: string;
                /** Product id registered on Google Play; matches the SKU in Play Console. */
                googlePlayStoreId: string;
                /** Product id on the Facebook store (when the game has a Facebook canvas build). */
                facebookStoreId: string;
                /** USD price used for analytics/revenue reporting, decoupled from the per-store actual prices. */
                analyticsPrice: number;
            };
            tsCreate: number;
            displayName: string;
            displayNameNormalize: string;
            avatar: AvatarItem;
            tags: Record<string, string>;
        },
        gameId: string,
    ): Promise<StoreInventory> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("StoreInventory", gameId);

        await collection.insertOne(rawStoreInventory);
        return new StoreInventory(rawStoreInventory, collection);
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
        let result = await collection.findOne(
            { storeId: storeId },
            {
                projection: this.getFindOptions(storeInventoryFindOptions),
            },
        );

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
    public async getStoreInventoryUsedAsync(storeId: string, gameId: string): Promise<{ storeId: string; useIds: { id: string; type: number; tsCreate: number }[] }> {
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
     * @param session Provides the database session value used by this operation.
     */
    public async insertStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string, ownerType: number, session?: mongodb.ClientSession) {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

        await collection.updateOne(
            { storeId: storeId },
            {
                $push: {
                    useIds: {
                        id: ownerId,
                        type: ownerType,
                        tsCreate: xDatetime.getCurrentMilliseconds(),
                    },
                } as any,
            },
            {
                upsert: true,
                session: session,
            },
        );
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
        } else {
            await collection.updateOne(
                { storeId: storeId },
                {
                    $pull: {
                        useIds: {
                            id: { $in: ownerIds },
                        },
                    } as any,
                }
            );
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
            useIds: { $elemMatch: { id: ownerId } },
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
        let result = await collection.findOne(
            { "inAppPurchase.facebookStoreId": productId },
            {
                projection: this.getFindOptions(storeInventoryFindOptions),
            },
        );

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
        let result = await collection.findOne(
            { "inAppPurchase.appleAppStoreId": productId },
            {
                projection: this.getFindOptions(storeInventoryFindOptions),
            },
        );

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
        let result = await collection.findOne(
            { "inAppPurchase.googlePlayStoreId": productId },
            {
                projection: this.getFindOptions(storeInventoryFindOptions),
            },
        );

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
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(storeInventoryFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
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
        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(storeInventoryFindOptions),
                sort: {
                    _id: -1,
                },
            })
            .skip(skip)
            .limit(limit);
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
    public async insertStoreInventoryLogAsync(storeId: string, gameId: string, id: string, type: number, priceCurrencyStartValues: { key: string; value: number }[], priceCurrencyAmountValues: { key: string; value: number }[], priceCurrencyFinalValues: { key: string; value: number }[], storeCurrencyStartValues: { key: string; value: number }[], storeCurrencyAmountValues: { key: string; value: number }[], storeCurrencyFinalValues: { key: string; value: number }[], storeItemFinalValues: { catalogId: string; classId: string; itemId: string }[], transactionId: string, storeReceiveType: number, log: string): Promise<void> {
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
     * @param filter Provides the filter value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async getStoreInventoryLogAsync(filter: {}, gameId: string, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("StoreInventory.StoreLog", gameId);

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Converts the to store inventories.
     * @param results Provides the results value used by this operation.
     * @param collection Provides the collection value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async convertToStoreInventories(results: mongodb.FindCursor<mongodb.WithId<mongodb.Document>>, collection: mongodb.Collection<mongodb.Document>): Promise<Array<StoreInventory>> {
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
