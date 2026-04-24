import * as mongodb from "mongodb";

export abstract class AbstractBaseRepository {
	// Stores the DOT value used by this instance.
	private static readonly DOT: string = ".";
	// Stores the RUNTIME value used by this instance.
	private static readonly RUNTIME: string = "Runtime" + AbstractBaseRepository.DOT;
	// Stores the SYSTEM value used by this instance.
	private static readonly SYSTEM: string = "System" + AbstractBaseRepository.DOT;

	// Stores the client value used by this instance.
	protected client: mongodb.MongoClient;
	// Stores the database value used by this instance.
	protected db: mongodb.Db;

	// Stores the log client value used by this instance.
	protected logClient: mongodb.MongoClient;
	// Stores the log database value used by this instance.
	protected logDb: mongodb.Db;

	constructor(client: mongodb.MongoClient, db: mongodb.Db, logClient: mongodb.MongoClient, logDb: mongodb.Db) {
		this.client = client;
		this.db = db;
		this.logClient = logClient;
		this.logDb = logDb;
	}

	/**
	 * Runs the time collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public runtimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.RUNTIME + collectionName);
	}

	/**
	 * Executes the system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.SYSTEM + collectionName);
	}

	/**
	 * Runs the time game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public runtimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.RUNTIME + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.SYSTEM + gameId + AbstractBaseRepository.DOT + collectionName);
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
	 * Executes the log runtime collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.RUNTIME + collectionName);
	}

	/**
	 * Executes the log system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.SYSTEM + collectionName);
	}

	/**
	 * Executes the log runtime game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.RUNTIME + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the log system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.SYSTEM + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the log collection workflow.
	 * @param fullCollectionName Provides the full collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logCollection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

}
