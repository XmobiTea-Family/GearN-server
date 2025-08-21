import * as mongodb from "mongodb";

export class CloudScriptDatabase {
	private static readonly DOT: string = ".";
	private static readonly RUNTIME: string = "Runtime" + CloudScriptDatabase.DOT;
	private static readonly META: string = "Meta" + CloudScriptDatabase.DOT;
	private static readonly SYSTEM: string = "System" + CloudScriptDatabase.DOT;

	private client: mongodb.MongoClient;
	private db: mongodb.Db;

	private logClient: mongodb.MongoClient;
	private logDb: mongodb.Db;

	init(url: string, dbName: string, logUrl: string, logDbName: string, options?: mongodb.MongoClientOptions): void {
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

	public runtimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.RUNTIME + collectionName);
	}

	public metaCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.META + collectionName);
	}

	public systemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.SYSTEM + collectionName);
	}

	public runtimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.RUNTIME + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public metaGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.META + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public systemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.SYSTEM + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public collection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.db.collection<TSchema>(fullCollectionName);
	}

	public createCollection(name: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<mongodb.BSON.Document>> {
		return this.db.createCollection(name, options);
	}

	public logRuntimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.RUNTIME + collectionName);
	}

	public logMetaCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.META + collectionName);
	}

	public logSystemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.SYSTEM + collectionName);
	}

	public logRuntimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.RUNTIME + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public logMetaGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.META + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public logSystemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.SYSTEM + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public logCollection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

	public logCreateCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions) {
		return this.logDb.createCollection<TSchema>(collectionName, options)
	}
}