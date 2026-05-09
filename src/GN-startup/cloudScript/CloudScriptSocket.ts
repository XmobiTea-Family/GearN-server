import { OperationEvent } from "@xmobitea/gearn-typescript-client-sdk";
import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptSocket extends CloudScriptProcessBase {
	/**
	 * Sends the event to.
	 * @param userId Indicates whether r ID should be used.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendEventToOne,
			userId: userId,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

	/**
	 * Sends the event to more user.
	 * @param userIds Indicates whether r IDs should be used.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendEventToMore,
			userIds: userIds,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

	/**
	 * Sends the event to all player.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendEventToAll,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

	/**
	 * Executes the join room workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param roomId Provides the room ID value used by this operation.
	 */
	public async joinRoom(userId: string, roomId: string): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.JoinRoom,
			userId: userId,
			roomId: roomId,
		});
	}

	/**
	 * Executes the leave room workflow asynchronously.
	 * @param userId Indicates whether r ID should be used.
	 * @param roomId Provides the room ID value used by this operation.
	 */
	public async leaveRoom(userId: string, roomId: string): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.LeaveRoom,
			userId: userId,
			roomId: roomId,
		});
	}

	/**
	 * Sends the event to room.
	 * @param roomId Provides the room ID value used by this operation.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendEventToRoom,
			roomId: roomId,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

}
