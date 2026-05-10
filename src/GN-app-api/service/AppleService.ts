import jwt, { JwtHeader, JwtPayload, VerifyErrors } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { IAppleService } from "./IAppleService";
import axios from "axios";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";

export class AppleService implements IAppleService {
    // private static readonly MAIN_verifyAppleAppStoreAPIUrl: string = "https://buy.itunes.apple.com/verifyReceipt";
    // private static readonly MAIN_verifySandboxAppleAppStoreAPIUrl: string = "https://sandbox.itunes.apple.com/verifyReceipt";

    private static readonly MAIN_iss: string = "https://appleid.apple.com";
    // Stores the MAIN iss auth keys value used by this instance.
    private static readonly MAIN_iss_auth_keys: string = "https://appleid.apple.com/auth/keys";

    // Stores the client value used by this instance.
    private client: jwksClient.JwksClient;
    // Stores the apple client ID value used by this instance.
    private appleClientId: string;
    // Indicates whether sandbox enable.
    private sandboxEnable: boolean;
    // Indicates whether suer ID.
    private issuerId: string;
    // Stores the key ID value used by this instance.
    private keyId: string;
    // Stores the p 8 content value used by this instance.
    private p8Content: string;

    /**
     * Initializes a new apple service instance.
     */
    constructor() {
        this.client = jwksClient({
            jwksUri: AppleService.MAIN_iss_auth_keys,
        });
    }

    /**
     * Executes the init workflow.
     * @param request Provides the request value used by this operation.
     */
    public init(request: { appleClientId: string; sandboxEnable: boolean; issuerId: string; keyId: string; p8Content: string }): void {
        this.appleClientId = request.appleClientId;
        this.sandboxEnable = request.sandboxEnable;
        this.issuerId = request.issuerId;
        this.keyId = request.keyId;
        this.p8Content = request.p8Content;
    }

