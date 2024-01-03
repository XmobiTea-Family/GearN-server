export interface OnSendNotificationSuccess {
    (): void;
}

export interface OnSendNotificationError {
    (error: string): void;
}

export interface IPushNotificationService {
    sendNotification(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

    sendNotificationToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

    sendNotificationToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }, onSendNotificationSuccess?: OnSendNotificationSuccess, onSendNotificationError?: OnSendNotificationError): Promise<void>;

}
