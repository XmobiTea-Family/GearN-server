import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { DataValueType } from "./type/DataValueType";
import { MatchmakingTicketMember } from "./MatchmakingTicketMember";

export class MatchmakingTicket extends MongoObject {
	private static readonly _ticketId: string = "ticketId";
	private static readonly _queueName: string = "queueName";
	private static readonly _creatorId: string = "creatorId";
	private static readonly _giveUpAfterSeconds: string = "giveUpAfterSeconds";
	private static readonly _userIds: string = "userIds";
	private static readonly _members: string = "members";
	private static readonly _status: string = "status";
	private static readonly _matchId: string = "matchId";
	private static readonly _tsCreate: string = "tsCreate";

	static readonly DOT: string = ".";

	private readonly ticketId: string;
	private readonly queueName: string;
	private readonly creatorId: string;
	private readonly giveUpAfterSeconds: number;
	private readonly userIds: Array<string>;
	private readonly members: Array<MatchmakingTicketMember>;

	private readonly tsCreate: number;
	private status: number;
	private matchId: string;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.ticketId = result[MatchmakingTicket._ticketId];
		this.queueName = result[MatchmakingTicket._queueName];
		this.creatorId = result[MatchmakingTicket._creatorId];
		this.giveUpAfterSeconds = result[MatchmakingTicket._giveUpAfterSeconds];
		this.userIds = result[MatchmakingTicket._userIds];
		this.members = result[MatchmakingTicket._members];
		this.tsCreate = result[MatchmakingTicket._tsCreate];

		this.setDocumentMatchmakingTicket(result);
	}

	private setDocumentMatchmakingTicket(result: mongoDB.WithId<mongoDB.Document>): void {
		this.status = result[MatchmakingTicket._status];
		this.matchId = result[MatchmakingTicket._matchId];
	}

	public getTicketId(): string {
		return this.ticketId;
	}

	public getQueueName(): string {
		return this.queueName;
	}

	public getCreatorId(): string {
		return this.creatorId;
	}

	public getGiveUpAfterSeconds(): number {
		return this.giveUpAfterSeconds;
	}

	public getUserIds(): Array<string> {
		return this.userIds;
	}

	public getMembers(): Array<MatchmakingTicketMember> {
		return this.members;
	}

	public setMemberStatus(userId: string, status: number): void {
		let member = this.members.find(x => x.userId == userId);
		if (member != null) {
			member.status = status;

			this.set(MatchmakingTicket._members, this.members);
		}
	}

	public setMemberAttribute(userId: string, attribute: { [k: string]: DataValueType }, attributeForQueue: { [k: string]: DataValueType }): void {
		let member = this.members.find(x => x.userId == userId);
		if (member != null) {
			member.attribute = attribute;
			member.attributeForQueue = attributeForQueue;

			this.set(MatchmakingTicket._members, this.members);
		}
	}

	public getMember(userId: string): MatchmakingTicketMember {
		return this.members.find(x => x.userId == userId);
	}

	public hasMember(userId: string): boolean {
		return this.getMember(userId) != null;
	}

	public getTsCreate(): number {
		return this.tsCreate;
	}

	public getStatus(): number {
		return this.status;
	}

	public setStatus(status: number): void {
		this.status = status;
		this.set(MatchmakingTicket._status, this.status);
	}

	public getMatchId(): string {
		return this.matchId;
	}

	public setMatchId(matchId: string): void {
		this.matchId = matchId;
		this.set(MatchmakingTicket._matchId, this.matchId);
	}
}
