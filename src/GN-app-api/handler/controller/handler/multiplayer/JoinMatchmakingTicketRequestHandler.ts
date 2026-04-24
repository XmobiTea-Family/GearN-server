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
import { GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class JoinMatchmakingTicketOperationRequest extends OperationRequest {

	// Stores the ticket ID value used by this instance.
	@StringDataMember({ code: ParameterCode.TicketId, minLength: 10, maxLength: 10 })
	public ticketId: string;

	// Stores the attribute value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.Attribute, isOptional: true })
	public attribute?: GNHashtable;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerJoinMatchmakingTicketOperationRequest extends JoinMatchmakingTicketOperationRequest {

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

class AdminJoinMatchmakingTicketOperationRequest extends ServerJoinMatchmakingTicketOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class JoinMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.JoinMatchmakingTicket;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return JoinMatchmakingTicketOperationRequest;
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

		if (!secretInfo.getPermission().multiplayer.joinMatchmakingTicket.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			ticketId: request.ticketId,
			attribute: request.attribute,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerJoinMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.joinMatchmakingTicket.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			ticketId: request.ticketId,
			attribute: request.attribute,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminJoinMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.joinMatchmakingTicket.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			ticketId: request.ticketId,
			attribute: request.attribute,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, ticketId: string, attribute: GNHashtable }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_JoinMatchmakingTicket", request, role, secretInfo, operationRequest);
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
				queueName: true,
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
		if (matchmakingTicket.getStatus() != MatchmakingTicketStatus.WaitingForMembers) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketAlreadyCompleted);
			return operationResponse;
		}

		// Stores the member value used in the current execution flow.
		let member = matchmakingTicket.getMember(request.userId);
		if (member == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketNotFound);
			return operationResponse;
		}

		if (member.status != MatchmakingMemberStatus.Pending) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketAlreadyCompleted);
			return operationResponse;
		}

		// Stores the resolved matchmaking queue settings instance for the current execution flow.
		let matchmakingQueueSettings = this.getMatchmakingQueueSettings(matchmakingTicket.getQueueName(), secretInfo.getGameId());

		if (matchmakingQueueSettings == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingQueueNotFound);
			return operationResponse;
		}

		// Stores the results value used in the current execution flow.
		let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: matchmakingTicket.getQueueName(), status: { $in: [MatchmakingTicketStatus.WaitingForMatch, MatchmakingTicketStatus.WaitingForMembers] } }, {
			projection: {
				ticketId: true,
				members: true,
			}
		});

		// Tracks whether join other ticket.
		let isJoinOtherTicket = false;
		while (await results.hasNext()) {
			// Stores the matchmaking ticket value used in the current execution flow.
			let thisMatchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);
			if (thisMatchmakingTicket.getTicketId() == request.ticketId) continue;

			// Stores the member value used in the current execution flow.
			let member = thisMatchmakingTicket.getMember(request.userId);

			if (member.status == MatchmakingMemberStatus.Joined) {
				isJoinOtherTicket = true;
				break;
			}
		}

		if (isJoinOtherTicket) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingPlayerJoinedOtherTicket);
			return operationResponse;
		}

		matchmakingTicket.setMemberAttribute(request.userId, request.attribute != null ? request.attribute.toData() : null, await this.getAttributeForQueue(request.userId, secretInfo.getGameId(), request.attribute, matchmakingQueueSettings));
		matchmakingTicket.setMemberStatus(request.userId, MatchmakingMemberStatus.Joined);

		// Stores the complete is ready collection used in the current execution flow.
		let allIsReady = matchmakingTicket.getMembers().find(x => x.status == MatchmakingMemberStatus.Pending) == null;
		if (allIsReady) {
			matchmakingTicket.setStatus(MatchmakingTicketStatus.WaitingForMatch);
		}

		await matchmakingTicket.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_JoinMatchmakingTicket", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
