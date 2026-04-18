import { GameCenterAuth, IGameCenterService } from "./IGameCenterService";
import axios from "axios";
import { createVerify } from "crypto";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class GameCenterService implements IGameCenterService {
	private static readonly maxTimestampAgeMs: number = 5 * 60 * 1000;
	private static readonly maxTimestampFutureMs: number = 30 * 1000;
	private static readonly replayCacheExpireMs: number = GameCenterService.maxTimestampAgeMs + GameCenterService.maxTimestampFutureMs;

	// Stores the public key cache collection used by this instance.
	private publicKeyCache: Map<string, string>;
	// Stores the replay auth cache collection used by this instance.
	private replayAuthCache: Map<string, boolean>;
	// Stores the bundle ID value used by this instance.
	private bundleId: string;

	/**
	 * Initializes a new game center service instance.
	 */
	constructor() {
		this.publicKeyCache = new Map();
		this.replayAuthCache = new Map();
	}

	/**
	 * Executes the init workflow.
	 * @param request Provides the request value used by this operation.
	 */
	public init(request: { bundleId: string }) {
		this.bundleId = request.bundleId;
	}

	/**
	 * Executes the verify token workflow asynchronously.
	 * @param auth Provides the auth value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async verifyToken(auth: GameCenterAuth): Promise<{ [k: string]: any; }> {
		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: any } = {};
		try {
			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			if (!Number.isInteger(auth.timestamp) || auth.timestamp <= 0) {
				answer["error"] = "verify_failed";
				answer["error_description"] = "timestamp invalid";
				return answer;
			}

			if (auth.timestamp < currentMilliseconds - GameCenterService.maxTimestampAgeMs) {
				answer["error"] = "verify_failed";
				answer["error_description"] = "timestamp too old";
				return answer;
			}

			if (auth.timestamp > currentMilliseconds + GameCenterService.maxTimestampFutureMs) {
				answer["error"] = "verify_failed";
				answer["error_description"] = "timestamp too new";
				return answer;
			}

			// Stores the replay key value used in the current execution flow.
			let replayKey = auth.playerId + ":" + auth.timestamp + ":" + auth.salt;
			if (this.replayAuthCache.has(replayKey)) {
				answer["error"] = "verify_failed";
				answer["error_description"] = "request replayed";
				return answer;
			}

			// Stores the public key value used in the current execution flow.
			let publicKey = await this.getCertificate(auth.publicKeyUrl);

			if (!this.concatSignatureAndVerify(publicKey, auth)) {
				answer["error"] = "verify_failed";
				answer["error_description"] = "can not verify";
			}
			else {
				this.replayAuthCache.set(replayKey, true);
				setTimeout(() => this.replayAuthCache.delete(replayKey), GameCenterService.replayCacheExpireMs).unref();

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

	/**
	 * Executes the concat signature and verify workflow.
	 * @param publicKey Provides the public key value used by this operation.
	 * @param auth Provides the auth value used by this operation.
	 * @returns Returns the operation result.
	 */
	private concatSignatureAndVerify(publicKey: string, auth: GameCenterAuth): boolean {
		// Stores the verifier value used in the current execution flow.
		let verifier = createVerify("sha256");

		// ConcatSignature
		verifier.update(auth.playerId, "utf8");
		verifier.update(this.bundleId, "utf8");
		verifier.update(this.toBigEndian(auth.timestamp));
		verifier.update(auth.salt, "base64");

		return verifier.verify(publicKey, auth.signature, "base64");
	}

	/**
	 * Executes the to big endian workflow.
	 * @param value Provides the value value used by this operation.
	 * @returns Returns the operation result.
	 */
	private toBigEndian(value: number): Buffer {
		// Stores the buffer value used in the current execution flow.
		let buffer = Buffer.alloc(8);
		buffer.fill(0);

		// Stores the high value used in the current execution flow.
		let high = ~~(value / 0xffffffff);
		// Stores the low value used in the current execution flow.
		let low = value % (0xffffffff + 0x1);

		buffer.writeUInt32BE(parseInt(high as any, 10), 0);
		buffer.writeUInt32BE(parseInt(low as any, 10), 4);

		return buffer;
	}

	/**
	 * Returns the certificate.
	 * @param publicKeyUrl Provides the public key URL value used by this operation.
	 * @returns Returns the certificate.
	 */
	private async getCertificate(publicKeyUrl: string): Promise<string> {
		// validate for safe security
		this.validatePublicKeyUrl(publicKeyUrl);

		// get from cache if exists
		let publicKey = this.getPublicKeyFromCache(publicKeyUrl);
		// download newest if cache null
		if (!publicKey) publicKey = await this.downloadPublicKey(publicKeyUrl);

		return publicKey;
	}

	/**
	 * Validates the public key URL.
	 * @param publicKeyUrl Provides the public key URL value used by this operation.
	 */
	private validatePublicKeyUrl(publicKeyUrl: string): void {
		// Stores the URL value used in the current execution flow.
		let url = new URL(publicKeyUrl);
		if (!url.host.endsWith(".apple.com")) {
			throw new Error("publicKeyUrl host must be apple.com");
		}

		if (url.protocol !== "https:") {
			throw new Error("publicKeyUrl protocol must https.")
		}
	}

	/**
	 * Returns the public key from cache.
	 * @param publicKeyUrl Provides the public key URL value used by this operation.
	 * @returns Returns the public key from cache.
	 */
	private getPublicKeyFromCache(publicKeyUrl: string): string | null | undefined {
		if (this.publicKeyCache.has(publicKeyUrl)) {
			return this.publicKeyCache.get(publicKeyUrl);
		}

		return null;
	}

	/**
	 * Converts the x 509 cert to PEM.
	 * @param base64 Provides the base 64 value used by this operation.
	 * @returns Returns the operation result.
	 */
	private convertX509CertToPEM(base64: string): string {
		// Stores the pem pre fix value used in the current execution flow.
		let pemPreFix = "-----BEGIN CERTIFICATE-----\n";
		// Stores the pem post fix value used in the current execution flow.
		let pemPostFix = "-----END CERTIFICATE-----";

		// Stores the cert body value used in the current execution flow.
		let certBody = base64.match(/.{0,64}/g)?.join("\n");
		return pemPreFix + certBody + pemPostFix;
	}

	/**
	 * Executes the download public key workflow asynchronously.
	 * @param publicKeyUrl Provides the public key URL value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async downloadPublicKey(publicKeyUrl: string): Promise<string> {
		// Stores the response value used in the current execution flow.
		let response = await axios.get(publicKeyUrl, {
			responseType: "arraybuffer",
		});

		if (response.status !== 200)
			throw new Error(`fetchPemFromUrl failed: statusCode: ${response.status}, statusText: ${response.statusText}`)

		// Stores the buffer value used in the current execution flow.
		let buffer: Buffer = response.data;

		// Stores the public key value used in the current execution flow.
		let publicKey = this.convertX509CertToPEM(buffer.toString("base64"));

		// check reponse has cache header to save cache timer 
		let cacheHeader = response.headers["cache-control"];
		if (cacheHeader) {
			// Stores the max age sec value used in the current execution flow.
			const maxAgeSec = cacheHeader.match(/max-age=([0-9]+)/);

			// default cache timer is 5000
			let marginMs = 5000;
			// Stores the parsed value used in the current execution flow.
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
