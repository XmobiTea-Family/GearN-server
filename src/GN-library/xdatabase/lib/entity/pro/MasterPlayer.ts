import * as mongoDB from "mongodb";

import { ExternalItem } from "./ExternalItem";
import { PlayerBase } from "./PlayerBase";
import { IPDetailItem } from "./IPDetailItem";

export class MasterPlayer extends PlayerBase {
	private static readonly _external: string = "external";
	private static readonly _userId: string = "userId";
	private static readonly _email: string = "email";
	private static readonly _lastIPDetail: string = "lastIPDetail";

	private readonly userId: string;
	private external: ExternalItem;
	private email: string;
	private lastIPDetail: IPDetailItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = result[MasterPlayer._userId];

		this.setDocumentMasterPlayer(result);
	}

	private setDocumentMasterPlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.external = result[MasterPlayer._external];

		if (result[MasterPlayer._external] != null) {
			if (result[MasterPlayer._external]["genericService"] != null) {
				if (result[MasterPlayer._external]["genericService"]["genericServices"] != null) {
					this.external.genericService.genericServices = new Map(Object.entries(result[MasterPlayer._external]["genericService"]["genericServices"]));
				}
			}
		}

		this.email = result[MasterPlayer._email];
		this.lastIPDetail = result[MasterPlayer._lastIPDetail];
	}

	public getUserId(): string {
		return this.userId;
	}

	public getPassword(): string {
		return this.external.account.password;
	}

	public getExternal(): ExternalItem {
		return this.external;
	}

	public setExternal(externalItem: ExternalItem): void {
		this.external = externalItem;

		this.set(MasterPlayer._external, this.external);
	}

	public getEmail(): string {
		return this.email;
	}

	public setEmail(email: string): void {
		this.email = email;

		this.set(MasterPlayer._email, this.email);
	}

	public getLastIPDetail(): IPDetailItem {
		return this.lastIPDetail;
	}

	public setLastIPDetail(ipDetail: IPDetailItem): void {
		this.lastIPDetail = ipDetail;

		this.set(MasterPlayer._lastIPDetail, this.lastIPDetail);
	}
}
