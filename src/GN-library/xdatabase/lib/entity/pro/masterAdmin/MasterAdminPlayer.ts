import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";

export class MasterAdminPlayer extends MasterAdminMongoObject {
	// Indicates whether r ID should be used.
	private static readonly _userId: string = "userId";
	// Indicates whether rname should be used.
	private static readonly _username: string = "username";
	// Defines the internal field key for password.
	private static readonly _password: string = "password";
	// Defines the internal field key for secret key.
	private static readonly _secretKey: string = "secretKey";

	// Indicates whether r ID should be used.
	private readonly userId: string;
	// Indicates whether rname should be used.
	private username: string;
	// Stores the password value used by this instance.
	private password: string;
	// Stores the secret key value used by this instance.
	private secretKey: string;

	/**
	 * Initializes a new master admin player instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = result[MasterAdminPlayer._userId];

		this.setDocumentMasterAdminPlayer(result);
	}

	/**
	 * Sets the document master admin player.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentMasterAdminPlayer(result: mongoDB.WithId<mongoDB.Document>) {
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
