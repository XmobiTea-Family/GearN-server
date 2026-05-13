import * as mongodb from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";

/**
 * Player of a specific game; the entity gameplay code interacts with the most.
 * Adds `userId` (the player's identifier inside this game) and `socketId` (the current real-time connection identifier).
 */
export class GamePlayer extends GamePlayerBase {
    /** MongoDB field name for userId — the link to the system-wide MasterPlayer. */
    private static readonly _userId: string = "userId";

    /** Player id inside this game; equal to MasterPlayer's `userId`; immutable after creation. */
    private readonly userId: string;

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
    }

    /**
     * Returns whether r ID should be used.
     * @returns Returns whether r ID should be used.
     */
    public getUserId(): string {
        return this.userId;
    }
}
