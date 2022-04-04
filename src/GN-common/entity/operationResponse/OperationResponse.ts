import { ReturnCode } from "./../../constant/ReturnCode";
import { GNHashtable } from "./../../common/GNData";

export class OperationResponse {
	private operationCode: number;
	private responseId: number;
	private returnCode: number;
	private debugMessage: string;
	private parameters: GNHashtable;

	constructor(operationCode: number, responseId: number) {
		this.operationCode = operationCode;
		this.responseId = responseId;
		this.parameters = new GNHashtable();
		this.debugMessage = null;
	}

	public getReturnCode(): number {
		return this.returnCode;
	}

	public setReturnCode(returnCode: number): OperationResponse {
		this.returnCode = returnCode;
		return this;
	}

	public setDebugMessage(debugMessage: string): OperationResponse {
		this.debugMessage = debugMessage;
		return this;
	}

	public setParameter(k: number, value: any): OperationResponse {
		this.parameters.add(k, value);
		return this;
	}

	public setParameters(parameters: GNHashtable): OperationResponse {
		this.parameters = parameters;
		return this;
	}

	public toString(): string {
		return this.operationCode + " " + this.responseId + " " + this.parameters.toString();
	}

	public static newOperationResponse(operationCode: number, responseId: number): OperationResponse {
		return new OperationResponse(operationCode, responseId);
	}

	public static newOperationInvalid(operationCode: number, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationInvalid);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationInvalidRequestParameters(operationCode: number, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.InvalidRequestParameters);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationInternalServerError(operationCode: number, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.InternalServerError);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationNotAuthorized(operationCode: number, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAuthorized);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public getResponseId(): number {
		return this.responseId;
	}

	public toSocketData(): [number, any, number] {
		return [this.returnCode, this.returnCode == ReturnCode.Ok ? this.parameters.toData() : this.debugMessage, this.responseId];
	}

	public toHttpData(): [number, any] {
		return [this.returnCode, this.returnCode == ReturnCode.Ok ? this.parameters.toData() : this.debugMessage];
	}
}
