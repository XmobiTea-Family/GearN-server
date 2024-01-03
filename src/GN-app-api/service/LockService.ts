import { ILockService } from "./ILockService";

import AsyncLock from "async-lock";
const asyncLock = new AsyncLock();

export class LockService implements ILockService {
	public async handle(key: string | string[], fn: () => any): Promise<void> {
		return await asyncLock.acquire(key, fn);
	}

	public isBusy(key?: string): boolean {
		return asyncLock.isBusy(key);
	}

}
