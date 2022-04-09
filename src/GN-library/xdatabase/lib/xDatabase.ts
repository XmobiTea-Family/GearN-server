const RUNTIME = "Runtime.";
const META = "Meta.";
const SYSTEM = "System.";

export const SparkCollectionName = {
	Player: "Player",
	Friend: "Friend",
	ExternalFBAuthentication: "ExternalFBAuthentication",
	ExternalAppleAuthentication: "ExternalAppleAuthentication",
};

import * as mongoDB from "mongodb";
import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { xGamePlayer } from "./entity/xGamePlayer";
import { xSparkPlayer } from "./entity/xSparkPlayer";

interface OnMongoRunError {
	(error: mongoDB.AnyError): void;
}

export class xDatabase {
	private client: mongoDB.MongoClient;
	private db: mongoDB.Db;
	private gameName: string;

	public init(url: string, dbName: string, gameName: string, options?: mongoDB.MongoClientOptions): void {
		this.client = new mongoDB.MongoClient(url, options);

		this.db = this.client.db(dbName);
		this.gameName = gameName;
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
		return this.collection(RUNTIME + collectionName);
	}

	public metaCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(META + collectionName);
	}

	public systemCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(SYSTEM + collectionName);
	}

	public runtimeGameCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(RUNTIME + this.gameName + collectionName);
	}

	public metaGameCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(META + this.gameName + collectionName);
	}

	public systemGameCollection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.collection(SYSTEM + this.gameName + collectionName);
	}

	public collection(collectionName: string): mongoDB.Collection<mongoDB.Document> {
		return this.db.collection(collectionName);
	}

	public createIndex(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }, cb?: (error?: Error, result?: string) => void): void {
		let collection = this.collection(collectionName);

		let createIndexesOptions = {
			background: true,
		};

		if (options != null) {
			let createIndexesOptionsAny = createIndexesOptions as any;

			if (options.expireAfterSeconds != null) createIndexesOptionsAny.expireAfterSeconds = options.expireAfterSeconds;
			if (options.sparse != null) createIndexesOptionsAny.sparse = options.sparse;
			if (options.unique != null) createIndexesOptionsAny.unique = options.unique;
		}

		collection.createIndex(index, createIndexesOptions, cb);
	}

	public async loadPlayer(userId: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ _id: new mongoDB.ObjectId(userId) });
		if (result) {
			let thisPlayer = new xSparkPlayer(result, collection);
			return thisPlayer;
		}

		return null;
	}

	public async loadPlayerByUsernameAndPassword(username: string, password: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ Username: username, Password: password });
		if (result) {
			let thisPlayer = new xSparkPlayer(result, collection);
			return thisPlayer;
		}

		return null;
	}

	public async loadPlayerByUsername(username: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ Username: username });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async loadPlayerByEmail(email: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ "UserEmail.Value": email, "UserEmail.IsConfirm": true });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async loadPlayerByDeviceInfo(deviceInfo: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ "UserExternal.DeviceInfo": deviceInfo });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async createPlayerByDeviceInfo(deviceInfo: string, segments: {}, ipAddressCreate: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let result = {
			Username: "",
			Password: "",
			Fullname: "",
			UserExternal: {
				DeviceInfo: deviceInfo,
			},
			UserBan: {},
			UserEmail: {},
			UserNumberPhone: {},
			UserAddress: {},
			UserPassport: {},
			Location: {},
			TsBirthday: 0,
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			IPAddressCreate: ipAddressCreate,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
			AccessToken: "",
		};
		await collection.insertOne(result);
		return new xSparkPlayer(result, collection);
	}

	public async loadPlayerByCustomId(customId: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ "UserExternal.CustomId": customId });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async createPlayerByCustomId(customId: string, segments: {}, ipAddressCreate: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let result = {
			Username: "",
			Password: "",
			Fullname: "",
			UserExternal: {
				CustomId: customId,
			},
			UserBan: {},
			UserEmail: {},
			UserNumberPhone: {},
			UserAddress: {},
			UserPassport: {},
			Location: {},
			TsBirthday: 0,
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			IPAddressCreate: ipAddressCreate,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
			AccessToken: "",
		};
		await collection.insertOne(result);
		return new xSparkPlayer(result, collection);
	}

	public async loadPlayerByPublicAddress(publicAddress: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ "UserExternal.PublicAddress": publicAddress });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async createPlayerByPublicAddress(publicAddress: string, segments: {}, ipAddressCreate: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let result = {
			Username: "",
			Password: "",
			Fullname: "",
			UserExternal: {
				PublicAddress: publicAddress,
			},
			UserBan: {},
			UserEmail: {},
			UserNumberPhone: {},
			UserAddress: {},
			UserPassport: {},
			Location: {},
			TsBirthday: 0,
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			IPAddressCreate: ipAddressCreate,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
			AccessToken: "",
		};
		await collection.insertOne(result);
		return new xSparkPlayer(result, collection);
	}

	public async createPlayerByUsernameAndPassword(username: string, password: string, segments: {}, ipAddressCreate: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let result = {
			Username: username,
			Password: password,
			Fullname: "",
			UserExternal: {},
			UserBan: {},
			UserEmail: {},
			UserNumberPhone: {},
			UserAddress: {},
			UserPassport: {},
			Location: {},
			TsBirthday: 0,
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			IPAddressCreate: ipAddressCreate,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
			AccessToken: "",
			RefreshToken: "",
		};
		await collection.insertOne(result);
		return new xSparkPlayer(result, collection);
	}

	public async loadPlayerByFacebookId(facebookId: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ "UserExternal.FacebookId": facebookId });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async createPlayerByFacebookId(facebookId: string, segments: {}, ipAddressCreate: string, email: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let result = {
			Username: "",
			Password: "",
			Fullname: "",
			UserExternal: {
				FacebookId: facebookId,
			},
			UserBan: {},
			UserEmail: {},
			UserNumberPhone: {},
			UserAddress: {},
			UserPassport: {},
			Location: {},
			TsBirthday: 0,
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			IPAddressCreate: ipAddressCreate,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
			AccessToken: "",
			RefreshToken: "",
		};

		if (email)
			result["UserEmail"] = {
				Value: email,
				IsConfirm: true,
			};

		await collection.insertOne(result);
		return new xSparkPlayer(result, collection);
	}

	public async loadPlayerByAppleUserId(appleUserId: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ "UserExternal.AppleUserId": appleUserId });
		if (result) {
			return new xSparkPlayer(result, collection);
		}
		return null;
	}

	public async createPlayerByAppleUserId(appleUserId: string, segments: {}, ipAddressCreate: string, email: string): Promise<xSparkPlayer> {
		let collection = this.systemCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let result = {
			Username: "",
			Password: "",
			Fullname: "",
			UserExternal: {
				AppleUserId: appleUserId,
			},
			UserBan: {},
			UserEmail: {},
			UserNumberPhone: {},
			UserAddress: {},
			UserPassport: {},
			Location: {},
			TsBirthday: 0,
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			IPAddressCreate: ipAddressCreate,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
			AccessToken: "",
			RefreshToken: "",
		};

		if (email)
			result["UserEmail"] = {
				Value: email,
				IsConfirm: true,
			};

		await collection.insertOne(result);
		return new xSparkPlayer(result, collection);
	}

	public async saveFBExternal(userId: string, facebookId: string, facebookName: string, facebookEmail: string, facebookToken: string) {
		await this.systemCollection(SparkCollectionName.ExternalFBAuthentication).updateOne(
			{ UserId: userId },
			{
				$set: {
					ExternalId: facebookId,
					ExternalDisplayName: facebookName,
					ExternalEmail: facebookEmail,
					Token: facebookToken,
					TsUpdate: xDatetime.getCurrentMilliseconds(),
					IsRemove: false,
				},
			},
			{
				upsert: true,
			}
		);
	}

	public async loadFBExternal(facebookId: string) {
		return await this.systemCollection(SparkCollectionName.ExternalFBAuthentication).findOne({ ExternalId: facebookId, IsRemove: false });
	}

	public async unConnectFBExternal(facebookId: string) {
		await this.systemCollection(SparkCollectionName.ExternalFBAuthentication).updateOne(
			{ ExternalId: facebookId, IsRemove: false },
			{
				$set: {
					IsRemove: true,
				},
			}
		);
	}

	public async saveAppleExternal(userId: string, appleUserId: string, appleDisplayName: string, appleId: string, appleToken: string) {
		await this.systemCollection(SparkCollectionName.ExternalAppleAuthentication).updateOne(
			{ UserId: userId },
			{
				$set: {
					ExternalId: appleUserId,
					ExternalDisplayName: appleDisplayName,
					ExternalEmail: appleId,
					Token: appleToken,
					TsUpdate: xDatetime.getCurrentMilliseconds(),
					IsRemove: false,
				},
			},
			{
				upsert: true,
			}
		);
	}

	public async unConnectAppleExternal(appleUserId: string) {
		await this.systemCollection(SparkCollectionName.ExternalAppleAuthentication).updateOne(
			{ ExternalId: appleUserId, IsRemove: false },
			{
				$set: {
					IsRemove: true,
				},
			}
		);
	}

	public async loadFriend(userId: string) {
		return await this.systemCollection(SparkCollectionName.Friend).findOne({ UserId: userId });
	}

	public async saveFriend(userId: string, doc: {}) {
		await this.systemCollection(SparkCollectionName.Friend).updateOne(
			{ UserId: userId },
			{
				$set: doc,
			},
			{
				upsert: true,
			}
		);
	}

	public async loadGamePlayer(userId: string): Promise<xGamePlayer> {
		let collection = this.systemGameCollection(SparkCollectionName.Player);
		let result = await collection.findOne({ UserId: userId });
		if (result) {
			return new xGamePlayer(result, collection);
		}

		return await this.createGamePlayer(userId, { UserRole: 101 });
	}

	private async createGamePlayer(userId: string, segments: {}): Promise<xGamePlayer> {
		let collection = this.systemGameCollection(SparkCollectionName.Player);
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let pushRegistrations: any[] = [];

		let result = {
			UserId: userId,
			DisplayName: "",
			UserBan: {},
			PushRegistrations: pushRegistrations,
			Location: {},
			TsCreate: currentMilliseconds,
			TsLastSeen: currentMilliseconds,
			Segments: segments,
			ScriptData: {},
			PrivateData: {},
		};
		await collection.insertOne(result);
		let thisPlayer = new xGamePlayer(result, collection);
		return thisPlayer;
	}
}
