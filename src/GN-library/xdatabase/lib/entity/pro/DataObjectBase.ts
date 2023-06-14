import * as mongoDB from "mongodb";

import { AvatarItem } from "./AvatarItem";
import { MongoObject } from "./MongoObject";
import { DataValueType } from "./type/DataValueType";
import { TagValueType } from "./type/TagValueType";

export class DataObjectBase extends MongoObject {
	private static readonly _segments: string = "segments";
	private static readonly _scriptData: string = "scriptData";
	private static readonly _privateData: string = "privateData";

	private static readonly _tsCreate: string = "tsCreate";

	private static readonly _displayName: string = "displayName";
	private static readonly _avatar: string = "avatar";
	private static readonly _tags: string = "tags";
	
	protected static readonly DOT: string = ".";

	private segments: Array<string>;
	private scriptData: Map<string, DataValueType>;
	private privateData: Map<string, DataValueType>;

	private displayName: string;
	private avatar: AvatarItem;

	private tsCreate: number;
	private tags: Map<string, TagValueType>;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentDataObjectBase(result);
	}

	private setDocumentDataObjectBase(result: mongoDB.WithId<mongoDB.Document>): void {
		this.segments = result[DataObjectBase._segments];
		this.scriptData = result[DataObjectBase._scriptData];
		this.privateData = result[DataObjectBase._privateData];

		this.displayName = result[DataObjectBase._displayName];
		this.avatar = result[DataObjectBase._avatar];

		this.tsCreate = result[DataObjectBase._tsCreate];
		this.tags = result[DataObjectBase._tags];
	}
	
	public getAllSegments(): Array<string> {
		return this.segments;
	}

	public hasSegment(segment: string): boolean {
		return this.segments.indexOf(segment) != -1;
	}

	public addSegment(segment: string): void {
		this.segments.push(segment);

		this.set(DataObjectBase._segments, this.segments);
	}

	public removeSegment(segment: string): void {
		let indexOf = this.segments.indexOf(segment);
		if (indexOf != -1) {
			this.segments.splice(indexOf, 1);
			return this.set(DataObjectBase._segments, this.segments);
		}

		throw Error("can not found the segment to remove");
	}

	public removeAllSegments(): void {
		this.segments.length = 0;

		this.set(DataObjectBase._segments, this.segments);
	}

	public getAllScriptData(): Map<string, DataValueType> {
		return this.scriptData;
	}

	public hasScriptData(key: string): boolean {
		return this.scriptData.has(key);
	}

	public getScriptData(key: string): DataValueType {
		return this.scriptData.get(key);
	}

	public setScriptData(key: string, value: DataValueType) {
		this.scriptData.set(key, value);

		this.set(DataObjectBase._scriptData + DataObjectBase.DOT + key, value);
	}

	public removeScriptData(key: string): void {
		this.scriptData.delete(key);

		this.unset(DataObjectBase._scriptData + DataObjectBase.DOT + key);
	}

	public getAllPrivateData(): Map<string, DataValueType> {
		return this.privateData;
	}

	public hasPrivateData(key: string): boolean {
		return this.privateData.has(key);
	}

	public getPrivateData(key: string): DataValueType {
		return this.privateData.get(key);
	}

	public setPrivateData(key: string, value: DataValueType): void {
		this.privateData.set(key, value);

		this.set(DataObjectBase._privateData + DataObjectBase.DOT + key, value);
	}

	public removePrivateData(key: string): void {
		this.privateData.delete(key);

		this.unset(DataObjectBase._privateData + DataObjectBase.DOT + key);
	}

	public getDisplayName(): string {
		return this.displayName;
	}

	public setDisplayName(displayName: string): void {
		this.displayName = displayName;

		this.set(DataObjectBase._displayName, this.displayName);
	}

	public getAvatar(): AvatarItem {
		return this.avatar;
	}

	public setAvatar(type: number, value: string): void {
		this.avatar = {
			type: type,
			value: value,
		};

		this.set(DataObjectBase._avatar, this.avatar);
	}

	public getTsCreate(): number {
		return this.tsCreate;
	}

	public setTsCreate(tsCreate: number): void {
		this.tsCreate = tsCreate;

		this.set(DataObjectBase._tsCreate, this.tsCreate);
	}


	public getAllTags(): Map<string, string | boolean | number> {
		return this.tags;
	}

	public hasTag(key: string): boolean {
		return this.tags.has(key);
	}

	public getTag(key: string): TagValueType {
		return this.tags.get(key);
	}

	public setTag(key: string, value: TagValueType): void {
		this.tags.set(key, value);

		this.set(DataObjectBase._tags + DataObjectBase.DOT + key, value);
	}

	public removeTag(key: string): void {
		this.tags.delete(key);

		this.unset(DataObjectBase._tags + DataObjectBase.DOT + key);
	}
}
