import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { GNServer } from "./../../GNServer";
import { GNHashtable } from "./../../GN-common/common/GNData";

import { MatchmakingTicketCanMatch } from "./../service/IMatchmakingService";
import { ServerDetail } from "./../../GN-library/xdatabase/lib/entity/pro/ServerDetail";

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

interface CloudScriptEventJoinRoom {
	eventType: CloudScriptEventType.JoinRoom;
	userId: string;
	roomId: string;
}

interface CloudScriptEventLeaveRoom {
	eventType: CloudScriptEventType.LeaveRoom;
	userId: string;
	roomId: string;
}

interface CloudScriptEventSendEventToRoom {
	eventType: CloudScriptEventType.SendEventToRoom;
	roomId: string;
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

export type CloudScriptEvent = CloudScriptEventSendEventToOne | CloudScriptEventSendEventToMore | CloudScriptEventSendEventToAll | CloudScriptEventJoinRoom | CloudScriptEventLeaveRoom | CloudScriptEventSendEventToRoom
	| CloudScriptEventConfirmServerDetail
	| CloudScriptEventSendMailToOne | CloudScriptEventSendMailToMore
	| CloudScriptEventSendPushNotificationToOne | CloudScriptEventSendPushNotificationToMore | CloudScriptEventSendPushNotificationToTopic | CloudScriptEventSubscribeToTopic | CloudScriptEventUnsubscribeFromTopic;

export interface ICloudScriptEventService {

	handleEvent(cloudScriptEvent: CloudScriptEvent): Promise<void>;

}

export class CloudScriptEventService implements ICloudScriptEventService {
	private gnServer: GNServer;

	public init(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	public async handleEvent(cloudScriptEvent: CloudScriptEvent): Promise<void> {
		if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToOne || cloudScriptEvent.eventType == CloudScriptEventType.SendEventToMore || cloudScriptEvent.eventType == CloudScriptEventType.SendEventToAll || cloudScriptEvent.eventType == CloudScriptEventType.SendEventToRoom) {
			let operationEvent = new OperationEvent(
				cloudScriptEvent.operationEvent.eventCode,
				cloudScriptEvent.operationEvent.parameters != null ? GNHashtable.builder().addAll(cloudScriptEvent.operationEvent.parameters).build() : null
			);

			if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToOne) {
				await this.gnServer.sendEventTo(cloudScriptEvent.userId, operationEvent);
			} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToMore) {
				await this.gnServer.sendEventToMoreUser(cloudScriptEvent.userIds, operationEvent);
			} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToAll) {
				await this.gnServer.sendEventToAllPlayer(operationEvent);
			} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToRoom) {
				await this.gnServer.sendEventToRoom(cloudScriptEvent.roomId, operationEvent);
			}
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.ConfirmServerDetail) {
			await this.gnServer.setMatchServerDetail(cloudScriptEvent.gameId, cloudScriptEvent.matchmakingTicketCanMatch.matchId, cloudScriptEvent.serverDetail, cloudScriptEvent.matchmakingTicketCanMatch.ticketIds);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.SendMailToOne) {
			let mailData = cloudScriptEvent.mailData;

			await this.gnServer.getEmailService().sendMail(cloudScriptEvent.email, mailData.subject, mailData.contentHtml);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.SendMailToMore) {
			let mailData = cloudScriptEvent.mailData;

			await this.gnServer.getEmailService().sendMailToMore(cloudScriptEvent.emails, mailData.subject, mailData.contentHtml);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.SendPushNotificationToOne) {
			let pushData = cloudScriptEvent.pushData;

			await this.gnServer.getPushNotificationService().sendNotification(cloudScriptEvent.token, pushData.title, pushData.body, pushData.badge, pushData.sound, pushData.icon, pushData.data);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.SendPushNotificationToMore) {
			let pushData = cloudScriptEvent.pushData;

			await this.gnServer.getPushNotificationService().sendNotificationToMore(cloudScriptEvent.tokens, pushData.title, pushData.body, pushData.badge, pushData.sound, pushData.icon, pushData.data);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.SendPushNotificationToTopic) {
			let pushData = cloudScriptEvent.pushData;

			await this.gnServer.getPushNotificationService().sendNotificationToTopic(cloudScriptEvent.topic, pushData.title, pushData.body, pushData.badge, pushData.sound, pushData.icon, pushData.data);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.SubscribeToTopic) {
			await this.gnServer.getPushNotificationService().subscribeToTopic(cloudScriptEvent.tokens, cloudScriptEvent.topic);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.UnsubscribeFromTopic) {
			await this.gnServer.getPushNotificationService().unsubscribeFromTopic(cloudScriptEvent.tokens, cloudScriptEvent.topic);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.JoinRoom) {
			await this.gnServer.joinRoom(cloudScriptEvent.userId, cloudScriptEvent.roomId);
		}
		else if (cloudScriptEvent.eventType == CloudScriptEventType.LeaveRoom) {
			await this.gnServer.leaveRoom(cloudScriptEvent.userId, cloudScriptEvent.roomId);
		}
	}

}
