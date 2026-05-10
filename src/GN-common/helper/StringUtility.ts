import { xRandom } from "./../../GN-library/xrandom/lib/xRandom";

export class StringUtility {
    // Stores the random character with number value used by this instance.
    private static readonly RandomCharacterWithNumber: string = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    // Stores the random character value used by this instance.
    private static readonly RandomCharacter: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    // 0 all
    // 1 all uppercase
    // 2 all lowercase
    // 3 string uppercase
    // 4 string lowercase
    public static generateRandomString(length: number, idTypeCase: number): string {
        // Stores the name return value used in the current execution flow.
        let nameReturn = "";

        if (idTypeCase > 2) {
            while (nameReturn.length < length) {
                nameReturn += StringUtility.RandomCharacter[xRandom.randomInt(0, StringUtility.RandomCharacter.length)];
            }

            if (idTypeCase == 3) nameReturn = nameReturn.toUpperCase();
            else if (idTypeCase == 4) nameReturn = nameReturn.toLowerCase();
        } else {
            while (nameReturn.length < length) {
                nameReturn += StringUtility.RandomCharacterWithNumber[xRandom.randomInt(0, StringUtility.RandomCharacterWithNumber.length)];
            }

            if (idTypeCase == 1) nameReturn = nameReturn.toUpperCase();
            else if (idTypeCase == 2) nameReturn = nameReturn.toLowerCase();
        }

        return nameReturn;
    }
}
