import { MatchmakingTicketCanMatch, ServerDetail } from "./../../index";

export enum CloudScriptEventType {
	SendEventToOne = 0,
	SendEventToMore = 1,
	SendEventToAll = 2,
	JoinRoom = 3,
	LeaveRoom = 4,
	SendEventToRoom = 5,

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
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendEventToOne;
	// Stores the operation event value used by this contract.
	operationEvent: {
		// Stores the event code value used by this contract.
		eventCode: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
	// Indicates whether r ID should be used.
	userId: string;
}

interface CloudScriptEventSendEventToMore {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendEventToMore;
	// Stores the operation event value used by this contract.
	operationEvent: {
		// Stores the event code value used by this contract.
		eventCode: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
	// Indicates whether r IDs should be used.
	userIds: string[];
}

interface CloudScriptEventSendEventToAll {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendEventToAll;
	// Stores the operation event value used by this contract.
	operationEvent: {
		// Stores the event code value used by this contract.
		eventCode: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
}

interface CloudScriptEventJoinRoom {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.JoinRoom;
	// Indicates whether r ID should be used.
	userId: string;
	// Stores the room ID value used by this contract.
	roomId: string;
}

interface CloudScriptEventLeaveRoom {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.LeaveRoom;
	// Indicates whether r ID should be used.
	userId: string;
	// Stores the room ID value used by this contract.
	roomId: string;
}

interface CloudScriptEventSendEventToRoom {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendEventToRoom;
	// Stores the room ID value used by this contract.
	roomId: string;
	// Stores the operation event value used by this contract.
	operationEvent: {
		// Stores the event code value used by this contract.
		eventCode: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
}

interface CloudScriptEventConfirmServerDetail {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.ConfirmServerDetail;
	// Stores the game ID value used by this contract.
	gameId: string;
	// Stores the matchmaking ticket can match value used by this contract.
	matchmakingTicketCanMatch: MatchmakingTicketCanMatch;
	// Stores the server detail value used by this contract.
	serverDetail: ServerDetail;
}

interface CloudScriptEventSendMailToOne {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendMailToOne;
	// Stores the mail data value used by this contract.
	mailData: {
		// Stores the subject value used by this contract.
		subject: string;
		// Stores the content html value used by this contract.
		contentHtml: string;
	};
	// Stores the email value used by this contract.
	email: string;
}

interface CloudScriptEventSendMailToMore {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendMailToMore;
	// Stores the mail data value used by this contract.
	mailData: {
		// Stores the subject value used by this contract.
		subject: string;
		// Stores the content html value used by this contract.
		contentHtml: string;
	};
	// Stores the emails list used by this contract.
	emails: string[];
}

interface CloudScriptEventSendPushNotificationToOne {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendPushNotificationToOne;
	// Stores the push data collection used by this contract.
	pushData: {
		// Stores the title value used by this contract.
		title: string;
		// Stores the body value used by this contract.
		body: string;
		// Stores the badge value used by this contract.
		badge?: number;
		// Stores the sound value used by this contract.
		sound?: string;
		// Stores the icon value used by this contract.
		icon?: string;
		// Stores the data collection used by this contract.
		data?: { [k: string]: any };
	};
	// Stores the token value used by this contract.
	token: string;
}

interface CloudScriptEventSendPushNotificationToMore {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendPushNotificationToMore;
	// Stores the push data collection used by this contract.
	pushData: {
		// Stores the title value used by this contract.
		title: string;
		// Stores the body value used by this contract.
		body: string;
		// Stores the badge value used by this contract.
		badge?: number;
		// Stores the sound value used by this contract.
		sound?: string;
		// Stores the icon value used by this contract.
		icon?: string;
		// Stores the data collection used by this contract.
		data?: { [k: string]: any };
	};
	// Stores the tokens list used by this contract.
	tokens: string[];
}

interface CloudScriptEventSendPushNotificationToTopic {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SendPushNotificationToTopic;
	// Stores the push data collection used by this contract.
	pushData: {
		// Stores the title value used by this contract.
		title: string;
		// Stores the body value used by this contract.
		body: string;
		// Stores the badge value used by this contract.
		badge?: number;
		// Stores the sound value used by this contract.
		sound?: string;
		// Stores the icon value used by this contract.
		icon?: string;
		// Stores the data collection used by this contract.
		data?: { [k: string]: any };
	};
	// Stores the topic value used by this contract.
	topic: string;
}

interface CloudScriptEventSubscribeToTopic {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.SubscribeToTopic;
	// Stores the tokens list used by this contract.
	tokens: string[];
	// Stores the topic value used by this contract.
	topic: string;
}

interface CloudScriptEventUnsubscribeFromTopic {
	// Stores the event type value used by this contract.
	eventType: CloudScriptEventType.UnsubscribeFromTopic;
	// Stores the tokens list used by this contract.
	tokens: string[];
	// Stores the topic value used by this contract.
	topic: string;
}

type CloudScriptEvent = CloudScriptEventSendEventToOne | CloudScriptEventSendEventToMore | CloudScriptEventSendEventToAll | CloudScriptEventJoinRoom | CloudScriptEventLeaveRoom | CloudScriptEventSendEventToRoom
	| CloudScriptEventConfirmServerDetail
	| CloudScriptEventSendMailToOne | CloudScriptEventSendMailToMore
	| CloudScriptEventSendPushNotificationToOne | CloudScriptEventSendPushNotificationToMore | CloudScriptEventSendPushNotificationToTopic | CloudScriptEventSubscribeToTopic | CloudScriptEventUnsubscribeFromTopic;

export class CloudScriptProcessBase {
	/**
	 * Sends the event.
	 * @param event Provides the event value used by this operation.
	 */
	protected async sendEvent(event: CloudScriptEvent) {
		if (process?.send)
			process.send(event);
	}

}
