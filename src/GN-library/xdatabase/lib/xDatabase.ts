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
	private static readonly DOT: string = ".";
	private static readonly RUNTIME: string = "Runtime" + xDatabase.DOT;
	private static readonly META: string = "Meta" + xDatabase.DOT;
	private static readonly SYSTEM: string = "System" + xDatabase.DOT;

	private client: mongoDB.MongoClient;
	private db: mongoDB.Db;

	private logClient: mongoDB.MongoClient;
	private logDb: mongoDB.Db;

	public getDb(): mongoDB.Db {
		return this.db;
	}

	public getLogDb(): mongoDB.Db {
		return this.logDb;
	}

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

	public run(onMongoRunSuccess?: OnRunSuccess, onMongoRunError?: OnMongoRunError): void {
		this.client.connect().then(result => {
			if (onMongoRunSuccess != null) onMongoRunSuccess();
		}).catch(err => {
			if (onMongoRunError != null) onMongoRunError(err);
		});
	}

	public runtimeCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.RUNTIME + collectionName);
	}

	public metaCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.META + collectionName);
	}

	public systemCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.SYSTEM + collectionName);
	}

	public runtimeGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.RUNTIME + gameId + xDatabase.DOT + collectionName);
	}

	public metaGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.META + gameId + xDatabase.DOT + collectionName);
	}

	public systemGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.SYSTEM + gameId + xDatabase.DOT + collectionName);
	}

	public collection<TSchema extends mongoDB.Document = mongoDB.Document>(fullCollectionName: string): mongoDB.Collection<TSchema> {
		return this.db.collection<TSchema>(fullCollectionName);
	}

	public createCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, options?: mongoDB.CreateCollectionOptions) {
		return this.db.createCollection<TSchema>(collectionName, options)
	}

	public createIndex<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }): void {
		let collection = this.collection<TSchema>(collectionName);

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

	public logRuntimeCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.RUNTIME + collectionName);
	}

	public logMetaCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.META + collectionName);
	}

	public logSystemCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.SYSTEM + collectionName);
	}

	public logRuntimeGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.RUNTIME + gameId + xDatabase.DOT + collectionName);
	}

	public logMetaGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.META + gameId + xDatabase.DOT + collectionName);
	}

	public logSystemGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.SYSTEM + gameId + xDatabase.DOT + collectionName);
	}

	public logCollection<TSchema extends mongoDB.Document = mongoDB.Document>(fullCollectionName: string): mongoDB.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

	public logCreateCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, options?: mongoDB.CreateCollectionOptions) {
		return this.logDb.createCollection<TSchema>(collectionName, options)
	}

	public logCreateIndex<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }): void {
		let collection = this.logCollection<TSchema>(collectionName);

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

	private async convertToMasterPlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<MasterPlayer>> {
		let answer: Array<MasterPlayer> = [];

		while (await results.hasNext()) {
			answer.push(new MasterPlayer(await results.next(), collection));
		}

		return answer;
	}

	public async loadMasterPlayersWithGoogleAsync(googleIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "external.google": { $in: { "googleId": googleIds } } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithGooglePlayGameServiceAsync(playerIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "external.googlePlayGameService": { $in: { "playerId": playerIds } } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithGameCenterAsync(playerIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "external.gameCenter": { $in: { "playerId": playerIds } } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithFacebookAsync(facebookIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "external.facebook": { $in: { "facebookId": facebookIds } } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithAppleAsync(appleIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "external.apple": { $in: { "appleId": appleIds } } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithGenericServiceAsync(genericService: string, genericIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");
		let $filter = {} as any;
		$filter["external.genericService.genericServices." + genericService] = { $in: { "genericId": genericIds } };

		let results = await collection.find($filter, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $filter = {} as any;
		$filter["tags." + key] = value;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayerWithDisplayNameAsync(displayName: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (!result) return null;
		return new MasterPlayer(result, collection);
	}

	public async loadMasterPlayerWithDisplayNameNormalizeAsync(displayNameNormalize: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (!result) return null;
		return new MasterPlayer(result, collection);
	}

	public async loadMasterPlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, direction: -1 | 1, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $sort = {} as any;
		$sort["playerStatistics." + key + ".value"] = direction;
		$sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithStatisticsAllAsync(key: string, direction: -1 | 1, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $filter = {} as any;
		$filter["playerStatistics." + key + ".value"] = { $ne: null };

		let $sort = {} as any;
		$sort["playerStatistics." + key + ".value"] = direction;
		$sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $sort = {} as any;
		$sort["playerCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $sort = {} as any;
		$sort["tsLastLogin"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithCreateAsync(skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $sort = {} as any;
		$sort["_id"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadPositionMasterPlayerLeaderboardWithStatisticsAsync(key: string, userId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		let collection = this.systemCollection("MasterPlayer");

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerStatistics: true
		};

		let thisPlayer = await this.loadMasterPlayerAsync(userId, masterPlayerFindOptions);
		if (thisPlayer == null) return -1;

		let score = initialValue;

		let playerStatistics = thisPlayer.getPlayerStatistics(key);
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		if (playerStatistics != null) {
			score = playerStatistics.value;
			tsLastUpdate = playerStatistics.tsLastUpdate;
		}

		let $filter = {} as any;

		if (direction == -1) {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["playerStatistics." + key + ".value"] = { $gt: score };
			condition2["playerStatistics." + key + ".value"] = score;
			condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}
		else {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["playerStatistics." + key + ".value"] = { $lt: score };
			condition2["playerStatistics." + key + ".value"] = score;
			condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	public async loadPositionMasterPlayerLeaderboardWithCurrencies(key: string, userId: string): Promise<number> {
		let collection = this.systemCollection("MasterPlayer");

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerCurrencies: true
		};

		let thisPlayer = await this.loadMasterPlayerAsync(userId, masterPlayerFindOptions);
		if (thisPlayer == null) return -1;

		let score = 0;

		let playerCurrencies = thisPlayer.getPlayerCurrency(key);
		if (playerCurrencies != null) {
			score = playerCurrencies.value;
		}

		let $filter = {} as any;

		$filter["playerCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments($filter);
	}

	public async loadMasterPlayerAsync(userId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ userId: userId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			let thisPlayer = new MasterPlayer(result, collection);
			return thisPlayer;
		}

		return null;
	}

	public async loadMasterPlayerByCustomDeviceIdAsync(customDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.customDeviceId": customDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByAndroidDeviceIdAsync(androidDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.androidDeviceId": androidDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByiOSDeviceIdAsync(iOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.iOSDeviceId": iOSDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByWindowsPhoneDeviceIdAsync(windowsPhoneDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.windowsPhoneDeviceId": windowsPhoneDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByWindowsDeviceIdAsync(windowsDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.windowsDeviceId": windowsDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByLinuxDeviceIdAsync(linuxDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.linuxDeviceId": linuxDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByMacOSDeviceIdAsync(macOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.macOSDeviceId": macOSDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByEditorDeviceIdAsync(editorDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.device.editorDeviceId": editorDeviceId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByAccountUsernameAsync(username: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.account.username": username }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByCustomIdAsync(customId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.custom.customId": customId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByAppleAsync(appleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.apple.appleId": appleId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByGoogleAsync(googleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.google.googleId": googleId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByGooglePlayGameServiceAsync(playerId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.googlePlayGameService.playerId": playerId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByGameCenterAsync(playerId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.gameCenter.playerId": playerId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByFacebookAsync(facebookId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "external.facebook.facebookId": facebookId }, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async loadMasterPlayerByGenericServiceAsync(serviceName: string, serviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let $filter = {} as any;
		$filter["external.genericService.genericServices." + serviceName + ".serviceId"] = serviceId;

		let result = await collection.findOne($filter, {
			projection: this.getFindOptions(masterPlayerFindOptions)
		});

		if (result) {
			return new MasterPlayer(result, collection);
		}

		return null;
	}

	public async createMasterPlayerAsync(result: any): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		await collection.insertOne(result);
		return new MasterPlayer(result, collection);
	}

	private async convertToGamePlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<GamePlayer>> {
		let answer: Array<GamePlayer> = [];

		while (await results.hasNext()) {
			answer.push(new GamePlayer(await results.next(), collection));
		}

		return answer;
	}

	public async loadGamePlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $filter = {} as any;
		$filter["tags." + key] = value;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayerWithDisplayNameAsync(displayName: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		let collection = this.systemCollection("GamePlayer");

		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

		if (!result) return null;
		return new GamePlayer(result, collection);
	}

	public async loadGamePlayerWithDisplayNameNormalizeAsync(displayNameNormalize: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		let collection = this.systemCollection("GamePlayer");

		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

		if (!result) return null;
		return new GamePlayer(result, collection);
	}

	public async loadGamePlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, direction: -1 | 1, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $sort = {} as any;
		$sort["playerStatistics." + key + ".value"] = direction;
		$sort["playerStatistics." + key + ".tsLastUpdate"] = direction;

		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersLeaderboardWithStatisticsAllAsync(key: string, gameId: string, direction: -1 | 1, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $filter = {} as any;
		$filter["playerStatistics." + key + ".value"] = { $ne: null };

		let $sort = {} as any;
		$sort["playerStatistics." + key + ".value"] = direction;
		$sort["playerStatistics." + key + ".tsLastUpdate"] = direction;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $sort = {} as any;
		$sort["_id"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $sort = {} as any;
		$sort["tsLastLogin"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadFriendGamePlayersLeaderboardWithStatisticsAsync(friendIds: string[], gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let results = await collection.find({ userId: { $in: friendIds } }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

		let answer: GamePlayer[] = [];

		while (await results.hasNext()) {
			let result = await results.next();
			answer.push(new GamePlayer(result, collection));
		}

		return answer;
	}

	public async loadGamePlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $sort = {} as any;
		$sort["playerCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadPositionGamePlayerLeaderboardWithStatisticsAsync(key: string, userId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerStatistics: true
		};

		let thisPlayer = await this.loadGamePlayerAsync(userId, gameId, masterPlayerFindOptions);
		if (thisPlayer == null) return -1;

		let score = initialValue;
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		let playerStatistics = thisPlayer.getPlayerStatistics(key);
		if (playerStatistics != null) {
			score = playerStatistics.value;
			tsLastUpdate = playerStatistics.tsLastUpdate;
		}

		let $filter = {} as any;
		if (direction == -1) {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["playerStatistics." + key + ".value"] = { $gt: score };
			condition2["playerStatistics." + key + ".value"] = score;
			condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}
		else {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["playerStatistics." + key + ".value"] = { $lt: score };
			condition2["playerStatistics." + key + ".value"] = score;
			condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	public async loadPositionGamePlayerLeaderboardWithCurrenciesAsync(key: string, userId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerCurrencies: true
		};

		let thisPlayer = await this.loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);
		if (thisPlayer == null) return -1;

		let score = 0;
		let playerCurrencies = thisPlayer.getPlayerCurrency(key);
		if (playerCurrencies != null) {
			score = playerCurrencies.value;
		}

		let $filter = {} as any;

		$filter["playerCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments($filter);
	}

	public async loadGamePlayerAsync(userId: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let result = await collection.findOne({ userId: userId }, {
			projection: this.getFindOptions(gamePlayerFindOptions)
		});

		if (result) {
			return new GamePlayer(result, collection);
		}

		return null;
	}

	public async createGamePlayerAsync(result: any, gameId: string): Promise<GamePlayer> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		await collection.insertOne(result);
		return new GamePlayer(result, collection);
	}

	public async insertMasterPlayerStatisticsLogAsync(userId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertMasterPlayerCurrencyLogAsync(userId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertMasterPlayerStatisticsLogsAsync(requests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[]): Promise<void> {
		let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

		await collection.insertMany(requests);
	}

	public async loadMasterPlayerStatisticsLogAsync($filter: {}, limit: number) {
		let collection = this.logRuntimeCollection("MasterPlayer.StatisticsLog");

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async loadMasterPlayerCurrencyLogAsync($filter: {}, limit: number) {
		let collection = this.logRuntimeCollection("MasterPlayer.CurrencyLog");

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async insertGamePlayerStatisticsLogAsync(userId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertGamePlayerStatisticsLogsAsync(requests: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	public async insertGamePlayerCurrencyLogAsync(userId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async loadGamePlayerStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async loadGamePlayerCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	private async convertToCharacterPlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<CharacterPlayer>> {
		let answer: Array<CharacterPlayer> = [];

		while (await results.hasNext()) {
			answer.push(new CharacterPlayer(await results.next(), collection));
		}

		return answer;
	}

	public async loadCharacterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $filter = {} as any;
		$filter["tags." + key] = value;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayerWithDisplayNameAsync(displayName: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

		if (!result) return null;
		return new CharacterPlayer(result, collection);
	}

	public async loadCharacterPlayerWithDisplayNameNormalizeAsync(displayNameNormalize: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

		if (!result) return null;
		return new CharacterPlayer(result, collection);
	}

	public async loadCharacterPlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $sort = {} as any;
		$sort["playerStatistics." + key + ".value"] = direction;
		$sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

		let $filter = {} as any;
		if (catalogId) {
			$filter["catalogId"] = catalogId;
		}

		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $filter = {} as any;
		$filter["playerStatistics." + key + ".value"] = { $ne: null };
		if (catalogId) $filter["catalogId"] = catalogId;

		let $sort = {} as any;
		$sort["playerStatistics." + key + ".value"] = direction;
		$sort["playerStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $sort = {} as any;
		$sort["_id"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $sort = {} as any;
		$sort["tsLastLogin"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $sort = {} as any;
		$sort["playerCurrencies." + key + ".value"] = -1;

		let $filter = {} as any;
		if (catalogId) {
			$filter["catalogId"] = catalogId;
		}

		let results = await collection.find($filter, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadPositionCharacterPlayerLeaderboardWithStatisticsAsync(key: string, characterId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			catalogId: true,
			playerStatistics: true,
		};

		let thisPlayer = await this.loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);
		if (thisPlayer == null) return -1;
		if (catalogId && thisPlayer.getCatalogId() != catalogId) return -1;

		let score = initialValue;
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		let playerStatistics = thisPlayer.getPlayerStatistics(key);
		if (playerStatistics != null) {
			score = playerStatistics.value;
			tsLastUpdate = playerStatistics.tsLastUpdate;
		}

		let $filter = {} as any;
		if (catalogId) {
			$filter["catalogId"] = catalogId;
		}

		if (direction == -1) {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["playerStatistics." + key + ".value"] = { $gt: score };
			condition2["playerStatistics." + key + ".value"] = score;
			condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}
		else {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["playerStatistics." + key + ".value"] = { $lt: score };
			condition2["playerStatistics." + key + ".value"] = score;
			condition2["playerStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	public async loadPositionCharacterPlayerLeaderboardWithCurrenciesAsync(key: string, userId: string, catalogId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerCurrencies: true,
			catalogId: true,
		};

		let thisPlayer = await this.loadCharacterPlayerAsync(userId, gameId, characterPlayerFindOptions);
		if (thisPlayer == null) return -1;
		if (catalogId && thisPlayer.getCatalogId() != catalogId) return -1;

		let score = 0;

		let playerCurrencies = thisPlayer.getPlayerCurrency(key);
		if (playerCurrencies != null) {
			score = playerCurrencies.value;
		}

		let $filter = {} as any;

		$filter["playerCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments($filter);
	}

	public async loadFriendCharacterPlayersLeaderboardWithStatisticsAsync(friendIds: string[], gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let results = await collection.find({ characterId: { $in: friendIds } }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

		let answer: CharacterPlayer[] = [];

		while (await results.hasNext()) {
			let result = await results.next();
			answer.push(new CharacterPlayer(result, collection));
		}

		return answer;
	}

	public async loadCharacterPlayerAsync(characterId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let result = await collection.findOne({ characterId: characterId }, {
			projection: this.getFindOptions(characterPlayerFindOptions)
		});

		if (result) {
			return new CharacterPlayer(result, collection);
		}

		return null;
	}

	public async createCharacterPlayerAsync(result: any, gameId: string): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		await collection.insertOne(result);
		return new CharacterPlayer(result, collection);
	}

	public async insertCharacterPlayerStatisticsLogAsync(characterId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertCharacterPlayerStatisticsLogsAsync(requests: { characterId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	public async insertCharacterPlayerCurrencyLogAsync(characterId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertStoreInventoryLogAsync(storeId: string, gameId: string, id: string, type: number,
		priceCurrencyStartValues: { key: string, value: number }[],
		priceCurrencyAmountValues: { key: string, value: number }[],
		priceCurrencyFinalValues: { key: string, value: number }[],
		storeCurrencyStartValues: { key: string, value: number }[],
		storeCurrencyAmountValues: { key: string, value: number }[],
		storeCurrencyFinalValues: { key: string, value: number }[],
		storeItemFinalValues: { catalogId: string, classId: string, itemId: string }[],
		transactionId: string, storeReceiveType: number, log: string): Promise<void> {
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

	public async getStoreInventoryLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("StoreInventory.StoreLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async loadCharacterPlayerStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async loadCharacterPlayerCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	private async convertToGroups(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<Group>> {
		let answer: Array<Group> = [];

		while (await results.hasNext()) {
			answer.push(new Group(await results.next(), collection));
		}

		return answer;
	}

	public async loadGroupsWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(groupFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $filter = {} as any;
		$filter["tags." + key] = value;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupWithDisplayNameAsync(displayName: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		let collection = this.systemGameCollection("Group", gameId);

		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (!result) return null;
		return new Group(result, collection);
	}

	public async loadGroupWithDisplayNameNormalizeAsync(displayNameNormalize: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		let collection = this.systemGameCollection("Group", gameId);

		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (!result) return null;
		return new Group(result, collection);
	}

	public async loadGroupsWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(groupFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $sort = {} as any;
		$sort["groupStatistics." + key + ".value"] = direction;
		$sort["groupStatistics." + key + ".tsLastUpdate"] = 1;

		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $filter = {} as any;
		$filter["groupStatistics." + key + ".value"] = { $ne: null };
		if (catalogId) $filter["catalogId"] = catalogId;

		let $sort = {} as any;
		$sort["groupStatistics." + key + ".value"] = direction;
		$sort["groupStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $sort = {} as any;
		$sort["_id"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $sort = {} as any;
		$sort["groupCurrencies." + key + ".value"] = -1;

		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadPositionGroupLeaderboardWithStatisticsAsync(key: string, groupId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		let collection = this.systemGameCollection("Group", gameId);

		let groupFindOptions: GroupFindOptions = {
			groupStatistics: true,
			catalogId: true,
		};

		let thisGroup = await this.loadGroupAsync(groupId, gameId, groupFindOptions);
		if (thisGroup == null) return -1;
		if (catalogId && thisGroup.getCatalogId() != catalogId) return -1;

		let score = initialValue;
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		let groupStatistics = thisGroup.getGroupStatistics(key);
		if (groupStatistics != null) {
			score = groupStatistics.value;
			tsLastUpdate = groupStatistics.tsLastUpdate;
		}

		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		if (direction == -1) {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["groupStatistics." + key + ".value"] = { $gt: score };
			condition2["groupStatistics." + key + ".value"] = score;
			condition2["groupStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}
		else {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["groupStatistics." + key + ".value"] = { $lt: score };
			condition2["groupStatistics." + key + ".value"] = score;
			condition2["groupStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	public async loadPositionGroupLeaderboardWithCurrenciesAsync(key: string, groupId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("Group", gameId);

		let groupFindOptions: GroupFindOptions = {
			groupCurrencies: true
		};

		let thisGroup = await this.loadGroupAsync(groupId, gameId, groupFindOptions);
		if (thisGroup == null) return -1;

		let score = 0;

		let groupCurrency = thisGroup.getGroupCurrency(key);
		if (groupCurrency != null) {
			score = groupCurrency.value;
		}

		let $filter = {} as any;

		$filter["groupCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments($filter);
	}

	public async loadGroupAsync(groupId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		let collection = this.systemGameCollection("Group", gameId);

		let result = await collection.findOne({ groupId: groupId }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (result) {
			return new Group(result, collection);
		}

		return null;
	}

	public async createGroupAsync(result: any, gameId: string): Promise<Group> {
		let collection = this.systemGameCollection("Group", gameId);

		await collection.insertOne(result);
		return new Group(result, collection);
	}

	private async convertToInventories(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<Inventory>> {
		let answer: Array<Inventory> = [];

		while (await results.hasNext()) {
			answer.push(new Inventory(await results.next(), collection));
		}

		return answer;
	}

	public async loadInventoriesWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let $filter = {} as any;
		$filter["tags." + key] = value;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoryWithDisplayNameAsync(displayName: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let result = await collection.findOne({ displayName: displayName }, {
			projection: this.getFindOptions(inventoryFindOptions)
		});

		if (!result) null;
		return new Inventory(result, collection);
	}

	public async loadInventoryWithDisplayNameNormalizeAsync(displayNameNormalize: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let result = await collection.findOne({ displayNameNormalize: displayNameNormalize }, {
			projection: this.getFindOptions(inventoryFindOptions)
		});

		if (!result) null;
		return new Inventory(result, collection);
	}

	public async loadInventoriesWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let $sort = {} as any;
		$sort["itemStatistics." + key + ".value"] = direction;
		$sort["itemStatistics." + key + ".tsLastUpdate"] = 1;

		let $filter = {} as any;
		$filter["catalogId"] = catalogId;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let $filter = {} as any;
		$filter["itemStatistics." + key + ".value"] = { $ne: null };
		if (catalogId) $filter["catalogId"] = catalogId;

		let $sort = {} as any;
		$sort["itemStatistics." + key + ".value"] = direction;
		$sort["itemStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).sort($sort);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let $sort = {} as any;
		$sort["_id"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(inventoryFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadPositionInventoryLeaderboardWithStatisticsAsync(key: string, itemId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let inventoryFindOptions: InventoryFindOptions = {
			itemStatistics: true,
			catalogId: true,
		};

		let thisInventory = await this.loadInventoryAsync(itemId, gameId, inventoryFindOptions);
		if (thisInventory == null) return -1;
		if (catalogId && thisInventory.getCatalogId() != catalogId) return -1;

		let score = initialValue;
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		let itemStatistics = thisInventory.getItemStatistics(key);
		if (itemStatistics != null) {
			score = itemStatistics.value;
			tsLastUpdate = itemStatistics.tsLastUpdate;
		}

		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		if (direction == -1) {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["itemStatistics." + key + ".value"] = { $gt: score };
			condition2["itemStatistics." + key + ".value"] = score;
			condition2["itemStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}
		else {
			let condition1 = {} as any;
			let condition2 = {} as any;

			condition1["itemStatistics." + key + ".value"] = { $lt: score };
			condition2["itemStatistics." + key + ".value"] = score;
			condition2["itemStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			$filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	public async loadInventoryAsync(itemId: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let result = await collection.findOne({ itemId: itemId }, {
			projection: this.getFindOptions(inventoryFindOptions)
		});

		if (result) {
			return new Inventory(result, collection);
		}

		return null;
	}

	public async createInventoryAsync(result: any, gameId: string): Promise<Inventory> {
		let collection = this.systemGameCollection("Inventory", gameId);

		await collection.insertOne(result);
		return new Inventory(result, collection);
	}

	public async insertInventoryStatisticsLogAsync(itemId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertInventoryStatisticsLogsAsync(requests: { itemId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		let collection = this.logRuntimeGameCollection("Inventory.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	public async loadInventoryStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("Inventory.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	private async convertToStoreInventories(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<StoreInventory>> {
		let answer: Array<StoreInventory> = [];

		while (await results.hasNext()) {
			answer.push(new StoreInventory(await results.next(), collection));
		}

		return answer;
	}

	public async getStoreInventoryUsedAsync(storeId: string, gameId: string): Promise<{ storeId: string, useIds: { id: string, type: number, tsCreate: number }[] }> {
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		let result = await collection.findOne({ storeId: storeId });

		return result as any;
	}

	public async insertStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string, ownerType: number) {
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		collection.updateOne({ storeId: storeId }, {
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

	public async removeStoreInventoryUsedAsync(storeId: string, gameId: string, ownerIds: string[]) {
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		if (ownerIds == null) {
			await collection.deleteOne({ storeId: storeId });
		}
		else {
			collection.updateOne({ storeId: storeId }, {
				$pull: {
					useIds: {
						id: { $in: ownerIds },
					}
				} as any
			});
		}
	}

	public async getCountStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string): Promise<number> {
		let collection = this.systemGameCollection("StoreInventory.StoreUsed", gameId);

		let count = await collection.countDocuments({
			storeId: storeId,
			useIds: { $elemMatch: { id: ownerId } }
		});

		return count;
	}

	public async loadStoreInventoryAsync(storeId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		let result = await collection.findOne({ storeId: storeId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	public async loadStoreInventoryByFacebookStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		let result = await collection.findOne({ "inAppPurchase.facebookStoreId": productId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	public async loadStoreInventoryByAppleAppStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		let result = await collection.findOne({ "inAppPurchase.appleAppStoreId": productId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	public async loadStoreInventoryByGooglePlayStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		let result = await collection.findOne({ "inAppPurchase.googlePlayStoreId": productId }, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		});

		if (result) {
			return new StoreInventory(result, collection);
		}

		return null;
	}

	public async loadStoreInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<Array<StoreInventory>> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		let $filter = {} as any;
		$filter["tags." + key] = value;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		}).skip(skip).limit(limit);
		return this.convertToStoreInventories(results, collection);
	}

	public async loadStoreInventoriesLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<Array<StoreInventory>> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		let $sort = {} as any;
		$sort["_id"] = -1;

		let results = await collection.find({}, {
			projection: this.getFindOptions(storeInventoryFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToStoreInventories(results, collection);
	}

	public async createStoreInventoryAsync(result: any, gameId: string): Promise<StoreInventory> {
		let collection = this.systemGameCollection("StoreInventory", gameId);

		await collection.insertOne(result);
		return new StoreInventory(result, collection);
	}

	public async loadGroupMessagesAsync(groupId: string, gameId: string, skip: number, limit: number): Promise<mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>> {
		let collection = this.runtimeGameCollection("Group.Message", gameId);

		return collection.find({
			groupId: groupId,
		}).sort({
			tsCreate: -1
		}).skip(skip).limit(limit);
	}

	public async createGroupMessageAsync(groupId: string, gameId: string, senderId: string, senderType: number, message: string, tsCreate: number): Promise<mongoDB.Document> {
		let collection = this.runtimeGameCollection("Group.Message", gameId);

		return collection.insertOne({
			groupId: groupId,
			senderId: senderId,
			senderType: senderType,
			message: message,
			tsCreate: tsCreate,
		});
	}

	public async insertGroupStatisticsLogAsync(groupId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async insertGroupStatisticsLogsAsync(requests: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	public async insertGroupCurrencyLogAsync(groupId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void> {
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

	public async loadGroupStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async loadGroupCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		let collection = this.logRuntimeGameCollection("Group.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	public async loadUploadFileInfoAsync(fileId: string, fileUploadInfoFindOptions?: FileUploadInfoFindOptions): Promise<UploadFileInfo> {
		let collection = this.systemCollection("UploadFileInfo");

		let result = await collection.findOne({ fileId: fileId }, {
			projection: this.getFindOptions(fileUploadInfoFindOptions)
		});

		if (result) {
			return new UploadFileInfo(result, collection);
		}

		return null;
	}

	public async createUploadFileInfoAsync(result: any): Promise<UploadFileInfo> {
		let collection = this.systemCollection("UploadFileInfo");

		await collection.insertOne(result);
		return new UploadFileInfo(result, collection);
	}

	private getFindOptions(findOptions: any): { [k: string]: boolean } {
		if (findOptions == null) return null;

		let answer: { [k: string]: boolean } = {};

		let keys = Object.keys(findOptions);
		keys.forEach((key: string) => {
			if (findOptions[key] == true) answer[key] = true;
		});

		return answer;
	}
}
