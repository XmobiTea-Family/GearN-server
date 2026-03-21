import { CodeHelper } from "./../../helper/CodeHelper";
import { ReturnCode } from "./../../constant/ReturnCode";
import { GNHashtable } from "./../../common/GNData";
import { InvalidMember } from "./../InvalidMember";

export class OperationResponse {
	// Stores the operation code value used by this instance.
	private operationCode: string;
	// Stores the response ID value used by this instance.
	private responseId: number;
	// Stores the return code value used by this instance.
	private returnCode: number;
	// Stores the debug message value used by this instance.
	private debugMessage: string;
	// Stores the parameters value used by this instance.
	private parameters: GNHashtable;

	// Stores the invalid members list used by this instance.
	private invalidMembers: InvalidMember[];

	/**
	 * Initializes a new operation response instance.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 */
	constructor(operationCode: string, responseId: number) {
		this.operationCode = operationCode;
		this.responseId = responseId;
		this.parameters = new GNHashtable();
		this.debugMessage = null;
	}

	/**
	 * Returns the operation code.
	 * @returns Returns the operation code.
	 */
	public getOperationCode(): string {
		return this.operationCode;
	}

	/**
	 * Returns the return code.
	 * @returns Returns the return code.
	 */
	public getReturnCode(): number {
		return this.returnCode;
	}

	/**
	 * Returns the parameters.
	 * @returns Returns the parameters.
	 */
	public getParameters(): GNHashtable {
		return this.parameters;
	}

	/**
	 * Returns the response ID.
	 * @returns Returns the response ID.
	 */
	public getResponseId(): number {
		return this.responseId;
	}

	/**
	 * Returns the debug message.
	 * @returns Returns the debug message.
	 */
	public getDebugMessage(): string {
		return this.debugMessage;
	}

	/**
	 * Returns the invalid members.
	 * @returns Returns the invalid members.
	 */
	public getInvalidMembers(): InvalidMember[] {
		return this.invalidMembers;
	}

	/**
	 * Checks whether error exists.
	 * @returns Returns the operation result.
	 */
	public hasError(): boolean {
		return this.getReturnCode() != ReturnCode.Ok;
	}

	/**
	 * Sets the return code.
	 * @param returnCode Provides the return code value used by this operation.
	 * @returns Returns the current operation response instance.
	 */
	public setReturnCode(returnCode: number): OperationResponse {
		this.returnCode = returnCode;
		return this;
	}

	/**
	 * Sets the debug message.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the current operation response instance.
	 */
	public setDebugMessage(debugMessage: string): OperationResponse {
		this.debugMessage = debugMessage;
		return this;
	}

	/**
	 * Sets the parameter.
	 * @param k Provides the k value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @returns Returns the current operation response instance.
	 */
	public setParameter(k: string, value: any): OperationResponse {
		this.parameters.add(k, value);
		return this;
	}

	/**
	 * Sets the parameters.
	 * @param parameters Provides the parameters value used by this operation.
	 * @returns Returns the current operation response instance.
	 */
	public setParameters(parameters: GNHashtable): OperationResponse {
		this.parameters = parameters;
		return this;
	}

	/**
	 * Sets the invalid members.
	 * @param invalidMembers Provides the invalid members value used by this operation.
	 * @returns Returns the current operation response instance.
	 */
	public setInvalidMembers(invalidMembers: InvalidMember[]): OperationResponse {
		this.invalidMembers = invalidMembers;
		return this;
	}

	/**
	 * Executes the to string workflow.
	 * @returns Returns the operation result.
	 */
	public toString(): string {
		// Stores the string builder value used in the current execution flow.
		let stringBuilder = "";

		stringBuilder += "OperationCode: " + this.operationCode + ", responseId: " + this.responseId + ", returnCode " + CodeHelper.getReturnCodeName(this.returnCode);

		if (this.returnCode == ReturnCode.Ok) stringBuilder += ", parameters " + JSON.stringify(this.parameters?.toData());
		else if (this.returnCode == ReturnCode.InvalidRequestParameters) {
			if (this.invalidMembers != null) {
				// Stores the invalid str value used in the current execution flow.
				let invalidStr = "";

				this.invalidMembers.forEach(invalidMember => {
					invalidStr += invalidMember;
				});
				stringBuilder += ", invalidMembers " + invalidStr;
			}
			else stringBuilder += ", invalidMembers " + this.invalidMembers;
		}
		else stringBuilder += ", debugMessage " + (this.debugMessage ?? "");

		return stringBuilder;
	}

}
