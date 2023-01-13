export interface ILockService {
	handle(key: string | string[], fn: () => any): Promise<void>;
	isBusy(key?: string): boolean;

}
