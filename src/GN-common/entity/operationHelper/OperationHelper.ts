import { InvalidMember } from "./../InvalidMember";
import { ReturnCode } from "./../../constant/ReturnCode";
import { OperationResponse } from "./../operationResponse/OperationResponse";
import { OperationRequest } from "./../operationRequest/OperationRequest";
import { OperationEvent } from "./../operationEvent/OperationEvent";
import { CodeHelper } from "./../../helper/CodeHelper";
import { Request } from "./../operationRequest/base/Request";
import { RequestType } from "./../../constant/enumType/RequestType";
import { RequestRole } from "./../../constant/enumType/RequestRole";
import { SecretInfo } from "./../SecretInfo";
import { AuthInfo } from "./../AuthInfo";
import { GNHashtable } from "./../../common/GNData";

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

	public static toDataGNHashtable(gnHashtable: GNHashtable) {
		if (gnHashtable == null) return null;

		return gnHashtable.toData();
	}

	public static toDataOperationResponse(operationResponse: OperationResponse) {
		return {
			operationCode: CodeHelper.getOperationCodeName(operationResponse.getOperationCode()),
			encrypted: operationResponse.isEncrypted(),
			responseId: operationResponse.getResponseId(),
			parameters: OperationHelper.toDataGNHashtable(operationResponse.getParameters()),
			debugMessage: operationResponse.getDebugMessage(),
			returnCode: CodeHelper.getReturnCodeName(operationResponse.getReturnCode()),
		};
	}

	public static toDataOperationRequest(operationRequest: OperationRequest) {
		return {
			operationCode: CodeHelper.getOperationCodeName(operationRequest.getOperationCode()),
			encrypted: operationRequest.isEncrypted(),
			requestId: operationRequest.getRequestId(),
			parameters: OperationHelper.toDataGNHashtable(operationRequest.getParameters())
		};
	}

	public static toDataFromRequest(request: Request) {
		return {
			code: CodeHelper.getOperationCodeName(request.getCode()),
			type: RequestType[<RequestType>request.getType()],
			role: RequestRole[<RequestRole>request.getRole()],
			ip: request.getIP(),
			secretInfo: OperationHelper.toDataSecretInfo(request.getSecretInfo()),
			authInfo: OperationHelper.toAuthInfo(request.getAuthInfo()),
		}
	}

	private static toDataSecretInfo(secretInfo: SecretInfo) {
		if (secretInfo == null) return null;

		return {
			role: RequestRole[<RequestRole>secretInfo.getRole()],
			gameId: secretInfo.getGameId(),
		}
	}

	private static toAuthInfo(authInfo: AuthInfo) {
		if (authInfo == null) return null;

		return {
			userId: authInfo.getUserId(),
		}
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

	public static newOperationNotAllowError(operationCode: number, responseId: number, encrypted: boolean, debugMessage?: string): OperationResponse {
		let operationInvalid = this.newOperationResponse(operationCode, responseId, encrypted);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAllow);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	public static toEventSocketData(operationEvent: OperationEvent): [number, {}] {
		return [operationEvent.getEventCode(), operationEvent.getParameters() == null ? null : operationEvent.getParameters().toData()];
	}

}