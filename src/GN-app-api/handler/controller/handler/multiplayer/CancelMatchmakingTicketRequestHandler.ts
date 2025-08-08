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
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class CancelMatchmakingTicketOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.TicketId, minLength: 10, maxLength: 10 })
	public ticketId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCancelMatchmakingTicketOperationRequest extends CancelMatchmakingTicketOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10 })
	public userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCancelMatchmakingTicketOperationRequest extends ServerCancelMatchmakingTicketOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CancelMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.CancelMatchmakingTicket;
	}

	public override getCommonOperationRequest() {
		return CancelMatchmakingTicketOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, ticketId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_CancelMatchmakingTicket", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

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

		let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);

		if (matchmakingTicket.getStatus() != <number>MatchmakingTicketStatus.WaitingForMembers && matchmakingTicket.getStatus() != <number>MatchmakingTicketStatus.WaitingForMatch) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketAlreadyCompleted);
			return operationResponse;
		}

		let member = matchmakingTicket.getMember(request.userId);
		if (member == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingPlayerHasNotJoinedTicket);
			return operationResponse;
		}

		if (member.status == <number>MatchmakingMemberStatus.Joined) {
			matchmakingTicket.setMemberStatus(request.userId, <number>MatchmakingMemberStatus.Canceled);
			matchmakingTicket.setStatus(<number>MatchmakingTicketStatus.Canceled);

			matchmakingTicket.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_CancelMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
