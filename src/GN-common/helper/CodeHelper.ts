import { SecretRole } from "./../entity/SecretInfo";
import { RequestRole } from "./../constant/enumType/RequestRole";
import { RequestType } from "./../constant/enumType/RequestType";
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
	private static requestTypeHelper: CodeHelperBase;
	private static requestRoleHelper: CodeHelperBase;
	private static secretRoleHelper: CodeHelperBase;

	public static getReturnCodeName(returnCode: number): string {
		return CodeHelper.returnCodeHelper.getCodeName(returnCode);
	}

	public static getRequestTypeName(requestType: number): string {
		return CodeHelper.requestTypeHelper.getCodeName(requestType);
	}

	public static getRequestRoleName(requestRole: number): string {
		return CodeHelper.requestRoleHelper.getCodeName(requestRole);
	}

	public static getSecretRoleName(secretRole: number): string {
		return CodeHelper.secretRoleHelper.getCodeName(secretRole);
	}

	static init(): void {
		this.setReturnCodeDic();
		this.setRequestTypeDic();
		this.setRequestRoleDic();
		this.setSecretRoleDic();
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

	private static setRequestTypeDic(): void {
		this.requestTypeHelper = new CodeHelperBase(new Map());

		this.addRequestTypeDic(RequestType);
	}

	public static addRequestTypeDic(requestType: any): void {
		let keys = Object.keys(requestType) as Array<string>;
		let values = Object.values(requestType) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			this.requestTypeHelper.codeDict.set(values[i], key[0].toLowerCase() + key.slice(1));
		}
	}

	private static setRequestRoleDic(): void {
		this.requestRoleHelper = new CodeHelperBase(new Map());

		this.addRequestRoleDic(RequestRole);
	}

	public static addRequestRoleDic(requestRole: any): void {
		let keys = Object.keys(requestRole) as Array<string>;
		let values = Object.values(requestRole) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			this.requestRoleHelper.codeDict.set(values[i], key[0].toLowerCase() + key.slice(1));
		}
	}

	private static setSecretRoleDic(): void {
		this.secretRoleHelper = new CodeHelperBase(new Map());

		this.addSecretRoleDic(SecretRole);
	}

	public static addSecretRoleDic(secretRole: any): void {
		let keys = Object.keys(secretRole) as Array<string>;
		let values = Object.values(secretRole) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			this.secretRoleHelper.codeDict.set(values[i], key[0].toLowerCase() + key.slice(1));
		}
	}

}
