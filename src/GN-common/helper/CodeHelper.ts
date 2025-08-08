import { ReturnCode } from "./../constant/ReturnCode";

class CodeHelperBase {
	private static readonly unknownCode = "Unknown";

	codeDict: Map<number, string>;

	public getCodeName(code: number): string {
		return this.codeDict.has(code) ? this.codeDict.get(code) : (CodeHelperBase.unknownCode + " (" + code + ")");
	}

	constructor(codeDict: Map<number, string>) {
		this.codeDict = codeDict;
	}
}

export class CodeHelper {
	private static returnCodeHelper: CodeHelperBase;

	public static getReturnCodeName(returnCode: number): string {
		return CodeHelper.returnCodeHelper.getCodeName(returnCode);
	}

	static init(): void {
		this.setReturnCodeDic();
	}

	private static setReturnCodeDic(): void {
		this.returnCodeHelper = new CodeHelperBase(new Map());

		this.addReturnCodeDic(ReturnCode);
	}

	public static addReturnCodeDic(returnCode: any): void {
		let keys = Object.keys(returnCode) as Array<string>;
		let values = Object.values(returnCode) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			this.returnCodeHelper.codeDict.set(values[i], keys[i]);
		}
	}

}
