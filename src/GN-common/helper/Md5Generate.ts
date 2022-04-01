import md5 from "md5";

export class Md5Generate {
	public static getMd5(input: string): string {
		return md5(input);
	}
}
