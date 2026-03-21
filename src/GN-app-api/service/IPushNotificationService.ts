export interface OnSendNotificationSuccess {
	(message: string): void;
}

export interface OnSendNotificationError {
	(error: string): void;
}

export interface IPushNotificationService {
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
	sendNotification(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

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
	sendNotificationToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<string>;

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
	sendNotificationToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

	/**
	 * Executes the subscribe to topic workflow.
	 * @param tokens Provides the tokens value used by this operation.
	 * @param topic Provides the topic value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 */
	subscribeToTopic(tokens: string[], topic: string, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

	/**
	 * Executes the unsubscribe from topic workflow.
	 * @param tokens Provides the tokens value used by this operation.
	 * @param topic Provides the topic value used by this operation.
	 * @param onSendNotificationSuccess Provides the on send notification success value used by this operation.
	 * @param onSendNotificationError Provides the on send notification error value used by this operation.
	 */
	unsubscribeFromTopic(tokens: string[], topic: string, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

}
