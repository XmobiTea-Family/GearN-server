import * as mongodb from "mongodb";

import { MongoObject } from "./MongoObject";
import { MatchMember } from "./MatchMember";
import { ServerDetail } from "./ServerDetail";

/**
 * A match created once matchmaking has resolved.
 * Holds the team-finalized member roster, the allocated server, and the lifecycle state (waiting for server, in-progress, ended).
 */
export class Match extends MongoObject {
    /** MongoDB field name for matchId — the match's unique business key. */
    private static readonly _matchId: string = "matchId";
    /** MongoDB field name for queueName — the matchmaking queue that produced this match. */
    private static readonly _queueName: string = "queueName";
    /** MongoDB field name for the team-assigned member roster. */
    private static readonly _members: string = "members";
    /** MongoDB field name for the allocated server information. */
    private static readonly _serverDetail: string = "serverDetail";
    /** MongoDB field name for the match-creation timestamp. */
    private static readonly _tsCreate: string = "tsCreate";
    /** MongoDB field name for the expected match duration in seconds. */
    private static readonly _timeToMatchInSeconds: string = "timeToMatchInSeconds";
    /** MongoDB field name for the match lifecycle state. */
    private static readonly _status: string = "status";

    /** Path separator used when building dotted field paths for MongoDB update operators (e.g. `members.0.status`). */
    static readonly DOT: string = ".";

    /** Match id; unique business key; immutable after creation. */
    private readonly matchId: string;
    /** Name of the matchmaking queue that produced this match (e.g. ranked_5v5); immutable. */
    private readonly queueName: string;
    /** Team-finalized member roster of the match; immutable because the roster is frozen at match creation. */
    private readonly members: Array<MatchMember>;
    /** Epoch ms when the match was created; immutable. */
    private readonly tsCreate: number;
    /** Expected match duration in seconds from the start; used as the match-server timeout and cleanup window. */
    private readonly timeToMatchInSeconds: number;

    /** Server endpoint (IP/ports) allocated to the match; null while still awaiting server allocation. */
    private serverDetail: ServerDetail;

    /** Match lifecycle state per the enum (waiting for server / in-progress / ended / cancelled). */
    private status: number;

    /**
     * Initializes a new match instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
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
    private setDocumentMatch(result: mongodb.WithId<mongodb.Document>): void {
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
