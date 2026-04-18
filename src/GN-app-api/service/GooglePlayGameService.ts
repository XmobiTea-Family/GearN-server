import { IGooglePlayGameService } from "./IGooglePlayGameService";
import axios from "axios";

export class GooglePlayGameService implements IGooglePlayGameService {
	// Stores the google API URL value used by this instance.
	private static readonly googleAPIUrl: string = "https://oauth2.googleapis.com";
	// Stores the google API token URL value used by this instance.
	private static readonly googleAPITokenUrl: string = "/token";
	// Stores the google API verify URL value used by this instance.
	private static readonly googleAPIVerifyUrl: string = "/games/v1/applications/$applicationId/verify";

	// Stores the redirect URI value used by this instance.
	private redirectUri: string;
	// Stores the client ID value used by this instance.
	private clientId: string;
	// Stores the client secret value used by this instance.
	private clientSecret: string;
	// Stores the application ID value used by this instance.
	private applicationId: string;

	/**
	 * Executes the init workflow.
	 * @param request Provides the request value used by this operation.
	 */
	public init(request: { redirectUri: string, clientId: string, clientSecret: string, applicationId: string }): void {
		this.redirectUri = request.redirectUri;
		this.clientId = request.clientId;
		this.clientSecret = request.clientSecret;
		this.applicationId = request.applicationId;
	}

	/**
	 * Executes the verify token workflow asynchronously.
	 * @param authCode Provides the auth code value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async verifyToken(authCode: string): Promise<{ [k: string]: any; }> {
		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: any } = {};

		try {
			// Stores the access token info value used in the current execution flow.
			let accessTokenInfo = await this.exchangeAccessToken(authCode);

			if (accessTokenInfo["error"] != null) {
				answer["error"] = accessTokenInfo.error;
				answer["error_description"] = accessTokenInfo.error_description;
			}
			else {
				// Stores the info value used in the current execution flow.
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

	/**
	 * Executes the exchange access token workflow asynchronously.
	 * @param authCode Provides the auth code value used by this operation.
	 */
	private async exchangeAccessToken(authCode: string) {
		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: any } = {};

		try {
			// Stores the token info result value used in the current execution flow.
			let tokenInfoResult = await axios.post(GooglePlayGameService.googleAPIUrl + GooglePlayGameService.googleAPITokenUrl, {
				grant_type: "authorization_code",
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

			// Stores the data value used in the current execution flow.
			let data = tokenInfoResult.data;

			answer = data;
		}
		catch (err) {
			answer["error"] = "Invalid Value";
		}

		return answer;
	}

	/**
	 * Returns the player ID.
	 * @param tokenType Provides the token type value used by this operation.
	 * @param accessToken Provides the access token value used by this operation.
	 */
	private async getPlayerId(tokenType: string, accessToken: string) {
		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: any } = {};

		try {
			// Stores the token info result value used in the current execution flow.
			let tokenInfoResult = await axios.post(GooglePlayGameService.googleAPIUrl + GooglePlayGameService.googleAPIVerifyUrl.replace("$applicationId", this.applicationId), null,
				{
					headers: {
						"Authorization": tokenType + " " + accessToken,
					}
				});

			// Stores the data value used in the current execution flow.
			let data = tokenInfoResult.data;
			answer = data;
		}
		catch (err) {
			answer["error"] = "Invalid Value";
		}

		return answer;
	}

}
