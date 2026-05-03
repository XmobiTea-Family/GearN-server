import * as mongodb from "mongodb";

import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";
import { MasterPlayerRepository } from "./MasterPlayerRepository";
import { GamePlayerRepository } from "./GamePlayerRepository";
import { CharacterPlayerRepository } from "./CharacterPlayerRepository";
import { GroupRepository } from "./GroupRepository";
import { InventoryRepository } from "./InventoryRepository";
import { StoreInventoryRepository } from "./StoreInventoryRepository";

interface OnMongoRunError {
	(error: mongodb.AnyError): void;
}

export class xDatabase {
	// Stores the DOT value used by this instance.
	private static readonly DOT: string = ".";
	// Stores the RUNTIME value used by this instance.
	private static readonly RUNTIME: string = "Runtime" + xDatabase.DOT;
	// Stores the SYSTEM value used by this instance.
	private static readonly SYSTEM: string = "System" + xDatabase.DOT;

	// Stores the client value used by this instance.
	private client: mongodb.MongoClient;
	// Stores the database value used by this instance.
	private db: mongodb.Db;

	// Stores the log client value used by this instance.
	private logClient: mongodb.MongoClient;
	// Stores the log database value used by this instance.
	private logDb: mongodb.Db;

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
	public getDb(): mongodb.Db {
		return this.db;
	}

	/**
	 * Returns the log database.
	 * @returns Returns the log database.
	 */
	public getLogDb(): mongodb.Db {
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
	public init(url: string, dbName: string, logUrl: string, logDbName: string, options?: mongodb.MongoClientOptions): void {
		this.client = new mongodb.MongoClient(url, options);

		this.db = this.client.db(dbName);

		if (!logUrl || logUrl == "" || logUrl == url) {
			this.logClient = this.client;
			this.logDb = this.db;
		}
		else {
			this.logClient = new mongodb.MongoClient(logUrl, options);
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
	public runtimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.RUNTIME + collectionName);
	}

	/**
	 * Executes the system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.SYSTEM + collectionName);
	}

	/**
	 * Runs the time game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public runtimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.RUNTIME + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(xDatabase.SYSTEM + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the collection workflow.
	 * @param fullCollectionName Provides the full collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public collection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.db.collection<TSchema>(fullCollectionName);
	}

	/**
	 * Creates the collection.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public createCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions) {
		return this.db.createCollection<TSchema>(collectionName, options)
	}

	/**
	 * Creates the index.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param index Provides the index value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public createIndex<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }): void {
		// Stores the collection value used in the current execution flow.
		let collection = this.collection<TSchema>(collectionName);

		// Stores the create indexes options value used in the current execution flow.
		let createIndexesOptions: mongodb.CreateIndexesOptions = {
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
	public logRuntimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.RUNTIME + collectionName);
	}

	/**
	 * Executes the log system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.SYSTEM + collectionName);
	}

	/**
	 * Executes the log runtime game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.RUNTIME + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the log system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(xDatabase.SYSTEM + gameId + xDatabase.DOT + collectionName);
	}

	/**
	 * Executes the log collection workflow.
	 * @param fullCollectionName Provides the full collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logCollection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

	/**
	 * Executes the log create collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public logCreateCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions) {
		return this.logDb.createCollection<TSchema>(collectionName, options)
	}

	/**
	 * Executes the log create index workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param index Provides the index value used by this operation.
	 * @param options Provides the options value used by this operation.
	 */
	public logCreateIndex<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any }): void {
		// Stores the collection value used in the current execution flow.
		let collection = this.logCollection<TSchema>(collectionName);

		// Stores the create indexes options value used in the current execution flow.
		let createIndexesOptions: mongodb.CreateIndexesOptions = {
			background: true,
		};

		if (options != null) {
			if (options.expireAfterSeconds != null) createIndexesOptions.expireAfterSeconds = options.expireAfterSeconds;
			if (options.sparse != null) createIndexesOptions.sparse = options.sparse;
			if (options.unique != null) createIndexesOptions.unique = options.unique;
		}

		collection.createIndex(index, createIndexesOptions);
	}

	public startSession(): mongodb.ClientSession {
		return this.client.startSession();
	}
}
