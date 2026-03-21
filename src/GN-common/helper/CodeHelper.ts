import { SecretRole } from "./../entity/SecretInfo";
import { RequestRole } from "./../constant/enumType/RequestRole";
import { RequestType } from "./../constant/enumType/RequestType";
import { ReturnCode } from "./../constant/ReturnCode";

class CodeHelperBase {
	// Stores the unknown code value used by this instance.
	private static readonly unknownCode = "Unknown";

	// Stores the code dict collection used by this instance.
	codeDict: Map<number, string>;

	/**
	 * Returns the code name.
	 * @param code Provides the code value used by this operation.
	 * @returns Returns the code name.
	 */
	public getCodeName(code: number): string {
		return this.codeDict.has(code) ? this.codeDict.get(code) : (CodeHelperBase.unknownCode + " (" + code + ")");
	}

	/**
	 * Initializes a new code helper base instance.
	 * @param codeDict Provides the code dict value used by this operation.
	 */
	constructor(codeDict: Map<number, string>) {
		this.codeDict = codeDict;
	}
}

export class CodeHelper {
	// Stores the return code helper value used by this instance.
	private static returnCodeHelper: CodeHelperBase;
	// Stores the request type helper value used by this instance.
	private static requestTypeHelper: CodeHelperBase;
	// Stores the request role helper value used by this instance.
	private static requestRoleHelper: CodeHelperBase;
	// Stores the secret role helper value used by this instance.
	private static secretRoleHelper: CodeHelperBase;

	/**
	 * Returns the return code name.
	 * @param returnCode Provides the return code value used by this operation.
	 * @returns Returns the return code name.
	 */
	public static getReturnCodeName(returnCode: number): string {
		return CodeHelper.returnCodeHelper.getCodeName(returnCode);
	}

	/**
	 * Returns the request type name.
	 * @param requestType Provides the request type value used by this operation.
	 * @returns Returns the request type name.
	 */
	public static getRequestTypeName(requestType: number): string {
		return CodeHelper.requestTypeHelper.getCodeName(requestType);
	}

	/**
	 * Returns the request role name.
	 * @param requestRole Provides the request role value used by this operation.
	 * @returns Returns the request role name.
	 */
	public static getRequestRoleName(requestRole: number): string {
		return CodeHelper.requestRoleHelper.getCodeName(requestRole);
	}

	/**
	 * Returns the secret role name.
	 * @param secretRole Provides the secret role value used by this operation.
	 * @returns Returns the secret role name.
	 */
	public static getSecretRoleName(secretRole: number): string {
		return CodeHelper.secretRoleHelper.getCodeName(secretRole);
	}

	/**
	 * Executes the init workflow.
	 */
	static init(): void {
		this.setReturnCodeDic();
		this.setRequestTypeDic();
		this.setRequestRoleDic();
		this.setSecretRoleDic();
	}

	/**
	 * Sets the return code dictionary.
	 */
	private static setReturnCodeDic(): void {
		this.returnCodeHelper = new CodeHelperBase(new Map());

		this.addReturnCodeDic(ReturnCode);
	}

	/**
	 * Adds the return code dictionary.
	 * @param returnCode Provides the return code value used by this operation.
	 */
	public static addReturnCodeDic(returnCode: any): void {
		// Stores the keys value used in the current execution flow.
		let keys = Object.keys(returnCode) as Array<string>;
		// Stores the values value used in the current execution flow.
		let values = Object.values(returnCode) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			this.returnCodeHelper.codeDict.set(values[i], keys[i]);
		}
	}

	/**
	 * Sets the request type dictionary.
	 */
	private static setRequestTypeDic(): void {
		this.requestTypeHelper = new CodeHelperBase(new Map());

		this.addRequestTypeDic(RequestType);
	}

	/**
	 * Adds the request type dictionary.
	 * @param requestType Provides the request type value used by this operation.
	 */
	public static addRequestTypeDic(requestType: any): void {
		// Stores the keys value used in the current execution flow.
		let keys = Object.keys(requestType) as Array<string>;
		// Stores the values value used in the current execution flow.
		let values = Object.values(requestType) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			// Stores the key value used in the current execution flow.
			let key = keys[i];
			this.requestTypeHelper.codeDict.set(values[i], key[0].toLowerCase() + key.slice(1));
		}
	}

	/**
	 * Sets the request role dictionary.
	 */
	private static setRequestRoleDic(): void {
		this.requestRoleHelper = new CodeHelperBase(new Map());

		this.addRequestRoleDic(RequestRole);
	}

	/**
	 * Adds the request role dictionary.
	 * @param requestRole Provides the request role value used by this operation.
	 */
	public static addRequestRoleDic(requestRole: any): void {
		// Stores the keys value used in the current execution flow.
		let keys = Object.keys(requestRole) as Array<string>;
		// Stores the values value used in the current execution flow.
		let values = Object.values(requestRole) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			// Stores the key value used in the current execution flow.
			let key = keys[i];
			this.requestRoleHelper.codeDict.set(values[i], key[0].toLowerCase() + key.slice(1));
		}
	}

	/**
	 * Sets the secret role dictionary.
	 */
	private static setSecretRoleDic(): void {
		this.secretRoleHelper = new CodeHelperBase(new Map());

		this.addSecretRoleDic(SecretRole);
	}

	/**
	 * Adds the secret role dictionary.
	 * @param secretRole Provides the secret role value used by this operation.
	 */
	public static addSecretRoleDic(secretRole: any): void {
		// Stores the keys value used in the current execution flow.
		let keys = Object.keys(secretRole) as Array<string>;
		// Stores the values value used in the current execution flow.
		let values = Object.values(secretRole) as Array<number>;

		for (let i = 0; i < keys.length; i++) {
			// Stores the key value used in the current execution flow.
			let key = keys[i];
			this.secretRoleHelper.codeDict.set(values[i], key[0].toLowerCase() + key.slice(1));
		}
	}

}
