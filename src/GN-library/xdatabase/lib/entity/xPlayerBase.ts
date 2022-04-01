const _id = "_id";
const Segments = "Segments";
const Location = "Location";
const ScriptData = "ScriptData";
const PrivateData = "PrivateData";
const TsCreate = "TsCreate";
const UserBan = "UserBan";
const TsLastSeen = "TsLastSeen";
const EMPTY_STR = "";
const DOT = ".";

import * as mongoDB from "mongodb";
import { xDatetime } from "../../../xdatetime/lib/xDatetime";

export class xPlayerBase {
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
		this._id = result[_id];
		this.userId = this._id.toString();

		this.userBan = result[UserBan];
		this.segments = result[Segments];
		this.location = result[Location];
		this.scriptData = result[ScriptData];
		this.privateData = result[PrivateData];
		this.tsCreate = result[TsCreate];
		this.tsLastSeen = result[TsLastSeen];
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
		updateQuery[UserBan + DOT + key] = value;

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

	public setLocation() {}

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
		updateQuery[Segments + DOT + key] = value;

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
		updateQuery[Segments + DOT + key] = EMPTY_STR;

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
		updateQuery[ScriptData + DOT + key] = value;

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
		updateQuery[ScriptData + DOT + key] = EMPTY_STR;

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
		updateQuery[PrivateData + DOT + key] = value;

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
		updateQuery[PrivateData + DOT + key] = EMPTY_STR;

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
