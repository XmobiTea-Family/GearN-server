import * as mongoDB from "mongodb";

import { AvatarItem } from "./AvatarItem";
import { MongoObject } from "./MongoObject";
import { DataValueType } from "./type/DataValueType";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";

export class DataObjectBase extends MongoObject {
	private static readonly _segments: string = "segments";
	private static readonly _customDatas: string = "customDatas";

	private static readonly _tsCreate: string = "tsCreate";

	private static readonly _displayName: string = "displayName";
	private static readonly _displayNameNormalize: string = "displayNameNormalize";
	private static readonly _avatar: string = "avatar";
	private static readonly _tags: string = "tags";

	static readonly DOT: string = ".";

	private segments: Array<string>;
	private customDatas: Map<string, DataValueType>;

	private displayName: string;
	private avatar: AvatarItem;

	private tsCreate: number;
	private tags: Map<string, string>;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentDataObjectBase(result);
	}

	private setDocumentDataObjectBase(result: mongoDB.WithId<mongoDB.Document>): void {
		this.segments = result[DataObjectBase._segments];
		this.customDatas = result[DataObjectBase._customDatas] != null ? new Map(Object.entries(result[DataObjectBase._customDatas])) : null;

		this.displayName = result[DataObjectBase._displayName];
		this.avatar = result[DataObjectBase._avatar];

		this.tsCreate = result[DataObjectBase._tsCreate];
		this.tags = result[DataObjectBase._tags] != null ? new Map(Object.entries(result[DataObjectBase._tags])) : null;
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

	public getAllCustomDatas(): Map<string, DataValueType> {
		return this.customDatas;
	}

	public hasCustomData(key: string): boolean {
		return this.customDatas.has(key);
	}

	public getCustomData(key: string): DataValueType {
		return this.customDatas.get(key);
	}

	public setCustomData(key: string, value: DataValueType) {
		this.customDatas.set(key, value);

		this.removeSet(DataObjectBase._customDatas);
		this.set(DataObjectBase._customDatas + DataObjectBase.DOT + key, value);
	}

	public removeCustomData(key: string): void {
		this.customDatas.delete(key);

		this.unset(DataObjectBase._customDatas + DataObjectBase.DOT + key);
	}

	public getDisplayName(): string {
		return this.displayName;
	}

	public setDisplayName(displayName: string): void {
		this.displayName = displayName;

		this.set(DataObjectBase._displayName, this.displayName);
		this.set(DataObjectBase._displayNameNormalize, DisplayNameUtility.normalizeString(displayName));
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

	public getAllTags(): Map<string, string> {
		return this.tags;
	}

	public clearTags(): void {
		this.tags.clear();

		this.set(DataObjectBase._tags, {});
	}

	public hasTag(key: string): boolean {
		return this.tags.has(key);
	}

	public getTag(key: string): string {
		return this.tags.get(key);
	}

	public setTag(key: string, value: string): void {
		this.tags.set(key, value);

		this.removeSet(DataObjectBase._tags);
		this.set(DataObjectBase._tags + DataObjectBase.DOT + key, value);
	}

	public removeTag(key: string): void {
		this.tags.delete(key);

		this.unset(DataObjectBase._tags + DataObjectBase.DOT + key);
	}
}
