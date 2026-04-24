import * as mongodb from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { SecretPermissionItem } from "./../../../../../../GN-common/entity/SecretInfo";

export class SecretInfoItem extends MasterAdminMongoObject {
	// Defines the internal field key for game ID.
	private static readonly _gameId: string = "gameId";
	// Defines the internal field key for secret key.
	private static readonly _secretKey: string = "secretKey";
	// Defines the internal field key for remove.
	private static readonly _remove: string = "remove";
	// Defines the internal field key for timestamp expire.
	private static readonly _tsExpire: string = "tsExpire";
	// Defines the internal field key for permission.
	private static readonly _permission: string = "permission";
	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";
	// Defines the internal field key for description.
	private static readonly _description: string = "description";
	// Defines the internal field key for creator ID.
	private static readonly _creatorId: string = "creatorId";

	// Stores the game ID value used by this instance.
	private readonly gameId: string;
	// Stores the secret key value used by this instance.
	private readonly secretKey: string;
	// Stores the timestamp create value used by this instance.
	private readonly tsCreate: number;
	// Stores the creator ID value used by this instance.
	private readonly creatorId: string;

	// Indicates whether remove.
	private remove: boolean;
	// Stores the timestamp expire value used by this instance.
	private tsExpire: number;
	// Stores the description value used by this instance.
	private description: string;
	// Stores the permission value used by this instance.
	private permission: SecretPermissionItem;

	/**
	 * Initializes a new secret info item instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.gameId = result[SecretInfoItem._gameId];
		this.secretKey = result[SecretInfoItem._secretKey];
		this.tsCreate = result[SecretInfoItem._tsCreate];
		this.creatorId = result[SecretInfoItem._creatorId];

		this.setDocumentMasterSecretInfoItem(result);
	}

	/**
	 * Sets the document master secret info item.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentMasterSecretInfoItem(result: mongodb.WithId<mongodb.Document>) {
		this.remove = result[SecretInfoItem._remove];
		this.tsExpire = result[SecretInfoItem._tsExpire];
		this.description = result[SecretInfoItem._description];
		this.permission = result[SecretInfoItem._permission];
	}

	/**
	 * Returns the game ID.
	 * @returns Returns the game ID.
	 */
	public getGameId(): string {
		return this.gameId;
	}

	/**
	 * Returns the secret key.
	 * @returns Returns the secret key.
	 */
	public getSecretKey(): string {
		return this.secretKey;
	}

	/**
	 * Returns the timestamp create.
	 * @returns Returns the timestamp create.
	 */
	public getTsCreate(): number {
		return this.tsCreate;
	}

	/**
	 * Returns the creator ID.
	 * @returns Returns the creator ID.
	 */
	public getCreatorId(): string {
		return this.creatorId;
	}

	/**
	 * Returns the remove.
	 * @returns Returns the remove.
	 */
	public getRemove(): boolean {
		return this.remove;
	}

	/**
	 * Sets the remove.
	 * @param isRemove Indicates whether remove.
	 */
	public setRemove(isRemove: boolean): void {
		this.remove = isRemove;

		this.set(SecretInfoItem._remove, this.remove);
	}

	/**
	 * Returns the timestamp expire.
	 * @returns Returns the timestamp expire.
	 */
	public getTsExpire(): number {
		return this.tsExpire;
	}

	/**
	 * Sets the timestamp expire.
	 * @param tsExpire Provides the timestamp expire value used by this operation.
	 */
	public setTsExpire(tsExpire: number): void {
		this.tsExpire = tsExpire;

		this.set(SecretInfoItem._tsExpire, this.tsExpire);
	}

	/**
	 * Returns the description.
	 * @returns Returns the description.
	 */
	public getDescription(): string {
		return this.description;
	}

	/**
	 * Sets the description.
	 * @param description Provides the description value used by this operation.
	 */
	public setDescription(description: string): void {
		this.description = description;

		this.set(SecretInfoItem._description, this.description);
	}

	/**
	 * Returns the permission.
	 * @returns Returns the permission.
	 */
	public getPermission(): SecretPermissionItem {
		return this.permission;
	}

	/**
	 * Sets the permission.
	 * @param permission Provides the permission value used by this operation.
	 */
	public setPermission(permission: SecretPermissionItem): void {
		this.permission = permission;

		this.set(SecretInfoItem._permission, this.permission);
	}
}
