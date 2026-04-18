import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { MatchMember } from "./MatchMember";
import { ServerDetail } from "./ServerDetail";

export class Match extends MongoObject {
	// Defines the internal field key for match ID.
	private static readonly _matchId: string = "matchId";
	// Defines the internal field key for queue name.
	private static readonly _queueName: string = "queueName";
	// Defines the internal field key for members.
	private static readonly _members: string = "members";
	// Defines the internal field key for server detail.
	private static readonly _serverDetail: string = "serverDetail";
	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";
	// Defines the internal field key for time to match in seconds.
	private static readonly _timeToMatchInSeconds: string = "timeToMatchInSeconds";
	// Defines the internal field key for status.
	private static readonly _status: string = "status";

	// Stores the DOT value used by this instance.
	static readonly DOT: string = ".";

	// Stores the match ID value used by this instance.
	private readonly matchId: string;
	// Stores the queue name value used by this instance.
	private readonly queueName: string;
	// Stores the members value used by this instance.
	private readonly members: Array<MatchMember>;
	// Stores the timestamp create value used by this instance.
	private readonly tsCreate: number;
	// Stores the time to match in seconds value used by this instance.
	private readonly timeToMatchInSeconds: number;

	// Stores the server detail value used by this instance.
	private serverDetail: ServerDetail;

	// Stores the status value used by this instance.
	private status: number;

	/**
	 * Initializes a new match instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.matchId = result[Match._matchId];
		this.queueName = result[Match._queueName];
		this.members = result[Match._members];
		this.tsCreate = result[Match._tsCreate];
		this.timeToMatchInSeconds = result[Match._timeToMatchInSeconds];

		this.setDocumentMatch(result);
	}

	/**
	 * Sets the document match.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentMatch(result: mongoDB.WithId<mongoDB.Document>): void {
		this.serverDetail = result[Match._serverDetail];
		this.status = result[Match._status];
	}

	/**
	 * Returns the match ID.
	 * @returns Returns the match ID.
	 */
	public getMatchId(): string {
		return this.matchId;
	}

	/**
	 * Returns the queue name.
	 * @returns Returns the queue name.
	 */
	public getQueueName(): string {
		return this.queueName;
	}

	/**
	 * Returns the members.
	 * @returns Returns the members.
	 */
	public getMembers(): Array<MatchMember> {
		return this.members;
	}

	/**
	 * Returns the server detail.
	 * @returns Returns the server detail.
	 */
	public getServerDetail(): ServerDetail {
		return this.serverDetail;
	}

	/**
	 * Sets the server detail.
	 * @param serverDetail Provides the server detail value used by this operation.
	 */
	public setServerDetail(serverDetail: ServerDetail): void {
		this.serverDetail = serverDetail;
		this.set(Match._serverDetail, this.serverDetail);
	}

	/**
	 * Returns the status.
	 * @returns Returns the status.
	 */
	public getStatus(): number {
		return this.status;
	}

	/**
	 * Sets the status.
	 * @param status Provides the status value used by this operation.
	 */
	public setStatus(status: number): void {
		this.status = status;
		this.set(Match._status, this.status);
	}

	/**
	 * Returns the timestamp create.
	 * @returns Returns the timestamp create.
	 */
	public getTsCreate(): number {
		return this.tsCreate;
	}

	/**
	 * Returns the time to match in seconds.
	 * @returns Returns the time to match in seconds.
	 */
	public getTimeToMatchInSeconds(): number {
		return this.timeToMatchInSeconds;
	}

}
