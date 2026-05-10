import * as mongodb from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { GamePlayer } from "./entity/pro/GamePlayer";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { GamePlayerFindOptions } from "./entity/pro/findOptions/GamePlayerFindOptions";
import { CharacterItem } from "./entity/pro/CharacterItem";
import { InventoryItem } from "./entity/pro/InventoryItem";
import { GroupItem } from "./entity/pro/GroupItem";
import { FriendItem } from "./entity/pro/FriendItem";
import { DataValueType } from "./entity/pro/type/DataValueType";
import { AvatarItem } from "./entity/pro/AvatarItem";
import { BanItem } from "./entity/pro/BanItem";
import { CurrencyItem } from "./entity/pro/CurrencyItem";
import { StatisticsItem } from "./entity/pro/StatisticsItem";

export class GamePlayerRepository extends AbstractBaseRepository {
    /**
     * Creates the game player async.
     * @param rawGamePlayer Provides the result value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async createGamePlayerAsync(
        rawGamePlayer: mongodb.WithId<mongodb.Document> & {
            userId: string;
            socketId: string;
            playerCharacters: CharacterItem[];
            playerInventories: InventoryItem[];
            playerGroups: GroupItem[];
            playerFriends: FriendItem[];
            segments: string[];
            customDatas: Record<string, DataValueType>;
            displayName: string;
            displayNameNormalize: string;
            avatar: AvatarItem;
            tsCreate: number;
            tags: Record<string, string>;
            playerBan: BanItem;
            playerDatas: Record<string, DataValueType>;
            playerCurrencies: Record<string, CurrencyItem>;
            playerStatistics: Record<string, StatisticsItem>;
            tsLastLogin: number;
            ipAddressCreate: string;
            countryCode: string;
        },
        gameId: string,
    ): Promise<GamePlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        await collection.insertOne(rawGamePlayer);
        return new GamePlayer(rawGamePlayer, collection);
    }

    /**
     * Loads the game player async.
     * @param userId Indicates whether r ID should be used.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayerAsync(userId: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { userId: userId },
            {
                projection: this.getFindOptions(gamePlayerFindOptions),
            },
        );

        if (result) {
            return new GamePlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the game players with segment async.
     * @param segment Provides the segment value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                { segments: segment },
                {
                    projection: this.getFindOptions(gamePlayerFindOptions),
                    sort: {
                        _id: -1,
                    },
                },
            )
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the game players with tag async.
     * @param key Provides the key value used by this operation.
     * @param value Provides the value value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["tags." + key] = value;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(gamePlayerFindOptions),
                sort: {
                    _id: -1,
                },
            })
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the game player with display name async.
     * @param displayName Provides the display name value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayerWithDisplayNameAsync(displayName: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { displayName: displayName },
            {
                projection: this.getFindOptions(gamePlayerFindOptions),
            },
        );

        if (!result) return null;
        return new GamePlayer(result, collection);
    }

    /**
     * Loads the game players with display name normalize regex async.
     * @param keyword Provides the keyword value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                { displayNameNormalize: { $regex: keyword } },
                {
                    projection: this.getFindOptions(gamePlayerFindOptions),
                    sort: {
                        _id: -1,
                    },
                },
            )
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the game players leaderboard with statistics async.
     * @param key Provides the key value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, direction: -1 | 1, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerStatistics." + key + ".value"] = direction;
        // $sort["playerStatistics." + key + ".tsLastUpdate"] = direction;

        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(gamePlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the game players leaderboard with statistics all async.
     * @param key Provides the key value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersLeaderboardWithStatisticsAllAsync(key: string, gameId: string, direction: -1 | 1, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["playerStatistics." + key + ".value"] = { $ne: null };

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerStatistics." + key + ".value"] = direction;
        // $sort["playerStatistics." + key + ".tsLastUpdate"] = direction;

        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(gamePlayerFindOptions),
            })
            .sort($sort);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the game players leaderboard with create async.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["_id"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(gamePlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the game players leaderboard with last login async.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["tsLastLogin"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(gamePlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the friend game players leaderboard with statistics async.
     * @param friendIds Provides the friend IDs value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadFriendGamePlayersLeaderboardWithStatisticsAsync(friendIds: string[], gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { userId: { $in: friendIds } },
            {
                projection: this.getFindOptions(gamePlayerFindOptions),
            },
        );

        // Stores the answer value used in the current execution flow.
        let answer: GamePlayer[] = [];

        while (await results.hasNext()) {
            // Stores the result value used in the current execution flow.
            let result = await results.next();
            answer.push(new GamePlayer(result, collection));
        }

        return answer;
    }

    /**
     * Loads the game players leaderboard with currencies async.
     * @param key Provides the key value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadGamePlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerCurrencies." + key + ".value"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(gamePlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToGamePlayers(results, collection);
    }

    /**
     * Loads the position game player leaderboard with statistics async.
     * @param key Provides the key value used by this operation.
     * @param userId Indicates whether r ID should be used.
     * @param gameId Provides the game ID value used by this operation.
     * @param initialValue Provides the initial value value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadPositionGamePlayerLeaderboardWithStatisticsAsync(key: string, userId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        // Stores the game player find options value used in the current execution flow.
        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerStatistics: true,
        };

        // Stores the this player value used in the current execution flow.
        let thisPlayer = await this.loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);
        if (thisPlayer == null) return -1;

        // Stores the score value used in the current execution flow.
        let score = initialValue;
        // Stores the timestamp last update value used in the current execution flow.
        let tsLastUpdate = xDatetime.getCurrentMilliseconds();

        // Stores the player statistics value used in the current execution flow.
        let playerStatistics = thisPlayer.getPlayerStatistics(key);
        if (playerStatistics != null) {
            score = playerStatistics.value;
            tsLastUpdate = playerStatistics.tsLastUpdate;
        }

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        if (direction == -1) {
            // let condition1 = {} as any;
            // let condition2 = {} as any;

            $filter["playerStatistics." + key + ".value"] = { $gt: score };
            // condition2["playerStatistics." + key + ".value"] = score;
            // condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

            // $filter.$or = [condition1, condition2];
        } else {
            // let condition1 = {} as any;
            // let condition2 = {} as any;

            $filter["playerStatistics." + key + ".value"] = { $lt: score };
            // condition2["playerStatistics." + key + ".value"] = score;
            // condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

            // $filter.$or = [condition1, condition2];
        }

        return await collection.countDocuments($filter);
    }

    public async removeGamePlayerSocketId(userId: string, gameId: string): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("GamePlayer", gameId);

        await collection.updateOne({ userId: userId }, { $set: { socketId: "" } });
    }

    /**
     * Executes the insert game player statistics logs async workflow asynchronously.
     * @param requests Provides the requests value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     */
    public async insertGamePlayerStatisticsLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[], gameId: string): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

        await collection.insertMany(requests);
    }

    /**
     * Executes the insert game player currency log async workflow asynchronously.
     * @param requests Provides the requests value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     */
    public async insertGamePlayerCurrencyLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[], gameId: string): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);

        await collection.insertMany(requests);
    }

    /**
     * Loads the game player statistics log async.
     * @param filter Provides the filter value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async loadGamePlayerStatisticsLogAsync(filter: {}, gameId: string, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Loads the game player currency log async.
     * @param filter Provides the filter value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async loadGamePlayerCurrencyLogAsync(filter: {}, gameId: string, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Converts the to game players.
     * @param results Provides the results value used by this operation.
     * @param collection Provides the collection value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async convertToGamePlayers(results: mongodb.FindCursor<mongodb.WithId<mongodb.Document>>, collection: mongodb.Collection<mongodb.Document>): Promise<Array<GamePlayer>> {
        // Stores the answer value used in the current execution flow.
        let answer: Array<GamePlayer> = [];

        while (await results.hasNext()) {
            answer.push(new GamePlayer(await results.next(), collection));
        }

        return answer;
    }

    /**
     * Returns the find options.
     * @param findOptions Provides the find options value used by this operation.
     * @returns Returns the find options.
     */
    private getFindOptions(findOptions: GamePlayerFindOptions): { [k: string]: boolean } {
        if (findOptions == null) return null;

        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: boolean } = {};

        if (findOptions.userId) answer["userId"] = true;
        if (findOptions.socketId) answer["socketId"] = true;
        if (findOptions.segments) answer["segments"] = true;
        if (findOptions.customDatas) answer["customDatas"] = true;
        if (findOptions.displayName) answer["displayName"] = true;
        if (findOptions.avatar) answer["avatar"] = true;
        if (findOptions.tsCreate) answer["tsCreate"] = true;
        if (findOptions.tags) answer["tags"] = true;
        if (findOptions.playerBan) answer["playerBan"] = true;
        if (findOptions.playerDatas) answer["playerDatas"] = true;
        if (findOptions.playerCurrencies) answer["playerCurrencies"] = true;
        if (findOptions.playerStatistics) answer["playerStatistics"] = true;
        if (findOptions.playerCharacters) answer["playerCharacters"] = true;
        if (findOptions.playerInventories) answer["playerInventories"] = true;
        if (findOptions.playerGroups) answer["playerGroups"] = true;
        if (findOptions.playerFriends) answer["playerFriends"] = true;
        if (findOptions.tsLastLogin) answer["tsLastLogin"] = true;
        if (findOptions.ipAddressCreate) answer["ipAddressCreate"] = true;
        if (findOptions.countryCode) answer["countryCode"] = true;

        return answer;
    }
}
