import * as mongodb from "mongodb";

import { MongoObject } from "./MongoObject";
import { DataValueType } from "./type/DataValueType";
import { MatchmakingTicketMember } from "./MatchmakingTicketMember";

/**
 * A matchmaking ticket queued for a match; may contain several players queueing together (a party).
 * Once the matchmaking conditions are met, the ticket is linked to a Match via `matchId`.
 */
export class MatchmakingTicket extends MongoObject {
    /** MongoDB field name for ticketId — the matchmaking ticket's unique business key. */
    private static readonly _ticketId: string = "ticketId";
    /** MongoDB field name for queueName — the matchmaking queue this ticket joins. */
    private static readonly _queueName: string = "queueName";
    /** MongoDB field name for the id of the ticket creator (party leader). */
    private static readonly _creatorId: string = "creatorId";
    /** MongoDB field name for the maximum wait time (seconds) before the ticket auto-cancels. */
    private static readonly _giveUpAfterSeconds: string = "giveUpAfterSeconds";
    /** MongoDB field name for the flattened userId list (used for fast per-user ticket lookup). */
    private static readonly _userIds: string = "userIds";
    /** MongoDB field name for the member list with their attributes. */
    private static readonly _members: string = "members";
    /** MongoDB field name for the ticket lifecycle state. */
    private static readonly _status: string = "status";
    /** MongoDB field name for matchId — populated when the ticket has matched. */
    private static readonly _matchId: string = "matchId";
    /** MongoDB field name for the ticket-creation timestamp. */
    private static readonly _tsCreate: string = "tsCreate";

    /** Path separator used when building dotted field paths for MongoDB update operators. */
    static readonly DOT: string = ".";

    /** Ticket id; unique business key; immutable after creation. */
    private readonly ticketId: string;
    /** Name of the matchmaking queue this ticket joined (e.g. ranked_5v5, casual_1v1); immutable. */
    private readonly queueName: string;
    /** Id of the player who created the ticket (party leader); immutable because ticket-control privileges stay with the creator. */
    private readonly creatorId: string;
    /** Maximum wait time (seconds) before auto-cancel; immutable because it is configured at creation. */
    private readonly giveUpAfterSeconds: number;
    /** Flattened userId list extracted from `members`, used for MongoDB indexing/per-user ticket lookup. */
    private readonly userIds: Array<string>;
    /** Member list with state and matchmaking attributes; immutable because the roster is frozen for the ticket's lifetime. */
    private readonly members: Array<MatchmakingTicketMember>;

    /** Epoch ms when the ticket was created; immutable. */
    private readonly tsCreate: number;
    /** Ticket lifecycle state per the enum (waiting / matched / cancelled / expired). */
    private status: number;
    /** Match id assigned when the ticket has matched; null while still queueing. */
    private matchId: string;

    /**
     * Initializes a new matchmaking ticket instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
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
    private setDocumentMatchmakingTicket(result: mongodb.WithId<mongodb.Document>): void {
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
        let member = this.members.find((x) => x.userId == userId);
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
        let member = this.members.find((x) => x.userId == userId);
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
        return this.members.find((x) => x.userId == userId);
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
