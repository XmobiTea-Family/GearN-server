import * as mongoDB from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

export class CharacterPlayer extends GamePlayerBase {
	private static readonly _characterId: string = "characterId";
	private static readonly _characterCatalogId: string = "characterCatalogId";
	private static readonly _owner: string = "owner";
	private static readonly _removeStatus: string = "removeStatus";

	private readonly characterId: string;
	private characterCatalogId: string;

	private owner: OwnerItem;

	private removeStatus: RemoveStatusItem;
	
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.characterId = result[CharacterPlayer._characterId];

		this.setDocumentCharacterPlayer(result);
	}

	private setDocumentCharacterPlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.characterCatalogId = result[CharacterPlayer._characterCatalogId];
		this.owner = result[CharacterPlayer._owner];
		this.removeStatus = result[CharacterPlayer._removeStatus];
	}

	public getCharacterId(): string {
		return this.characterId;
	}

	public getCharacterCatalogId(): string {
		return this.characterCatalogId;
	}

	public setCharacterCatalogId(characterCatalogId: string): void {
		this.characterCatalogId = characterCatalogId;

		this.set(CharacterPlayer._characterCatalogId, this.characterCatalogId);
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