import * as mongodb from "mongodb";

import { MongoObject } from "./MongoObject";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

/**
 * Chat message in a group's chat channel (guild chat, party chat...).
 * Supports editing (`tsLastUpdate`) and soft delete (`removeStatus`) for audit trail.
 */
export class ChatMessage extends MongoObject {
	/** MongoDB field name for messageId — the message's unique business key. */
	private static readonly _messageId: string = "messageId";
	/** MongoDB field name for groupId — which group the channel belongs to. */
	private static readonly _groupId: string = "groupId";
	/** MongoDB field name for the sender. */
	private static readonly _sender: string = "sender";
	/** MongoDB field name for the message body. */
	private static readonly _message: string = "message";
	/** MongoDB field name for the message-send timestamp. */
	private static readonly _tsCreate: string = "tsCreate";
	/** MongoDB field name for the most recent edit timestamp. */
	private static readonly _tsLastUpdate: string = "tsLastUpdate";
	/** MongoDB field name for the soft-delete state (message recalled). */
	private static readonly _removeStatus: string = "removeStatus";

	/** Message id; unique business key; immutable after creation. */
	private readonly messageId: string;
	/** Group id this message belongs to; immutable (a message can't be moved to another group). */
	private readonly groupId: string;

	/** Message sender (OwnerItem so the sender may be a player or the system). */
	private sender: OwnerItem;

	/** Message text; mutable if the user edits the message. */
	private message: string;

	/** Epoch ms when the message was first sent. */
	private tsCreate: number;
	/** Epoch ms of the most recent edit; equal to tsCreate if it has never been edited. */
	private tsLastUpdate: number;

	/** Soft-delete state; present when the message is recalled/removed by the user or a moderator. */
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new chat message instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.messageId = result[ChatMessage._messageId];
		this.groupId = result[ChatMessage._groupId];

		this.setDocumentChatMessage(result);
	}

	/**
	 * Sets the document chat message.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentChatMessage(result: mongodb.WithId<mongodb.Document>): void {
		this.sender = result[ChatMessage._sender];

		this.message = result[ChatMessage._message];
		this.tsCreate = result[ChatMessage._tsCreate];
		this.tsLastUpdate = result[ChatMessage._tsLastUpdate];

		this.removeStatus = result[ChatMessage._removeStatus];
	}

	/**
	 * Returns the message ID.
	 * @returns Returns the message ID.
	 */
	public getMessageId(): string {
		return this.messageId;
	}

	/**
	 * Returns the group ID.
	 * @returns Returns the group ID.
	 */
	public getGroupId(): string {
		return this.groupId;
	}

	/**
	 * Returns the sender.
	 * @returns Returns the sender.
	 */
	public getSender(): OwnerItem {
		return this.sender;
	}

	/**
	 * Sets the sender.
	 * @param senderId Provides the sender ID value used by this operation.
	 * @param senderType Provides the sender type value used by this operation.
	 */
	public setSender(senderId: string, senderType: number) {
		this.sender = {
			id: senderId,
			type: senderType,
		};

		this.set(ChatMessage._sender, this.sender);
	}

	/**
	 * Returns the message.
	 * @returns Returns the message.
	 */
	public getMessage(): string {
		return this.message;
	}

	/**
	 * Sets the message.
	 * @param message Provides the message value used by this operation.
	 */
	public setMessage(message: string) {
		this.message = message;

		this.set(ChatMessage._message, this.message);
	}

	/**
	 * Returns the timestamp create.
	 * @returns Returns the timestamp create.
	 */
	public getTsCreate(): number {
		return this.tsCreate;
	}

	/**
	 * Sets the timestamp create.
	 * @param tsCreate Provides the timestamp create value used by this operation.
	 */
	public setTsCreate(tsCreate: number): void {
		this.tsCreate = tsCreate;

		this.set(ChatMessage._tsCreate, this.tsCreate);
	}

	/**
	 * Returns the timestamp last update.
	 * @returns Returns the timestamp last update.
	 */
	public getTsLastUpdate(): number {
		return this.tsLastUpdate;
	}

	/**
	 * Sets the timestamp last update.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public setTsLastUpdate(tsLastUpdate: number): void {
		this.tsLastUpdate = tsLastUpdate;

		this.set(ChatMessage._tsLastUpdate, this.tsLastUpdate);
	}

	/**
	 * Returns the remove status.
	 * @returns Returns the remove status.
	 */
	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	/**
	 * Sets the remove status.
	 * @param tsRemove Provides the timestamp remove value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(ChatMessage._removeStatus, this.removeStatus);
	}
}
