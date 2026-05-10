export interface ISteamService {
    /**
     * Executes the verify ticket workflow.
     * @param ticket Provides the ticket value used by this operation.
     * @param identity Provides the identity value used by this operation.
     * @returns Resolves with the operation result.
     */
    verifyTicket(ticket: string, identity: string): Promise<{ [k: string]: any }>;
}
