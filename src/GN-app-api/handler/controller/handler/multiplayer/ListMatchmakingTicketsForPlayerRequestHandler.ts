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

	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerListMatchmakingTicketsForPlayerOperationRequest extends ListMatchmakingTicketsForPlayerOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10 })
	public userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminListMatchmakingTicketsForPlayerOperationRequest extends ServerListMatchmakingTicketsForPlayerOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ListMatchmakingTicketsForPlayerRequestHandler extends MultiplayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.ListMatchmakingTicketsForPlayer;
	}

	public override getCommonOperationRequest() {
		return ListMatchmakingTicketsForPlayerOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	private async execute(request: { userId: string, queueName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_ListMatchmakingTicketsForPlayer", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// find tat ca nhung cai ticket nay
		let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: request.queueName, status: <number>MatchmakingTicketStatus.WaitingForMembers }, {
			projection: {
				ticketId: true,
				members: true,
			}
		});

		let ticketIds: string[] = [];

		while (await results.hasNext()) {
			let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);

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
