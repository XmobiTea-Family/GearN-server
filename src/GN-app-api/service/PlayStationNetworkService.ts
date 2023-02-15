import jwt, { JwtHeader, VerifyErrors } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { IPlayStationNetworkService } from "./IPlayStationNetworkService";

export class PlayStationNetworkService implements IPlayStationNetworkService {
    private static readonly MAIN_iss: string = "https://auth.api.sonyentertainmentnetwork.com";
    private static readonly MAIN_iss_auth_keys: string = "https://auth.api.sonyentertainmentnetwork.com/2.0/jwks";

    private client: jwksClient.JwksClient;
    private appleClientId: string;

    constructor() {
        this.client = jwksClient({
            jwksUri: PlayStationNetworkService.MAIN_iss_auth_keys,
        });
    }

    public init(): void {

    }

    private getSigningKey(header: JwtHeader): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!header.kid) {
                return reject(new Error("No KID in token header"));
            }

            this.client.getSigningKey(header.kid, (err, key) => {
                if (err) {
                    return reject(err);
                }

                const signingKey = key.getPublicKey(); // hoặc key.rsaPublicKey
                resolve(signingKey);
            });
        });
    }

    private async verifyToken(token: string): Promise<{ [k: string]: any }> {
        try {
            const signingKey = await this.getSigningKey(jwt.decode(token, { complete: true })?.header as JwtHeader);

            return new Promise((resolve, reject) =>
                jwt.verify(token, signingKey, (err: VerifyErrors | null, decoded: any) => {
                    if (err) {
                        return reject({ error: err.message });
                    }
                    return resolve(decoded);
                })
            );
        } catch (error) {
            return { error: error.message };
        }
    }

    public async verifyPSNToken(token: string): Promise<{ [k: string]: any }> {
        try {
            let answer = await this.verifyToken(token);

            if (answer.iss !== PlayStationNetworkService.MAIN_iss) {
                answer["error"] = "unexpected issuer (iss claim): " + answer.iss;
            } else if (answer.aud !== this.appleClientId) {
                answer["error"] = "unexpected audience (aud claim): " + answer.aud;
            } else {
                let now = Math.floor(Date.now() / 1000); // thời gian hiện tại (epoch seconds)

                if (answer.exp && answer.exp < now) {
                    answer["error"] = "token expired at " + new Date(answer.exp * 1000).toISOString();
                } else if (answer.iat && answer.iat > now + 10) {
                    answer["error"] = "token issued in the future: " + new Date(answer.iat * 1000).toISOString();
                }
            }

            return answer;  // { iss: string, sub: string, online_id: string, iat: number, exp: number }
        } catch (error) {
            return {
                "error": error
            };
        }
    }

}
