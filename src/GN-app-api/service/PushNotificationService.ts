import { Messaging } from "firebase-admin/lib/messaging/messaging";
import { IPushNotificationService, OnSendNotificationError, OnSendNotificationSuccess } from "./IPushNotificationService";

import admin from "firebase-admin";
import { StringUtility } from "./../../GN-common/helper/StringUtility";

export class PushNotificationService implements IPushNotificationService {
	// Indicates whether init.
	private isInit: boolean = false;

	// Stores the project ID value used by this instance.
	private projectId: string;
	// Stores the client email value used by this instance.
	private clientEmail: string;
	// Stores the private key value used by this instance.
	private privateKey: string;

	// Stores the messaging value used by this instance.
	private messaging: Messaging;

	// Indicates whether need setup.
	private needSetup: boolean = false;

	/**
	 * Executes the init workflow.
	 * @param projectId Provides the project ID value used by this operation.
	 * @param clientEmail Provides the client email value used by this operation.
	 * @param privateKey Provides the private key value used by this operation.
	 */
	public init(projectId: string, clientEmail: string, privateKey: string): void {
		this.isInit = false;

		// Stores the old project ID value used in the current execution flow.
		let oldProjectId = this.projectId;
		// Stores the old client email value used in the current execution flow.
		let oldClientEmail = this.clientEmail;
		// Stores the old private key value used in the current execution flow.
		let oldPrivateKey = this.privateKey;

		this.projectId = projectId;
		this.clientEmail = clientEmail;
		this.privateKey = privateKey;

		if (oldProjectId != projectId || oldClientEmail != clientEmail || oldPrivateKey != privateKey) {
			this.needSetup = true;
		}
	}

	/**
	 * Runs the current workflow.
	 */
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

	/**
	 * Sends the notification.
	 * @param token Provides the token value used by this operation.
	 * @param title Provides the title value used by this operation.
	 * @param body Provides the body value used by this operation.
	 * @param badge Provides the badge value used by this operation.
	 * @param sound Provides the sound value used by this operation.
	 * @param icon Provides the icon value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 */
	public async sendNotification(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		if (!this.isInit) return;

		try {
			// Stores the response value used in the current execution flow.
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

	/**
	 * Sends the notification to more.
	 * @param tokens Provides the tokens value used by this operation.
	 * @param title Provides the title value used by this operation.
	 * @param body Provides the body value used by this operation.
	 * @param badge Provides the badge value used by this operation.
	 * @param sound Provides the sound value used by this operation.
	 * @param icon Provides the icon value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async sendNotificationToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<string> {
		if (!this.isInit) return "";

		// Stores the collapse ID value used in the current execution flow.
		let collapseId = StringUtility.generateRandomString(12, 0);

		try {
			// Stores the response value used in the current execution flow.
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

			// Stores the response str value used in the current execution flow.
			let responseStr = JSON.stringify(response);
			if (onSendNotificationSuccess) onSendNotificationSuccess(responseStr);

			return responseStr;
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);

			return error.code;
		}
	}

	/**
	 * Sends the notification to topic.
	 * @param topic Provides the topic value used by this operation.
	 * @param title Provides the title value used by this operation.
	 * @param body Provides the body value used by this operation.
	 * @param badge Provides the badge value used by this operation.
	 * @param sound Provides the sound value used by this operation.
	 * @param icon Provides the icon value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 */
	public async sendNotificationToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		if (!this.isInit) return;

		try {
			// Stores the response value used in the current execution flow.
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

	/**
	 * Executes the subscribe to topic workflow asynchronously.
	 * @param tokens Provides the tokens value used by this operation.
	 * @param topic Provides the topic value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 */
	public async subscribeToTopic(tokens: string[], topic: string, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		try {
			// Stores the response value used in the current execution flow.
			const response = await this.messaging.subscribeToTopic(tokens, topic);

			if (onSendNotificationSuccess) onSendNotificationSuccess(JSON.stringify(response));
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);
		}
	}

	/**
	 * Executes the unsubscribe from topic workflow asynchronously.
	 * @param tokens Provides the tokens value used by this operation.
	 * @param topic Provides the topic value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 */
	public async unsubscribeFromTopic(tokens: string[], topic: string, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void> {
		try {
			// Stores the response value used in the current execution flow.
			const response = await this.messaging.unsubscribeFromTopic(tokens, topic);

			if (onSendNotificationSuccess) onSendNotificationSuccess(JSON.stringify(response));
		} catch (error) {
			if (onSendNotificationError) onSendNotificationError(error.code);
		}
	}

}
