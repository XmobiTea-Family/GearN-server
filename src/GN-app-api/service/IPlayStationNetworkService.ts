export interface IPlayStationNetworkService {
	/**
	 * Executes the verify PSN token workflow.
	 * @param token Provides the token value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	verifyPSNToken(token: string): Promise<{ [k: string]: any }>;
}
