import * as mongoDB from "mongodb";

import { AvatarItem } from "./AvatarItem";
import { MongoObject } from "./MongoObject";
import { DataValueType } from "./type/DataValueType";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";

export class DataObjectBase extends MongoObject {
	// Defines the internal field key for segments.
	private static readonly _segments: string = "segments";
	// Defines the internal field key for custom datas.
	private static readonly _customDatas: string = "customDatas";

	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";

	// Defines the internal field key for display name.
	private static readonly _displayName: string = "displayName";
	// Defines the internal field key for display name normalize.
	private static readonly _displayNameNormalize: string = "displayNameNormalize";
	// Defines the internal field key for avatar.
	private static readonly _avatar: string = "avatar";
	// Defines the internal field key for tags.
	private static readonly _tags: string = "tags";

	// Stores the DOT value used by this instance.
	static readonly DOT: string = ".";

	// Stores the segments value used by this instance.
	private segments: Array<string>;
	// Stores the custom datas collection used by this instance.
	private customDatas: Map<string, DataValueType>;

	// Stores the display name value used by this instance.
	private displayName: string;
	// Stores the avatar value used by this instance.
	private avatar: AvatarItem;

	// Stores the timestamp create value used by this instance.
	private tsCreate: number;
	// Stores the tags collection used by this instance.
	private tags: Map<string, string>;

	/**
	 * Initializes a new data object base instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentDataObjectBase(result);
	}

	/**
	 * Sets the document data object base.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentDataObjectBase(result: mongoDB.WithId<mongoDB.Document>): void {
		this.segments = result[DataObjectBase._segments];
		this.customDatas = result[DataObjectBase._customDatas] != null ? new Map(Object.entries(result[DataObjectBase._customDatas])) : null;

		this.displayName = result[DataObjectBase._displayName];
		this.avatar = result[DataObjectBase._avatar];

		this.tsCreate = result[DataObjectBase._tsCreate];
		this.tags = result[DataObjectBase._tags] != null ? new Map(Object.entries(result[DataObjectBase._tags])) : null;
	}

	/**
	 * Returns all segments.
	 * @returns Returns all segments.
	 */
	public getAllSegments(): Array<string> {
		return this.segments;
	}

	/**
	 * Checks whether segment exists.
	 * @param segment Provides the segment value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasSegment(segment: string): boolean {
		return this.segments.indexOf(segment) != -1;
	}

	/**
	 * Adds the segment.
	 * @param segment Provides the segment value used by this operation.
	 */
	public addSegment(segment: string): void {
		this.segments.push(segment);

		this.set(DataObjectBase._segments, this.segments);
	}

	/**
	 * Removes the segment.
	 * @param segment Provides the segment value used by this operation.
	 */
	public removeSegment(segment: string): void {
		// Stores the index of value used in the current execution flow.
		let indexOf = this.segments.indexOf(segment);
		if (indexOf != -1) {
			this.segments.splice(indexOf, 1);
			return this.set(DataObjectBase._segments, this.segments);
		}

		throw Error("can not found the segment to remove");
	}

	/**
	 * Removes all segments.
	 */
	public removeAllSegments(): void {
		this.segments.length = 0;

		this.set(DataObjectBase._segments, this.segments);
	}

	/**
	 * Returns all custom datas.
	 * @returns Returns all custom datas.
	 */
	public getAllCustomDatas(): Map<string, DataValueType> {
		return this.customDatas;
	}

	/**
	 * Checks whether custom data exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasCustomData(key: string): boolean {
		return this.customDatas.has(key);
	}

	/**
	 * Returns the custom data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the custom data.
	 */
	public getCustomData(key: string): DataValueType {
		return this.customDatas.get(key);
	}

	/**
	 * Sets the custom data.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setCustomData(key: string, value: DataValueType) {
		this.customDatas.set(key, value);

		this.set(DataObjectBase._customDatas + DataObjectBase.DOT + key, value);
	}

	/**
	 * Removes the custom data.
	 * @param key Provides the key value used by this operation.
	 */
	public removeCustomData(key: string): void {
		this.customDatas.delete(key);

		this.unset(DataObjectBase._customDatas + DataObjectBase.DOT + key);
	}

	/**
	 * Returns the display name.
	 * @returns Returns the display name.
	 */
	public getDisplayName(): string {
		return this.displayName;
	}

	/**
	 * Sets the display name.
	 * @param displayName Provides the display name value used by this operation.
	 */
	public setDisplayName(displayName: string): void {
		this.displayName = displayName;

		this.set(DataObjectBase._displayName, this.displayName);
		this.set(DataObjectBase._displayNameNormalize, DisplayNameUtility.normalizeString(displayName));
	}

	/**
	 * Returns the avatar.
	 * @returns Returns the avatar.
	 */
	public getAvatar(): AvatarItem {
		return this.avatar;
	}

	/**
	 * Sets the avatar.
	 * @param type Provides the type value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setAvatar(type: number, value: string): void {
		this.avatar = {
			type: type,
			value: value,
		};

		this.set(DataObjectBase._avatar, this.avatar);
	}

	/**
	 * Returns the timestamp create.
	 * @returns Returns the timestamp create.
	 */
	public getTsCreate(): number {
		return this.tsCreate;
	}

	/**
	 * Sets the timestamp create.
	 * @param tsCreate Provides the timestamp create value used by this operation.
	 */
	public setTsCreate(tsCreate: number): void {
		this.tsCreate = tsCreate;

		this.set(DataObjectBase._tsCreate, this.tsCreate);
	}

	/**
	 * Returns all tags.
	 * @returns Returns all tags.
	 */
	public getAllTags(): Map<string, string> {
		return this.tags;
	}

	/**
	 * Executes the clear tags workflow.
	 */
	public clearTags(): void {
		this.tags.clear();

		this.set(DataObjectBase._tags, {});
	}

	/**
	 * Checks whether tag exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasTag(key: string): boolean {
		return this.tags.has(key);
	}

	/**
	 * Returns the tag.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the tag.
	 */
	public getTag(key: string): string {
		return this.tags.get(key);
	}

	/**
	 * Sets the tag.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setTag(key: string, value: string): void {
		this.tags.set(key, value);

		this.set(DataObjectBase._tags + DataObjectBase.DOT + key, value);
	}

	/**
	 * Removes the tag.
	 * @param key Provides the key value used by this operation.
	 */
	public removeTag(key: string): void {
		this.tags.delete(key);

		this.unset(DataObjectBase._tags + DataObjectBase.DOT + key);
	}
}
