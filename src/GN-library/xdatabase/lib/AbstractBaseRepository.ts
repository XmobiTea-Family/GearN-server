import * as mongoDB from "mongodb";

export abstract class AbstractBaseRepository {
	// Stores the DOT value used by this instance.
	private static readonly DOT: string = ".";
	// Stores the RUNTIME value used by this instance.
	private static readonly RUNTIME: string = "Runtime" + AbstractBaseRepository.DOT;
	// Stores the META value used by this instance.
	private static readonly META: string = "Meta" + AbstractBaseRepository.DOT;
	// Stores the SYSTEM value used by this instance.
	private static readonly SYSTEM: string = "System" + AbstractBaseRepository.DOT;

	// Stores the client value used by this instance.
	protected client: mongoDB.MongoClient;
	// Stores the database value used by this instance.
	protected db: mongoDB.Db;

	// Stores the log client value used by this instance.
	protected logClient: mongoDB.MongoClient;
	// Stores the log database value used by this instance.
	protected logDb: mongoDB.Db;

	constructor(client: mongoDB.MongoClient, db: mongoDB.Db, logClient: mongoDB.MongoClient, logDb: mongoDB.Db) {
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
	public runtimeCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.RUNTIME + collectionName);
	}

	/**
	 * Executes the meta collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public metaCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.META + collectionName);
	}

	/**
	 * Executes the system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.SYSTEM + collectionName);
	}

	/**
	 * Runs the time game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public runtimeGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.RUNTIME + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the meta game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public metaGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.META + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public systemGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.collection<TSchema>(AbstractBaseRepository.SYSTEM + gameId + AbstractBaseRepository.DOT + collectionName);
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
	 * Executes the log runtime collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.RUNTIME + collectionName);
	}

	/**
	 * Executes the log meta collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logMetaCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.META + collectionName);
	}

	/**
	 * Executes the log system collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.SYSTEM + collectionName);
	}

	/**
	 * Executes the log runtime game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logRuntimeGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.RUNTIME + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the log meta game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logMetaGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.META + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the log system game collection workflow.
	 * @param collectionName Provides the collection name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logSystemGameCollection<TSchema extends mongoDB.Document = mongoDB.Document>(collectionName: string, gameId: string): mongoDB.Collection<TSchema> {
		return this.logCollection<TSchema>(AbstractBaseRepository.SYSTEM + gameId + AbstractBaseRepository.DOT + collectionName);
	}

	/**
	 * Executes the log collection workflow.
	 * @param fullCollectionName Provides the full collection name value used by this operation.
	 * @returns Returns the operation result.
	 */
	public logCollection<TSchema extends mongoDB.Document = mongoDB.Document>(fullCollectionName: string): mongoDB.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

}
