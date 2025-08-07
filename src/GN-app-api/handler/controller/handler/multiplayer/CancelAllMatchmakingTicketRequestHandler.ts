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

class CancelAllMatchmakingTicketOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	queueName: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCancelAllMatchmakingTicketOperationRequest extends CancelAllMatchmakingTicketOperationRequest {
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10 })
	userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCancelAllMatchmakingTicketOperationRequest extends ServerCancelAllMatchmakingTicketOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CancelAllMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.CancelAllMatchmakingTicket;
	}

	public override getCommonOperationRequest() {
		return CancelAllMatchmakingTicketOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.cancelAllMatchmakingTicket.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			queueName: request.queueName
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCancelAllMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.cancelAllMatchmakingTicket.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			queueName: request.queueName
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCancelAllMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.cancelAllMatchmakingTicket.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			queueName: request.queueName
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, queueName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_CancelAllMatchmakingTicket", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let matchmakingQueueSettings = this.getMatchmakingQueueSettings(request.queueName, secretInfo.getGameId());

		if (matchmakingQueueSettings == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingQueueNotFound);
			return operationResponse;
		}

		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// find tat ca nhung cai ticket nay
		let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: request.queueName, status: { $in: [<number>MatchmakingTicketStatus.WaitingForMatch, <number>MatchmakingTicketStatus.WaitingForMembers] } }, {
			projection: {
				ticketId: true,
				members: true,
			}
		});

		let ticketIds: string[] = [];

		while (await results.hasNext()) {
			let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);

			let member = matchmakingTicket.getMember(request.userId);

			if (member.status == MatchmakingMemberStatus.Joined) {
				matchmakingTicket.setMemberStatus(request.userId, <number>MatchmakingMemberStatus.Canceled);
				matchmakingTicket.setStatus(<number>MatchmakingMemberStatus.Canceled);
				matchmakingTicket.saveAsync();

				ticketIds.push(matchmakingTicket.getTicketId());
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		operationResponse.setParameter(ParameterCode.TicketIds, ticketIds);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_CancelAllMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
