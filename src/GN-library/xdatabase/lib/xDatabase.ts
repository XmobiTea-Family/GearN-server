import * as mongoDB from "mongodb";

import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";
import { UploadFileInfo } from "./entity/pro/UploadFileInfo";
import { FileUploadInfoFindOptions } from "./entity/pro/findOptions/FileUploadInfoFindOptions";
import { MasterPlayerRepository } from "./MasterPlayerRepository";
import { GamePlayerRepository } from "./GamePlayerRepository";
import { CharacterPlayerRepository } from "./CharacterPlayerRepository";
import { GroupRepository } from "./GroupRepository";
import { InventoryRepository } from "./InventoryRepository";
import { StoreInventoryRepository } from "./StoreInventoryRepository";

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
	private client: mongoDB.MongoClient;
	// Stores the database value used by this instance.
	private db: mongoDB.Db;

	// Stores the log client value used by this instance.
	private logClient: mongoDB.MongoClient;
	// Stores the log database value used by this instance.
	private logDb: mongoDB.Db;

	private _masterPlayerRepository: MasterPlayerRepository;
	public get masterPlayerRepository(): MasterPlayerRepository {
		return this._masterPlayerRepository;
	}

	private _gamePlayerRepository: GamePlayerRepository;
	public get gamePlayerRepository(): GamePlayerRepository {
		return this._gamePlayerRepository;
	}

	private _characterPlayerRepository: CharacterPlayerRepository;
	public get characterPlayerRepository(): CharacterPlayerRepository {
		return this._characterPlayerRepository;
	}

	private _groupRepository: GroupRepository;
	public get groupRepository(): GroupRepository {
		return this._groupRepository;
	}

	private _inventoryRepository: InventoryRepository;
	public get inventoryRepository(): InventoryRepository {
		return this._inventoryRepository;
	}

	private _storeInventoryRepository: StoreInventoryRepository;
	public get storeInventoryRepository(): StoreInventoryRepository {
		return this._storeInventoryRepository;
	}

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

		this._masterPlayerRepository = new MasterPlayerRepository(this.client, this.db, this.logClient, this.logDb);
		this._gamePlayerRepository = new GamePlayerRepository(this.client, this.db, this.logClient, this.logDb);
		this._characterPlayerRepository = new CharacterPlayerRepository(this.client, this.db, this.logClient, this.logDb);
		this._groupRepository = new GroupRepository(this.client, this.db, this.logClient, this.logDb);
		this._inventoryRepository = new InventoryRepository(this.client, this.db, this.logClient, this.logDb);
		this._storeInventoryRepository = new StoreInventoryRepository(this.client, this.db, this.logClient, this.logDb);
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
