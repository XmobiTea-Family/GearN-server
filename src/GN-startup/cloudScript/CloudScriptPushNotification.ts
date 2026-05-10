import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptPushNotification extends CloudScriptProcessBase {
    /**
     * Executes the send workflow asynchronously.
     * @param token Provides the token value used by this operation.
     * @param title Provides the title value used by this operation.
     * @param body Provides the body value used by this operation.
     * @param badge Provides the badge value used by this operation.
     * @param sound Provides the sound value used by this operation.
     * @param icon Provides the icon value used by this operation.
     * @param data Provides the data value used by this operation.
     */
    public async send(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }) {
        return await this.sendEvent({
            eventType: CloudScriptEventType.SendPushNotificationToOne,
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

    /**
     * Sends the to more.
     * @param tokens Provides the tokens value used by this operation.
     * @param title Provides the title value used by this operation.
     * @param body Provides the body value used by this operation.
     * @param badge Provides the badge value used by this operation.
     * @param sound Provides the sound value used by this operation.
     * @param icon Provides the icon value used by this operation.
     * @param data Provides the data value used by this operation.
     */
    public async sendToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }) {
        return await this.sendEvent({
            eventType: CloudScriptEventType.SendPushNotificationToMore,
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

    /**
     * Sends the to topic.
     * @param topic Provides the topic value used by this operation.
     * @param title Provides the title value used by this operation.
     * @param body Provides the body value used by this operation.
     * @param badge Provides the badge value used by this operation.
     * @param sound Provides the sound value used by this operation.
     * @param icon Provides the icon value used by this operation.
     * @param data Provides the data value used by this operation.
     */
    public async sendToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }) {
        return await this.sendEvent({
            eventType: CloudScriptEventType.SendPushNotificationToTopic,
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

    /**
     * Executes the subscribe to topic workflow asynchronously.
     * @param tokens Provides the tokens value used by this operation.
     * @param topic Provides the topic value used by this operation.
     */
    public async subscribeToTopic(tokens: string[], topic: string) {
        return await this.sendEvent({
            eventType: CloudScriptEventType.SubscribeToTopic,
            tokens: tokens,
            topic: topic,
        });
    }

    /**
     * Executes the unsubscribe from topic workflow asynchronously.
     * @param tokens Provides the tokens value used by this operation.
     * @param topic Provides the topic value used by this operation.
     */
    public async unsubscribeFromTopic(tokens: string[], topic: string) {
        return await this.sendEvent({
            eventType: CloudScriptEventType.UnsubscribeFromTopic,
            tokens: tokens,
            topic: topic,
        });
    }
}
