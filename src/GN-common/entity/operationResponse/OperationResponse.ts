import { CodeHelper } from "./../../helper/CodeHelper";
import { ReturnCode } from "./../../constant/ReturnCode";
import { GNHashtable } from "./../../common/GNData";
import { InvalidMember } from "./../InvalidMember";

export class OperationResponse {
	private operationCode: string;
	private responseId: number;
	private returnCode: number;
	private debugMessage: string;
	private parameters: GNHashtable;

	private invalidMembers: InvalidMember[];

	constructor(operationCode: string, responseId: number) {
		this.operationCode = operationCode;
		this.responseId = responseId;
		this.parameters = new GNHashtable();
		this.debugMessage = null;
	}

	public getOperationCode(): string {
		return this.operationCode;
	}

	public getReturnCode(): number {
		return this.returnCode;
	}

	public getParameters(): GNHashtable {
		return this.parameters;
	}

	public getResponseId(): number {
		return this.responseId;
	}

	public getDebugMessage(): string {
		return this.debugMessage;
	}

	public getInvalidMembers(): InvalidMember[] {
		return this.invalidMembers;
	}

	public hasError(): boolean {
		return this.getReturnCode() != ReturnCode.Ok;
	}

	public setReturnCode(returnCode: number): OperationResponse {
		this.returnCode = returnCode;
		return this;
	}

	public setDebugMessage(debugMessage: string): OperationResponse {
		this.debugMessage = debugMessage;
		return this;
	}

	public setParameter(k: string, value: any): OperationResponse {
		this.parameters.add(k, value);
		return this;
	}

	public setParameters(parameters: GNHashtable): OperationResponse {
		this.parameters = parameters;
		return this;
	}

	public setInvalidMembers(invalidMembers: InvalidMember[]): OperationResponse {
		this.invalidMembers = invalidMembers;
		return this;
	}

	public toString(): string {
		let stringBuilder = "";

		stringBuilder += "OperationCode: " + this.operationCode + ", responseId: " + this.responseId + ", returnCode " + CodeHelper.getReturnCodeName(this.returnCode);

		if (this.returnCode == ReturnCode.Ok) stringBuilder += ", parameters " + JSON.stringify(this.parameters?.toData());
		else if (this.returnCode == ReturnCode.InvalidRequestParameters) {
			if (this.invalidMembers != null) {
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
