import { xRandom } from "./../../GN-library/xrandom/lib/xRandom";

export class StringUtility {
	private static readonly RandomCharacter: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";

	public static generateRandomString(length: number): string {
		let nameReturn = "";

		while (nameReturn.length < length) {
			nameReturn += StringUtility.RandomCharacter[xRandom.randomInt(0, StringUtility.RandomCharacter.length)];
		}

		return nameReturn;
	}

}
