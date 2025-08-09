import { InvalidMember } from "./../InvalidMember";
import { ReturnCode } from "./../../constant/ReturnCode";
import { OperationResponse } from "./../operationResponse/OperationResponse";
import { OperationRequest } from "./../operationRequest/OperationRequest";
import { OperationEvent } from "./../operationEvent/OperationEvent";
import { CodeHelper } from "./../../helper/CodeHelper";
import { Request } from "./../operationRequest/base/Request";
import { SecretInfo } from "./../SecretInfo";
import { AuthInfo } from "./../AuthInfo";
import { GNHashtable } from "./../../common/GNData";

export class OperationHelper {
	public static toResponseSocketData(operationResponse: OperationResponse): {
		returnCode: number,
		parameters: {},
		invalidRequestParameters: (string | number)[][],
		debugMessage: string,
		responseId: number,
	} {
		return {
			returnCode: operationResponse.getReturnCode(),
			parameters: OperationHelper.toDataGNHashtable(operationResponse.getParameters()),
			invalidRequestParameters: OperationHelper.invalidMemberData(operationResponse),
			debugMessage: operationResponse.getDebugMessage(),
			responseId: operationResponse.getResponseId(),
		}
	}

	public static toResponseHttpData(operationResponse: OperationResponse): {
		returnCode: number,
		parameters: {},
		invalidRequestParameters: (string | number)[][],
		debugMessage: string,
	} {
		return {
			returnCode: operationResponse.getReturnCode(),
			parameters: OperationHelper.toDataGNHashtable(operationResponse.getParameters()),
			invalidRequestParameters: OperationHelper.invalidMemberData(operationResponse),
			debugMessage: operationResponse.getDebugMessage(),
		}
	}

	public static toDataGNHashtable(gnHashtable: GNHashtable) {
		if (gnHashtable == null) return null;

		return gnHashtable.toData();
	}

	private static invalidMemberData(operationResponse: OperationResponse): (string | number)[][] {
		let invalidMembers = operationResponse.getInvalidMembers();
		if (invalidMembers != null) {
			let anwser = [];

			for (let i = 0; i < invalidMembers.length; i++) {
				let invalidMember = invalidMembers[i];
				anwser.push([invalidMember.code, invalidMember.invalidMemberType as number]);
			}

			return anwser;
		}

		return null;
	}

	public static toDataOperationResponse(operationResponse: OperationResponse) {
		return {
			operationCode: operationResponse.getOperationCode(),
			responseId: operationResponse.getResponseId(),
			parameters: OperationHelper.toDataGNHashtable(operationResponse.getParameters()),
			debugMessage: operationResponse.getDebugMessage(),
			returnCode: CodeHelper.getReturnCodeName(operationResponse.getReturnCode()),
		};
	}

	public static toDataOperationRequest(operationRequest: OperationRequest) {
		return {
			operationCode: operationRequest.getOperationCode(),
			requestId: operationRequest.getRequestId(),
			parameters: OperationHelper.toDataGNHashtable(operationRequest.getParameters())
		};
	}

	public static toDataFromRequest(request: Request) {
		return {
			operationCode: request.getOperationCode(),
			requestType: CodeHelper.getRequestTypeName(request.getRequestType()),
			role: CodeHelper.getRequestRoleName(request.getRole()),
			ip: request.getIP(),
			secretInfo: OperationHelper.toDataSecretInfo(request.getSecretInfo()),
			authInfo: OperationHelper.toAuthInfo(request.getAuthInfo()),
		}
	}

	private static toDataSecretInfo(secretInfo: SecretInfo) {
		if (secretInfo == null) return null;

		return {
			role: CodeHelper.getSecretRoleName(secretInfo.getRole()),
			gameId: secretInfo.getGameId(),
		}
	}

	private static toAuthInfo(authInfo: AuthInfo) {
		if (authInfo == null) return null;

		return {
			userId: authInfo.getUserId(),
		}
	}

	public static newOperationResponse(operationCode: string, responseId: number): OperationResponse {
		return new OperationResponse(operationCode, responseId);
	}

	public static newOperationResponseInvalid(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationInvalid);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseInvalidRequestParameters(operationCode: string, responseId: number, invalidMembers: InvalidMember[], debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.InvalidRequestParameters);
		operationInvalid.setInvalidMembers(invalidMembers);

		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseInternalServerError(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.InternalServerError);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseNotAuthorized(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAuthorized);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static newOperationResponseNotAllowError(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAllow);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static toEventSocketData(operationEvent: OperationEvent): {
		eventCode: string,
		parameters: {}
	} {
		return {
			eventCode: operationEvent.getEventCode(),
			parameters: OperationHelper.toDataGNHashtable(operationEvent.getParameters())
		}
	}

}