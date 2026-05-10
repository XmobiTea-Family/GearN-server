import * as mongodb from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { MasterPlayer } from "./entity/pro/MasterPlayer";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { MasterPlayerFindOptions } from "./entity/pro/findOptions/MasterPlayerFindOptions";
import { ExternalItem } from "./entity/pro/ExternalItem";
import { DataValueType } from "./entity/pro/type/DataValueType";
import { CurrencyItem } from "./entity/pro/CurrencyItem";
import { StatisticsItem } from "./entity/pro/StatisticsItem";
import { IPDetailItem } from "./entity/pro/IPDetailItem";
import { PushNotificationItem } from "./entity/pro/PushNotificationItem";
import { BanItem } from "./entity/pro/BanItem";
import { AvatarItem } from "./entity/pro/AvatarItem";

export class MasterPlayerRepository extends AbstractBaseRepository {
    /**
     * Creates the master player async.
     * @param rawMasterPlayer Provides the result value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async createMasterPlayerAsync(
        rawMasterPlayer: mongodb.WithId<mongodb.Document> & {
            userId: string;
            external: ExternalItem;
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
            lastIPDetail: IPDetailItem;
            countryCode: string;
            email: string;
            pushNotifications: PushNotificationItem[];
        },
    ): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        await collection.insertOne(rawMasterPlayer);
        return new MasterPlayer(rawMasterPlayer, collection);
    }

    /**
     * Loads the master player async.
     * @param userId Indicates whether r ID should be used.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerAsync(userId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { userId: userId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            // Stores the this player value used in the current execution flow.
            let thisPlayer = new MasterPlayer(result, collection);
            return thisPlayer;
        }

        return null;
    }

    /**
     * Loads the master players with google async.
     * @param googleIds Provides the google IDs value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithGoogleAsync(googleIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { "external.google.googleId": { $in: googleIds } },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with google play game service async.
     * @param playerIds Provides the player IDs value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithGooglePlayGameServiceAsync(playerIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { "external.googlePlayGameService.playerId": { $in: playerIds } },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with game center async.
     * @param playerIds Provides the player IDs value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithGameCenterAsync(playerIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { "external.gameCenter.playerId": { $in: playerIds } },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with facebook async.
     * @param facebookIds Provides the facebook IDs value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithFacebookAsync(facebookIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { "external.facebook.facebookId": { $in: facebookIds } },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with apple async.
     * @param appleIds Provides the apple IDs value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithAppleAsync(appleIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection.find(
            { "external.apple.appleId": { $in: appleIds } },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with generic service async.
     * @param genericService Provides the generic service used by this operation.
     * @param genericIds Provides the generic IDs value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithGenericServiceAsync(genericService: string, genericIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");
        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["external.genericService.genericServices." + genericService + ".serviceId"] = { $in: genericIds };

        // Stores the results value used in the current execution flow.
        let results = await collection.find($filter, {
            projection: this.getFindOptions(masterPlayerFindOptions),
        });
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with segment async.
     * @param segment Provides the segment value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                { segments: segment },
                {
                    projection: this.getFindOptions(masterPlayerFindOptions),
                    sort: {
                        _id: -1,
                    },
                },
            )
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players with tag async.
     * @param key Provides the key value used by this operation.
     * @param value Provides the value value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["tags." + key] = value;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(masterPlayerFindOptions),
                sort: {
                    _id: -1,
                },
            })
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master player with display name async.
     * @param displayName Provides the display name value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerWithDisplayNameAsync(displayName: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { displayName: displayName },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (!result) return null;
        return new MasterPlayer(result, collection);
    }

    /**
     * Loads the master players with display name normalize regex async.
     * @param keyword Provides the keyword value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                { displayNameNormalize: { $regex: keyword } },
                {
                    projection: this.getFindOptions(masterPlayerFindOptions),
                    sort: {
                        _id: -1,
                    },
                },
            )
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players leaderboard with statistics async.
     * @param key Provides the key value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, direction: -1 | 1, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerStatistics." + key + ".value"] = direction;
        // $sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(masterPlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players leaderboard with statistics all async.
     * @param key Provides the key value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersLeaderboardWithStatisticsAllAsync(key: string, direction: -1 | 1, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["playerStatistics." + key + ".value"] = { $ne: null };

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerStatistics." + key + ".value"] = direction;
        // $sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

        let results = await collection
            .find($filter, {
                projection: this.getFindOptions(masterPlayerFindOptions),
            })
            .sort($sort);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players leaderboard with currencies async.
     * @param key Provides the key value used by this operation.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["playerCurrencies." + key + ".value"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(masterPlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players leaderboard with last login async.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["tsLastLogin"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(masterPlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the master players leaderboard with create async.
     * @param skip Provides the skip value used by this operation.
     * @param limit Provides the limit value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayersLeaderboardWithCreateAsync(skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the sort value used in the current execution flow.
        let $sort = {} as any;
        $sort["_id"] = -1;

        // Stores the results value used in the current execution flow.
        let results = await collection
            .find(
                {},
                {
                    projection: this.getFindOptions(masterPlayerFindOptions),
                },
            )
            .sort($sort)
            .skip(skip)
            .limit(limit);
        return this.convertToMasterPlayers(results, collection);
    }

    /**
     * Loads the position master player leaderboard with statistics async.
     * @param key Provides the key value used by this operation.
     * @param userId Indicates whether r ID should be used.
     * @param initialValue Provides the initial value value used by this operation.
     * @param direction Provides the direction value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadPositionMasterPlayerLeaderboardWithStatisticsAsync(key: string, userId: string, initialValue: number, direction: -1 | 1): Promise<number> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the master player find options value used in the current execution flow.
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerStatistics: true,
        };

        // Stores the this player value used in the current execution flow.
        let thisPlayer = await this.loadMasterPlayerAsync(userId, masterPlayerFindOptions);
        if (thisPlayer == null) return -1;

        // Stores the score value used in the current execution flow.
        let score = initialValue;

        // Stores the player statistics value used in the current execution flow.
        let playerStatistics = thisPlayer.getPlayerStatistics(key);
        // Stores the timestamp last update value used in the current execution flow.
        let tsLastUpdate = xDatetime.getCurrentMilliseconds();

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

    /**
     * Loads the master player by custom device ID async.
     * @param customDeviceId Provides the custom device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByCustomDeviceIdAsync(customDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.customDeviceId": customDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by android device ID async.
     * @param androidDeviceId Provides the android device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByAndroidDeviceIdAsync(androidDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.androidDeviceId": androidDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player byi OS device ID async.
     * @param iOSDeviceId Provides the i OS device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByiOSDeviceIdAsync(iOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.iOSDeviceId": iOSDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by windows phone device ID async.
     * @param windowsPhoneDeviceId Provides the windows phone device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByWindowsPhoneDeviceIdAsync(windowsPhoneDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.windowsPhoneDeviceId": windowsPhoneDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by windows device ID async.
     * @param windowsDeviceId Provides the windows device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByWindowsDeviceIdAsync(windowsDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.windowsDeviceId": windowsDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by linux device ID async.
     * @param linuxDeviceId Provides the linux device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByLinuxDeviceIdAsync(linuxDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.linuxDeviceId": linuxDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by mac OS device ID async.
     * @param macOSDeviceId Provides the mac OS device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByMacOSDeviceIdAsync(macOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.macOSDeviceId": macOSDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by editor device ID async.
     * @param editorDeviceId Provides the editor device ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByEditorDeviceIdAsync(editorDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.device.editorDeviceId": editorDeviceId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by account username async.
     * @param username Indicates whether rname should be used.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByAccountUsernameAsync(username: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.account.username": username },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by custom ID async.
     * @param customId Provides the custom ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByCustomIdAsync(customId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.custom.customId": customId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by apple async.
     * @param appleId Provides the apple ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByAppleAsync(appleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.apple.appleId": appleId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by google async.
     * @param googleId Provides the google ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByGoogleAsync(googleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.google.googleId": googleId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by google play game service async.
     * @param playerId Provides the player ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByGooglePlayGameServiceAsync(playerId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.googlePlayGameService.playerId": playerId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by game center async.
     * @param playerId Provides the player ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByGameCenterAsync(playerId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.gameCenter.playerId": playerId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by facebook async.
     * @param facebookId Provides the facebook ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByFacebookAsync(facebookId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne(
            { "external.facebook.facebookId": facebookId },
            {
                projection: this.getFindOptions(masterPlayerFindOptions),
            },
        );

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Loads the master player by generic service async.
     * @param serviceName Provides the service name value used by this operation.
     * @param serviceId Provides the service ID value used by this operation.
     * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async loadMasterPlayerByGenericServiceAsync(serviceName: string, serviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
        // Stores the collection value used in the current execution flow.
        let collection = this.systemCollection("MasterPlayer");

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;
        $filter["external.genericService.genericServices." + serviceName + ".serviceId"] = serviceId;

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne($filter, {
            projection: this.getFindOptions(masterPlayerFindOptions),
        });

        if (result) {
            return new MasterPlayer(result, collection);
        }

        return null;
    }

    /**
     * Executes the insert master player currency log async workflow asynchronously.
     * @param requests Provides the requests value used by this operation.
     */
    public async insertMasterPlayerCurrencyLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[]): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeCollection("MasterPlayer.CurrencyLog");

        await collection.insertMany(requests);
    }

    /**
     * Executes the insert master player statistics logs async workflow asynchronously.
     * @param requests Provides the requests value used by this operation.
     */
    public async insertMasterPlayerStatisticsLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[]): Promise<void> {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

        await collection.insertMany(requests);
    }

    /**
     * Loads the master player statistics log async.
     * @param filter Provides the filter value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async loadMasterPlayerStatisticsLogAsync(filter: {}, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Loads the master player currency log async.
     * @param filter Provides the filter value used by this operation.
     * @param limit Provides the limit value used by this operation.
     */
    public async loadMasterPlayerCurrencyLogAsync(filter: {}, limit: number) {
        // Stores the collection value used in the current execution flow.
        let collection = this.logRuntimeCollection("MasterPlayer.CurrencyLog");

        return await collection.find(filter).sort({ _id: -1 }).limit(limit);
    }

    /**
     * Converts the to master players.
     * @param results Provides the results value used by this operation.
     * @param collection Provides the collection value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async convertToMasterPlayers(results: mongodb.FindCursor<mongodb.WithId<mongodb.Document>>, collection: mongodb.Collection<mongodb.Document>): Promise<Array<MasterPlayer>> {
        // Stores the answer value used in the current execution flow.
        let answer: Array<MasterPlayer> = [];

        while (await results.hasNext()) {
            answer.push(new MasterPlayer(await results.next(), collection));
        }

        return answer;
    }

    /**
     * Returns the find options.
     * @param findOptions Provides the find options value used by this operation.
     * @returns Returns the find options.
     */
    private getFindOptions(findOptions: MasterPlayerFindOptions): { [k: string]: boolean } {
        if (findOptions == null) return null;

        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: boolean } = {};

        if (findOptions.userId) answer["userId"] = true;
        if (findOptions.lastIPDetail) answer["lastIPDetail"] = true;
        if (findOptions.external) answer["external"] = true;
        if (findOptions.segments) answer["segments"] = true;
        if (findOptions.customDatas) answer["customDatas"] = true;
        if (findOptions.displayName) answer["displayName"] = true;
        if (findOptions.avatar) answer["avatar"] = true;
        if (findOptions.tsCreate) answer["tsCreate"] = true;
        if (findOptions.tags) answer["tags"] = true;
        if (findOptions.playerBan) answer["playerBan"] = true;
        if (findOptions.playerCurrencies) answer["playerCurrencies"] = true;
        if (findOptions.playerStatistics) answer["playerStatistics"] = true;
        if (findOptions.playerDatas) answer["playerDatas"] = true;
        if (findOptions.ipAddressCreate) answer["ipAddressCreate"] = true;
        if (findOptions.countryCode) answer["countryCode"] = true;
        if (findOptions.tsLastLogin) answer["tsLastLogin"] = true;
        if (findOptions.email) answer["email"] = true;
        if (findOptions.pushNotifications) answer["pushNotifications"] = true;

        return answer;
    }
}
