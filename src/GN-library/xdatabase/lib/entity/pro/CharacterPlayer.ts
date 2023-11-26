import * as mongoDB from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

export class CharacterPlayer extends GamePlayerBase {
	private static readonly _characterId: string = "characterId";
	private static readonly _catalogId: string = "catalogId";
	private static readonly _owner: string = "owner";
	private static readonly _removeStatus: string = "removeStatus";

	private readonly characterId: string;
	private readonly catalogId: string;

	private owner: OwnerItem;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.characterId = result[CharacterPlayer._characterId];
		this.catalogId = result[CharacterPlayer._catalogId];

		this.setDocumentCharacterPlayer(result);
	}

	private setDocumentCharacterPlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.owner = result[CharacterPlayer._owner];
		this.removeStatus = result[CharacterPlayer._removeStatus];
	}

	public getCharacterId(): string {
		return this.characterId;
	}

	public getCatalogId(): string {
		return this.catalogId;
	}

	public getOwner(): OwnerItem {
		return this.owner;
	}

	public setOwner(ownerId: string, ownerType: number): void {
		this.owner = {
			id: ownerId,
			type: ownerType,
		};

		this.set(CharacterPlayer._owner, this.owner);
	}

	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(CharacterPlayer._removeStatus, this.removeStatus);
	}

}