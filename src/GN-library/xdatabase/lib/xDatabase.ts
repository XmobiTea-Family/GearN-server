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

	public async loadMasterPlayersBySegment(segment: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "segments": { $elementMatch: segment }}, masterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersByTag(key: string, value: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.find({ "tags": { $elementMatch: { key: key, value: value }}}, masterPlayerFindOptions as any).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayersByStatistics(key: string, value: string, direction: number, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>> {
		let collection = this.systemCollection("MasterPlayer");

		let results = await collection.aggregate([{ $match: {"playerStatistics.key": key}}], masterPlayerFindOptions as any).sort({"playerStatistics": {"key": -1}}).skip(skip).limit(limit);
		return this.convertToMasterPlayers(results, collection);
	}

	public async loadMasterPlayerAsync(userId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
		let collection = this.systemCollection("MasterPlayer");

		let result = await collection.findOne({ "_id": new mongoDB.ObjectId(userId) }, masterPlayerFindOptions as any);
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

	public async loadMasterPlayerByIOSDeviceIdAsync(iOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
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

	public async loadMasterPlayerByUsernameAsync(username: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer> {
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
		let result = await collection.findOne({ "external.genericService.genericServices": {$elemMatch: { "serviceName": serviceName, "userId": userId }} }, masterPlayerFindOptions as any);
		if (result) {
			return new MasterPlayer(result, collection);
		}
		return null;
	}

	public async createMasterPlayerAsync(masterPlayer: MasterPlayer): Promise<MasterPlayer> {
		let collection = this.systemCollection("GamePlayer");

		let result = {
			external: masterPlayer.getExternal(),
			segments: masterPlayer.getAllSegments(),
			scriptData: masterPlayer.getAllScriptData(),
			privateData: masterPlayer.getAllPrivateData(),
			displayName: masterPlayer.getDisplayName(),
			avatar: masterPlayer.getAvatar(),
			tsCreate: masterPlayer.getTsCreate(),
			tags: masterPlayer.getAllTags(),
			role: masterPlayer.getRole(),
			playerBan: masterPlayer.getPlayerBan(),
			playerDatas: masterPlayer.getAllPlayerDatas(),
			playerCurrencies: masterPlayer.getAllPlayerCurrencies(),
			playerStatistics: masterPlayer.getAllPlayerStatistics(),
			playerCharacters: masterPlayer.getAllPlayerCharacters(),
			playerInventories: masterPlayer.getAllPlayerInventories(),
			playerGroups: masterPlayer.getAllPlayerGroups(),
			playerFriends: masterPlayer.getAllPlayerFriends(),
			tsLastLogin: masterPlayer.getTsLastLogin(),
			ipAddressCreate: masterPlayer.getIpAddressCreate(),
			countryCode: masterPlayer.getCountryCode(),
		} as any;

		await collection.insertOne(result);

		return new MasterPlayer(result, collection);
	}

	public async loadGamePlayerAsync(userId: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer> {
		let collection = this.systemGameCollection("GamePlayer", gameId);
		let result = await collection.findOne({ UserId: userId }, gamePlayerFindOptions as any);
		if (result) {
			return new GamePlayer(result, collection);
		}

		return null;
	}

	public async createGamePlayerAsync(gamePlayer: GamePlayer, gameId: string): Promise<GamePlayer> {
		let collection = this.systemGameCollection("GamePlayer", gameId);

		let result = {
			userId: gamePlayer.getUserId(),
			socketId: gamePlayer.getSocketId(),
			segments: gamePlayer.getAllSegments(),
			scriptData: gamePlayer.getAllScriptData(),
			privateData: gamePlayer.getAllPrivateData(),
			displayName: gamePlayer.getDisplayName(),
			avatar: gamePlayer.getAvatar(),
			tsCreate: gamePlayer.getTsCreate(),
			tags: gamePlayer.getAllTags(),
			role: gamePlayer.getRole(),
			playerBan: gamePlayer.getPlayerBan(),
			playerDatas: gamePlayer.getAllPlayerDatas(),
			playerCurrencies: gamePlayer.getAllPlayerCurrencies(),
			playerStatistics: gamePlayer.getAllPlayerStatistics(),
			playerCharacters: gamePlayer.getAllPlayerCharacters(),
			playerInventories: gamePlayer.getAllPlayerInventories(),
			playerGroups: gamePlayer.getAllPlayerGroups(),
			playerFriends: gamePlayer.getAllPlayerFriends(),
			tsLastLogin: gamePlayer.getTsLastLogin(),
			ipAddressCreate: gamePlayer.getIpAddressCreate(),
			countryCode: gamePlayer.getCountryCode(),
		} as any;

		await collection.insertOne(gamePlayer as any);
		let thisPlayer = new GamePlayer(result, collection);

		return thisPlayer;
	}

	public async loadCharacterPlayerAsync(characterId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);
		let result = await collection.findOne({ CharacterId: characterId }, characterPlayerFindOptions as any);
		if (result) {
			return new CharacterPlayer(result, collection);
		}

		return null;
	}

	public async createCharacterPlayerAsync(characterPlayer: CharacterPlayer, gameId: string): Promise<CharacterPlayer> {
		let collection = this.systemGameCollection("CharacterPlayer", gameId);

		let result = {
			characterId: characterPlayer.getCharacterId(),
			characterCatalogId: characterPlayer.getCharacterCatalogId(),
			owner: characterPlayer.getOwner(),
			removeStatus: characterPlayer.getRemoveStatus(),
			segments: characterPlayer.getAllSegments(),
			scriptData: characterPlayer.getAllScriptData(),
			privateData: characterPlayer.getAllPrivateData(),
			displayName: characterPlayer.getDisplayName(),
			avatar: characterPlayer.getAvatar(),
			tsCreate: characterPlayer.getTsCreate(),
			tags: characterPlayer.getAllTags(),
			role: characterPlayer.getRole(),
			playerBan: characterPlayer.getPlayerBan(),
			playerDatas: characterPlayer.getAllPlayerDatas(),
			playerCurrencies: characterPlayer.getAllPlayerCurrencies(),
			playerStatistics: characterPlayer.getAllPlayerStatistics(),
			playerCharacters: characterPlayer.getAllPlayerCharacters(),
			playerInventories: characterPlayer.getAllPlayerInventories(),
			playerGroups: characterPlayer.getAllPlayerGroups(),
			playerFriends: characterPlayer.getAllPlayerFriends(),
			tsLastLogin: characterPlayer.getTsLastLogin(),
			ipAddressCreate: characterPlayer.getIpAddressCreate(),
			countryCode: characterPlayer.getCountryCode(),
		} as any;

		await collection.insertOne(characterPlayer as any);
		let thisPlayer = new CharacterPlayer(result, collection);

		return thisPlayer;
	}

	public async loadGroupAsync(groupId: string): Promise<Group> {

	}

	public async loadInventoryAsync(itemId: string): Promise<Inventory> {

	}
}
