import { IFacebookService } from "./IFacebookService";
import axios from "axios";

export class FacebookService implements IFacebookService {
	private static readonly graphFBAPIUrl: string = "https://graph.facebook.com";
	private static readonly graphFBAPIContentURL: string = "/me?fields=id,name,email,friends&access_token=";

	public async getBasicInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
		let answer: { [k: string]: any } = {};

		try {
			let result = await axios.get(FacebookService.graphFBAPIUrl + FacebookService.graphFBAPIContentURL + accessToken);
			answer = result.data;
		} catch (error) {
			answer["error"] = error;
		}

		return answer;
	}

}
