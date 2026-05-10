import { IFacebookService } from "./IFacebookService";
import axios from "axios";
import { createHmac } from "crypto";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class FacebookService implements IFacebookService {
    private static readonly defaultScopes: string = "id,name,email";

    // Stores the graph FBAPI URL value used by this instance.
    private static readonly graphFBAPIUrl: string = "https://graph.facebook.com";
    // Stores the graph FBAPI content URL value used by this instance.
    private static readonly graphFBAPIContentURL: string = "/me";
    private static readonly graphFBAPIVerifyURL: string = "/debug_token";

    // Stores the facebook app ID value used by this instance.
    private facebookAppId: string;
    // Stores the facebook app token value used by this instance.
    private facebookAppToken: string;
    // Stores the facebook inapp secret value used by this instance.
    private facebookInappSecret: string;

    /**
     * Executes the init workflow.
     * @param request Provides the request value used by this operation.
     */
    public init(request: { facebookAppId: string; facebookAppToken: string; facebookInappSecret: string }): void {
        this.facebookAppId = request.facebookAppId;
        this.facebookAppToken = request.facebookAppToken;
        this.facebookInappSecret = request.facebookInappSecret;
    }

    /**
     * Returns the basic info by access token.
     * @param accessToken Provides the access token value used by this operation.
     * @returns Returns the basic info by access token.
     */
    public async getBasicInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
        // Stores the app info by access token result value used in the current execution flow.
        let appInfoByAccessTokenResult = await this.getAppInfoByAccessToken(accessToken);

        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: any } = {};

        if (appInfoByAccessTokenResult.error != null) {
            answer["error"] = appInfoByAccessTokenResult.error;
        } else {
            try {
                // Stores the result value used in the current execution flow.
                let result = await axios.get(FacebookService.graphFBAPIUrl + FacebookService.graphFBAPIContentURL, {
                    params: {
                        fields: FacebookService.defaultScopes,
                        access_token: accessToken,
                    },
                });

                if (result.data?.error != null) {
                    answer["error"] = result.data.error.message ?? result.data.error;
                } else {
                    answer = result.data ?? {};
                    answer["scopes"] = appInfoByAccessTokenResult["scopes"] ?? [];
                }
            } catch (error) {
                answer["error"] = error;
            }
        }

        return answer;
    }

    /**
     * Returns the app info by access token.
     * @param accessToken Provides the access token value used by this operation.
     * @returns Returns the app info by access token.
     */
    private async getAppInfoByAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: any } = {};

        if (!this.facebookAppToken) {
            answer["error"] = "facebook app token null";
        } else if (!this.facebookAppId) {
            answer["error"] = "facebook app id null";
        } else {
            try {
                // Stores the result value used in the current execution flow.
                let result = await axios.get(FacebookService.graphFBAPIUrl + FacebookService.graphFBAPIVerifyURL, {
                    params: {
                        input_token: accessToken,
                        access_token: this.facebookAppToken,
                    },
                });

                // Stores the data value used in the current execution flow.
                let data = result.data?.data;
                if (data == null) {
                    answer["error"] = "facebook verify data null";
                } else if (data.error != null) {
                    answer["error"] = data.error.message ?? data.error;
                } else if (data.is_valid !== true) {
                    answer["error"] = "access token invalid";
                } else if (data.app_id !== this.facebookAppId) {
                    answer["error"] = "facebook app id invalid";
                } else if (data.expires_at != null && data.expires_at * 1000 < xDatetime.getCurrentMilliseconds()) {
                    answer["error"] = "access token expired";
                } else {
                    answer = data;
                }
            } catch (error) {
                answer["error"] = error;
            }
        }

        return answer;
    }

    /**
     * Validates the receipt.
     * @param payload Provides the payload value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async validateReceipt(payload: string): Promise<{
        // Indicates whether success.
        success: boolean;
        // Stores the product ID value used by this contract.
        productId?: string;
    }> {
        // Stores the payload JSON value used in the current execution flow.
        let payloadJson = JSON.parse(payload);
        // Stores the signed request value used in the current execution flow.
        let signedRequest = payloadJson["json"]["signedRequest"];
        // Stores the app ID value used in the current execution flow.
        let appId = payloadJson["json"]["appId"];
        if (this.facebookValidationReceipt(signedRequest)) {
            // let json = CryptoJS.enc.Base64.parse(signedRequest.split(".")[1]).toString(CryptoJS.enc.Utf8);
            // let gsJson = JSON.parse(json);

            // if (appId == this.facebookAppId) {
            //     let product_id = gsJson["product_id"];

            //     return {
            //         success: true,
            //         productId: product_id,
            //     };
            // }

            const base64Payload = signedRequest.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");

            // Stores the payload buffer value used in the current execution flow.
            const payloadBuffer = Buffer.from(base64Payload, "base64");
            // Stores the JSON str value used in the current execution flow.
            const jsonStr = payloadBuffer.toString("utf8");
            // Stores the gs JSON value used in the current execution flow.
            const gsJson = JSON.parse(jsonStr);

            if (appId === this.facebookAppId) {
                // Stores the product ID value used in the current execution flow.
                const product_id = gsJson["product_id"];
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

    /**
     * Executes the facebook validation receipt workflow.
     * @param signedRequest Provides the signed request value used by this operation.
     * @returns Returns the operation result.
     */
    private facebookValidationReceipt(signedRequest: string): boolean {
        // let [encodedSig, encodedPayload] = signedRequest.split(".");

        // let base64Sig = encodedSig.replace(/-/g, "+").replace(/_/g, "/");
        // let signature = CryptoJS.enc.Base64.parse(base64Sig).toString();
        // let dataHash = CryptoJS.HmacSHA256(encodedPayload, this.facebookInappSecret).toString();
        // let isValid = signature === dataHash;

        // return isValid;

        const [encodedSig, encodedPayload] = signedRequest.split(".");

        // Stores the base 64 sig value used in the current execution flow.
        const base64Sig = encodedSig.replace(/-/g, "+").replace(/_/g, "/");

        // Stores the signature buffer value used in the current execution flow.
        const signatureBuffer = Buffer.from(base64Sig, "base64");

        // Stores the hmac value used in the current execution flow.
        const hmac = createHmac("sha256", this.facebookInappSecret);
        hmac.update(encodedPayload);
        // Stores the data hash buffer value used in the current execution flow.
        const dataHashBuffer = hmac.digest();

        // Tracks whether valid.
        const isValid = signatureBuffer.equals(dataHashBuffer);
        return isValid;
    }
}
