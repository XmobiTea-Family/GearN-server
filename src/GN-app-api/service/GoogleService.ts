const MAIN_iss = "https://securetoken.google.com/";
const pubKeyUrl = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const RS256 = "RS256";

import { IGoogleService } from "./IGoogleService";
import jwt, { Jwt, JwtPayload } from 'jsonwebtoken';
import axios from "axios";

export class GoogleService implements IGoogleService {
    private pubKeys: string[];
	private firebaseProductId: string;

	public setFirebaseProductId(firebaseProductId: string): void {
		this.firebaseProductId = firebaseProductId;
	}

    public async verifyGoogleToken(accessToken: string): Promise<{ [k: string]: any }> {
        let answer: { [k: string]: any } = {};

        try {
            let jwtFull = jwt.decode(accessToken, { complete: true }) as Jwt;
            let header = jwtFull.header;
            let decoded = jwtFull.payload as JwtPayload;

            if (header.alg !== RS256) {
                answer["error"] = "unexpected alg (alg claim): " + header.alg;
            }
            else if (this.pubKeys.indexOf(header.kid) == -1) {
                answer["error"] = "unexpected kid (kid claim): " + header.kid;
            }
            else if (decoded.iss !== MAIN_iss + this.firebaseProductId) {
                answer["error"] = "unexpected issuer (iss claim): " + decoded.iss;
            }
            else if (decoded.aud !== this.firebaseProductId) {
                answer["error"] = "unexpected audience (aud claim): " + decoded.aud;
            }
            else {
                answer = decoded;
            }
        }
        catch (err) {
            answer["error"] = err;
        }

        return answer;
    }

    constructor() {
        this.pubKeys = [];
        this.reloadPubKey();

        setInterval(() => {
            this.reloadPubKey();
        }, 1000 * 60 * 60 * 12);
    }

    private async reloadPubKey(): Promise<void> {
        try {
            let result = await axios.get(pubKeyUrl);

            let data = result.data;
            
            let keys = Object.keys(data);

            this.pubKeys.length = 0;
            for (let i = 0; i < keys.length; i++) {
                this.pubKeys.push(keys[i]);
            }
        } catch (error) {
            console.log(error);

            setTimeout(() => {
                this.reloadPubKey();
            }, 5000);
        }
    }
}
