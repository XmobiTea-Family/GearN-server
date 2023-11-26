import { IFacebookService } from "./IFacebookService";
import axios from "axios";
import * as CryptoJS from 'crypto-js';
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class FacebookService implements IFacebookService {
	private static readonly graphFBAPIUrl: string = "https://graph.facebook.com";
	private static readonly graphFBAPIContentURL: string = "/me?fields=$scopes&access_token=$access_token";//id,name,email,friends
	private static readonly graphFBAPIVerifyURL: string = "/debug_token?input_token=$input_token&access_token=$access_token";

	private facebookAppId: string;
	private facebookAppToken: string;
	private facebookInappSecret: string;

	public init(request: { facebookAppId: string, facebookAppToken: string, facebookInappSecret: string }): void {
		this.facebookAppId = request.facebookAppId;
		this.facebookAppToken = request.facebookAppToken;
		this.facebookInappSecret = request.facebookInappSecret;
	}

	public async getBasicInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
		let appInfoByAccessTokenResult = await this.getAppInfoByAccessToken(accessToken);

		let answer: { [k: string]: any } = {};

		if (appInfoByAccessTokenResult.error != null) {
			answer["error"] = appInfoByAccessTokenResult.error;
		}
		else {
			try {
				let scopeStr = answer.scopes.join(",");
				
				let result = await axios.get(FacebookService.graphFBAPIUrl + FacebookService.graphFBAPIContentURL.replace("$scopes", scopeStr).replace("$access_token", accessToken));
				answer = result.data;
			} catch (error) {
				answer["error"] = error;
			}
		}

		return answer;
	}

	private async getAppInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
		let answer: { [k: string]: any } = {};

		if (!this.facebookAppToken) {
			answer["error"] = "facebook app token null";
		}
		else {
			try {
				let result = await axios.get(FacebookService.graphFBAPIUrl + FacebookService.graphFBAPIVerifyURL.replace("$access_token", this.facebookAppToken).replace("$input_token", accessToken));
				
				if (result.data.data.error) {
					answer["error"] = result.data.data.error.message;
				}
				else {
					let data = result.data.data;

					if (data.expires_at * 1000 < xDatetime.getCurrentMilliseconds()) {
						answer["error"] = "access token expired";
					}
					else answer = data;
				}
			} catch (error) {
				answer["error"] = error;
			}
		}

		return answer;
	}

	public async validateReceipt(payload: string): Promise<{
		success: boolean,
		productId?: string,
	}> {
		let payloadJson = JSON.parse(payload);
		let signedRequest = payloadJson["json"]["signedRequest"];
		let appId = payloadJson["json"]["appId"];
		if (this.facebookValidationReceipt(signedRequest)) {
			let json = CryptoJS.enc.Base64.parse(signedRequest.split('.')[1]).toString(CryptoJS.enc.Utf8);
			let gsJson = JSON.parse(json);

			if (appId == this.facebookAppId) {
				let product_id = gsJson["product_id"];

				return {
					success: true,
					productId: product_id,
				};
			}
		}

		return {
			success: false,
		};
	}

	private facebookValidationReceipt(signedRequest: string): boolean {
		let firstpart = signedRequest.split('.')[0];
		firstpart = firstpart.replace(/-/g, '+').replace(/_/g, '/');
		let signature = CryptoJS.enc.Base64.parse(firstpart).toString();
		let dataHash = CryptoJS.HmacSHA256(signedRequest.split('.')[1], this.facebookInappSecret).toString();
		let isValid = signature === dataHash;

		return isValid;
	};
}
