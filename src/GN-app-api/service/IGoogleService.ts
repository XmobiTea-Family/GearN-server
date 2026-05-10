export interface IGoogleService {
    /**
     * Executes the verify google token via access token workflow.
     * @param accessToken Provides the access token value used by this operation.
     * @returns Resolves with the operation result.
     */
    verifyGoogleTokenViaAccessToken(accessToken: string): Promise<{ [k: string]: any }>;
    /**
     * Executes the verify google token via ID token workflow.
     * @param idToken Provides the ID token value used by this operation.
     * @returns Resolves with the operation result.
     */
    verifyGoogleTokenViaIdToken(idToken: string): Promise<{ [k: string]: any }>;
    /**
     * Validates the receipt.
     * @param payload Provides the payload value used by this operation.
     * @returns Resolves with the operation result.
     */
    validateReceipt(payload: string): Promise<{
        // Indicates whether success.
        success: boolean;
        // Stores the product ID value used by this contract.
        productId?: string;
    }>;
}
