import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

export class ChatMessage extends MongoObject {
	// Defines the internal field key for message ID.
	private static readonly _messageId: string = "messageId";
	// Defines the internal field key for group ID.
	private static readonly _groupId: string = "groupId";
	// Defines the internal field key for sender.
	private static readonly _sender: string = "sender";
	// Defines the internal field key for message.
	private static readonly _message: string = "message";
	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";
	// Defines the internal field key for timestamp last update.
	private static readonly _tsLastUpdate: string = "tsLastUpdate";
	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";

	// Stores the message ID value used by this instance.
	private readonly messageId: string;
	// Stores the group ID value used by this instance.
	private readonly groupId: string;

	// Stores the sender value used by this instance.
	private sender: OwnerItem;

	// Stores the message value used by this instance.
	private message: string;

	// Stores the timestamp create value used by this instance.
	private tsCreate: number;
	// Stores the timestamp last update value used by this instance.
	private tsLastUpdate: number;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new chat message instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.messageId = result[ChatMessage._messageId];
		this.groupId = result[ChatMessage._groupId];

		this.setDocumentChatMessage(result);
	}

	/**
	 * Sets the document chat message.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentChatMessage(result: mongoDB.WithId<mongoDB.Document>): void {
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
