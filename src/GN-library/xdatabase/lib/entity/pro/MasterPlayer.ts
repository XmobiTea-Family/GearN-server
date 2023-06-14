import * as mongoDB from "mongodb";

import { ExternalItem } from "./ExternalItem";
import { MasterPlayerBase } from "./MasterPlayerBase";

export class MasterPlayer extends MasterPlayerBase {
	private static readonly _external: string = "external";

	private readonly userId: string;
	private external: ExternalItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = this._id.toString();

		this.setDocumentMasterPlayer(result);
	}

	private setDocumentMasterPlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.external = result[MasterPlayer._external];
	}

	public getUserId(): string {
		return this.userId;
	}

	public getExternal(): ExternalItem {
		return this.external;
	}

	public setExternal(externalItem: ExternalItem): void {
		this.external = externalItem;

		this.set(MasterPlayer._external, this.external);
	}
}
