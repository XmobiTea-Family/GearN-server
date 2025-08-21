import { MatchmakingTicketCanMatch, ServerDetail } from "./../../index";

export enum CloudScriptEventType {
	SendEventToOne = 0,
	SendEventToMore = 1,
	SendEventToAll = 2,

	ConfirmServerDetail = 10,

	SendMailToOne = 20,
	SendMailToMore = 21,

	SendPushNotificationToOne = 30,
	SendPushNotificationToMore = 31,
	SendPushNotificationToTopic = 32,
	SubscribeToTopic = 33,
	UnsubscribeFromTopic = 34,


}

interface CloudScriptEventSendEventToOne {
	eventType: CloudScriptEventType.SendEventToOne;
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
	userId: string;
}

interface CloudScriptEventSendEventToMore {
	eventType: CloudScriptEventType.SendEventToMore;
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
	userIds: string[];
}

interface CloudScriptEventSendEventToAll {
	eventType: CloudScriptEventType.SendEventToAll;
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
}

interface CloudScriptEventConfirmServerDetail {
	eventType: CloudScriptEventType.ConfirmServerDetail;
	gameId: string;
	matchmakingTicketCanMatch: MatchmakingTicketCanMatch;
	serverDetail: ServerDetail;
}

interface CloudScriptEventSendMailToOne {
	eventType: CloudScriptEventType.SendMailToOne;
	mailData: {
		subject: string;
		contentHtml: string;
	};
	email: string;
}

interface CloudScriptEventSendMailToMore {
	eventType: CloudScriptEventType.SendMailToMore;
	mailData: {
		subject: string;
		contentHtml: string;
	};
	emails: string[];
}

interface CloudScriptEventSendPushNotificationToOne {
	eventType: CloudScriptEventType.SendPushNotificationToOne;
	pushData: {
		title: string;
		body: string;
		badge?: number;
		sound?: string;
		icon?: string;
		data?: { [k: string]: any };
	};
	token: string;
}

interface CloudScriptEventSendPushNotificationToMore {
	eventType: CloudScriptEventType.SendPushNotificationToMore;
	pushData: {
		title: string;
		body: string;
		badge?: number;
		sound?: string;
		icon?: string;
		data?: { [k: string]: any };
	};
	tokens: string[];
}

interface CloudScriptEventSendPushNotificationToTopic {
	eventType: CloudScriptEventType.SendPushNotificationToTopic;
	pushData: {
		title: string;
		body: string;
		badge?: number;
		sound?: string;
		icon?: string;
		data?: { [k: string]: any };
	};
	topic: string;
}

interface CloudScriptEventSubscribeToTopic {
	eventType: CloudScriptEventType.SubscribeToTopic;
	tokens: string[];
	topic: string;
}

interface CloudScriptEventUnsubscribeFromTopic {
	eventType: CloudScriptEventType.UnsubscribeFromTopic;
	tokens: string[];
	topic: string;
}

type CloudScriptEvent = CloudScriptEventSendEventToOne | CloudScriptEventSendEventToMore | CloudScriptEventSendEventToAll
	| CloudScriptEventConfirmServerDetail
	| CloudScriptEventSendMailToOne
	| CloudScriptEventSendMailToMore
	| CloudScriptEventSendPushNotificationToOne
	| CloudScriptEventSendPushNotificationToMore
	| CloudScriptEventSendPushNotificationToTopic
	| CloudScriptEventSubscribeToTopic
	| CloudScriptEventUnsubscribeFromTopic;

export class CloudScriptProcessBase {
	protected async sendEvent(event: CloudScriptEvent) {
		if (process?.send)
			process.send(event);
	}

}
