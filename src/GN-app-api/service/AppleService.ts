const MAIN_iss = "https://appleid.apple.com";
const MAIN_iss_auth_keys = "https://appleid.apple.com/auth/keys";

import jwt, { JwtHeader, SigningKeyCallback, JwtPayload, VerifyErrors } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { IAppleService } from "./IAppleService";

export class AppleService implements IAppleService {
	private client: jwksClient.JwksClient;
	private appleClientId: string;

	constructor() {
		this.client = jwksClient({
			jwksUri: MAIN_iss_auth_keys,
		});
	}

	public setAppleClientId(appleClientId: string): void {
		this.appleClientId = appleClientId;
	}

	public async verifyAppleToken(token: string): Promise<{ [k: string]: any }> {
		let answer: { [k: string]: any } = {};

		try {
			await jwt.verify(token, this.getApplePublicKey, null, (err: VerifyErrors | null, decoded: JwtPayload) => {
				if (err) {
					answer["error"] = err;
				} else {
					if (decoded.iss !== MAIN_iss) {
						answer["error"] = "unexpected issuer (iss claim): " + decoded.iss;
					} else if (decoded.aud !== this.appleClientId) {
						answer["error"] = "unexpected audience (aud claim): " + decoded.aud;
					} else {
						answer = decoded;
					}
				}
			});
		} catch (error) {
			answer["error"] = error;
		}

		return answer;
	}

	private getApplePublicKey(header: JwtHeader, callback: SigningKeyCallback) {
		this.client.getSigningKey(header.kid, (err: Error, key: jwksClient.SigningKey) => {
			if (err) return callback(err, null);

			let signingKey = key.getPublicKey();
			return callback(null, signingKey);
		});
	}
}
