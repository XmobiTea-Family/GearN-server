import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingMemberStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingMemberStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class CancelMatchmakingTicketOperationRequest extends OperationRequest {

	// Stores the ticket ID value used by this instance.
	@StringDataMember({ code: ParameterCode.TicketId, minLength: 10, maxLength: 10 })
	public ticketId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCancelMatchmakingTicketOperationRequest extends CancelMatchmakingTicketOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10 })
	public userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCancelMatchmakingTicketOperationRequest extends ServerCancelMatchmakingTicketOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CancelMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.CancelMatchmakingTicket;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return CancelMatchmakingTicketOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.cancelMatchmakingTicket.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			ticketId: request.ticketId
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCancelMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.cancelMatchmakingTicket.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			ticketId: request.ticketId
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCancelMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.cancelMatchmakingTicket.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			ticketId: request.ticketId
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, ticketId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_CancelMatchmakingTicket", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// find tat ca nhung cai ticket nay
		let result = await matchmakingTicketCollection.findOne({ ticketId: request.ticketId }, {
			projection: {
				status: true,
				members: true,
			}
		});

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketNotFound);
			return operationResponse;
		}

		// Stores the matchmaking ticket value used in the current execution flow.
		let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);

		if (matchmakingTicket.getStatus() != MatchmakingTicketStatus.WaitingForMembers && matchmakingTicket.getStatus() != MatchmakingTicketStatus.WaitingForMatch) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketAlreadyCompleted);
			return operationResponse;
		}

		// Stores the member value used in the current execution flow.
		let member = matchmakingTicket.getMember(request.userId);
		if (member == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingPlayerHasNotJoinedTicket);
			return operationResponse;
		}

		if (member.status == MatchmakingMemberStatus.Joined || member.status == MatchmakingMemberStatus.Pending) {
			matchmakingTicket.setMemberStatus(request.userId, MatchmakingMemberStatus.Canceled);
			matchmakingTicket.setStatus(MatchmakingTicketStatus.Canceled);

			await matchmakingTicket.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_CancelMatchmakingTicket", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
