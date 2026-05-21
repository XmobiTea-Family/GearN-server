import * as mongodb from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";
import { CharacterItem } from "./CharacterItem";

/**
 * Player of a specific game; the entity gameplay code interacts with the most.
 * Adds `userId` (the player's identifier inside this game) and `socketId` (the current real-time connection identifier).
 */
export class GamePlayer extends GamePlayerBase {
    /** MongoDB field name for the player's owned character list (quick reference only — not the full character entity). */
    private static readonly _playerCharacters: string = "playerCharacters";

    /** MongoDB field name for userId — the link to the system-wide MasterPlayer. */
    private static readonly _userId: string = "userId";

    /** Player id inside this game; equal to MasterPlayer's `userId`; immutable after creation. */
    private readonly userId: string;

    /** Reference array of characters currently owned by the player (each entry is a CharacterItem — id + catalog only). */
    private playerCharacters: Array<CharacterItem>;

    /**
     * Initializes a new game player instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        super(result, collection);
        this.userId = result[GamePlayer._userId];

        this.setDocumentGamePlayer(result);
    }

    /**
     * Sets the document game player.
     * @param result Provides the result value used by this operation.
     */
    private setDocumentGamePlayer(result: mongodb.WithId<mongodb.Document>) {
        // this.playerPushs = result[GamePlayer._playerPushs];
        this.playerCharacters = result[GamePlayer._playerCharacters];
    }

    /**
     * Returns whether r ID should be used.
     * @returns Returns whether r ID should be used.
     */
    public getUserId(): string {
        return this.userId;
    }

    /**
    * Returns all player characters.
    * @returns Returns all player characters.
    */
    public getAllPlayerCharacters(): Array<CharacterItem> {
        return this.playerCharacters;
    }

    public getPlayerCharacter(characterId: string): CharacterItem {
        return this.playerCharacters.find((x) => x.characterId == characterId);
    }

    public setPlayerCharacter(characterId: string, catalogId: string): void {
        let playerCharacterItem = this.playerCharacters.find((x) => x.characterId == characterId);
        if (playerCharacterItem == null) {
            playerCharacterItem = {
                catalogId: catalogId,
                characterId: characterId,
            };

            this.playerCharacters.push(playerCharacterItem);
        } else {
            playerCharacterItem.catalogId = catalogId;
        }

        this.set(GamePlayer._playerCharacters, this.playerCharacters);
    }

    public removePlayerCharacter(characterId: string): void {
        let playerCharacterItem = this.playerCharacters.find((x) => x.characterId == characterId);
        if (playerCharacterItem != null) {
            let indexOf = this.playerCharacters.indexOf(playerCharacterItem);
            if (indexOf != -1) {
                this.playerCharacters.splice(indexOf, 1);

                return this.set(GamePlayer._playerCharacters, this.playerCharacters);
            }
        }

        throw Error("can not found the characterId to remove");
    }

    /**
    * Checks whether player character exists.
    */
    public hasPlayerCharacter(characterId: string): boolean {
        return this.playerCharacters.find((x) => x.characterId == characterId) != null;
    }
}
