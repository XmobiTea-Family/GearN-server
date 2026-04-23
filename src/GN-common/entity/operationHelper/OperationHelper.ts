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
	/**
	 * Executes the to response socket data workflow.
	 * @param operationResponse Provides the operation response value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static toResponseSocketData(operationResponse: OperationResponse): {
		// Stores the return code value used by this contract.
		returnCode: number,
		// Stores the parameters value used by this contract.
		parameters: {},
		// Stores the invalid request parameters list used by this contract.
		invalidRequestParameters: (string | number)[][],
		// Stores the debug message value used by this contract.
		debugMessage: string,
		// Stores the response ID value used by this contract.
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

	/**
	 * Executes the to response HTTP data workflow.
	 * @param operationResponse Provides the operation response value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static toResponseHttpData(operationResponse: OperationResponse): {
		// Stores the return code value used by this contract.
		returnCode: number,
		// Stores the parameters value used by this contract.
		parameters: {},
		// Stores the invalid request parameters list used by this contract.
		invalidRequestParameters: (string | number)[][],
		// Stores the debug message value used by this contract.
		debugMessage: string,
	} {
		return {
			returnCode: operationResponse.getReturnCode(),
			parameters: OperationHelper.toDataGNHashtable(operationResponse.getParameters()),
			invalidRequestParameters: OperationHelper.invalidMemberData(operationResponse),
			debugMessage: operationResponse.getDebugMessage(),
		}
	}

	/**
	 * Executes the to data GearN hashtable workflow.
	 * @param gnHashtable Provides the GearN hashtable value used by this operation.
	 */
	public static toDataGNHashtable(gnHashtable: GNHashtable) {
		if (gnHashtable == null) return null;

		return gnHashtable.toData();
	}

	/**
	 * Executes the invalid member data workflow.
	 * @param operationResponse Provides the operation response value used by this operation.
	 * @returns Returns the operation result.
	 */
	private static invalidMemberData(operationResponse: OperationResponse): (string | number)[][] {
		// Stores the invalid members value used in the current execution flow.
		let invalidMembers = operationResponse.getInvalidMembers();
		if (invalidMembers != null) {
			// Stores the anwser value used in the current execution flow.
			let anwser = [];

			for (let i = 0; i < invalidMembers.length; i++) {
				// Stores the invalid member value used in the current execution flow.
				let invalidMember = invalidMembers[i];
				anwser.push([invalidMember.code, invalidMember.invalidMemberType as number]);
			}

			return anwser;
		}

		return null;
	}

	/**
	 * Executes the to data operation response workflow.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	public static toDataOperationResponse(operationResponse: OperationResponse) {
		return {
			operationCode: operationResponse.getOperationCode(),
			responseId: operationResponse.getResponseId(),
			parameters: OperationHelper.toDataGNHashtable(operationResponse.getParameters()),
			debugMessage: operationResponse.getDebugMessage(),
			returnCode: CodeHelper.getReturnCodeName(operationResponse.getReturnCode()),
		};
	}

	/**
	 * Executes the to data operation request workflow.
	 * @param operationRequest Provides the operation request value used by this operation.
	 */
	public static toDataOperationRequest(operationRequest: OperationRequest) {
		return {
			operationCode: operationRequest.getOperationCode(),
			requestId: operationRequest.getRequestId(),
			parameters: OperationHelper.toDataGNHashtable(operationRequest.getParameters())
		};
	}

	/**
	 * Executes the to data from request workflow.
	 * @param request Provides the request value used by this operation.
	 */
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

	/**
	 * Executes the to data secret info workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 */
	private static toDataSecretInfo(secretInfo: SecretInfo) {
		if (secretInfo == null) return null;

		return {
			gameId: secretInfo.getGameId(),
		}
	}

	/**
	 * Executes the to auth info workflow.
	 * @param authInfo Provides the auth info value used by this operation.
	 */
	private static toAuthInfo(authInfo: AuthInfo) {
		if (authInfo == null) return null;

		return {
			userId: authInfo.getUserId(),
		}
	}

	/**
	 * Executes the new operation response workflow.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static newOperationResponse(operationCode: string, responseId: number): OperationResponse {
		return new OperationResponse(operationCode, responseId);
	}

	/**
	 * Executes the new operation response invalid workflow.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static newOperationResponseInvalid(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		// Stores the operation invalid value used in the current execution flow.
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationInvalid);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	/**
	 * Executes the new operation response invalid request parameters workflow.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 * @param invalidMembers Provides the invalid members value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static newOperationResponseInvalidRequestParameters(operationCode: string, responseId: number, invalidMembers: InvalidMember[], debugMessage?: string): OperationResponse {
		// Stores the operation invalid value used in the current execution flow.
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.InvalidRequestParameters);
		operationInvalid.setInvalidMembers(invalidMembers);

		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	/**
	 * Executes the new operation response internal server error workflow.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static newOperationResponseInternalServerError(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		// Stores the operation invalid value used in the current execution flow.
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.InternalServerError);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	/**
	 * Executes the new operation response not authorized workflow.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static newOperationResponseNotAuthorized(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		// Stores the operation invalid value used in the current execution flow.
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAuthorized);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	/**
	 * Executes the new operation response not allow error workflow.
	 * @param operationCode Provides the operation code value used by this operation.
	 * @param responseId Provides the response ID value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static newOperationResponseNotAllowError(operationCode: string, responseId: number, debugMessage?: string): OperationResponse {
		// Stores the operation invalid value used in the current execution flow.
		let operationInvalid = this.newOperationResponse(operationCode, responseId);

		operationInvalid.setReturnCode(ReturnCode.OperationNotAllow);
		if (debugMessage !== null) operationInvalid.setDebugMessage(debugMessage);

		return operationInvalid;
	}

	/**
	 * Executes the to event socket data workflow.
	 * @param operationEvent Provides the operation event value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static toEventSocketData(operationEvent: OperationEvent): {
		// Stores the event code value used by this contract.
		eventCode: string,
		// Stores the parameters value used by this contract.
		parameters: {}
	} {
		return {
			eventCode: operationEvent.getEventCode(),
			parameters: OperationHelper.toDataGNHashtable(operationEvent.getParameters())
		}
	}

}