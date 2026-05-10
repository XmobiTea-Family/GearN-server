import * as mongodb from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";

/**
 * Administrator account for the system (operates the dashboard — not a game player).
 * Separated from MasterPlayer to constrain access and tighten security.
 */
export class MasterAdminPlayer extends MasterAdminMongoObject {
    /** MongoDB field name for the admin userId (distinct from MasterPlayer's userId). */
    private static readonly _userId: string = "userId";
    /** MongoDB field name for the admin username used to sign into the dashboard. */
    private static readonly _username: string = "username";
    /** MongoDB field name for the admin's hashed password. */
    private static readonly _password: string = "password";
    /** MongoDB field name for the secret key used for 2FA or admin request signing. */
    private static readonly _secretKey: string = "secretKey";

    /** Admin id within the system; immutable after creation, used as the foreign-key reference. */
    private readonly userId: string;
    /** Admin username (dashboard login); unique across all admins in the system. */
    private username: string;
    /** Hashed password; never stored as plain text. */
    private password: string;
    /** Secret key used for 2FA/MFA or signing sensitive admin requests. */
    private secretKey: string;

    /**
     * Initializes a new master admin player instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        super(result, collection);
        this.userId = result[MasterAdminPlayer._userId];

        this.setDocumentMasterAdminPlayer(result);
    }

    /**
     * Sets the document master admin player.
     * @param result Provides the result value used by this operation.
     */
    private setDocumentMasterAdminPlayer(result: mongodb.WithId<mongodb.Document>) {
        this.username = result[MasterAdminPlayer._username];
        this.password = result[MasterAdminPlayer._password];
        this.secretKey = result[MasterAdminPlayer._secretKey];
    }

    /**
     * Returns whether r ID should be used.
     * @returns Returns whether r ID should be used.
     */
    public getUserId(): string {
        return this.userId;
    }

    /**
     * Returns whether rname should be used.
     * @returns Returns whether rname should be used.
     */
    public getUsername(): string {
        return this.username;
    }

    /**
     * Returns the password.
     * @returns Returns the password.
     */
    public getPassword(): string {
        return this.password;
    }

    /**
     * Returns the secret key.
     * @returns Returns the secret key.
     */
    public getSecretKey(): string {
        return this.secretKey;
    }

    /**
     * Sets whether rname should be used.
     * @param username Indicates whether rname should be used.
     */
    public setUsername(username: string) {
        this.username = username;

        this.set(MasterAdminPlayer._username, this.username);
    }

    /**
     * Sets the password.
     * @param password Provides the password value used by this operation.
     */
    public setPassword(password: string) {
        this.password = password;

        this.set(MasterAdminPlayer._password, this.password);
    }

    /**
     * Sets the secret key.
     * @param secretKey Provides the secret key value used by this operation.
     */
    public setSecretKey(secretKey: string) {
        this.secretKey = secretKey;

        this.set(MasterAdminPlayer._secretKey, this.secretKey);
    }
}
