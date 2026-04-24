import * as mongodb from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

export class CharacterPlayer extends GamePlayerBase {
	// Defines the internal field key for character ID.
	private static readonly _characterId: string = "characterId";
	// Defines the internal field key for catalog ID.
	private static readonly _catalogId: string = "catalogId";
	// Defines the internal field key for owner.
	private static readonly _owner: string = "owner";
	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";

	// Stores the character ID value used by this instance.
	private readonly characterId: string;
	// Stores the catalog ID value used by this instance.
	private readonly catalogId: string;

	// Stores the owner value used by this instance.
	private owner: OwnerItem;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new character player instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.characterId = result[CharacterPlayer._characterId];
		this.catalogId = result[CharacterPlayer._catalogId];

		this.setDocumentCharacterPlayer(result);
	}

	/**
	 * Sets the document character player.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentCharacterPlayer(result: mongodb.WithId<mongodb.Document>) {
		this.owner = result[CharacterPlayer._owner];
		this.removeStatus = result[CharacterPlayer._removeStatus];
	}

	/**
	 * Returns the character ID.
	 * @returns Returns the character ID.
	 */
	public getCharacterId(): string {
		return this.characterId;
	}

	/**
	 * Returns the catalog ID.
	 * @returns Returns the catalog ID.
	 */
	public getCatalogId(): string {
		return this.catalogId;
	}

	/**
	 * Returns the owner.
	 * @returns Returns the owner.
	 */
	public getOwner(): OwnerItem {
		return this.owner;
	}

	/**
	 * Sets the owner.
	 * @param ownerId Provides the owner ID value used by this operation.
	 * @param ownerType Provides the owner type value used by this operation.
	 */
	public setOwner(ownerId: string, ownerType: number): void {
		this.owner = {
			id: ownerId,
			type: ownerType,
		};

		this.set(CharacterPlayer._owner, this.owner);
	}

	/**
	 * Returns the remove status.
	 * @returns Returns the remove status.
	 */
	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	/**
	 * Sets the remove status.
	 * @param tsRemove Provides the timestamp remove value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(CharacterPlayer._removeStatus, this.removeStatus);
	}

}