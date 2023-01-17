import { EventCode } from "./../constant/EventCode";
import { OperationCode } from "./../constant/OperationCode";
import { ReturnCode } from "./../constant/ReturnCode";

export class CodeHelper {
    private static readonly UnknownCode = "Unknown";

    private static operationCodeDic: { [k: number]: string };
    private static eventCodeDic: { [k: number]: string };
    private static returnCodeDic: { [k: number]: string };

    public static getOperationCodeName(operationCode: number): string {
        let operationCodeName = this.operationCodeDic[operationCode];
        return operationCodeName ? operationCodeName : this.UnknownCode;
    }

    public static getEventCodeName(eventCode: number): string {
        let eventCodeName = this.eventCodeDic[eventCode];
        return eventCodeName ? eventCodeName : this.UnknownCode;
    }

    public static getReturnCodeName(returnCode: number): string {
        let returnCodeName = this.returnCodeDic[returnCode];
        return returnCodeName ? returnCodeName : this.UnknownCode;
    }

    static init(): void {
        this.setOperationCodeDic();
        this.setEventCodeDic();
        this.setReturnCodeDic();
    }

    private static setOperationCodeDic(): void {
        this.operationCodeDic = {};

        this.addOperationCodeDic(OperationCode);
    }

    public static addOperationCodeDic(operationCode: any): void {
        let keys = Object.keys(operationCode) as Array<string>;
        let values = Object.values(operationCode) as Array<number>;

        for (let i = 0; i < keys.length; i++) {
            this.operationCodeDic[values[i]] = keys[i];
        }
    }

    private static setEventCodeDic(): void {
        this.eventCodeDic = {};

        this.addEventCodeDic(EventCode);
    }

    public static addEventCodeDic(eventCode: any): void {
        let keys = Object.keys(eventCode) as Array<string>;
        let values = Object.values(eventCode) as Array<number>;

        for (let i = 0; i < keys.length; i++) {
            this.eventCodeDic[values[i]] = keys[i];
        }
    }

    private static setReturnCodeDic(): void {
        this.returnCodeDic = {};

        this.addReturnCodeDic(ReturnCode);
    }

    public static addReturnCodeDic(returnCode: any): void {
        let keys = Object.keys(returnCode) as Array<string>;
        let values = Object.values(returnCode) as Array<number>;

        for (let i = 0; i < keys.length; i++) {
            this.returnCodeDic[values[i]] = keys[i];
        }
    }

}
