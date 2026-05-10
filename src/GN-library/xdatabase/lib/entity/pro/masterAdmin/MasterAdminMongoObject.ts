import * as mongodb from "mongodb";

import { MongoObject } from "./../MongoObject";

/**
 * Base class for every document in the master-admin collection (system-wide administration).
 * Adds the `type` field so different document kinds can share a single collection (single-collection inheritance pattern).
 */
export class MasterAdminMongoObject extends MongoObject {
    /** MongoDB field name for the discriminator type, used to distinguish document kinds when several entities share one collection. */
    private static readonly _type: string = "type";

    /** Discriminator type of the document (e.g. "Game", "MasterAdminPlayer", "SecretInfoItem"); immutable after creation. */
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
