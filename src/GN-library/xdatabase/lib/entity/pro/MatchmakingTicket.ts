import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { DataValueType } from "./type/DataValueType";
import { MatchmakingTicketMember } from "./MatchmakingTicketMember";

export class MatchmakingTicket extends MongoObject {
	// Defines the internal field key for ticket ID.
	private static readonly _ticketId: string = "ticketId";
	// Defines the internal field key for queue name.
	private static readonly _queueName: string = "queueName";
	// Defines the internal field key for creator ID.
	private static readonly _creatorId: string = "creatorId";
	// Defines the internal field key for give up after seconds.
	private static readonly _giveUpAfterSeconds: string = "giveUpAfterSeconds";
	// Indicates whether r IDs should be used.
	private static readonly _userIds: string = "userIds";
	// Defines the internal field key for members.
	private static readonly _members: string = "members";
	// Defines the internal field key for status.
	private static readonly _status: string = "status";
	// Defines the internal field key for match ID.
	private static readonly _matchId: string = "matchId";
	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";

	// Stores the DOT value used by this instance.
	static readonly DOT: string = ".";

	// Stores the ticket ID value used by this instance.
	private readonly ticketId: string;
	// Stores the queue name value used by this instance.
	private readonly queueName: string;
	// Stores the creator ID value used by this instance.
	private readonly creatorId: string;
	// Stores the give up after seconds value used by this instance.
	private readonly giveUpAfterSeconds: number;
	// Indicates whether r IDs should be used.
	private readonly userIds: Array<string>;
	// Stores the members value used by this instance.
	private readonly members: Array<MatchmakingTicketMember>;

	// Stores the timestamp create value used by this instance.
	private readonly tsCreate: number;
	// Stores the status value used by this instance.
	private status: number;
	// Stores the match ID value used by this instance.
	private matchId: string;

	/**
	 * Initializes a new matchmaking ticket instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
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

	/**
	 * Sets the document matchmaking ticket.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentMatchmakingTicket(result: mongoDB.WithId<mongoDB.Document>): void {
		this.status = result[MatchmakingTicket._status];
		this.matchId = result[MatchmakingTicket._matchId];
	}

	/**
	 * Returns the ticket ID.
	 * @returns Returns the ticket ID.
	 */
	public getTicketId(): string {
		return this.ticketId;
	}

	/**
	 * Returns the queue name.
	 * @returns Returns the queue name.
	 */
	public getQueueName(): string {
		return this.queueName;
	}

	/**
	 * Returns the creator ID.
	 * @returns Returns the creator ID.
	 */
	public getCreatorId(): string {
		return this.creatorId;
	}

	/**
	 * Returns the give up after seconds.
	 * @returns Returns the give up after seconds.
	 */
	public getGiveUpAfterSeconds(): number {
		return this.giveUpAfterSeconds;
	}

	/**
	 * Returns whether r IDs should be used.
	 * @returns Returns whether r IDs should be used.
	 */
	public getUserIds(): Array<string> {
		return this.userIds;
	}

	/**
	 * Returns the members.
	 * @returns Returns the members.
	 */
	public getMembers(): Array<MatchmakingTicketMember> {
		return this.members;
	}

	/**
	 * Sets the member status.
	 * @param userId Indicates whether r ID should be used.
	 * @param status Provides the status value used by this operation.
	 */
	public setMemberStatus(userId: string, status: number): void {
		// Stores the member value used in the current execution flow.
		let member = this.members.find(x => x.userId == userId);
		if (member != null) {
			member.status = status;

			this.set(MatchmakingTicket._members, this.members);
		}
	}

	/**
	 * Sets the member attribute.
	 * @param userId Indicates whether r ID should be used.
	 * @param attribute Provides the attribute value used by this operation.
	 * @param attributeForQueue Provides the attribute for queue value used by this operation.
	 */
	public setMemberAttribute(userId: string, attribute: { [k: string]: DataValueType }, attributeForQueue: { [k: string]: DataValueType }): void {
		// Stores the member value used in the current execution flow.
		let member = this.members.find(x => x.userId == userId);
		if (member != null) {
			member.attribute = attribute;
			member.attributeForQueue = attributeForQueue;

			this.set(MatchmakingTicket._members, this.members);
		}
	}

	/**
	 * Returns the member.
	 * @param userId Indicates whether r ID should be used.
	 * @returns Returns the member.
	 */
	public getMember(userId: string): MatchmakingTicketMember {
		return this.members.find(x => x.userId == userId);
	}

	/**
	 * Checks whether member exists.
	 * @param userId Indicates whether r ID should be used.
	 * @returns Returns the operation result.
	 */
	public hasMember(userId: string): boolean {
		return this.getMember(userId) != null;
	}

	/**
	 * Returns the timestamp create.
	 * @returns Returns the timestamp create.
	 */
	public getTsCreate(): number {
		return this.tsCreate;
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
		this.set(MatchmakingTicket._status, this.status);
	}

	/**
	 * Returns the match ID.
	 * @returns Returns the match ID.
	 */
	public getMatchId(): string {
		return this.matchId;
	}

	/**
	 * Sets the match ID.
	 * @param matchId Provides the match ID value used by this operation.
	 */
	public setMatchId(matchId: string): void {
		this.matchId = matchId;
		this.set(MatchmakingTicket._matchId, this.matchId);
	}
}
