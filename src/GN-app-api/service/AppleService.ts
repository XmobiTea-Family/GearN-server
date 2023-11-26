import jwt, { JwtHeader, SigningKeyCallback, JwtPayload, VerifyErrors, Jwt } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { IAppleService } from "./IAppleService";
import axios from "axios";
import { Debug } from "../../GN-library/xdebug/lib/xDebug";

export class AppleService implements IAppleService {
	// private static readonly MAIN_verifyAppleAppStoreAPIUrl: string = "https://buy.itunes.apple.com/verifyReceipt";
	// private static readonly MAIN_verifySandboxAppleAppStoreAPIUrl: string = "https://sandbox.itunes.apple.com/verifyReceipt";

	private static readonly MAIN_iss: string = "https://appleid.apple.com";
	private static readonly MAIN_iss_auth_keys: string = "https://appleid.apple.com/auth/keys";

	private client: jwksClient.JwksClient;
	private appleClientId: string;
	private sandboxEnable: boolean;
	private issuerId: string;
	private keyId: string;
	private p8Content: string;

	constructor() {
		this.client = jwksClient({
			jwksUri: AppleService.MAIN_iss_auth_keys,
		});
	}

	public init(request: { appleClientId: string, sandboxEnable: boolean, issuerId: string, keyId: string, p8Content: string, }): void {
		this.appleClientId = request.appleClientId;
		this.sandboxEnable = request.sandboxEnable;
		this.issuerId = request.issuerId;
		this.keyId = request.keyId;
		this.p8Content = request.p8Content;
	}

	private async verifyToken(token: string): Promise<{ [k: string]: any }> {
		return new Promise((resolve, reject) =>
			jwt.verify(token, (header: JwtHeader, callback: SigningKeyCallback) => {
				this.client.getSigningKey(header.kid, (err: Error, key: jwksClient.SigningKey) => {
					if (err) return callback(err, null);

					let signingKey = key.getPublicKey();
					return callback(null, signingKey);
				});
			}, (err: VerifyErrors | null, decoded: JwtPayload) => {
				if (err) {
					reject({ "error": err.message });
				} else {
					resolve(decoded);
				}
			})
		);
	}

	public async verifyAppleToken(token: string): Promise<{ [k: string]: any }> {
		try {
			let answer = await this.verifyToken(token);

			if (answer.iss !== AppleService.MAIN_iss) {
				answer["error"] = "unexpected issuer (iss claim): " + answer.iss;
			} else if (answer.aud !== this.appleClientId) {
				answer["error"] = "unexpected audience (aud claim): " + answer.aud;
			}

			return answer;
		} catch (error) {
			return {
				"error": error
			};
		}
	}

	public async validateReceipt(payload: string, transactionId: string): Promise<{
		success: boolean,
		productId?: string,
	}> {
		if (!this.appleClientId || !this.issuerId || !this.keyId || !this.p8Content) {
			return {
				success: false,
			}
		}

		let transactionInfoResponse = await this.getTransactionInfoAsync(transactionId, false);
		if (transactionInfoResponse.responesCode == 404 && this.sandboxEnable) {
			transactionInfoResponse = await this.getTransactionInfoAsync(transactionId, true);
		}

		if (transactionInfoResponse.responesCode == 200) {
			let signedTransactionInfoPayload: any;
			try {
				signedTransactionInfoPayload = jwt.decode(transactionInfoResponse.data.signedTransactionInfo);
			}
			catch (err) {
				Debug.log("[GN] error while validate apple receipt " + err.toString());
			}

			return {
				success: true,
				productId: signedTransactionInfoPayload.productId,
			}
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
	// 				'Content-Type': 'application/x-www-form-urlencoded'
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
	// 				'Content-Type': 'application/x-www-form-urlencoded'
	// 			},
	// 		});
	// 		answer = result.data;
	// 	} catch (error) {
	// 		answer["error"] = error;
	// 	}

	// 	return answer;
	// }

	public async getTransactionInfoAsync(transactionId: string, isSandbox: boolean) {
		let token = this.getToken();

		let url = isSandbox ? ("https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/" + transactionId)
			: ("https://api.storekit.itunes.apple.com/inApps/v1/transactions/" + transactionId);

		try {
			let result = await axios.get(url, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token
				},
			});

			return {
				responesCode: result.status,
				data: result.data,
			}
		} catch (error) {
			return {
				responesCode: -1,
				error: error
			}
		}
	}

	private getToken(): string {
		let now = Math.floor(Date.now() / 1000);

		// Create the payload
		let payload: JwtPayload = {
			iss: this.issuerId,
			iat: now,
			exp: now + 30 * 60,
			aud: 'appstoreconnect-v1',
			bid: this.appleClientId,
		};

		// Create the header
		let header: JwtHeader = {
			alg: 'ES256',
			kid: this.keyId,
			typ: 'JWT',
		};

		// Generate the token
		const token = jwt.sign(payload, this.p8Content, {
			algorithm: 'ES256',
			header: header,
		});

		return token;
	}
}
