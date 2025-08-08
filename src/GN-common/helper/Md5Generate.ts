import { createHash } from "crypto";

export class Md5Generate {

	public static getMd5(input: string): string {
		return createHash("md5").update(input).digest("hex");
	}

}
