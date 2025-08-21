import { OperationEvent } from "@xmobitea/gn-typescript-client";
import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptSocket extends CloudScriptProcessBase {
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

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendEventToAll,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

}
