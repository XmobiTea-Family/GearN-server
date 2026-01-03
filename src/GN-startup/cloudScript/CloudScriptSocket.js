"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptSocket = void 0;
const CloudScriptEvent_1 = require("./CloudScriptEvent");
class CloudScriptSocket extends CloudScriptEvent_1.CloudScriptProcessBase {
    async sendEventTo(userId, operationEvent) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendEventToOne,
            userId: userId,
            operationEvent: {
                eventCode: operationEvent.getEventCode(),
                parameters: operationEvent.getParameters()?.toData() ?? null,
            },
        });
    }
    async sendEventToMoreUser(userIds, operationEvent) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendEventToMore,
            userIds: userIds,
            operationEvent: {
                eventCode: operationEvent.getEventCode(),
                parameters: operationEvent.getParameters()?.toData() ?? null,
            },
        });
    }
    async sendEventToAllPlayer(operationEvent) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendEventToAll,
            operationEvent: {
                eventCode: operationEvent.getEventCode(),
                parameters: operationEvent.getParameters()?.toData() ?? null,
            },
        });
    }
    async joinRoom(userId, roomId) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.JoinRoom,
            userId: userId,
            roomId: roomId,
        });
    }
    async leaveRoom(userId, roomId) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.LeaveRoom,
            userId: userId,
            roomId: roomId,
        });
    }
    async sendEventToRoom(roomId, operationEvent) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendEventToRoom,
            roomId: roomId,
            operationEvent: {
                eventCode: operationEvent.getEventCode(),
                parameters: operationEvent.getParameters()?.toData() ?? null,
            },
        });
    }
}
exports.CloudScriptSocket = CloudScriptSocket;
