const googleAPIUrl = "https://www.googleapis.com";
const googleAPITokenInfoURL = "/oauth2/v3/tokeninfo?access_token=";
const googleAPIUserInfoURL = "/oauth2/v3/userinfo?access_token=";

import { IGoogleService } from "./IGoogleService";
import axios from "axios";

export class GoogleService implements IGoogleService {
	private googleClientId: string;

	public setGoogleClientId(googleClientId: string): void {
		this.googleClientId = googleClientId;
	}

    private async debugToken() {
        return;

        let accessToken = "ya29.A0ARrdaM-0XBkRR0bqNFGx6fAoML5WKvYvKROwSdaG2GZcnwDfG3eATkQAGuogRm0hUuDYhmt0n5xXXTBlTo3dCJeKHhjhel1PUOJ9UrYx_a6kPnsO3t7cIajICx__X41oOd05I1nvgALCStBo_XkjcUJP78DY_SEzFHd0YUNnWUtBVEFTQVRBU0ZRRl91NjFWQ2w5amtDSS1UV0F1YWlzWnJvMllHdw0171";

        this.verifyGoogleToken(accessToken);
    }

    public async verifyGoogleToken(accessToken: string): Promise<{ [k: string]: any }> {
        let answer: { [k: string]: any } = {};

        try {
            let tokenInfoResult = await axios.get(googleAPIUrl + googleAPITokenInfoURL + accessToken);
            let data = tokenInfoResult.data;

            if (data.error_description != null) {
                answer["error"] = data.error_description;
            }
            else if (data.aud !== this.googleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + data.aud;
            }
            else {
                let userInfoResult = await axios.get(googleAPIUrl + googleAPIUserInfoURL + accessToken);
                answer = userInfoResult.data;
            }
        }
        catch (err) {
            answer["error"] = err;
        }

        return answer;
    }

    constructor() {
        this.debugToken();
    }
}
