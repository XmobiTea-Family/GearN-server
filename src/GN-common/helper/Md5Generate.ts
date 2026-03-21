import { createHash } from "crypto";

export class Md5Generate {

	/**
	 * Returns the md 5.
	 * @param input Provides the input value used by this operation.
	 * @returns Returns the md 5.
	 */
	public static getMd5(input: string): string {
		return createHash("md5").update(input).digest("hex");
	}

}
