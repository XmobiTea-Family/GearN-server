import { IGooglePlayGameService } from "./IGooglePlayGameService";
import axios from "axios";

export class GooglePlayGameService implements IGooglePlayGameService {
    private static readonly googleAPIUrl: string = "https://oauth2.googleapis.com";
    private static readonly googleAPITokenUrl: string = "/token";
    private static readonly googleAPIVerifyUrl: string = "/games/v1/applications/$applicationId/verify";

    private redirectUri: string;
    private clientId: string;
    private clientSecret: string;
    private applicationId: string;

    public init(request: { redirectUri: string, clientId: string, clientSecret: string, applicationId: string }): void {
        this.redirectUri = request.redirectUri;
        this.clientId = request.clientId;
        this.clientSecret = request.clientSecret;
        this.applicationId = request.applicationId;
    }

    public async verifyToken(authCode: string): Promise<{ [k: string]: any; }> {
        let answer: { [k: string]: any } = {};

        try {
            let accessTokenInfo = await this.exchangeAccessToken(authCode);

            if (accessTokenInfo["error"] != null) {
                answer["error"] = accessTokenInfo.error;
                answer["error_description"] = accessTokenInfo.error_description;
            }
            else {
                let info = await this.getPlayerId(accessTokenInfo["token_type"], accessTokenInfo["access_token"]);

                if (info["error"] != null) {
                    answer["error"] = info.error;
                    answer["error_description"] = info.error_description;
                }
                else {
                    answer = info;
                }
            }
        }
        catch (err) {
            answer["error"] = "Invalid Value";
        }

        return answer;
    }

    private async exchangeAccessToken(authCode: string) {
        let answer: { [k: string]: any } = {};

        try {
            let tokenInfoResult = await axios.post(GooglePlayGameService.googleAPIUrl + GooglePlayGameService.googleAPITokenUrl, {
                create_type: "authorization_code",
                redirect_uri: this.redirectUri,
                code: authCode,
                client_id: this.clientId,
                client_secret: this.clientSecret,
            },
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                });

            let data = tokenInfoResult.data;

            answer = data;
        }
        catch (err) {
            answer["error"] = "Invalid Value";
        }

        return answer;
    }

    private async getPlayerId(tokenType: string, accessToken: string) {
        let answer: { [k: string]: any } = {};

        try {
            let tokenInfoResult = await axios.post(GooglePlayGameService.googleAPIUrl + GooglePlayGameService.googleAPIVerifyUrl.replace("$applicationId", this.applicationId), null,
                {
                    headers: {
                        "Authorization": tokenType + " " + accessToken,
                    }
                });

            let data = tokenInfoResult.data;
            answer = data;
        }
        catch (err) {
            answer["error"] = "Invalid Value";
        }

        return answer;
    }

}
