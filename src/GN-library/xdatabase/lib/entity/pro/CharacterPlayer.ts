import * as mongodb from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

/**
 * Character that belongs to a player inside a game; extends GamePlayerBase so the player's full business surface applies to the character too.
 * Unlike CharacterItem (lightweight reference only), this is the full entity with its own inventory, groups, friends...
 */
export class CharacterPlayer extends GamePlayerBase {
	/** MongoDB field name for the character id — the system-wide unique identifier. */
	private static readonly _characterId: string = "characterId";
	/** MongoDB field name for the character catalog id (the template the character was created from). */
	private static readonly _catalogId: string = "catalogId";
	/** MongoDB field name for the character's owner (player). */
	private static readonly _owner: string = "owner";
	/** MongoDB field name for the soft-delete state (if any). */
	private static readonly _removeStatus: string = "removeStatus";

	/** Character id; immutable after creation, used as the join key inside CharacterItem references. */
	private readonly characterId: string;
	/** Catalog id identifying the character template (warrior, mage...); immutable after creation. */
	private readonly catalogId: string;

	/** Owner (player) of this character; typically owner.type = player and owner.id = userId. */
	private owner: OwnerItem;

	/** Soft-delete state of the character; null means the character is still active. */
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