import * as mongodb from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { CharacterPlayer } from "./entity/pro/CharacterPlayer";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { CharacterPlayerFindOptions } from "./entity/pro/findOptions/CharacterPlayerFindOptions";
import { OwnerItem } from "./entity/pro/OwnerItem";
import { RemoveStatusItem } from "./entity/pro/RemoveStatusItem";
import { InventoryItem } from "./entity/pro/InventoryItem";
import { GroupItem } from "./entity/pro/GroupItem";
import { FriendItem } from "./entity/pro/FriendItem";
import { BanItem } from "./entity/pro/BanItem";
import { CurrencyItem } from "./entity/pro/CurrencyItem";
import { StatisticsItem } from "./entity/pro/StatisticsItem";
import { DataValueType } from "./entity/pro/type/DataValueType";
import { AvatarItem } from "./entity/pro/AvatarItem";
import { CharacterItem } from "./entity/pro/CharacterItem";

export class CharacterPlayerRepository extends AbstractBaseRepository {
    /**
     * Creates the character player async.
     * @param rawCharacterPlayer Provides the result value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async createCharacterPlayerAsync(
        rawCharacterPlayer: mongodb.WithId<mongodb.Document> & {
            characterId: string;
            catalogId: string;
            owner: OwnerItem;
            playerCharacters: CharacterItem[];
            removeStatus: RemoveStatusItem;
            playerInventories: InventoryItem[];
            playerGroups: GroupItem[];
            playerFriends: FriendItem[];
            playerBan: BanItem;
            playerCurrencies: Record<string, CurrencyItem>;
            playerStatistics: Record<string, StatisticsItem>;
            playerDatas: Record<string, DataValueType>;
            ipAddressCreate: string;
            countryCode: string;
            tsLastLogin: number;
            segments: string[];
            customDatas: Record<string, DataValueType>;
            tsCreate: number;
            displayName: string;
            displayNameNormalize: string;
            avatar: AvatarItem;
            tags: Record<string, string>;
        },
        gameId: string,
        session?: mongodb.ClientSession,
    ): Promise<CharacterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        await collection.insertOne(rawCharacterPlayer, {
            session: session,
        });
        return new CharacterPlayer(rawCharacterPlayer, collection);
    }

    /**
     * Loads the character player async.
     * @param characterId Provides the character ID value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayerAsync(characterId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { characterId: characterId },
            {
                projection: this.getFindOptions(characterPlayerFindOptions),
            },
        );

        if (result) {
            return new CharacterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the character players with segment async.
     * @param segment Provides the segment value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                { segments: segment },
                {
                    projection: this.getFindOptions(characterPlayerFindOptions),
                    sort: {
                        _id: -1,
                    },
                },
            )
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character players with tag async.
     * @param key Provides the key value used by this operation.
     * @param value Provides the value value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["tags." + key] = value;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(characterPlayerFindOptions),
                sort: {
                    _id: -1,
                },
            })
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character player with display name async.
     * @param displayName Provides the display name value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayerWithDisplayNameAsync(displayName: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { displayName: displayName },
            {
                projection: this.getFindOptions(characterPlayerFindOptions),
            },
        );

        if (!result) return null;
        return new CharacterPlayer(result, collection);
    }

    /**
     * Loads the character players with display name normalize regex async.
     * @param keyword Provides the keyword value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                { displayNameNormalize: { $regex: keyword } },
                {
                    projection: this.getFindOptions(characterPlayerFindOptions),
                    sort: {
                        _id: -1,
                    },
                },
            )
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character players leaderboard with statistics async.
     * @param key Provides the key value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param catalogId Provides the catalog ID value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerStatistics." + key + ".value"] = direction;
        // $sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

        let $filter = {} as any;
        if (catalogId) {
            $filter["catalogId"] = catalogId;
        }

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(characterPlayerFindOptions),
            })
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character players leaderboard with statistics all async.
     * @param key Provides the key value used by this operation.
     * @param catalogId Provides the catalog ID value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["playerStatistics." + key + ".value"] = { $ne: null };
        if (catalogId) $filter["catalogId"] = catalogId;

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerStatistics." + key + ".value"] = direction;
        // $sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(characterPlayerFindOptions),
            })
            .sort($sort);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character players leaderboard with create async.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["_id"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(characterPlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character players leaderboard with last login async.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["tsLastLogin"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(characterPlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the character players leaderboard with currencies async.
     * @param key Provides the key value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param catalogId Provides the catalog ID value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadCharacterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerCurrencies." + key + ".value"] = -1;

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        if (catalogId) {
            $filter["catalogId"] = catalogId;
        }

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(characterPlayerFindOptions),
            })
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToCharacterPlayers(results, collection);
    }

    /**
     * Loads the position character player leaderboard with statistics async.
     * @param key Provides the key value used by this operation.
     * @param characterId Provides the character ID value used by this operation.
     * @param catalogId Provides the catalog ID value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param initialValue Provides the initial value value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadPositionCharacterPlayerLeaderboardWithStatisticsAsync(key: string, characterId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the character player find options value used in the current execution flow.
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            catalogId: true,
            playerStatistics: true,
        };

        // Stores the this player value used in the current execution flow.
        let thisPlayer = await this.loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);
        if (thisPlayer == null) return -1;
        if (catalogId && thisPlayer.getCatalogId() != catalogId) return -1;

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
        if (catalogId) {
            $filter["catalogId"] = catalogId;
        }

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

    /**
     * Loads the friend character players leaderboard with statistics async.
     * @param friendIds Provides the friend IDs value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadFriendCharacterPlayersLeaderboardWithStatisticsAsync(friendIds: string[], gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemGameCollection("CharacterPlayer", gameId);

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { characterId: { $in: friendIds } },
            {
                projection: this.getFindOptions(characterPlayerFindOptions),
            },
        );

        // Stores the answer value used in the current execution flow.
        let answer: CharacterPlayer[] = [];

        while (await results.hasNext()) {
            // Stores the result value used in the current execution flow.
            let result = await results.next();
            answer.push(new CharacterPlayer(result, collection));
        }

        return answer;
    }

    /**
     * Executes the insert character player statistics logs async workflow asynchronously.
     * @param requests Provides the requests value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     */
    public async insertCharacterPlayerStatisticsLogsAsync(requests: { characterId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[], gameId: string): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

        await collection.insertMany(requests);
    }

