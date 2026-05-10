import jwt, { JwtHeader, VerifyErrors } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { IPlayStationNetworkService } from "./IPlayStationNetworkService";

export class PlayStationNetworkService implements IPlayStationNetworkService {
    // Stores the MAIN iss value used by this instance.
    private static readonly MAIN_iss: string = "https://auth.api.sonyentertainmentnetwork.com";
    // Stores the MAIN iss auth keys value used by this instance.
    private static readonly MAIN_iss_auth_keys: string = "https://auth.api.sonyentertainmentnetwork.com/2.0/jwks";

    // Stores the client value used by this instance.
    private client: jwksClient.JwksClient;
    // Stores the apple client ID value used by this instance.
    private appleClientId: string;

    /**
     * Initializes a new play station network service instance.
     */
    constructor() {
        this.client = jwksClient({
            jwksUri: PlayStationNetworkService.MAIN_iss_auth_keys,
        });
    }

    /**
     * Executes the init workflow.
     */
    public init(): void {}

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
     * Executes the verify PSN token workflow asynchronously.
     * @param token Provides the token value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async verifyPSNToken(token: string): Promise<{ [k: string]: any }> {
        try {
            // Stores the answer value used in the current execution flow.
            let answer = await this.verifyToken(token);

            if (answer.iss !== PlayStationNetworkService.MAIN_iss) {
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

            return answer; // { iss: string, sub: string, online_id: string, iat: number, exp: number }
        } catch (error) {
            return {
                error: error,
            };
        }
    }
}
