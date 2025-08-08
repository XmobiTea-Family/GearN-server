import { Messaging } from "firebase-admin/lib/messaging/messaging";
import { IPushNotificationService, OnSendNotificationError, OnSendNotificationSuccess } from "./IPushNotificationService";

import admin from "firebase-admin";
import { StringUtility } from "./../../GN-common/helper/StringUtility";

export class PushNotificationService implements IPushNotificationService {
	private isInit: boolean = false;

	private projectId: string;
	private clientEmail: string;
	private privateKey: string;

	private messaging: Messaging;

	private needSetup: boolean = false;

	public init(projectId: string, clientEmail: string, privateKey: string): void {
		this.isInit = false;

		let oldProjectId = this.projectId;
		let oldClientEmail = this.clientEmail;
		let oldPrivateKey = this.privateKey;

		this.projectId = projectId;
		this.clientEmail = clientEmail;
		this.privateKey = privateKey;

		if (oldProjectId != projectId || oldClientEmail != clientEmail || oldPrivateKey != privateKey) {
			this.needSetup = true;
		}
	}

	public async run(): Promise<void> {
		if (!this.projectId || !this.clientEmail || !this.privateKey) return;
		if (!this.needSetup) return;

		if (admin.apps.length > 0) {
			await admin.app().delete();
		}

		admin.initializeApp({
			credential: admin.credential.cert({
				projectId: this.projectId,
				clientEmail: this.clientEmail,
				privateKey: this.privateKey.replace(/\\n/g, "\n"),
			}),
		});

		this.messaging = admin.messaging();

		this.isInit = true;
	}

	public async sendNotification(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		if (!this.isInit) return;

		try {
			const response = await this.messaging.send({
				token: token,
				notification: {
					title: title,
					body: body,
				},
				data: data,
				android: {
					notification: {
						title: title,
						body: body,
						sound: sound,
						icon: icon,
					}
				},
				apns: {
					payload: {
						aps: {
							alert: {
								title: title,
								body: body,
							},
							badge: !badge ? undefined : badge,
							sound: sound,
						}
					}
				}
			});

			if (onSendNotificationSuccess) onSendNotificationSuccess(response);
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);
		}
	}

	public async sendNotificationToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<string> {
		if (!this.isInit) return "";

		let collapseId = StringUtility.generateRandomString(12, 0);

		try {
			const response = await this.messaging.sendEachForMulticast({
				tokens: tokens,
				notification: {
					title: title,
					body: body,
				},
				data: data,
				android: {
					notification: {
						title: title,
						body: body,
						sound: sound,
						icon: icon,
					},
					collapseKey: collapseId
				},
				apns: {
					headers: {
						"apns-collapse-id": collapseId
					},
					payload: {
						aps: {
							alert: {
								title: title,
								body: body,
							},
							badge: !badge ? undefined : badge,
							sound: sound,

						}
					}
				}
			});

			let responseStr = JSON.stringify(response);
			if (onSendNotificationSuccess) onSendNotificationSuccess(responseStr);

			return responseStr;
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);

			return error.code;
		}
	}

	public async sendNotificationToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		if (!this.isInit) return;

		try {
			const response = await this.messaging.send({
				topic: topic,
				notification: {
					title: title,
					body: body,
				},
				data: data,
				android: {
					notification: {
						title: title,
						body: body,
						sound: sound,
						icon: icon,
					}
				},
				apns: {
					payload: {
						aps: {
							alert: {
								title: title,
								body: body,
							},
							badge: !badge ? undefined : badge,
							sound: sound,
						}
					}
				}
			});

			if (onSendNotificationSuccess) onSendNotificationSuccess(response);
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);
		}
	}

	public async subscribeToTopic(tokens: string[], topic: string, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		try {
			const response = await this.messaging.subscribeToTopic(tokens, topic);

			if (onSendNotificationSuccess) onSendNotificationSuccess(JSON.stringify(response));
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);
		}
	}

	public async unsubscribeFromTopic(tokens: string[], topic: string, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		try {
			const response = await this.messaging.unsubscribeFromTopic(tokens, topic);

			if (onSendNotificationSuccess) onSendNotificationSuccess(JSON.stringify(response));
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);
		}
	}

}
