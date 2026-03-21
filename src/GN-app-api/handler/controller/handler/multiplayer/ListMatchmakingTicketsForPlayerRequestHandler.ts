import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingMemberStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingMemberStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class ListMatchmakingTicketsForPlayerOperationRequest extends OperationRequest {

	// Stores the queue name value used by this instance.
	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerListMatchmakingTicketsForPlayerOperationRequest extends ListMatchmakingTicketsForPlayerOperationRequest {

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

class AdminListMatchmakingTicketsForPlayerOperationRequest extends ServerListMatchmakingTicketsForPlayerOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ListMatchmakingTicketsForPlayerRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ListMatchmakingTicketsForPlayer;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ListMatchmakingTicketsForPlayerOperationRequest;
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

		if (!secretInfo.getPermission().multiplayer.listMatchmakingTicketsForPlayer.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			queueName: request.queueName,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerListMatchmakingTicketsForPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.listMatchmakingTicketsForPlayer.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			queueName: request.queueName,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminListMatchmakingTicketsForPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.listMatchmakingTicketsForPlayer.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			queueName: request.queueName,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, queueName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_ListMatchmakingTicketsForPlayer", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// find tat ca nhung cai ticket nay
		let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: request.queueName, status: <number>MatchmakingTicketStatus.WaitingForMembers }, {
			projection: {
				ticketId: true,
				members: true,
			}
		});

		// Stores the ticket IDs value used in the current execution flow.
		let ticketIds: string[] = [];

		while (await results.hasNext()) {
			// Stores the matchmaking ticket value used in the current execution flow.
			let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);

			// Stores the member value used in the current execution flow.
			let member = matchmakingTicket.getMember(request.userId);

			if (member.status == MatchmakingMemberStatus.Pending) {
				ticketIds.push(matchmakingTicket.getTicketId());
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		operationResponse.setParameter(ParameterCode.TicketIds, ticketIds);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_ListMatchmakingTicketsForPlayer", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
