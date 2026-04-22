import * as mongoDB from "mongodb";

import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";
import { MasterPlayer } from "./entity/pro/MasterPlayer";
import { GamePlayer } from "./entity/pro/GamePlayer";
import { CharacterPlayer } from "./entity/pro/CharacterPlayer";
import { MasterPlayerFindOptions } from "./entity/pro/findOptions/MasterPlayerFindOptions";
import { GamePlayerFindOptions } from "./entity/pro/findOptions/GamePlayerFindOptions";
import { CharacterPlayerFindOptions } from "./entity/pro/findOptions/CharacterPlayerFindOptions";
import { Group } from "./entity/pro/Group";
import { Inventory } from "./entity/pro/Inventory";
import { GroupFindOptions } from "./entity/pro/findOptions/GroupFindOptions";
import { InventoryFindOptions } from "./entity/pro/findOptions/InventoryFindOptions";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { StoreInventoryFindOptions } from "./entity/pro/findOptions/StoreInventoryFindOptions";
import { StoreInventory } from "./entity/pro/StoreInventory";
import { UploadFileInfo } from "./entity/pro/UploadFileInfo";
import { FileUploadInfoFindOptions } from "./entity/pro/findOptions/FileUploadInfoFindOptions";

interface OnMongoRunError {
	(error: mongoDB.AnyError): void;
}

export class xDatabase {
	// Stores the DOT value used by this instance.
	private static readonly DOT: string = ".";
	// Stores the RUNTIME value used by this instance.
	private static readonly RUNTIME: string = "Runtime" + xDatabase.DOT;
	// Stores the META value used by this instance.
	private static readonly META: string = "Meta" + xDatabase.DOT;
	// Stores the SYSTEM value used by this instance.
	private static readonly SYSTEM: string = "System" + xDatabase.DOT;

	// Stores the client value used by this instance.
	protected client: mongoDB.MongoClient;
	// Stores the database value used by this instance.
	protected db: mongoDB.Db;

	// Stores the log client value used by this instance.
	protected logClient: mongoDB.MongoClient;
	// Stores the log database value used by this instance.
	protected logDb: mongoDB.Db;

	/**
	 * Returns the database.
	 * @returns Returns the database.
	 */
	public getDb(): mongoDB.Db {
		return this.db;
	}

	/**
	 * Returns the log database.
	 * @returns Returns the log database.
	 */
	public getLogDb(): mongoDB.Db {
		return this.logDb;
	}

	/**
	 * Executes the init workflow.
	 * @param url Provides the URL value used by this operation.
	 * @param dbName Provides the database name value used by this operation.
	 * @param logUrl Provides the log URL value used by this operation.
	 * @param logDbName Provides the log database name value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public init(url: string, dbName: string, logUrl: string, logDbName: string, options?: mongoDB.MongoClientOptions): void {
		this.client = new mongoDB.MongoClient(url, options);

		this.db = this.client.db(dbName);

		if (!logUrl || logUrl == "" || logUrl == url) {
			this.logClient = this.client;
			this.logDb = this.db;
		}
		else {
			this.logClient = new mongoDB.MongoClient(logUrl, options);
			this.logDb = this.logClient.db(logDbName);
		}
	}

	/**
	 * Runs the current workflow.
	 * @param onMongoRunSuccess Provides the on mongo run success value used by this operation.
	 * @param onMongoRunError Provides the on mongo run error value used by this operation.
	 */
	public run(onMongoRunSuccess?: OnRunSuccess, onMongoRunError?: OnMongoRunError): void {
		if (this.logClient != null && this.logClient != this.client) {
			this.logClient.connect();
		}

		this.client.connect().then(result => {
			if (onMongoRunSuccess != null) onMongoRunSuccess();
		}).catch(err => {
			if (onMongoRunError != null) onMongoRunError(err);
		});
	}

