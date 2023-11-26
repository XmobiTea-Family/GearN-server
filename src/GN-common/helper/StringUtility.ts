import { xRandom } from "./../../GN-library/xrandom/lib/xRandom";

export class StringUtility {
	private static readonly RandomCharacter: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

	public static generateRandomString(length: number, idTypeCase: number): string {
		let nameReturn = "";

		while (nameReturn.length < length) {
			nameReturn += StringUtility.RandomCharacter[xRandom.randomInt(0, StringUtility.RandomCharacter.length)];
		}

		if (idTypeCase) {
			if (idTypeCase == 1) nameReturn = nameReturn.toUpperCase();
			else nameReturn = nameReturn.toLowerCase();
		}

		return nameReturn;
	}

}
