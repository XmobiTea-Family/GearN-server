import * as mongodb from "mongodb";

/**
 * Container that batches the changes to apply to a MongoDB document inside a single `updateOne` call.
 * Each field maps to a MongoDB update operator; only operators that actually carry data are sent over the wire.
 */
interface UpdateFilter {
    /** MongoDB `$inc` operator: atomically increments/decrements numeric fields. */
    $inc?: { [k: string]: number };
    /** MongoDB `$min` operator: only overwrites when the new value is smaller than the current one. */
    $min?: { [k: string]: any };
    /** MongoDB `$max` operator: only overwrites when the new value is larger than the current one. */
    $max?: { [k: string]: any };
    /** MongoDB `$mul` operator: multiplies the current numeric value by the supplied factor. */
    $mul?: { [k: string]: number };
    /** MongoDB `$rename` operator: renames a field from old name to new name. */
    $rename?: { [k: string]: string };
    /** MongoDB `$set` operator: directly assigns a value to a field (overwriting the previous value). */
    $set?: { [k: string]: any };
    /** MongoDB `$setOnInsert` operator: only assigns when the document is created via upsert; ignored on update. */
    $setOnInsert?: { [k: string]: any };
    /** MongoDB `$unset` operator: removes the field from the document (the supplied value is the empty string). */
    $unset?: { [k: string]: string };
}

/**
 * Base class for every entity persisted in MongoDB across the system.
 * Accumulates pending changes in `updateFilter` and flushes them to the database through `saveAsync`,
 * so business code only has to call `set/inc/unset...` and then save once at the end.
 */
export class MongoObject {
    /** MongoDB's default `_id` field name — the primary key on every document. */
    private static readonly __id: string = "_id";
    /** Empty-string constant used as the value for `$unset` (MongoDB requires a value, even though it's ignored). */
    private static readonly EMPTY_STR: string = "";

    /** Reference to the MongoDB Collection holding the document; used by `saveAsync` when executing `updateOne`. */
    private readonly collection: mongodb.Collection<mongodb.Document>;

    /** ObjectId of the document; immutable, used as the `_id` filter on every update. */
    protected readonly _id: mongodb.ObjectId;
    /** Raw document loaded from MongoDB; subclasses can read it to access fields that aren't mapped to properties. */
    protected readonly originResult: mongodb.WithId<mongodb.Document>;

    /** Accumulator for changes to push to MongoDB; created lazily on the first mutate call. */
    private updateFilter: UpdateFilter;

    /**
     * Initializes a new mongo object instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        this.collection = collection;
        this._id = result[MongoObject.__id];
        this.originResult = result;
    }

    /**
     * Executes the inc workflow.
     * @param field Provides the field value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    protected inc(field: string, value: number) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$inc == null) this.updateFilter.$inc = {};
        this.updateFilter.$inc[field] = value;
    }

    /**
     * Removes the inc.
     * @param field Provides the field value used by this operation.
     */
    protected removeInc(field: string) {
        if (this.updateFilter != null && this.updateFilter.$inc != null) {
            if (this.updateFilter.$inc[field]) delete this.updateFilter.$inc[field];
        }
    }

    /**
     * Executes the min workflow.
     * @param field Provides the field value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    protected min(field: string, value: any) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$min == null) this.updateFilter.$min = {};
        this.updateFilter.$min[field] = value;
    }

    /**
     * Executes the max workflow.
     * @param field Provides the field value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    protected max(field: string, value: any) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$max == null) this.updateFilter.$max = {};
        this.updateFilter.$max[field] = value;
    }

    /**
     * Executes the mul workflow.
     * @param field Provides the field value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    protected mul(field: string, value: number) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$mul == null) this.updateFilter.$mul = {};
        this.updateFilter.$mul[field] = value;
    }

    /**
     * Executes the rename workflow.
     * @param field Provides the field value used by this operation.
     * @param newField Provides the new field value used by this operation.
     */
    protected rename(field: string, newField: string) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$rename == null) this.updateFilter.$rename = {};
        this.updateFilter.$rename[field] = newField;
    }

    /**
     * Executes the set workflow.
     * @param field Provides the field value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    protected set(field: string, value: any) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$set == null) this.updateFilter.$set = {};
        this.updateFilter.$set[field] = value;
    }

    /**
     * Removes the set.
     * @param field Provides the field value used by this operation.
     */
    protected removeSet(field: string) {
        if (this.updateFilter != null && this.updateFilter.$set != null) {
            if (this.updateFilter.$set[field]) delete this.updateFilter.$set[field];
        }
    }

    /**
     * Sets the on insert.
     * @param field Provides the field value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    protected setOnInsert(field: string, value: any) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$setOnInsert == null) this.updateFilter.$setOnInsert = {};
        this.updateFilter.$setOnInsert[field] = value;
    }

    /**
     * Executes the unset workflow.
     * @param field Provides the field value used by this operation.
     */
    protected unset(field: string) {
        if (this.updateFilter == null) this.updateFilter = {};
        if (this.updateFilter.$unset == null) this.updateFilter.$unset = {};
        this.updateFilter.$unset[field] = MongoObject.EMPTY_STR;
    }

    // protected addToSet($addToSet: mongodb.SetFields<mongodb.Document>) {
    //     if (this.updateFilter == null) this.updateFilter = {};
    //     this.updateFilter.$addToSet = $addToSet;
    // }

    // protected pop($pop: mongodb.OnlyFieldsOfType<mongodb.Document, ReadonlyArray<any>, 1 | -1>) {
    //     if (this.updateFilter == null) this.updateFilter = {};
    //     this.updateFilter.$pop = $pop;
    // }

    // protected pull($pull: mongodb.PullOperator<mongodb.Document>) {
    //     if (this.updateFilter == null) this.updateFilter = {};
    //     this.updateFilter.$pull = $pull;
    // }

    // protected push($push: mongodb.PushOperator<mongodb.Document>) {
    //     if (this.updateFilter == null) this.updateFilter = {};
    //     this.updateFilter.$push = $push;
    // }

    // protected pullAll($pullAll: mongodb.PullAllOperator<mongodb.Document>) {
    //     if (this.updateFilter == null) this.updateFilter = {};
    //     this.updateFilter.$pullAll = $pullAll;
    // }

    public getObjectId(): mongodb.ObjectId {
        return this._id;
    }

    /**
     * Returns the origin result.
     * @returns Returns the origin result.
     */
    public getOriginResult(): mongodb.WithId<mongodb.Document> {
        return this.originResult;
    }

    /**
     * Saves the async.
     * @returns Resolves with the operation result.
     */
    public async saveAsync(session?: mongodb.ClientSession): Promise<mongodb.UpdateResult> {
        if (this.updateFilter == null) {
            return {
                acknowledged: false,
                matchedCount: 1,
                modifiedCount: 0,
                upsertedCount: 0,
                upsertedId: null,
            };
        }

        return await this.collection.updateOne({ _id: this._id }, this.updateFilter, {
            session: session,
        });
    }
}
