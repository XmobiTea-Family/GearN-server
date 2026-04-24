import * as mongodb from "mongodb";

interface UpdateFilter {
	// Stores the inc collection used by this contract.
	$inc?: { [k: string]: number };
	// Stores the min collection used by this contract.
	$min?: { [k: string]: any };
	// Stores the max collection used by this contract.
	$max?: { [k: string]: any };
	// Stores the mul collection used by this contract.
	$mul?: { [k: string]: number };
	// Stores the rename collection used by this contract.
	$rename?: { [k: string]: string };
	// Stores the set collection used by this contract.
	$set?: { [k: string]: any };
	// Stores the set on insert collection used by this contract.
	$setOnInsert?: { [k: string]: any };
	// Stores the unset collection used by this contract.
	$unset?: { [k: string]: string };
}

export class MongoObject {
	// Defines the internal field key for ID.
	private static readonly __id: string = "_id";
	// Stores the EMPTY STR value used by this instance.
	private static readonly EMPTY_STR: string = "";

	// Stores the collection value used by this instance.
	private readonly collection: mongodb.Collection<mongodb.Document>;

	// Stores the ID value used by this instance.
	protected readonly _id: mongodb.ObjectId;
	// Stores the origin result value used by this instance.
	protected readonly originResult: mongodb.WithId<mongodb.Document>;

	// Stores the update filter value used by this instance.
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
			if (this.updateFilter.$inc[field])
				delete this.updateFilter.$inc[field];
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
			if (this.updateFilter.$set[field])
				delete this.updateFilter.$set[field];
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
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$addToSet = $addToSet;
	// }

	// protected pop($pop: mongodb.OnlyFieldsOfType<mongodb.Document, ReadonlyArray<any>, 1 | -1>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$pop = $pop;
	// }

	// protected pull($pull: mongodb.PullOperator<mongodb.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$pull = $pull;
	// }

	// protected push($push: mongodb.PushOperator<mongodb.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$push = $push;
	// }

	// protected pullAll($pullAll: mongodb.PullAllOperator<mongodb.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$pullAll = $pullAll;
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
				upsertedId: null
			}
		}

		return await this.collection.updateOne(
			{ _id: this._id },
			this.updateFilter,
			{
				session: session,
			}
		);
	}
}