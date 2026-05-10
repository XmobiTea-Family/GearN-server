import * as mongodb from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { xGameSettings } from "./../../../../../xsettings/lib/entity/xGameSettings";
import { xMatchmakingQueueSettings } from "./../../../../../xsettings/lib/entity/xMatchmakingQueueSettings";

/**
 * A game registered in the GearN system (multi-tenant: each tenant is a game).
 * Holds metadata, gameplay configuration (xGameSettings) and the matchmaking queue configuration the game offers.
 */
export class GameItem extends MasterAdminMongoObject {
    /** MongoDB field name for gameId — unique business key identifying the game (tenant). */
    private static readonly _gameId: string = "gameId";
    /** MongoDB field name for the game display name. */
    private static readonly _gameName: string = "gameName";
    /** MongoDB field name for the game description. */
    private static readonly _gameDescription: string = "gameDescription";
    /** MongoDB field name for the game icon URL. */
    private static readonly _gameIconUrl: string = "gameIconUrl";
    /** MongoDB field name for the game creation timestamp. */
    private static readonly _tsCreate: string = "tsCreate";
    /** MongoDB field name for the id of the admin who created the game. */
    private static readonly _creatorId: string = "creatorId";
    /** MongoDB field name for the gameplay configuration (xGameSettings). */
    private static readonly _gameSettings: string = "gameSettings";
    /** MongoDB field name for the array of matchmaking queue configurations available to the game. */
    private static readonly _matchmakingQueueSettings: string = "matchmakingQueueSettings";

    /** Game (tenant) id; unique business key; immutable after creation. */
    private readonly gameId: string;
    /** Epoch ms when the game was created; immutable. */
    private readonly tsCreate: number;
    /** Id of the admin who created the game; immutable so the original owner stays traceable. */
    private readonly creatorId: string;

    /** Game display name shown to users/admins. */
    private gameName: string;
    /** Short free-text description of the game; aids search/management. */
    private gameDescription: string;
    /** Game icon URL shown in the dashboard and client launcher. */
    private gameIconUrl: string;
    /** Aggregated gameplay configuration (player, character, group, inventory settings...). */
    private gameSettings: xGameSettings;
    /** Matchmaking queue configurations exposed by the game (e.g. ranked_5v5, casual_1v1). */
    private matchmakingQueueSettings: xMatchmakingQueueSettings[];

    /**
     * Initializes a new game item instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        super(result, collection);

        this.gameId = result[GameItem._gameId];
        this.tsCreate = result[GameItem._tsCreate];
        this.creatorId = result[GameItem._creatorId];

        this.setDocumentMasterGameItem(result);
    }

    /**
     * Sets the document master game item.
     * @param result Provides the result value used by this operation.
     */
    private setDocumentMasterGameItem(result: mongodb.WithId<mongodb.Document>) {
        this.gameName = result[GameItem._gameName];
        this.gameDescription = result[GameItem._gameDescription];
        this.gameIconUrl = result[GameItem._gameIconUrl];
        this.gameSettings = result[GameItem._gameSettings];
        this.matchmakingQueueSettings = result[GameItem._matchmakingQueueSettings];
    }

    /**
     * Returns the game ID.
     * @returns Returns the game ID.
     */
    public getGameId(): string {
        return this.gameId;
    }

    /**
     * Returns the timestamp create.
     * @returns Returns the timestamp create.
     */
    public getTsCreate(): number {
        return this.tsCreate;
    }

    /**
     * Returns the creator ID.
     * @returns Returns the creator ID.
     */
    public getCreatorId(): string {
        return this.creatorId;
    }

    /**
     * Returns the game name.
     * @returns Returns the game name.
     */
    public getGameName(): string {
        return this.gameName;
    }

    /**
     * Sets the game name.
     * @param gameName Provides the game name value used by this operation.
     */
    public setGameName(gameName: string): void {
        this.gameName = gameName;

        this.set(GameItem._gameName, gameName);
    }

    /**
     * Returns the game description.
     * @returns Returns the game description.
     */
    public getGameDescription(): string {
        return this.gameDescription;
    }

    /**
     * Sets the game description.
     * @param gameDescription Provides the game description value used by this operation.
     */
    public setGameDescription(gameDescription: string): void {
        this.gameDescription = gameDescription;

        this.set(GameItem._gameDescription, gameDescription);
    }

    /**
     * Returns the game icon URL.
     * @returns Returns the game icon URL.
     */
    public getGameIconUrl(): string {
        return this.gameIconUrl;
    }

    /**
     * Sets the game icon URL.
     * @param gameIconUrl Provides the game icon URL value used by this operation.
     */
    public setGameIconUrl(gameIconUrl: string): void {
        this.gameIconUrl = gameIconUrl;

        this.set(GameItem._gameIconUrl, gameIconUrl);
    }

    /**
     * Returns the game settings.
     * @returns Returns the game settings.
     */
    public getGameSettings(): xGameSettings {
        return this.gameSettings;
    }

    /**
     * Sets the game settings.
     * @param gameSettings Provides the game settings value used by this operation.
     */
    public setGameSettings(gameSettings: xGameSettings): void {
        this.gameSettings = gameSettings;

        this.set(GameItem._gameSettings, gameSettings);
    }

    /**
     * Returns the matchmaking queue settings.
     * @returns Returns the matchmaking queue settings.
     */
    public getMatchmakingQueueSettings(): xMatchmakingQueueSettings[] {
        return this.matchmakingQueueSettings;
    }

    /**
     * Sets the matchmaking queue settings.
     * @param matchmakingQueueSettings Provides the matchmaking queue settings value used by this operation.
     */
    public setMatchmakingQueueSettings(matchmakingQueueSettings: xMatchmakingQueueSettings[]): void {
        this.matchmakingQueueSettings = matchmakingQueueSettings;

        this.set(GameItem._matchmakingQueueSettings, matchmakingQueueSettings);
    }
}