	/**
	 * Runs the time collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public runtimeCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.RUNTIME + collectionName);
	}

	/**
	 * Executes the meta collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public metaCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.META + collectionName);
	}

	/**
	 * Executes the system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.SYSTEM + collectionName);
	}

	/**
	 * Runs the time game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public runtimeGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.RUNTIME + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the meta game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public metaGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.META + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.SYSTEM + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the collection workflow.
	 * @param fullCollectionName Provides the full collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public collection<TSchema extends mongoDB.Document = mongoDB.Document>(fullCollectionName: string): mongoDB.Collection<TSchema> {
		return this.db.collection<TSchema>(fullCollectionName);
	}

	/**
	 * Creates the collection.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public createCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, options?: mongoDB.CreateCollectionOptions) {
		return this.db.createCollection<TSchema>(collectionName, options)
	}

	/**
	 * Creates the index.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param index Provides the index value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public createIndex<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }): void {
		// Stores the collection value used in the current execution flow.
		let collection = this.collection<TSchema>(collectionName);

		// Stores the create indexes options value used in the current execution flow.
		let createIndexesOptions: mongoDB.CreateIndexesOptions = {
			background: true,
		};

		if (options != null) {
			if (options.expireAfterSeconds != null) createIndexesOptions.expireAfterSeconds = options.expireAfterSeconds;
			if (options.sparse != null) createIndexesOptions.sparse = options.sparse;
			if (options.unique != null) createIndexesOptions.unique = options.unique;
		}

		collection.createIndex(index, createIndexesOptions);
	}

	/**
	 * Executes the log runtime collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.RUNTIME + collectionName);
	}

	/**
	 * Executes the log meta collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logMetaCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.META + collectionName);
	}

	/**
	 * Executes the log system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.SYSTEM + collectionName);
	}

	/**
	 * Executes the log runtime game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.RUNTIME + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the log meta game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logMetaGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.META + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the log system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.SYSTEM + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the log collection workflow.
	 * @param fullCollectionName Provides the full collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logCollection<TSchema extends mongoDB.Document = mongoDB.Document>(fullCollectionName: string): mongoDB.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

	/**
	 * Executes the log create collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public logCreateCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, options?: mongoDB.CreateCollectionOptions) {
		return this.logDb.createCollection<TSchema>(collectionName, options)
	}

	/**
	 * Executes the log create index workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param index Provides the index value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public logCreateIndex<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }): void {
		// Stores the collection value used in the current execution flow.
		let collection = this.logCollection<TSchema>(collectionName);

		// Stores the create indexes options value used in the current execution flow.
		let createIndexesOptions: mongoDB.CreateIndexesOptions = {
			background: true,
		};

		if (options != null) {
			if (options.expireAfterSeconds != null) createIndexesOptions.expireAfterSeconds = options.expireAfterSeconds;
			if (options.sparse != null) createIndexesOptions.sparse = options.sparse;
			if (options.unique != null) createIndexesOptions.unique = options.unique;
		}

		collection.createIndex(index, createIndexesOptions);
	}

	/**
	 * Converts the to master players.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToMasterPlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<MasterPlayer>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<MasterPlayer> = [];

		while (await results.hasNext()) {
			answer.push(new MasterPlayer(await results.next(), collection));
		}

		return answer;
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
		let results = await collection.find({ "external.google.googleId": { $in: googleIds } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
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
		let results = await collection.find({ "external.googlePlayGameService.playerId": { $in: playerIds } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
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
		let results = await collection.find({ "external.gameCenter.playerId": { $in: playerIds } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
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
		let results = await collection.find({ "external.facebook.facebookId": { $in: facebookIds } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
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
		let results = await collection.find({ "external.apple.appleId": { $in: appleIds } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
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
			projection: this.getFindOptions(masterPlayerFindOptions)
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
		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(masterPlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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
		let results = await collection.find($filter, {
			projection: this.getFindOptions(masterPlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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
		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (!result) return null;
		return new MasterPlayer(result, collection);
	}

	/**
	 * Loads the master player with display name normalize async.
	 * @param displayNameNormalize Provides the display name normalize value used by this operation.
	 * @param masterPlayerFindOptions Provides the master player find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadMasterPlayerWithDisplayNameNormalizeAsync(displayNameNormalize: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("MasterPlayer");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(masterPlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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

		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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

		let results = await collection.find($filter, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
			playerStatistics: true
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
		}
		else {
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
	 * Loads the position master player leaderboard with currencies.
	 * @param key Provides the key value used by this operation.
	 * @param userId Indicates whether r ID should be used.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionMasterPlayerLeaderboardWithCurrencies(key: string, userId: string): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("MasterPlayer");

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerCurrencies: true
		};

		// Stores the this player value used in the current execution flow.
		let thisPlayer = await this.loadMasterPlayerAsync(userId, masterPlayerFindOptions);
		if (thisPlayer == null) return -1;

		// Stores the score value used in the current execution flow.
		let score = 0;

		// Stores the player currencies value used in the current execution flow.
		let playerCurrencies = thisPlayer.getPlayerCurrency(key);
		if (playerCurrencies != null) {
			score = playerCurrencies.value;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;

		$filter["playerCurrencies." + key + ".value"] = {
			$gt: score,
		}
		return await collection.countDocuments($filter);
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
		let result = await collection.findOne({ userId: userId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			// Stores the this player value used in the current execution flow.
			let thisPlayer = new MasterPlayer(result, collection);
			return thisPlayer;
		}

		return null;
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
		let result = await collection.findOne({ "external.device.customDeviceId": customDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.androidDeviceId": androidDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.iOSDeviceId": iOSDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.windowsPhoneDeviceId": windowsPhoneDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.windowsDeviceId": windowsDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.linuxDeviceId": linuxDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.macOSDeviceId": macOSDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.device.editorDeviceId": editorDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.account.username": username }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.custom.customId": customId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.apple.appleId": appleId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.google.googleId": googleId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.googlePlayGameService.playerId": playerId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.gameCenter.playerId": playerId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ "external.facebook.facebookId": facebookId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

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
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	/**
	 * Creates the master player async.
	 * @param result Provides the result value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createMasterPlayerAsync(result: any): Promise<MasterPlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("MasterPlayer");

		await collection.insertOne(result);
		return new MasterPlayer(result, collection);
	}

	/**
	 * Converts the to game players.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToGamePlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<GamePlayer>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<GamePlayer> = [];

		while (await results.hasNext()) {
			answer.push(new GamePlayer(await results.next(), collection));
		}

		return answer;
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
		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(gamePlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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
		let results = await collection.find($filter, {
			projection: this.getFindOptions(gamePlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	/**
	 * Loads the game player with display name async.
	 * @param displayName Provides the display name value used by this operation.
	 * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGamePlayerWithDisplayNameAsync(displayName: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("GamePlayer");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

		if (!result) return null;
		return new GamePlayer(result, collection);
	}

	/**
	 * Loads the game player with display name normalize async.
	 * @param displayNameNormalize Provides the display name normalize value used by this operation.
	 * @param gamePlayerFindOptions Provides the game player find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGamePlayerWithDisplayNameNormalizeAsync(displayNameNormalize: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("GamePlayer");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

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
		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(gamePlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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

		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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

		let results = await collection.find($filter, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		let results = await collection.find({ userId: { $in: friendIds } }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

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
		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerStatistics: true
		};

		// Stores the this player value used in the current execution flow.
		let thisPlayer = await this.loadGamePlayerAsync(userId, gameId, masterPlayerFindOptions);
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
		}
		else {
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
	 * Loads the position game player leaderboard with currencies async.
	 * @param key Provides the key value used by this operation.
	 * @param userId Indicates whether r ID should be used.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionGamePlayerLeaderboardWithCurrenciesAsync(key: string, userId: string, gameId: string): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("GamePlayer", gameId);

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerCurrencies: true
		};

		// Stores the this player value used in the current execution flow.
		let thisPlayer = await this.loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);
		if (thisPlayer == null) return -1;

		// Stores the score value used in the current execution flow.
		let score = 0;
		// Stores the player currencies value used in the current execution flow.
		let playerCurrencies = thisPlayer.getPlayerCurrency(key);
		if (playerCurrencies != null) {
			score = playerCurrencies.value;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;

		$filter["playerCurrencies." + key + ".value"] = {
			$gt: score,
		}
		return await collection.countDocuments($filter);
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
		let result = await collection.findOne({ userId: userId }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

		if (result) {
			return new GamePlayer(result, collection);
		}

		return null;
	}

	public async removeGamePlayerSocketId(userId: string, gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("GamePlayer", gameId);

		await collection.updateOne({ userId: userId }, { $set: { socketId: "" } });
	}

	/**
	 * Creates the game player async.
	 * @param result Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createGamePlayerAsync(result: any, gameId: string): Promise<GamePlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("GamePlayer", gameId);

		await collection.insertOne(result);
		return new GamePlayer(result, collection);
	}

	/**
	 * Executes the insert master player statistics log async workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertMasterPlayerStatisticsLogAsync(userId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

		await collection.insertOne({
			userId: userId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Executes the insert master player currency log async workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertMasterPlayerCurrencyLogAsync(userId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeCollection("MasterPlayer.CurrencyLog");

		await collection.insertOne({
			userId: userId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Executes the insert master player statistics logs async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 */
	public async insertMasterPlayerStatisticsLogsAsync(requests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[]): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

