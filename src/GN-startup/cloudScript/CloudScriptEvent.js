"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptProcessBase = exports.CloudScriptEventType = void 0;
var CloudScriptEventType;
(function (CloudScriptEventType) {
    CloudScriptEventType[CloudScriptEventType["SendEventToOne"] = 0] = "SendEventToOne";
    CloudScriptEventType[CloudScriptEventType["SendEventToMore"] = 1] = "SendEventToMore";
    CloudScriptEventType[CloudScriptEventType["SendEventToAll"] = 2] = "SendEventToAll";
    CloudScriptEventType[CloudScriptEventType["JoinRoom"] = 3] = "JoinRoom";
    CloudScriptEventType[CloudScriptEventType["LeaveRoom"] = 4] = "LeaveRoom";
    CloudScriptEventType[CloudScriptEventType["SendEventToRoom"] = 5] = "SendEventToRoom";
    CloudScriptEventType[CloudScriptEventType["ConfirmServerDetail"] = 10] = "ConfirmServerDetail";
    CloudScriptEventType[CloudScriptEventType["SendMailToOne"] = 20] = "SendMailToOne";
    CloudScriptEventType[CloudScriptEventType["SendMailToMore"] = 21] = "SendMailToMore";
    CloudScriptEventType[CloudScriptEventType["SendPushNotificationToOne"] = 30] = "SendPushNotificationToOne";
    CloudScriptEventType[CloudScriptEventType["SendPushNotificationToMore"] = 31] = "SendPushNotificationToMore";
    CloudScriptEventType[CloudScriptEventType["SendPushNotificationToTopic"] = 32] = "SendPushNotificationToTopic";
    CloudScriptEventType[CloudScriptEventType["SubscribeToTopic"] = 33] = "SubscribeToTopic";
    CloudScriptEventType[CloudScriptEventType["UnsubscribeFromTopic"] = 34] = "UnsubscribeFromTopic";
})(CloudScriptEventType || (exports.CloudScriptEventType = CloudScriptEventType = {}));
class CloudScriptProcessBase {
    async sendEvent(event) {
        if (process?.send)
            process.send(event);
    }
}
exports.CloudScriptProcessBase = CloudScriptProcessBase;
