export interface IAppleService {
	verifyAppleToken(token: string): Promise<{ [k: string]: any }>;
	validateReceipt(payload: string, transactionId: string): Promise<{
		success: boolean,
		productId?: string,
	}>;
}
