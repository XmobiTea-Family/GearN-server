export interface IAppleService {
	/**
	 * Executes the verify apple token workflow.
	 * @param token Provides the token value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	verifyAppleToken(token: string): Promise<{ [k: string]: any }>;
	/**
	 * Validates the receipt.
	 * @param payload Provides the payload value used by this operation.
	 * @param transactionId Provides the transaction ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	validateReceipt(payload: string, transactionId: string): Promise<{
		// Indicates whether success.
		success: boolean,
		// Stores the product ID value used by this contract.
		productId?: string,
	}>;
}
