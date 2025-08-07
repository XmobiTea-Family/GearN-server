import { GNHashtable } from "./../../common/GNData";

export class OperationRequest {
	private isValid: boolean;

	public isValidRequest(): boolean {
		return this.isValid;
	}

	private operationCode: string;
	private requestId: number;
	private parameters: GNHashtable;

	constructor(operationCode: string) {
		this.operationCode = operationCode;
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

	public toString(): string {
		return "OperationCode: " + this.operationCode + ", requestId: " + this.requestId + ", parameters " + JSON.stringify(this.parameters?.toData());
	}

}
