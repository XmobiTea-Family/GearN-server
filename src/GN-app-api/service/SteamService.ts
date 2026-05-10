import axios from "axios";
import { ISteamService } from "./ISteamService";

// I dont use this in current gearn server version.
export class SteamService implements ISteamService {
    // Stores the steam API key value used by this instance.
    private steamApiKey: string;
    // Stores the steam app ID value used by this instance.
    private steamAppId: string;

    /**
     * Executes the init workflow.
     * @param request Provides the request value used by this operation.
     */
    public init(request: { steamApiKey: string; steamAppId: string }) {
        this.steamApiKey = request.steamApiKey;
        this.steamAppId = request.steamAppId;
    }

    /**
     * Executes the verify ticket workflow asynchronously.
     * @param ticket Provides the ticket value used by this operation.
     * @param identity Provides the identity value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async verifyTicket(ticket: string, identity: string): Promise<{ [k: string]: any }> {
        try {
            // Stores the URL value used in the current execution flow.
            let url = "https://partner.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/";

            // Stores the response value used in the current execution flow.
            const response = await axios.get(url, {
                params: {
                    key: this.steamApiKey,
                    appid: this.steamAppId,
                    ticket: ticket,
                    identity: identity,
                },
            });

            // Stores the result value used in the current execution flow.
            const result = response.data.response;
            if (result.error) {
                throw new Error(`Steam error: ${result.error.errordesc}, Code: ${result.error.errorcode}`);
            }

            if (!result.params) {
                throw new Error("No steam profile returned");
            }

            return {
                steamId: result.params.steamid,
            };
        } catch (error) {
            return {
                error: error,
            };
        }
    }
}
