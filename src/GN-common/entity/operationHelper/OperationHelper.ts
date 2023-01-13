import { InvalidMember } from "./../InvalidMember";
import { ReturnCode } from "./../../constant/ReturnCode";
import { OperationResponse } from "./../operationResponse/OperationResponse";
import { OperationEvent } from "./../operationEvent/OperationEvent";

export class OperationHelper {

	private static invalidMemberData(operationResponse: OperationResponse): (string | number)[][] {
		let anwser = [];

		let invalidMembers = operationResponse.getInvalidMembers();
		if (invalidMembers != null) {
			for (let i = 0; i < invalidMembers.length; i++) {
				let invalidMember = invalidMembers[i];
				anwser.push([invalidMember.code, invalidMember.invalidMemberType as number]);
			}
		}

		return anwser;
	}

	public static toResponseSocketData(operationResponse: OperationResponse): [number, any, number] {
		return [operationResponse.getReturnCode(), operationResponse.getReturnCode() == ReturnCode.Ok ? operationResponse.getParameters().toData() : operationResponse.getReturnCode() == ReturnCode.InvalidRequestParameters ? OperationHelper.invalidMemberData(operationResponse) : operationResponse.getDebugMessage(), operationResponse.getResponseId()];
	}

	public static toResponseHttpData(operationResponse: OperationResponse): [number, any] {
		return [operationResponse.getReturnCode(), operationResponse.getReturnCode() == ReturnCode.Ok ? operationResponse.getParameters().toData() : operationResponse.getReturnCode() == ReturnCode.InvalidRequestParameters ? OperationHelper.invalidMemberData(operationResponse) : operationResponse.getDebugMessage()];
	}

	public static newOperationResponse(operationCode: number, responseId: number, encrypted: boolean): OperationResponse {
		return new OperationResponse(operationCode, responseId, encrypted);
	}

	public static newOperationResponseInvalid(operationCode: number, responseId: number, encrypted: boolean, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId, encrypted);

		operationInvalid.setReturnCode(ReturnCode.OperationInvalid);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseInvalidRequestParameters(operationCode: number, responseId: number, invalidMembers: InvalidMember[], encrypted: boolean, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId, encrypted);

		operationInvalid.setReturnCode(ReturnCode.InvalidRequestParameters);
		operationInvalid.setInvalidMembers(invalidMembers);

		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseInternalServerError(operationCode: number, responseId: number, encrypted: boolean, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId, encrypted);

		operationInvalid.setReturnCode(ReturnCode.InternalServerError);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseNotAuthorized(operationCode: number, responseId: number, encrypted: boolean, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId, encrypted);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAuthorized);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static toEventSocketData(operationEvent: OperationEvent): [number, {}] {
		return [operationEvent.getEventCode(), operationEvent.getParameters() == null ? null : operationEvent.getParameters().toData()];
	}

}