import * as mongodb from "mongodb";

import { MongoObject } from "./../MongoObject";

export class MasterAdminMongoObject extends MongoObject {
	// Defines the internal field key for type.
	private static readonly _type: string = "type";

	// Stores the type value used by this instance.
	private readonly type: string;

	/**
	 * Initializes a new master admin mongo object instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);
		this.type = result[MasterAdminMongoObject._type];
	}

	/**
	 * Returns the type.
	 * @returns Returns the type.
	 */
	public getType(): string {
		return this.type;
	}
}
