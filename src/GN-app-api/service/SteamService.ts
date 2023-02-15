import axios from "axios";
import { ISteamService } from "./ISteamService";

export class SteamService implements ISteamService {
    private steamApiKey: string;
    private steamAppId: string;

    public init(request: { steamApiKey: string, steamAppId: string, }) {
        this.steamApiKey = request.steamApiKey;
        this.steamAppId = request.steamAppId;
    }

    public async verifyTicket(ticket: string, identity: string): Promise<{ [k: string]: any }> {
        try {
            let url = "https://partner.steam-api.com/ISteamUserAuth/AuthenticateUserTicket/v1/";

            const response = await axios.get(url, {
                params: {
                    key: this.steamApiKey,
                    appid: this.steamAppId,
                    ticket: ticket,
                    identity: identity,
                }
            });

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
                "error": error
            };
        }
    }

}