    /**
     * Returns the signing key.
     * @param header Provides the header value used by this operation.
     * @returns Returns the signing key.
     */
    private getSigningKey(header: JwtHeader): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!header.kid) {
                return reject(new Error("No KID in token header"));
            }

            this.client.getSigningKey(header.kid, (err, key) => {
                if (err) {
                    return reject(err);
                }

                // Stores the signing key value used in the current execution flow.
                const signingKey = key.getPublicKey(); // hoặc key.rsaPublicKey
                resolve(signingKey);
            });
        });
    }

    /**
     * Executes the verify token workflow asynchronously.
     * @param token Provides the token value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async verifyToken(token: string): Promise<{ [k: string]: any }> {
        try {
            // Stores the signing key value used in the current execution flow.
            const signingKey = await this.getSigningKey(jwt.decode(token, { complete: true })?.header as JwtHeader);

            return new Promise((resolve, reject) =>
                jwt.verify(token, signingKey, (err: VerifyErrors | null, decoded: any) => {
                    if (err) {
                        return reject({ error: err.message });
                    }
                    return resolve(decoded);
                }),
            );
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Executes the verify apple token workflow asynchronously.
     * @param token Provides the token value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async verifyAppleToken(token: string): Promise<{ [k: string]: any }> {
        try {
            // Stores the answer value used in the current execution flow.
            let answer = await this.verifyToken(token);

            if (answer.iss !== AppleService.MAIN_iss) {
                answer["error"] = "unexpected issuer (iss claim): " + answer.iss;
            } else if (answer.aud !== this.appleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + answer.aud;
            } else {
                // Stores the now value used in the current execution flow.
                let now = Math.floor(Date.now() / 1000); // thời gian hiện tại (epoch seconds)

                if (answer.exp && answer.exp < now) {
                    answer["error"] = "token expired at " + new Date(answer.exp * 1000).toISOString();
                } else if (answer.iat && answer.iat > now + 10) {
                    answer["error"] = "token issued in the future: " + new Date(answer.iat * 1000).toISOString();
                }
            }

            return answer;
        } catch (error) {
            return {
                error: error,
            };
        }
    }

    /**
     * Validates the receipt.
     * @param payload Provides the payload value used by this operation.
     * @param transactionId Provides the transaction ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async validateReceipt(
        payload: string,
        transactionId: string,
    ): Promise<{
        // Indicates whether success.
        success: boolean;
        // Stores the product ID value used by this contract.
        productId?: string;
    }> {
        if (!this.appleClientId || !this.issuerId || !this.keyId || !this.p8Content) {
            return {
                success: false,
            };
        }

        // Stores the transaction info response value used in the current execution flow.
        let transactionInfoResponse = await this.getTransactionInfoAsync(transactionId, false);
        if (transactionInfoResponse.responesCode == 404 && this.sandboxEnable) {
            transactionInfoResponse = await this.getTransactionInfoAsync(transactionId, true);
        }

        if (transactionInfoResponse.responesCode == 200) {
            // Stores the signed transaction info payload value used in the current execution flow.
            let signedTransactionInfoPayload: any;
            try {
                signedTransactionInfoPayload = jwt.decode(transactionInfoResponse.data.signedTransactionInfo);
            } catch (err) {
                Debug.log("[GearN] error while validate apple receipt " + err.toString());
            }

            return {
                success: true,
                productId: signedTransactionInfoPayload.productId,
            };
        }

        return {
            success: false,
        };

        // let result = await this.validateReceiptLive(payload);

        // if (result["error"] != null) {
        // 	return {
        // 		success: false,
        // 	};
        // }

        // let statusCode: number = result["status"];

        // if (statusCode == 0) {

        // }
        // else if (statusCode == 21007 && this.sandboxEnable) {
        // 	result = await this.validateReceiptSandbox(payload);

        // 	if (result["error"] != null) {
        // 		return {
        // 			success: false,
        // 		};
        // 	}
        // }

        // let receiptJson = result["receipt"];

        // let bundle_id = receiptJson["bundle_id"];

        // if (bundle_id == this.appleClientId) {
        // 	let gsIn_apps = receiptJson["in_app"];

        // 	for (let i = 0; i < gsIn_apps.length; i++) {
        // 		let gsIn_app = gsIn_apps[i];

        // 		let transaction_id = gsIn_app["transaction_id"];

        // 		if (transactionId == transaction_id) {
        // 			let product_id = gsIn_app["product_id"];

        // 			return {
        // 				success: true,
        // 				productId: product_id
        // 			};
        // 		}
        // 	}
        // }

        // return {
        // 	success: false,
        // };
    }

    // private async validateReceiptLive(payload: string): Promise<{ [k: string]: any }> {
    // 	let answer: { [k: string]: any } = {};

    // 	try {
    // 		let result = await axios.post(AppleService.MAIN_verifyAppleAppStoreAPIUrl, { "receipt-data": payload }, {
    // 			headers: {
    // 				"Content-Type": "application/x-www-form-urlencoded"
    // 			},
    // 		});
    // 		answer = result.data;
    // 	} catch (error) {
    // 		answer["error"] = error;
    // 	}

    // 	return answer;
    // }

    // private async validateReceiptSandbox(payload: string): Promise<{ [k: string]: any }> {
    // 	let answer: { [k: string]: any } = {};

    // 	try {
    // 		let result = await axios.post(AppleService.MAIN_verifySandboxAppleAppStoreAPIUrl, { "receipt-data": payload }, {
    // 			headers: {
    // 				"Content-Type": "application/x-www-form-urlencoded"
    // 			},
    // 		});
    // 		answer = result.data;
    // 	} catch (error) {
    // 		answer["error"] = error;
    // 	}

    // 	return answer;
    // }

    public async getTransactionInfoAsync(transactionId: string, isSandbox: boolean) {
        // Stores the token value used in the current execution flow.
        let token = this.getToken();

        // Stores the URL value used in the current execution flow.
        let url = isSandbox ? "https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/" + transactionId : "https://api.storekit.itunes.apple.com/inApps/v1/transactions/" + transactionId;

        try {
            // Stores the result value used in the current execution flow.
            let result = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            return {
                responesCode: result.status,
                data: result.data,
            };
        } catch (error) {
            return {
                responesCode: -1,
                error: error,
            };
        }
    }

    /**
     * Returns the token.
     * @returns Returns the token.
     */
    private getToken(): string {
        // Stores the now value used in the current execution flow.
        let now = Math.floor(Date.now() / 1000);

        // Create the payload
        let payload: JwtPayload = {
            iss: this.issuerId,
            iat: now,
            exp: now + 30 * 60,
            aud: "appstoreconnect-v1",
            bid: this.appleClientId,
        };

        // Create the header
        let header: JwtHeader = {
            alg: "ES256",
            kid: this.keyId,
            typ: "JWT",
        };

        // Generate the token
        const token = jwt.sign(payload, this.p8Content, {
            algorithm: "ES256",
            header: header,
        });

        return token;
    }
}
