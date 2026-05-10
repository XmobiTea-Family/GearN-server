import * as mongodb from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { SecretPermissionItem } from "./../../../../../../GN-common/entity/SecretInfo";

/**
 * A secret key issued to a game for calling server APIs / CloudScript.
 * Each key carries a permission set, an expiration, and can be revoked (`remove`).
 */
export class SecretInfoItem extends MasterAdminMongoObject {
    /** MongoDB field name for the gameId the secret key is bound to. */
    private static readonly _gameId: string = "gameId";
    /** MongoDB field name for the actual secret key value. */
    private static readonly _secretKey: string = "secretKey";
    /** MongoDB field name for the revocation flag. */
    private static readonly _remove: string = "remove";
    /** MongoDB field name for the key expiration timestamp. */
    private static readonly _tsExpire: string = "tsExpire";
    /** MongoDB field name for the key's permission set. */
    private static readonly _permission: string = "permission";
    /** MongoDB field name for the key creation timestamp. */
    private static readonly _tsCreate: string = "tsCreate";
    /** MongoDB field name for the human-readable purpose description of the key. */
    private static readonly _description: string = "description";
    /** MongoDB field name for the id of the admin who created the key. */
    private static readonly _creatorId: string = "creatorId";

    /** Game id the secret key is bound to; immutable after creation (a key belongs to a specific game). */
    private readonly gameId: string;
    /** Secret key value (long random string); immutable — issued keys are not allowed to be edited. */
    private readonly secretKey: string;
    /** Epoch ms when the key was created; immutable. */
    private readonly tsCreate: number;
    /** Id of the admin who created this secret key; immutable for traceability. */
    private readonly creatorId: string;

    /** Revocation flag — true once an admin revokes the key; the server refuses requests using a revoked key. */
    private remove: boolean;
    /** Epoch ms when the key expires; after this point the key is no longer accepted even if `remove` is false. */
    private tsExpire: number;
    /** Description of the key's purpose (entered by the admin) to disambiguate multiple keys of the same game. */
    private description: string;
    /** Permission set attached to the key; decides which APIs/scopes the key may call. */
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
