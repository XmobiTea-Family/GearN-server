import * as mongoDB from "mongodb";

import { GamePlayerBase } from "./GamePlayerBase";

export class GamePlayer extends GamePlayerBase {
	// Indicates whether r ID should be used.
	private static readonly _userId: string = "userId";
	// Defines the internal field key for socket ID.
	private static readonly _socketId: string = "socketId";

	// Indicates whether r ID should be used.
	private readonly userId: string;

	// Stores the socket ID value used by this instance.
	private socketId: string;

	/**
	 * Initializes a new game player instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = result[GamePlayer._userId];

		this.setDocumentGamePlayer(result);
	}

	/**
	 * Sets the document game player.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentGamePlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.socketId = result[GamePlayer._socketId];
		// this.playerPushs = result[GamePlayer._playerPushs];
	}

	/**
	 * Returns whether r ID should be used.
	 * @returns Returns whether r ID should be used.
	 */
	public getUserId(): string {
		return this.userId;
	}

	/**
	 * Returns the socket ID.
	 * @returns Returns the socket ID.
	 */
	public getSocketId(): string {
		return this.socketId;
	}

	/**
	 * Sets the socket ID.
	 * @param socketId Provides the socket ID value used by this operation.
	 */
	public setSocketId(socketId: string): void {
		this.socketId = socketId;

		this.set(GamePlayer._socketId, this.socketId);
	}
}
