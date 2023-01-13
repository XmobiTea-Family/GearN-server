import * as mongoDB from "mongodb";
import { xDatetime } from "./../../../xdatetime/lib/xDatetime";

export class xPlayerBase {
	private static readonly _id: string = "_id";
	private static readonly Segments: string = "Segments";
	private static readonly Location: string = "Location";
	private static readonly ScriptData: string = "ScriptData";
	private static readonly PrivateData: string = "PrivateData";
	private static readonly TsCreate: string = "TsCreate";
	private static readonly UserBan: string = "UserBan";
	private static readonly TsLastSeen: string = "TsLastSeen";
	private static readonly EMPTY_STR: string = "";
	protected static readonly DOT: string = ".";

	protected collection: mongoDB.Collection<mongoDB.Document>;
	protected _id: mongoDB.ObjectId;

	protected userId: string;
	private userBan: { [k: string]: any } = {};
	private segments: { [k: string]: any } = {};
	private location: { [k: string]: any } = {};
	private scriptData: { [k: string]: any } = {};
	private privateData: { [k: string]: any } = {};
	private tsCreate: number;
	private tsLastSeen: number;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		this.collection = collection;
		this.setDocumentBase(result);
	}

	private setDocumentBase(result: mongoDB.WithId<mongoDB.Document>) {
		this._id = result[xPlayerBase._id];
		this.userId = this._id.toString();

		this.userBan = result[xPlayerBase.UserBan];
		this.segments = result[xPlayerBase.Segments];
		this.location = result[xPlayerBase.Location];
		this.scriptData = result[xPlayerBase.ScriptData];
		this.privateData = result[xPlayerBase.PrivateData];
		this.tsCreate = result[xPlayerBase.TsCreate];
		this.tsLastSeen = result[xPlayerBase.TsLastSeen];
	}

	public getUserId(): string {
		return this.userId;
	}

	public getUserBan(key: string) {
		return this.userBan[key];
	}

	public setUserBan(key: string, value: any) {
		this.userBan[key] = value;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.UserBan + xPlayerBase.DOT + key] = value;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public getLocation() {
		return this.location;
	}

	public setLocation() { }

	public getTsCreate() {
		return this.tsCreate;
	}

	public getTsLastSeen() {
		return this.tsLastSeen;
	}

	public updateTsLastSeen() {
		this.tsLastSeen = xDatetime.getCurrentMilliseconds();

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: {
					TsLastSeen: this.tsLastSeen,
				},
			}
		);
	}

	public getSegmentValue(key: string) {
		return this.segments[key];
	}

	public setSegmentValue(key: string, value: any) {
		this.segments[key] = value;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.Segments + xPlayerBase.DOT + key] = value;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public removeSegmentValue(key: string) {
		delete this.segments[key];

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.Segments + xPlayerBase.DOT + key] = xPlayerBase.EMPTY_STR;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$unset: updateQuery,
			}
		);
	}

	public getScriptData(key: string): any {
		return this.scriptData[key];
	}

	public setScriptData(key: string, value: any) {
		this.scriptData[key] = value;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.ScriptData + xPlayerBase.DOT + key] = value;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public removeScriptData(key: string) {
		delete this.scriptData[key];

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.ScriptData + xPlayerBase.DOT + key] = xPlayerBase.EMPTY_STR;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$unset: updateQuery,
			}
		);
	}

	public getPrivateData(key: string): any {
		return this.privateData[key];
	}

	public setPrivateData(key: string, value: any) {
		this.privateData[key] = value;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.PrivateData + xPlayerBase.DOT + key] = value;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public removePrivateData(key: string) {
		delete this.privateData[key];

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xPlayerBase.PrivateData + xPlayerBase.DOT + key] = xPlayerBase.EMPTY_STR;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$unset: updateQuery,
			}
		);
	}

	public isNewPlayer() {
		return !this.scriptData;
	}

}
