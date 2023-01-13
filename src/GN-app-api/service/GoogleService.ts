import { IGoogleService } from "./IGoogleService";
import axios from "axios";

export class GoogleService implements IGoogleService {
    private static readonly googleAPIUrl: string = "https://www.googleapis.com";
    private static readonly googleAPITokenInfoAccessTokenURL: string = "/oauth2/v3/tokeninfo?access_token=";
    private static readonly googleAPIUserInfoAccessTokenURL: string = "/oauth2/v3/userinfo?access_token=";
    private static readonly googleAPITokenInfoIdTokenURL: string = "/oauth2/v3/tokeninfo?id_token=";

    private googleClientId: string;

    public setGoogleClientId(googleClientId: string): void {
        this.googleClientId = googleClientId;
    }

    private async debugToken() {
        return;

        let accessToken = "ya29.A0AVA9y1vmClxTRY0kM7l6kFv86JMktyL5VoszK59CyDUaQdkAPSCYSRGezkzvNfSdgE54FHIw_-kvqGntTX7ihYbfccPBNhjxbkboXQEP_UjCnDpQUnr-DHmxLnSdwAFdWk2Kn5P_egmGufe6ttgkWCVEL0HDjikhCdyRYUNnWUtBVEFTQVRBU0ZRRl91NjFWaFM4bENkX0JZTkswV1dVdjFqVDg3UQ0171";

        this.verifyGoogleTokenViaAccessToken(accessToken);
    }

    public async verifyGoogleTokenViaAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
        let answer: { [k: string]: any } = {};

        try {
            let tokenInfoResult = await axios.get(GoogleService.googleAPIUrl + GoogleService.googleAPITokenInfoAccessTokenURL + accessToken);
            let data = tokenInfoResult.data;

            if (data.error_description != null) {
                answer["error"] = data.error_description;
            }
            else if (data.aud !== this.googleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + data.aud;
            }
            else {
                let userInfoResult = await axios.get(GoogleService.googleAPIUrl + GoogleService.googleAPIUserInfoAccessTokenURL + accessToken);
                answer = data;

                let userInfoDataKeys = Object.keys(userInfoResult.data);
                for (let i = 0; i < userInfoDataKeys.length; i++) {
                    let key = userInfoDataKeys[i];

                    answer[key] = userInfoResult.data[key];
                }
            }
        }
        catch (err) {
            answer["error"] = "Invalid Value";
        }

        return answer;
    }

    public async verifyGoogleTokenViaIdToken(idToken: string): Promise<{ [k: string]: any }> {
        let answer: { [k: string]: any } = {};

        try {
            let tokenInfoResult = await axios.get(GoogleService.googleAPIUrl + GoogleService.googleAPITokenInfoIdTokenURL + idToken);
            let data = tokenInfoResult.data;

            if (data.error_description != null) {
                answer["error"] = data.error_description;
            }
            else if (data.aud !== this.googleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + data.aud;
            }
            else {
                answer = data;
            }
        }
        catch (err) {
            answer["error"] = "Invalid Value";
        }

        return answer;
    }

    constructor() {
        this.debugToken();
    }

}
