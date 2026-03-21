export interface IFacebookService {
	/**
	 * Returns the basic info by access token.
	 * @param accessToken Provides the access token value used by this operation.
	 * @returns Returns the basic info by access token.
	 */
	getBasicInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }>;
	/**
	 * Validates the receipt.
	 * @param payload Provides the payload value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	validateReceipt(payload: string): Promise<{
		// Indicates whether success.
		success: boolean,
		// Stores the product ID value used by this contract.
		productId?: string,
	}>;
}
