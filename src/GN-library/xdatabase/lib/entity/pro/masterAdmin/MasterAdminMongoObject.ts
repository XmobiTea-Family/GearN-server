import * as mongoDB from "mongodb";

import { MongoObject } from "./../MongoObject";

export class MasterAdminMongoObject extends MongoObject {
	private static readonly _type: string = "type";

	private readonly type: string;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.type = result[MasterAdminMongoObject._type];
	}

	public getType(): string {
		return this.type;
	}
}
