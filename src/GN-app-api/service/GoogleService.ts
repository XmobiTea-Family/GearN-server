import { IGoogleService } from "./IGoogleService";
import axios from "axios";
import crypto from "crypto";

export class GoogleService implements IGoogleService {
    private static readonly googleAPIUrl: string = "https://www.googleapis.com";
    private static readonly googleAPITokenInfoAccessTokenURL: string = "/oauth2/v3/tokeninfo?access_token=";
    private static readonly googleAPIUserInfoAccessTokenURL: string = "/oauth2/v3/userinfo?access_token=";
    private static readonly googleAPITokenInfoIdTokenURL: string = "/oauth2/v3/tokeninfo?id_token=";

    private googleClientId: string;
    private packageId: string;
    private publicKeyString: string;

    public init(request: { googleClientId: string, packageId: string, publicRSAKey: string }): void {
        this.googleClientId = request.googleClientId;
        this.packageId = request.packageId;

        if (request.publicRSAKey)
            this.publicKeyString = this.generateFormattedPublickey(request.publicRSAKey);
        else this.publicKeyString = "";
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

    public async validateReceipt(payload: string): Promise<{
        success: boolean,
        productId?: string,
    }> {
        let payloadJson = JSON.parse(payload);

        let signature = payloadJson["signature"];
        let json = payloadJson["json"];

        if (this.androidValidationReceipt(signature, json)) {
            let gsJson = JSON.parse(json);

            let packageName = gsJson["packageName"];
            if (packageName == this.packageId) {
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

    private androidValidationReceipt(signature: any, signedData: any): boolean {
        if (!this.publicKeyString) return false;

        let verifier = crypto.createVerify('RSA-SHA1');
        verifier.update(signedData);
        return verifier.verify(this.publicKeyString, signature, 'base64');
    };

    // gotta give credit to nothing2lose for this function
    private generateFormattedPublickey(publicKeyStr: string): string {
        var KEY_PREFIX, KEY_SUFFIX, chunkSize, chunks, str;
        KEY_PREFIX = "-----BEGIN PUBLIC KEY-----\n";
        KEY_SUFFIX = '\n-----END PUBLIC KEY-----';
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
