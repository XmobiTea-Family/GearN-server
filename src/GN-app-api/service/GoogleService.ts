const googleAPIUrl = "https://www.googleapis.com";
const googleAPITokenInfoAccessTokenURL = "/oauth2/v3/tokeninfo?access_token=";
const googleAPIUserInfoAccessTokenURL = "/oauth2/v3/userinfo?access_token=";
const googleAPITokenInfoIdTokenURL = "/oauth2/v3/tokeninfo?id_token=";

import { IGoogleService } from "./IGoogleService";
import axios from "axios";

export class GoogleService implements IGoogleService {
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
            let tokenInfoResult = await axios.get(googleAPIUrl + googleAPITokenInfoAccessTokenURL + accessToken);
            let data = tokenInfoResult.data;

            if (data.error_description != null) {
                answer["error"] = data.error_description;
            }
            else if (data.aud !== this.googleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + data.aud;
            }
            else {
                let userInfoResult = await axios.get(googleAPIUrl + googleAPIUserInfoAccessTokenURL + accessToken);
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
            let tokenInfoResult = await axios.get(googleAPIUrl + googleAPITokenInfoIdTokenURL + idToken);
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
