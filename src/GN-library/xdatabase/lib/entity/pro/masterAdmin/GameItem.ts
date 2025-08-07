import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { xGameSettings } from "./../../../../../xsettings/lib/entity/xGameSettings";
import { xMatchmakingQueueSettings } from "./../../../../../xsettings/lib/entity/xMatchmakingQueueSettings";

export class GameItem extends MasterAdminMongoObject {
	private static readonly _gameId: string = "gameId";
	private static readonly _gameName: string = "gameName";
	private static readonly _gameDescription: string = "gameDescription";
	private static readonly _gameIconUrl: string = "gameIconUrl";
	private static readonly _tsCreate: string = "tsCreate";
	private static readonly _creatorId: string = "creatorId";
	private static readonly _gameSettings: string = "gameSettings";
	private static readonly _matchmakingQueueSettings: string = "matchmakingQueueSettings";

	private readonly gameId: string;
	private readonly tsCreate: number;
	private readonly creatorId: string;

	private gameName: string;
	private gameDescription: string;
	private gameIconUrl: string;
	private gameSettings: xGameSettings;
	private matchmakingQueueSettings: xMatchmakingQueueSettings[];

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.gameId = result[GameItem._gameId];
		this.tsCreate = result[GameItem._tsCreate];
		this.creatorId = result[GameItem._creatorId];

		this.setDocumentMasterGameItem(result);
	}

	private setDocumentMasterGameItem(result: mongoDB.WithId<mongoDB.Document>) {
		this.gameName = result[GameItem._gameName];
		this.gameDescription = result[GameItem._gameDescription];
		this.gameIconUrl = result[GameItem._gameIconUrl];
		this.gameSettings = result[GameItem._gameSettings];
		this.matchmakingQueueSettings = result[GameItem._matchmakingQueueSettings];
	}

	public getGameId(): string {
		return this.gameId;
	}

	public getTsCreate(): number {
		return this.tsCreate;
	}

	public getCreatorId(): string {
		return this.creatorId;
	}

	public getGameName(): string {
		return this.gameName;
	}

	public setGameName(gameName: string): void {
		this.gameName = gameName;

		this.set(GameItem._gameName, gameName);
	}

	public getGameDescription(): string {
		return this.gameDescription;
	}

	public setGameDescription(gameDescription: string): void {
		this.gameDescription = gameDescription;

		this.set(GameItem._gameDescription, gameDescription);
	}

	public getGameIconUrl(): string {
		return this.gameIconUrl;
	}

	public setGameIconUrl(gameIconUrl: string): void {
		this.gameIconUrl = gameIconUrl;

		this.set(GameItem._gameIconUrl, gameIconUrl);
	}

	public getGameSettings(): xGameSettings {
		return this.gameSettings;
	}

	public setGameSettings(gameSettings: xGameSettings): void {
		this.gameSettings = gameSettings;

		this.set(GameItem._gameSettings, gameSettings);
	}

	public getMatchmakingQueueSettings(): xMatchmakingQueueSettings[] {
		return this.matchmakingQueueSettings;
	}

	public setMatchmakingQueueSettings(matchmakingQueueSettings: xMatchmakingQueueSettings[]): void {
		this.matchmakingQueueSettings = matchmakingQueueSettings;

		this.set(GameItem._matchmakingQueueSettings, matchmakingQueueSettings);
	}
}
