import * as mongoDB from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";

export class GamePlayer extends GamePlayerBase {
	private static readonly _userId: string = "userId";
	private static readonly _socketId: string = "socketId";

	private readonly userId: string;

	private socketId: string;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = result[GamePlayer._userId];

		this.setDocumentGamePlayer(result);
	}

	private setDocumentGamePlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.socketId = result[GamePlayer._socketId];
		// this.playerPushs = result[GamePlayer._playerPushs];
	}

	public getUserId(): string {
		return this.userId;
	}

	public getSocketId(): string {
		return this.socketId;
	}

	public setSocketId(socketId: string): void {
		this.socketId = socketId;

		this.set(GamePlayer._socketId, this.socketId);
	}
}
