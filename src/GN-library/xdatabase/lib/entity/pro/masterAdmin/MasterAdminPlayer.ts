import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";

export class MasterAdminPlayer extends MasterAdminMongoObject {
	private static readonly _userId: string = "userId";
	private static readonly _username: string = "username";
	private static readonly _password: string = "password";
	private static readonly _secretKey: string = "secretKey";

	private readonly userId: string;
	private username: string;
	private password: string;
	private secretKey: string;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = result[MasterAdminPlayer._userId];

		this.setDocumentMasterAdminPlayer(result);
	}

	private setDocumentMasterAdminPlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.username = result[MasterAdminPlayer._username];
		this.password = result[MasterAdminPlayer._password];
		this.secretKey = result[MasterAdminPlayer._secretKey];
	}

	public getUserId(): string {
		return this.userId;
	}

	public getUsername(): string {
		return this.username;
	}

	public getPassword(): string {
		return this.password;
	}

	public getSecretKey(): string {
		return this.secretKey;
	}

	public setUsername(username: string) {
		this.username = username;

		this.set(MasterAdminPlayer._username, this.username);
	}

	public setPassword(password: string) {
		this.password = password;

		this.set(MasterAdminPlayer._password, this.password);
	}

	public setSecretKey(secretKey: string) {
		this.secretKey = secretKey;

		this.set(MasterAdminPlayer._secretKey, this.secretKey);
	}
}
