const MAIN_iss = "https://appleid.apple.com";
const MAIN_iss_auth_keys = "https://appleid.apple.com/auth/keys";

import jwt, { JwtHeader, SigningKeyCallback, JwtPayload, VerifyErrors, Jwt } from "jsonwebtoken";
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
					reject({"error": err.message});
				} else {
					resolve(decoded);
				}
			})
		);
	}

	public async verifyAppleToken(token: string): Promise<{ [k: string]: any }> {
		try {
			let answer = await this.verifyToken(token);

			if (answer.iss !== MAIN_iss) {
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
}
