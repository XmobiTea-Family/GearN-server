import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptPushNotification extends CloudScriptProcessBase {
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

	public async subscribeToTopic(tokens: string[], topic: string) {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SubscribeToTopic,
			tokens: tokens,
			topic: topic,
		});
	}

	public async unsubscribeFromTopic(tokens: string[], topic: string) {
		return await this.sendEvent({
			eventType: CloudScriptEventType.UnsubscribeFromTopic,
			tokens: tokens,
			topic: topic,
		});
	}

}
