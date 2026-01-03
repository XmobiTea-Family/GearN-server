"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptPushNotification = void 0;
const CloudScriptEvent_1 = require("./CloudScriptEvent");
class CloudScriptPushNotification extends CloudScriptEvent_1.CloudScriptProcessBase {
    async send(token, title, body, badge, sound, icon, data) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendPushNotificationToOne,
            token: token,
            pushData: {
                title: title,
                body: body,
                badge: badge,
                sound: sound,
                icon: icon,
                data: data,
            },
        });
    }
    async sendToMore(tokens, title, body, badge, sound, icon, data) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendPushNotificationToMore,
            tokens: tokens,
            pushData: {
                title: title,
                body: body,
                badge: badge,
                sound: sound,
                icon: icon,
                data: data,
            },
        });
    }
    async sendToTopic(topic, title, body, badge, sound, icon, data) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SendPushNotificationToTopic,
            topic: topic,
            pushData: {
                title: title,
                body: body,
                badge: badge,
                sound: sound,
                icon: icon,
                data: data,
            },
        });
    }
    async subscribeToTopic(tokens, topic) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.SubscribeToTopic,
            tokens: tokens,
            topic: topic,
        });
    }
    async unsubscribeFromTopic(tokens, topic) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.UnsubscribeFromTopic,
            tokens: tokens,
            topic: topic,
        });
    }
}
exports.CloudScriptPushNotification = CloudScriptPushNotification;
