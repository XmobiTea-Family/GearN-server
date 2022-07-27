export interface IPushNotificationService {
	handle(key: string | string[], fn: () => any): Promise<void>;
	isBusy(key?: string): boolean;
}
