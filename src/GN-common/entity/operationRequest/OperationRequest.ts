import { CodeHelper } from "./../../helper/CodeHelper";
import { GNHashtable } from "./../../common/GNData";

export class OperationRequest {
	private isValid: boolean;

	public isValidRequest(): boolean {
		return this.isValid;
	}

	private operationCode: string;
	private requestId: number;
	private parameters: GNHashtable;
	private encrypted: boolean;

	constructor(operationCode: string, encrypted: boolean) {
		this.operationCode = operationCode;
		this.encrypted = encrypted;
	}

	public getOperationCode(): string {
		return this.operationCode;
	}

	public getRequestId(): number {
		return this.requestId;
	}

	public getParameters(): GNHashtable {
		return this.parameters;
	}

	public isEncrypted(): boolean {
		return this.encrypted;
	}

	public setRequestId(requestId: number): OperationRequest {
		this.requestId = requestId;
		return this;
	}

	public setParameter(key: string, value: any): OperationRequest {
		if (this.parameters == null) this.parameters = new GNHashtable();

		this.parameters.add(key, value);

		return this;
	}

	public setParameters(parameters: GNHashtable): OperationRequest {
		this.parameters = parameters;
		return this;
	}

	public setEncrypted(encrypted: boolean): OperationRequest {
		this.encrypted = encrypted;
		return this;
	}

	public toString(): string {
		return "Code: " + CodeHelper.getOperationCodeName(this.operationCode) + " (" + this.operationCode + ")" + ", requestId: " + this.requestId + ", parameters " + this.parameters + ", encrypted " + this.encrypted;
	}

}
