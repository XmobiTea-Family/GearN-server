import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { xGameSettings } from "./../../../../../xsettings/lib/entity/xGameSettings";
import { xMatchmakingQueueSettings } from "./../../../../../xsettings/lib/entity/xMatchmakingQueueSettings";

export class GameItem extends MasterAdminMongoObject {
	// Defines the internal field key for game ID.
	private static readonly _gameId: string = "gameId";
	// Defines the internal field key for game name.
	private static readonly _gameName: string = "gameName";
	// Defines the internal field key for game description.
	private static readonly _gameDescription: string = "gameDescription";
	// Defines the internal field key for game icon URL.
	private static readonly _gameIconUrl: string = "gameIconUrl";
	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";
	// Defines the internal field key for creator ID.
	private static readonly _creatorId: string = "creatorId";
	// Defines the internal field key for game settings.
	private static readonly _gameSettings: string = "gameSettings";
	// Defines the internal field key for matchmaking queue settings.
	private static readonly _matchmakingQueueSettings: string = "matchmakingQueueSettings";

	// Stores the game ID value used by this instance.
	private readonly gameId: string;
	// Stores the timestamp create value used by this instance.
	private readonly tsCreate: number;
	// Stores the creator ID value used by this instance.
	private readonly creatorId: string;

	// Stores the game name value used by this instance.
	private gameName: string;
	// Stores the game description value used by this instance.
	private gameDescription: string;
	// Stores the game icon URL value used by this instance.
	private gameIconUrl: string;
	// Stores the game settings value used by this instance.
	private gameSettings: xGameSettings;
	// Stores the matchmaking queue settings list used by this instance.
	private matchmakingQueueSettings: xMatchmakingQueueSettings[];

	/**
	 * Initializes a new game item instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
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
	private setDocumentMasterGameItem(result: mongoDB.WithId<mongoDB.Document>) {
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
