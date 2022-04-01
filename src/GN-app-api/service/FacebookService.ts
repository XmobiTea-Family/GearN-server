const graphFBAPIUrl = "https://graph.facebook.com";
const graphFBAPIContentURL = "/me?fields=id,name,email,friends&access_token=";

import { IFacebookService } from "./IFacebookService";
import axios from "axios";

export class FacebookService implements IFacebookService {
	public async getBasicInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
		let answer: { [k: string]: any } = {};

		await axios
			.get(graphFBAPIUrl + graphFBAPIContentURL + accessToken)
			.then((response) => {
				answer.data = response.data;
			})
			.catch((error) => {
				answer.error = error;
			});

		return answer;
	}
}
