import { IGoogleService } from "./IGoogleService";
import axios from "axios";
import crypto from "crypto";

export class GoogleService implements IGoogleService {
    // Stores the google API URL value used by this instance.
    private static readonly googleAPIUrl: string = "https://www.googleapis.com";
    // Stores the google API token info access token URL value used by this instance.
    private static readonly googleAPITokenInfoAccessTokenURL: string = "/oauth2/v3/tokeninfo?access_token=";
    // Stores the google API user info access token URL value used by this instance.
    private static readonly googleAPIUserInfoAccessTokenURL: string = "/oauth2/v3/userinfo?access_token=";
    // Stores the google API token info ID token URL value used by this instance.
    private static readonly googleAPITokenInfoIdTokenURL: string = "/oauth2/v3/tokeninfo?id_token=";

    // Stores the google client ID value used by this instance.
    private googleClientId: string;
    // Stores the package ID value used by this instance.
    private packageId: string;
    // Stores the public key string value used by this instance.
    private publicKeyString: string;

    /**
     * Executes the init workflow.
     * @param request Provides the request value used by this operation.
     */
    public init(request: { googleClientId: string, packageId: string, publicRSAKey: string }): void {
        this.googleClientId = request.googleClientId;
        this.packageId = request.packageId;

        if (request.publicRSAKey)
            this.publicKeyString = this.generateFormattedPublickey(request.publicRSAKey);
        else this.publicKeyString = "";
    }

    /**
     * Executes the verify google token via access token workflow asynchronously.
     * @param accessToken Provides the access token value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async verifyGoogleTokenViaAccessToken(accessToken: string): Promise<{ [k: string]: any }> {
        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: any } = {};

        try {
            // Stores the token info result value used in the current execution flow.
            let tokenInfoResult = await axios.get(GoogleService.googleAPIUrl + GoogleService.googleAPITokenInfoAccessTokenURL + accessToken);
            // Stores the data value used in the current execution flow.
            let data = tokenInfoResult.data;

            if (data.error_description != null) {
                answer["error"] = data.error_description;
            }
            else if (data.aud !== this.googleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + data.aud;
            }
            else {
                // Tracks whether r info result should be used.
                let userInfoResult = await axios.get(GoogleService.googleAPIUrl + GoogleService.googleAPIUserInfoAccessTokenURL + accessToken);
                answer = data;

                // Tracks whether r info data keys should be used.
                let userInfoDataKeys = Object.keys(userInfoResult.data);
                for (let i = 0; i < userInfoDataKeys.length; i++) {
                    // Stores the key value used in the current execution flow.
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

    /**
     * Executes the verify google token via ID token workflow asynchronously.
     * @param idToken Provides the ID token value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async verifyGoogleTokenViaIdToken(idToken: string): Promise<{ [k: string]: any }> {
        // Stores the answer value used in the current execution flow.
        let answer: { [k: string]: any } = {};

        try {
            // Stores the token info result value used in the current execution flow.
            let tokenInfoResult = await axios.get(GoogleService.googleAPIUrl + GoogleService.googleAPITokenInfoIdTokenURL + idToken);
            // Stores the data value used in the current execution flow.
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

    /**
     * Validates the receipt.
     * @param payload Provides the payload value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async validateReceipt(payload: string): Promise<{
        // Indicates whether success.
        success: boolean,
        // Stores the product ID value used by this contract.
        productId?: string,
    }> {
        // Stores the payload JSON value used in the current execution flow.
        let payloadJson = JSON.parse(payload);

        // Stores the signature value used in the current execution flow.
        let signature = payloadJson["signature"];
        // Stores the JSON value used in the current execution flow.
        let json = payloadJson["json"];

        if (this.androidValidationReceipt(signature, json)) {
            // Stores the gs JSON value used in the current execution flow.
            let gsJson = JSON.parse(json);

            // Stores the package name value used in the current execution flow.
            let packageName = gsJson["packageName"];
            if (packageName == this.packageId) {
                // Stores the product ID value used in the current execution flow.
                let product_id = gsJson["productId"];

                return {
                    success: true,
                    productId: product_id
                };
            }
        }

        return {
            success: false,
        };
    }

    /**
     * Executes the android validation receipt workflow.
     * @param signature Provides the signature value used by this operation.
     * @param signedData Provides the signed data value used by this operation.
     * @returns Returns the operation result.
     */
    private androidValidationReceipt(signature: any, signedData: any): boolean {
        if (!this.publicKeyString) return false;

        // Stores the verifier value used in the current execution flow.
        let verifier = crypto.createVerify("RSA-SHA1");
        verifier.update(signedData);
        return verifier.verify(this.publicKeyString, signature, "base64");
    };

    // gotta give credit to nothing2lose for this function
    private generateFormattedPublickey(publicKeyStr: string): string {
        // Stores the KEY PREFIX value used in the current execution flow.
        var KEY_PREFIX, KEY_SUFFIX, chunkSize, chunks, str;
        KEY_PREFIX = "-----BEGIN PUBLIC KEY-----\n";
        KEY_SUFFIX = "\n-----END PUBLIC KEY-----";
        str = publicKeyStr;
        chunks = [];
        chunkSize = 64;
        while (str) {
            if (str.length < chunkSize) {
                chunks.push(str);
                break;
            } else {
                chunks.push(str.substr(0, chunkSize));
                str = str.substr(chunkSize);
            }
        }
        str = chunks.join("\n");
        str = KEY_PREFIX + str + KEY_SUFFIX;
        return str;
    };
}