    /**
     * Executes the insert character player currency log async workflow asynchronously.
     * @param requests Provides the requests value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     */
    public async insertCharacterPlayerCurrencyLogsAsync(requests: { characterId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[], gameId: string): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);

        await collection.insertMany(requests);
    }

    /**
     * Loads the character player statistics log async.
     * @param filter Provides the filter value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async loadCharacterPlayerStatisticsLogAsync(filter: {}, gameId: string, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Loads the character player currency log async.
     * @param filter Provides the filter value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async loadCharacterPlayerCurrencyLogAsync(filter: {}, gameId: string, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Converts the to character players.
     * @param results Provides the results value used by this operation.
     * @param collection Provides the collection value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async convertToCharacterPlayers(results: mongodb.FindCursor<mongodb.WithId<mongodb.Document>>, collection: mongodb.Collection<mongodb.Document>): Promise<Array<CharacterPlayer>> {
        // Stores the answer value used in the current execution flow.
        let answer: Array<CharacterPlayer> = [];

        while (await results.hasNext()) {
            answer.push(new CharacterPlayer(await results.next(), collection));
        }

        return answer;
    }

    /**
     * Returns the find options.
     * @param findOptions Provides the find options value used by this operation.
     * @returns Returns the find options.
     */
    private getFindOptions(findOptions: CharacterPlayerFindOptions): { [k: string]: boolean } {
        if (findOptions == null) return null;

        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: boolean } = {};

        if (findOptions.characterId) answer["characterId"] = true;
        if (findOptions.catalogId) answer["catalogId"] = true;
        if (findOptions.owner) answer["owner"] = true;
        if (findOptions.removeStatus) answer["removeStatus"] = true;
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
