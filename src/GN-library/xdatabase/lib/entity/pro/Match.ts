import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { MatchMember } from "./MatchMember";
import { ServerDetail } from "./ServerDetail";

export class Match extends MongoObject {
	private static readonly _matchId: string = "matchId";
	private static readonly _queueName: string = "queueName";
	private static readonly _members: string = "members";
	private static readonly _serverDetail: string = "serverDetail";
	private static readonly _tsCreate: string = "tsCreate";
	private static readonly _timeToMatchInSeconds: string = "timeToMatchInSeconds";

	static readonly DOT: string = ".";

	private readonly matchId: string;
	private readonly queueName: string;
	private readonly members: Array<MatchMember>;
	private readonly tsCreate: number;
	private readonly timeToMatchInSeconds: number;

	private serverDetail: ServerDetail;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.matchId = result[Match._matchId];
		this.queueName = result[Match._queueName];
		this.members = result[Match._members];
		this.tsCreate = result[Match._tsCreate];
		this.timeToMatchInSeconds = result[Match._timeToMatchInSeconds];

		this.setDocumentMatch(result);
	}

	private setDocumentMatch(result: mongoDB.WithId<mongoDB.Document>): void {
		this.serverDetail = result[Match._serverDetail];
	}

	public getMatchId(): string {
		return this.matchId;
	}

	public getQueueName(): string {
		return this.queueName;
	}

	public getMembers(): Array<MatchMember> {
		return this.members;
	}

	public getServerDetail(): ServerDetail {
		return this.serverDetail;
	}

	public setServerDetail(serverDetail: ServerDetail): void {
		this.serverDetail = serverDetail;
		this.set(Match._serverDetail, this.serverDetail);
	}

	public getTsCreate(): number {
		return this.tsCreate;
	}

	public getTimeToMatchInSeconds(): number {
		return this.timeToMatchInSeconds;
	}

}
