import * as mongoDB from "mongodb";

export class xConfigBase {
	private doc: mongoDB.WithId<mongoDB.Document>;
	private _id: mongoDB.ObjectId;
	private configName: string;
	private version: number;

	public getOriginDoc(): { [key: string]: any } {
		return this.doc;
	}

	public getConfigName(): string {
		return this.configName;
	}

	public getVersion(): number {
		return this.version;
	}

	constructor(result: mongoDB.WithId<mongoDB.Document>) {
		this.setDocumentBase(result);
	}

	private setDocumentBase(result: mongoDB.WithId<mongoDB.Document>): void {
		this.doc = result;
		this._id = result._id;
		this.configName = result["ConfigName"];
		this.version = result["Version"];
	}

	public toJson(): string {
		return JSON.stringify(this.doc);
	}

}
