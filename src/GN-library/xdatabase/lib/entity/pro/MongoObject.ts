import * as mongoDB from "mongodb";

interface UpdateFilter {
	$inc?: { [k: string]: number};
	$min?: { [k: string]: any};
	$max?: { [k: string]: any};
	$mul?: { [k: string]: number};
	$rename?: { [k: string]: string};
	$set?: { [k: string]: any };
	$setOnInsert?: { [k: string]: any };
	$unset?: { [k: string]: string};
}

export class MongoObject {
	private static readonly __id: string = "_id";
	private static readonly EMPTY_STR: string = "";

	private readonly collection: mongoDB.Collection<mongoDB.Document>;
	protected readonly _id: mongoDB.ObjectId;

	private updateFilter: UpdateFilter;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		this.collection = collection;
		this._id = result[MongoObject.__id];
	}

	protected inc(field: string, value: number) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$inc == null) this.updateFilter.$inc = {};
		this.updateFilter.$inc[field] = value;
	}

	protected min(field: string, value: any) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$min == null) this.updateFilter.$min = {};
		this.updateFilter.$min[field] = value;
	}

	protected max(field: string, value: any) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$max == null) this.updateFilter.$max = {};
		this.updateFilter.$max[field] = value;
	}

	protected mul(field: string, value: number) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$mul == null) this.updateFilter.$mul = {};
		this.updateFilter.$mul[field] = value;
	}

	protected rename(field: string, newField: string) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$rename == null) this.updateFilter.$rename = {};
		this.updateFilter.$rename[field] = newField;
	}

	protected set(field: string, value: any) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$set == null) this.updateFilter.$set = {};
		this.updateFilter.$set[field] = value;
	}

	protected setOnInsert(field: string, value: any) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$setOnInsert == null) this.updateFilter.$setOnInsert = {};
		this.updateFilter.$setOnInsert[field] = value;
	}

	protected unset(field: string) {
		if (this.updateFilter == null) this.updateFilter = {};
		if (this.updateFilter.$unset == null) this.updateFilter.$unset = {};
		this.updateFilter.$unset[field] = MongoObject.EMPTY_STR;
	}



	// protected addToSet($addToSet: mongoDB.SetFields<mongoDB.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$addToSet = $addToSet;
	// }

	// protected pop($pop: mongoDB.OnlyFieldsOfType<mongoDB.Document, ReadonlyArray<any>, 1 | -1>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$pop = $pop;
	// }

	// protected pull($pull: mongoDB.PullOperator<mongoDB.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$pull = $pull;
	// }

	// protected push($push: mongoDB.PushOperator<mongoDB.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$push = $push;
	// }

	// protected pullAll($pullAll: mongoDB.PullAllOperator<mongoDB.Document>) {
	// 	if (this.updateFilter == null) this.updateFilter = {};
	// 	this.updateFilter.$pullAll = $pullAll;
	// }

	public async saveAsync(): Promise<mongoDB.UpdateResult> {
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
			this.updateFilter
		);
	}
}