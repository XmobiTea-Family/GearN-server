import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { OwnerItem } from "./OwnerItem";
import { RemoveStatusItem } from "./RemoveStatusItem";

export class ChatMessage extends MongoObject {
	private static readonly _messageId: string = "messageId";
	private static readonly _groupId: string = "groupId";
	private static readonly _sender: string = "sender";
	private static readonly _message: string = "message";
	private static readonly _tsCreate: string = "tsCreate";
	private static readonly _tsLastUpdate: string = "tsLastUpdate";
	private static readonly _removeStatus: string = "removeStatus";

	private readonly messageId: string;
	private readonly groupId: string;

	private sender: OwnerItem;

	private message: string;

	private tsCreate: number;
	private tsLastUpdate: number;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.messageId = result[ChatMessage._messageId];
		this.groupId = result[ChatMessage._groupId];

		this.setDocumentChatMessage(result);
	}

	private setDocumentChatMessage(result: mongoDB.WithId<mongoDB.Document>): void {
		this.sender = result[ChatMessage._sender];

		this.message = result[ChatMessage._message];
		this.tsCreate = result[ChatMessage._tsCreate];
		this.tsLastUpdate = result[ChatMessage._tsLastUpdate];

		this.removeStatus = result[ChatMessage._removeStatus];
	}

	public getMessageId(): string {
		return this.messageId;
	}

	public getGroupId(): string {
		return this.groupId;
	}

	public getSender(): OwnerItem {
		return this.sender;
	}

	public setSender(senderId: string, senderType: number) {
		this.sender = {
			id: senderId,
			type: senderType,
		};

		this.set(ChatMessage._sender, this.sender);
	}

	public getMessage(): string {
		return this.message;
	}

	public setMessage(message: string) {
		this.message = message;

		this.set(ChatMessage._message, this.message);
	}

	public getTsCreate(): number {
		return this.tsCreate;
	}

	public setTsCreate(tsCreate: number): void {
		this.tsCreate = tsCreate;

		this.set(ChatMessage._tsCreate, this.tsCreate);
	}

	public getTsLastUpdate(): number {
		return this.tsLastUpdate;
	}

	public setTsLastUpdate(tsLastUpdate: number): void {
		this.tsLastUpdate = tsLastUpdate;

		this.set(ChatMessage._tsLastUpdate, this.tsLastUpdate);
	}

	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(ChatMessage._removeStatus, this.removeStatus);
	}
}
