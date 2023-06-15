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

	public getDb(): mongoDB.Db {
		return this.db;
	}

	public init(url: string, dbName: string, options?: mongoDB.MongoClientOptions): void {
		this.client = new mongoDB.MongoClient(url, options);

		this.db = this.client.db(dbName);
	}

	public run(onMongoRunSuccess?: OnRunSuccess, onMongoRunError?: OnMongoRunError): void {
		this.client.connect((err, result) => {
			if (err) {
				if (onMongoRunError != null) onMongoRunError(err);
			} else {
				if (onMongoRunSuccess != null) onMongoRunSuccess();
			}
		});
	}

	public runtimeCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(xDatabase.RUNTIME + collectionName);
	}

	public metaCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(xDatabase.META + collectionName);
	}

	public systemCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(xDatabase.SYSTEM + collectionName);
	}

	public runtimeGameCollection(collectionName: string, gameName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(xDatabase.RUNTIME + gameName + xDatabase.DOT + collectionName);
	}

	public metaGameCollection(collectionName: string, gameName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(xDatabase.META + gameName + xDatabase.DOT + collectionName);
	}

	public systemGameCollection(collectionName: string, gameName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(xDatabase.SYSTEM + gameName + xDatabase.DOT + collectionName);
	}

	public collection(fullCollectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.db.collection(fullCollectionName);
	}

	private async convertToMasterPlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<MasterPlayer>> {
		let answer: Array<MasterPlayer> = [];
		
		while (await results.hasNext()) {
			answer.push(new MasterPlayer(await results.next(), collection));
		}

		return answer;
	}

	public async loadMasterPlayersWithGoogleAsync(googleIds: string[], skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "external.google.googleId": { $in: googleIds }}, masterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "segments": { $elementMatch: segment }}, masterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "tags": { $elementMatch: { key: key, value: value }}}, masterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $sort = {} as any;
		$sort["playerStatistics." + key] = {
			value: -1,
			tsLastUpdate: -1
		};

		let results = await collection.find({}, masterPlayerFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let $sort = {} as any;
		$sort["playerCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, masterPlayerFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadPositionMasterPlayerLeaderboardWithStatisticsAsync(key: string, userId: string): Promise<number> {
		let collection = this.systemCollection("MasterPlayer");

		let options = {} as any;
		options["playerStatistics." + key] = true;

		let thisPlayer = await collection.findOne({ "userId": userId }, options);
		if (thisPlayer == null) return -1;

		let playerStatistics = thisPlayer["playerStatistics"];
		if (playerStatistics == null) return -1;

		let score = playerStatistics.value;
		let tsLastUpdate = playerStatistics.tsLastUpdate;
		let filter = {} as any;
		filter["playerStatistics." + key] = {
			$and: [{
				$gt: {
					value: score,
				},
				$lt: {
					tsLastUpdate: tsLastUpdate
				}
			}],
		}
		return await collection.countDocuments(filter);
	}

	public async loadPositionMasterPlayerLeaderboardWithCurrencies(key: string, userId: string): Promise<number> {
		let collection = this.systemCollection("MasterPlayer");

		let options = {} as any;
		options["playerCurrencies." + key] = true;

		let thisPlayer = await collection.findOne({ "userId": userId }, options);
		if (thisPlayer == null) return -1;

		let playerCurrencies = thisPlayer["playerCurrencies"];
		if (playerCurrencies == null) return -1;

		let score = playerCurrencies.value;
		let filter = {} as any;

		filter["playerCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments(filter);
	}

	public async loadMasterPlayerAsync(userId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "userId": userId }, masterPlayerFindOptions as any);
		if (result) {
			let thisPlayer = new MasterPlayer(result, collection);
			return thisPlayer;
		}

		return null;
	}

	public async loadMasterPlayerByCustomDeviceIdAsync(customDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.customDeviceId": customDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByAndroidDeviceIdAsync(androidDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.androidDeviceId": androidDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByiOSDeviceIdAsync(iOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.iOSDeviceId": iOSDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByWindowsPhoneDeviceIdAsync(windowsPhoneDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.windowsPhoneDeviceId": windowsPhoneDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByWindowsDeviceIdAsync(windowsDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.windowsDeviceId": windowsDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByLinuxDeviceIdAsync(linuxDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.linuxDeviceId": linuxDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByMacOSDeviceIdAsync(macOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.macOSDeviceId": macOSDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByEditorDeviceIdAsync(editorDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.device.editorDeviceId": editorDeviceId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByAccountUsernameAsync(username: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.account.username": username }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByCustomIdAsync(customId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.custom.customId": customId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByAppleAsync(appleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.apple.appleId": appleId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByGoogleAsync(googleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.google.googleId": googleId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByFacebookAsync(facebookId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");
		let result = await collection.findOne({ "external.facebook.facebookId": facebookId }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async loadMasterPlayerByGenericServiceAsync(serviceName: string, userId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let filter = {} as any;
		filter["external.genericService.genericServices." + serviceName + ".userId"] = userId;

		let result = await collection.findOne(filter, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async createMasterPlayerAsync(result: any): Promise<MasterPlayer> {
		let collection = this.systemCollection("GamePlayer");

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

		let results = await collection.find({ "segments": { $elementMatch: segment }}, gamePlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let results = await collection.find({ "tags": { $elementMatch: { key: key, value: value }}}, gamePlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $sort = {} as any;
		$sort["playerStatistics." + key] = {
			value: -1,
			tsLastUpdate: -1
		};

		let results = await collection.find({}, gamePlayerFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadGamePlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let $sort = {} as any;
		$sort["playerCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, gamePlayerFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToGamePlayers(results, collection);
	}

	public async loadPositionGamePlayerLeaderboardWithStatisticsAsync(key: string, userId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let options = {} as any;
		options["playerStatistics." + key] = true;

		let thisPlayer = await collection.findOne({ "userId": userId }, options);
		if (thisPlayer == null) return -1;

		let playerStatistics = thisPlayer["playerStatistics"];
		if (playerStatistics == null) return -1;

		let score = playerStatistics.value;
		let tsLastUpdate = playerStatistics.tsLastUpdate;
		let filter = {} as any;
		filter["playerStatistics." + key] = {
			$and: [{
				$gt: {
					value: score,
				},
				$lt: {
					tsLastUpdate: tsLastUpdate
				}
			}],
		}
		return await collection.countDocuments(filter);
	}

	public async loadPositionGamePlayerLeaderboardWithCurrenciesAsync(key: string, userId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let options = {} as any;
		options["playerCurrencies." + key] = true;

		let thisPlayer = await collection.findOne({ "userId": userId }, options);
		if (thisPlayer == null) return -1;

		let playerCurrencies = thisPlayer["playerCurrencies"];
		if (playerCurrencies == null) return -1;

		let score = playerCurrencies.value;
		let filter = {} as any;

		filter["playerCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments(filter);
	}

	public async loadGamePlayerAsync(userId: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		let collection = this.systemGameCollection("GamePlayer", gameId);
		let result = await collection.findOne({ "userId": userId }, gamePlayerFindOptions as any);
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

	private async convertToCharacterPlayers(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<CharacterPlayer>> {
		let answer: Array<CharacterPlayer> = [];
		
		while (await results.hasNext()) {
			answer.push(new CharacterPlayer(await results.next(), collection));
		}

		return answer;
	}

	public async loadCharacterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let results = await collection.find({ "segments": { $elementMatch: segment }}, characterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let results = await collection.find({ "tags": { $elementMatch: { key: key, value: value }}}, characterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $sort = {} as any;
		$sort["playerStatistics." + key] = {
			value: -1,
			tsLastUpdate: -1
		};

		let results = await collection.find({}, characterPlayerFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadCharacterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let $sort = {} as any;
		$sort["playerCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, characterPlayerFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToCharacterPlayers(results, collection);
	}

	public async loadPositionCharacterPlayerLeaderboardWithStatisticsAsync(key: string, userId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let options = {} as any;
		options["playerStatistics." + key] = true;

		let thisPlayer = await collection.findOne({ "userId": userId }, options);
		if (thisPlayer == null) return -1;

		let playerStatistics = thisPlayer["playerStatistics"];
		if (playerStatistics == null) return -1;

		let score = playerStatistics.value;
		let tsLastUpdate = playerStatistics.tsLastUpdate;
		let filter = {} as any;
		filter["playerStatistics." + key] = {
			$and: [{
				$gt: {
					value: score,
				},
				$lt: {
					tsLastUpdate: tsLastUpdate
				}
			}],
		}
		return await collection.countDocuments(filter);
	}

	public async loadPositionCharacterPlayerLeaderboardWithCurrenciesAsync(key: string, userId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let options = {} as any;
		options["playerCurrencies." + key] = true;

		let thisPlayer = await collection.findOne({ "userId": userId }, options);
		if (thisPlayer == null) return -1;

		let playerCurrencies = thisPlayer["playerCurrencies"];
		if (playerCurrencies == null) return -1;

		let score = playerCurrencies.value;
		let filter = {} as any;

		filter["playerCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments(filter);
	}

	public async loadCharacterPlayerAsync(characterId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);
		let result = await collection.findOne({ "characterId": characterId }, characterPlayerFindOptions as any);
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

	private async convertToGroups(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<Group>> {
		let answer: Array<Group> = [];
		
		while (await results.hasNext()) {
			answer.push(new Group(await results.next(), collection));
		}

		return answer;
	}

	public async loadGroupsWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let results = await collection.find({ "segments": { $elementMatch: segment }}, groupFindOptions as any).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let results = await collection.find({ "tags": { $elementMatch: { key: key, value: value }}}, groupFindOptions as any).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $sort = {} as any;
		$sort["groupStatistics." + key] = {
			value: -1,
			tsLastUpdate: -1
		};

		let results = await collection.find({}, groupFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadGroupsLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		let collection = this.systemGameCollection("Group", gameId);

		let $sort = {} as any;
		$sort["groupCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, groupFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	public async loadPositionGroupLeaderboardWithStatisticsAsync(key: string, groupId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("Group", gameId);

		let options = {} as any;
		options["groupStatistics." + key] = true;

		let thisPlayer = await collection.findOne({ "groupId": groupId }, options);
		if (thisPlayer == null) return -1;

		let playerStatistics = thisPlayer["playerStatistics"];
		if (playerStatistics == null) return -1;

		let score = playerStatistics.value;
		let tsLastUpdate = playerStatistics.tsLastUpdate;
		let filter = {} as any;
		filter["groupStatistics." + key] = {
			$and: [{
				$gt: {
					value: score,
				},
				$lt: {
					tsLastUpdate: tsLastUpdate
				}
			}],
		}
		return await collection.countDocuments(filter);
	}

	public async loadPositionGroupLeaderboardWithCurrenciesAsync(key: string, groupId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("Group", gameId);

		let options = {} as any;
		options["groupCurrencies." + key] = true;

		let thisPlayer = await collection.findOne({ "groupId": groupId }, options);
		if (thisPlayer == null) return -1;

		let playerCurrencies = thisPlayer["groupCurrencies"];
		if (playerCurrencies == null) return -1;

		let score = playerCurrencies.value;
		let filter = {} as any;

		filter["groupCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments(filter);
	}

	public async loadGroupAsync(groupId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		let collection = this.systemGameCollection("Group", gameId);
		let result = await collection.findOne({ "groupId": groupId }, groupFindOptions as any);
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

		let results = await collection.find({ "segments": { $elementMatch: segment }}, inventoryFindOptions as any).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let results = await collection.find({ "tags": { $elementMatch: { key: key, value: value }}}, inventoryFindOptions as any).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let $sort = {} as any;
		$sort["itemStatistics." + key] = {
			value: -1,
			tsLastUpdate: -1
		};

		let results = await collection.find({}, inventoryFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadInventoriesLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let $sort = {} as any;
		$sort["itemCurrencies." + key + ".value"] = -1;

		let results = await collection.find({}, inventoryFindOptions as any).sort($sort).skip(skip).limit(limit);
		return this.convertToInventories(results, collection);
	}

	public async loadPositionInventoryLeaderboardWithStatisticsAsync(key: string, itemId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let options = {} as any;
		options["itemStatistics." + key] = true;

		let thisPlayer = await collection.findOne({ "itemId": itemId }, options);
		if (thisPlayer == null) return -1;

		let playerStatistics = thisPlayer["playerStatistics"];
		if (playerStatistics == null) return -1;

		let score = playerStatistics.value;
		let tsLastUpdate = playerStatistics.tsLastUpdate;
		let filter = {} as any;
		filter["itemStatistics." + key] = {
			$and: [{
				$gt: {
					value: score,
				},
				$lt: {
					tsLastUpdate: tsLastUpdate
				}
			}],
		}
		return await collection.countDocuments(filter);
	}

	public async loadPositionInventoryLeaderboardWithCurrenciesAsync(key: string, itemId: string, gameId: string): Promise<number> {
		let collection = this.systemGameCollection("Inventory", gameId);

		let options = {} as any;
		options["itemCurrencies." + key] = true;

		let thisPlayer = await collection.findOne({ "itemId": itemId }, options);
		if (thisPlayer == null) return -1;

		let playerCurrencies = thisPlayer["groupCurrencies"];
		if (playerCurrencies == null) return -1;

		let score = playerCurrencies.value;
		let filter = {} as any;

		filter["itemCurrencies." + key] = {
			$gt: {
				value: score,
			}
		}
		return await collection.countDocuments(filter);
	}

	public async loadInventoryAsync(itemId: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory> {
		let collection = this.systemGameCollection("Inventory", gameId);
		let result = await collection.findOne({ "itemId": itemId }, inventoryFindOptions as any);
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
}
