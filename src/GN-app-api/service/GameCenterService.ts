import { GameCenterAuth, IGameCenterService } from "./IGameCenterService";
import axios from "axios";
import { createVerify } from "crypto";

export class GameCenterService implements IGameCenterService {
	private publicKeyCache: Map<string, string>;
	private bundleId: string;

	constructor() {
		this.publicKeyCache = new Map();
	}

	public init(request: { bundleId: string }) {
		this.bundleId = request.bundleId;
	}

	public async verifyToken(auth: GameCenterAuth): Promise<{ [k: string]: any; }> {
		let answer: { [k: string]: any } = {};
		try {
			let publicKey = await this.getCertificate(auth.publicKeyUrl);

			if (!this.concatSignatureAndVerify(publicKey, auth)) {
				answer["error"] = "verify_failed";
				answer["error_description"] = "can not verify";
			}
			else {
				answer["playerId"] = auth.playerId;
				answer["name"] = auth.name;
			}
		}
		catch (err) {
			answer["error"] = "verify_exception";
			answer["error_description"] = err.message;
		}

		return answer;
	}

	private concatSignatureAndVerify(publicKey: string, auth: GameCenterAuth): boolean {
		let verifier = createVerify("sha256");

		// ConcatSignature
		verifier.update(auth.playerId, "utf8");
		verifier.update(this.bundleId, "utf8");
		verifier.update(this.toBigEndian(auth.timestamp));
		verifier.update(auth.salt, "base64");

		return verifier.verify(publicKey, auth.signature, "base64");
	}

	private toBigEndian(value: number): Buffer {
		let buffer = Buffer.alloc(8);
		buffer.fill(0);

		let high = ~~(value / 0xffffffff);
		let low = value % (0xffffffff + 0x1);

		buffer.writeUInt32BE(parseInt(high as any, 10), 0);
		buffer.writeUInt32BE(parseInt(low as any, 10), 4);

		return buffer;
	}

	private async getCertificate(publicKeyUrl: string): Promise<string> {
		// validate for safe security
		this.validatePublicKeyUrl(publicKeyUrl);

		// get from cache if exists
		let publicKey = this.getPublicKeyFromCache(publicKeyUrl);
		// download newest if cache null
		if (!publicKey) publicKey = await this.downloadPublicKey(publicKeyUrl);

		return publicKey;
	}

	private validatePublicKeyUrl(publicKeyUrl: string): void {
		let url = new URL(publicKeyUrl);
		if (!url.host.endsWith(".apple.com")) {
			throw new Error("publicKeyUrl host must be apple.com");
		}

		if (url.protocol !== "https:") {
			throw new Error("publicKeyUrl protocol must https.")
		}
	}

	private getPublicKeyFromCache(publicKeyUrl: string): string | null | undefined {
		if (this.publicKeyCache.has(publicKeyUrl)) {
			return this.publicKeyCache.get(publicKeyUrl);
		}

		return null;
	}

	private convertX509CertToPEM(base64: string): string {
		let pemPreFix = "-----BEGIN CERTIFICATE-----\n";
		let pemPostFix = "-----END CERTIFICATE-----";

		let certBody = base64.match(/.{0,64}/g)?.join("\n");
		return pemPreFix + certBody + pemPostFix;
	}

	private async downloadPublicKey(publicKeyUrl: string): Promise<string> {
		let response = await axios.get(publicKeyUrl, {
			responseType: "arraybuffer",
		});

		if (response.status !== 200)
			throw new Error(`fetchPemFromUrl failed: statusCode: ${response.status}, statusText: ${response.statusText}`)

		let buffer: Buffer = response.data;

		let publicKey = this.convertX509CertToPEM(buffer.toString("base64"));

		// check reponse has cache header to save cache timer 
		let cacheHeader = response.headers["cache-control"];
		if (cacheHeader) {
			const maxAgeSec = cacheHeader.match(/max-age=([0-9]+)/);

			// default cache timer is 5000
			let marginMs = 5000;
			let parsed = (typeof maxAgeSec?.[1] === "string") ? parseInt(maxAgeSec[1], 10) * 1000 - marginMs : 0;
			if (parsed > 0) {
				this.publicKeyCache.set(publicKeyUrl, publicKey);

				// auto set expired the cache entry later, as per max-age
				setTimeout(() => this.publicKeyCache.delete(publicKeyUrl), parsed).unref();
			}
		}

		return publicKey;
	}

}
