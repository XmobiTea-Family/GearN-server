export interface ISteamService {
    verifyTicket(ticket: string, identity: string): Promise<{ [k: string]: any }>;

}
