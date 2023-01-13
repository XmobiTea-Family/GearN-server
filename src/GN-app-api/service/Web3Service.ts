const MAX_RANDOM_MESSAGE_COUNT = 100;

import { IWeb3Service } from "./IWeb3Service";
import Web3 from "web3";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { Md5Generate } from "./../../GN-common/helper/Md5Generate";
import { DisplayNameUltils } from "./../../GN-common/helper/DisplayNameUltils";
import { xRandom } from "./../../GN-library/xrandom/lib/xRandom";
const web3Instance = new Web3();

const randomMessages: string[] = [];
generateRandomMessage();

function generateRandomMessage() {
    for (let i = 0; i < MAX_RANDOM_MESSAGE_COUNT; i++) {
        let name = DisplayNameUltils.generateRandomString(50);
        let md5 = Md5Generate.getMd5(name);
        randomMessages.push(name + md5);
    }

}

export class Web3Service implements IWeb3Service {
    public getPublicAddress(message: string, signature: string): string {
        try {
            return web3Instance.eth.accounts.recover(message, signature);
        } catch (err) {
            Debug.logException(err);
            return "";
        }
    }

    public isMatch(message: string): boolean {
        return randomMessages.indexOf(message) != -1
    }

    public getRandomMessage(): string {
        return randomMessages[xRandom.randomInt(0, randomMessages.length)];
    }

}