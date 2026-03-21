export interface IGooglePlayGameService {
	/**
	 * Executes the verify token workflow.
	 * @param authCode Provides the auth code value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	verifyToken(authCode: string): Promise<{ [k: string]: any }>;
}