		await collection.insertMany(requests);
	}

	/**
	 * Loads the master player statistics log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadMasterPlayerStatisticsLogAsync($filter: {}, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Loads the master player currency log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadMasterPlayerCurrencyLogAsync($filter: {}, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeCollection("MasterPlayer.CurrencyLog");

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Executes the insert game player statistics log async workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertGamePlayerStatisticsLogAsync(userId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

		await collection.insertOne({
			userId: userId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Executes the insert game player statistics logs async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	public async insertGamePlayerStatisticsLogsAsync(requests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	/**
	 * Executes the insert game player currency log async workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertGamePlayerCurrencyLogAsync(userId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);

		await collection.insertOne({
			userId: userId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Loads the game player statistics log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadGamePlayerStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Loads the game player currency log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadGamePlayerCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Converts the to character players.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToCharacterPlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<CharacterPlayer>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<CharacterPlayer> = [];

		while (await results.hasNext()) {
			answer.push(new CharacterPlayer(await results.next(), collection));
		}

		return answer;
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
		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(characterPlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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
		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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
		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

		if (!result) return null;
		return new CharacterPlayer(result, collection);
	}

	/**
	 * Loads the character player with display name normalize async.
	 * @param displayNameNormalize Provides the display name normalize value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param characterPlayerFindOptions Provides the character player find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadCharacterPlayerWithDisplayNameNormalizeAsync(displayNameNormalize: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

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
		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(characterPlayerFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
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
		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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

		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		let results = await collection.find({}, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
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
		}
		else {
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
	 * Loads the position character player leaderboard with currencies async.
	 * @param key Provides the key value used by this operation.
	 * @param userId Indicates whether r ID should be used.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionCharacterPlayerLeaderboardWithCurrenciesAsync(key: string, userId: string, catalogId: string, gameId: string): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		// Stores the character player find options value used in the current execution flow.
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerCurrencies: true,
			catalogId: true,
		};

		// Stores the this player value used in the current execution flow.
		let thisPlayer = await this.loadCharacterPlayerAsync(userId, gameId, characterPlayerFindOptions);
		if (thisPlayer == null) return -1;
		if (catalogId && thisPlayer.getCatalogId() != catalogId) return -1;

		// Stores the score value used in the current execution flow.
		let score = 0;

		// Stores the player currencies value used in the current execution flow.
		let playerCurrencies = thisPlayer.getPlayerCurrency(key);
		if (playerCurrencies != null) {
			score = playerCurrencies.value;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;

		$filter["playerCurrencies." + key + ".value"] = {
			$gt: score,
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
		let results = await collection.find({ characterId: { $in: friendIds } }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

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
		let result = await collection.findOne({ characterId: characterId }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

		if (result) {
			return new CharacterPlayer(result, collection);
		}

		return null;
	}

	/**
	 * Creates the character player async.
	 * @param result Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createCharacterPlayerAsync(result: any, gameId: string): Promise<CharacterPlayer> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		await collection.insertOne(result);
		return new CharacterPlayer(result, collection);
	}

	/**
	 * Executes the insert character player statistics log async workflow asynchronously.
	 * @param characterId Provides the character ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertCharacterPlayerStatisticsLogAsync(characterId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

		await collection.insertOne({
			characterId: characterId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Executes the insert character player statistics logs async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	public async insertCharacterPlayerStatisticsLogsAsync(requests: { characterId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	/**
	 * Executes the insert character player currency log async workflow asynchronously.
	 * @param characterId Provides the character ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertCharacterPlayerCurrencyLogAsync(characterId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);

		await collection.insertOne({
			characterId: characterId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
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
	 * Loads the character player statistics log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadCharacterPlayerStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Loads the character player currency log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadCharacterPlayerCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Converts the to groups.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToGroups(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<Group>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<Group> = [];

		while (await results.hasNext()) {
			answer.push(new Group(await results.next(), collection));
		}

		return answer;
	}

	/**
	 * Loads the groups with segment async.
	 * @param segment Provides the segment value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(groupFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups with tag async.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["tags." + key] = value;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the group with display name async.
	 * @param displayName Provides the display name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupWithDisplayNameAsync(displayName: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (!result) return null;
		return new Group(result, collection);
	}

	/**
	 * Loads the group with display name normalize async.
	 * @param displayNameNormalize Provides the display name normalize value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupWithDisplayNameNormalizeAsync(displayNameNormalize: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (!result) return null;
		return new Group(result, collection);
	}

	/**
	 * Loads the groups with display name normalize regex async.
	 * @param keyword Provides the keyword value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(groupFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with statistics async.
	 * @param key Provides the key value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["groupStatistics." + key + ".value"] = direction;
		// $sort["groupStatistics." + key + ".tsLastUpdate"] = 1;

		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with statistics all async.
	 * @param key Provides the key value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["groupStatistics." + key + ".value"] = { $ne: null };
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["groupStatistics." + key + ".value"] = direction;
		// $sort["groupStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with create async.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["_id"] = -1;

		// Stores the results value used in the current execution flow.
		let results = await collection.find({}, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with currencies async.
	 * @param key Provides the key value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["groupCurrencies." + key + ".value"] = -1;

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the position group leaderboard with statistics async.
	 * @param key Provides the key value used by this operation.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param initialValue Provides the initial value value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionGroupLeaderboardWithStatisticsAsync(key: string, groupId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			groupStatistics: true,
			catalogId: true,
		};

		// Stores the this group value used in the current execution flow.
		let thisGroup = await this.loadGroupAsync(groupId, gameId, groupFindOptions);
		if (thisGroup == null) return -1;
		if (catalogId && thisGroup.getCatalogId() != catalogId) return -1;

		// Stores the score value used in the current execution flow.
		let score = initialValue;
		// Stores the timestamp last update value used in the current execution flow.
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		// Stores the group statistics value used in the current execution flow.
		let groupStatistics = thisGroup.getGroupStatistics(key);
		if (groupStatistics != null) {
			score = groupStatistics.value;
			tsLastUpdate = groupStatistics.tsLastUpdate;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		if (direction == -1) {
			// let condition1 = {} as any;
			// let condition2 = {} as any;

			$filter["groupStatistics." + key + ".value"] = { $gt: score };
			// condition2["groupStatistics." + key + ".value"] = score;
			// condition2["groupStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			// $filter.$or = [condition1, condition2];
		}
		else {
			// let condition1 = {} as any;
			// let condition2 = {} as any;

			$filter["groupStatistics." + key + ".value"] = { $lt: score };
			// condition2["groupStatistics." + key + ".value"] = score;
			// condition2["groupStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			// $filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	/**
	 * Loads the position group leaderboard with currencies async.
	 * @param key Provides the key value used by this operation.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionGroupLeaderboardWithCurrenciesAsync(key: string, groupId: string, gameId: string): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			groupCurrencies: true
		};

		// Stores the this group value used in the current execution flow.
		let thisGroup = await this.loadGroupAsync(groupId, gameId, groupFindOptions);
		if (thisGroup == null) return -1;

		// Stores the score value used in the current execution flow.
		let score = 0;

		// Stores the group currency value used in the current execution flow.
		let groupCurrency = thisGroup.getGroupCurrency(key);
		if (groupCurrency != null) {
			score = groupCurrency.value;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;

		$filter["groupCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments($filter);
	}

	/**
	 * Loads the group async.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupAsync(groupId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ groupId: groupId }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (result) {
			return new Group(result, collection);
		}

		return null;
	}

	/**
	 * Creates the group async.
	 * @param result Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createGroupAsync(result: any, gameId: string): Promise<Group> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		await collection.insertOne(result);
		return new Group(result, collection);
	}

	/**
	 * Converts the to inventories.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToInventories(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<Inventory>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<Inventory> = [];

		while (await results.hasNext()) {
			answer.push(new Inventory(await results.next(), collection));
		}

		return answer;
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
	 * Loads the inventory with display name async.
	 * @param displayName Provides the display name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoryWithDisplayNameAsync(displayName: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(inventoryFindOptions)
		});

		if (!result) return null;
		return new Inventory(result, collection);
	}

	/**
	 * Loads the inventory with display name normalize async.
	 * @param displayNameNormalize Provides the display name normalize value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param inventoryFindOptions Provides the inventory find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadInventoryWithDisplayNameNormalizeAsync(displayNameNormalize: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(inventoryFindOptions)
		});

		if (!result) return null;
		return new Inventory(result, collection);
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
	 * Creates the inventory async.
	 * @param result Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createInventoryAsync(result: any, gameId: string): Promise<Inventory> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Inventory", gameId);

		await collection.insertOne(result);
		return new Inventory(result, collection);
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
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadInventoryStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Inventory.StatisticsLog", gameId);

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
	 * Loads the group messages async.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupMessagesAsync(groupId: string, gameId: string, skip: number, limit: number): Promise<mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.runtimeGameCollection("Group.Message", gameId);

		return collection.find({
			groupId: groupId,
		}).sort({
			tsCreate: -1
		}).skip(skip).limit(limit);
	}

	/**
	 * Creates the group message async.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param senderId Provides the sender ID value used by this operation.
	 * @param senderType Provides the sender type value used by this operation.
	 * @param message Provides the message value used by this operation.
	 * @param tsCreate Provides the timestamp create value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createGroupMessageAsync(groupId: string, gameId: string, senderId: string, senderType: number, message: string, tsCreate: number): Promise<mongoDB.Document> {
		// Stores the collection value used in the current execution flow.
		let collection = this.runtimeGameCollection("Group.Message", gameId);

		return collection.insertOne({
			groupId: groupId,
			senderId: senderId,
			senderType: senderType,
			message: message,
			tsCreate: tsCreate,
		});
	}

	/**
	 * Executes the insert group statistics log async workflow asynchronously.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertGroupStatisticsLogAsync(groupId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		await collection.insertOne({
			groupId: groupId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Executes the insert group statistics logs async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	public async insertGroupStatisticsLogsAsync(requests: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	/**
	 * Executes the insert group currency log async workflow asynchronously.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param startValue Provides the start value value used by this operation.
	 * @param finalValue Provides the final value value used by this operation.
	 * @param log Provides the log value used by this operation.
	 */
	public async insertGroupCurrencyLogAsync(groupId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.CurrencyLog", gameId);

		await collection.insertOne({
			groupId: groupId,
			key: key,
			amount: amount,
			startValue: startValue,
			finalValue: finalValue,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			log: log,
		});
	}

	/**
	 * Loads the group statistics log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadGroupStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Loads the group currency log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadGroupCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Loads the upload file info async.
	 * @param fileId Provides the file ID value used by this operation.
	 * @param fileUploadInfoFindOptions Provides the file upload info find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadUploadFileInfoAsync(fileId: string, fileUploadInfoFindOptions?: FileUploadInfoFindOptions): Promise<UploadFileInfo> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("UploadFileInfo");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ fileId: fileId }, {
			projection: this.getFindOptions(fileUploadInfoFindOptions)
		});

		if (result) {
			return new UploadFileInfo(result, collection);
		}

		return null;
	}

	/**
	 * Creates the upload file info async.
	 * @param result Provides the result value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createUploadFileInfoAsync(result: any): Promise<UploadFileInfo> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemCollection("UploadFileInfo");

		await collection.insertOne(result);
		return new UploadFileInfo(result, collection);
	}

	/**
	 * Returns the find options.
	 * @param findOptions Provides the find options value used by this operation.
	 * @returns Returns the find options.
	 */
	private getFindOptions(findOptions: any): { [k: string]: boolean } {
		if (findOptions == null) return null;

		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: boolean } = {};

		let keys = Object.keys(findOptions);
		keys.forEach((key: string) => {
			if (findOptions[key] == true) answer[key] = true;
		});

		return answer;
	}

	public startSession(): mongoDB.ClientSession {
		return this.client.startSession();
	}
}
