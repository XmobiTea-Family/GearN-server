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
import { GNHashtable } from "./../../../../../GN-common/common/GNData";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { MatchmakingTicketMember } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicketMember";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class CreateMatchmakingTicketOperationRequest extends OperationRequest {

	@NumberDataMember({ code: ParameterCode.GiveUpAfterSeconds, mustInt: true, minValue: 20 })
	public giveUpAfterSeconds: number;

	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	@GNHashtableDataMember({ code: ParameterCode.Attribute, isOptional: true })
	public attribute?: GNHashtable;

	@GNArrayDataMember({ code: ParameterCode.Members, isOptional: true, elementCls: String })
	public members?: Array<string>;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateMatchmakingTicketOperationRequest extends CreateMatchmakingTicketOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10 })
	public userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCreateMatchmakingTicketOperationRequest extends ServerCreateMatchmakingTicketOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.CreateMatchmakingTicket;
	}

	public override getCommonOperationRequest() {
		return CreateMatchmakingTicketOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.createMatchmakingTicket.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			giveUpAfterSeconds: request.giveUpAfterSeconds,
			queueName: request.queueName,
			attribute: request.attribute,
			members: request.members,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreateMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.createMatchmakingTicket.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			giveUpAfterSeconds: request.giveUpAfterSeconds,
			queueName: request.queueName,
			attribute: request.attribute,
			members: request.members,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreateMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.createMatchmakingTicket.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			giveUpAfterSeconds: request.giveUpAfterSeconds,
			queueName: request.queueName,
			attribute: request.attribute,
			members: request.members,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, giveUpAfterSeconds: number, queueName: string, attribute: GNHashtable, members: Array<string> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_CreateMatchmakingTicket", request, secretInfo, operationRequest);
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

		let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: request.queueName, status: { $in: [<number>MatchmakingTicketStatus.WaitingForMatch, <number>MatchmakingTicketStatus.WaitingForMembers] } }, {
			projection: {
				members: true,
			}
		});

		let isJoinOtherTicket = false;
		while (await results.hasNext()) {
			let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);

			let member = matchmakingTicket.getMember(request.userId);

			if (member.status == MatchmakingMemberStatus.Joined) {
				isJoinOtherTicket = true;
				break;
			}
		}

		if (isJoinOtherTicket) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingPlayerHasJoinedOtherTicket);
			return operationResponse;
		}

		let userIds: string[] = [];
		userIds.push(request.userId);

		let members: MatchmakingTicketMember[] = [];
		members.push({
			userId: request.userId,
			status: <number>MatchmakingMemberStatus.Joined,
			attribute: request.attribute == null ? null : request.attribute.toData(),
			attributeForQueue: await this.getAttributeForQueue(request.userId, secretInfo.getGameId(), request.attribute, matchmakingQueueSettings)
		});

		let matchmakingTicketStatus: MatchmakingTicketStatus = MatchmakingTicketStatus.WaitingForMatch;

		if (request.members != null) {
			for (let i = 0; i < request.members.length; i++) {
				let member = request.members[i];

				if (!userIds.includes(member)) {
					userIds.push(member);

					members.push({
						userId: member,
						status: <number>MatchmakingMemberStatus.Pending,
						attribute: null,
						attributeForQueue: null,
					});

					matchmakingTicketStatus = MatchmakingTicketStatus.WaitingForMembers;
				}
			}
		}

		let ticketSize = matchmakingQueueSettings.ticketSize;
		if (members.length < ticketSize.min || members.length > ticketSize.max) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.TicketSizeError);
			return operationResponse;
		}

		let result = {
			ticketId: StringUtility.generateRandomString(10, 0),
			queueName: request.queueName,
			creatorId: request.userId,
			giveUpAfterSeconds: request.giveUpAfterSeconds,
			userIds: userIds,
			members: members,
			status: <number>matchmakingTicketStatus,
			tsCreate: xDatetime.getCurrentMilliseconds(),
		}

		matchmakingTicketCollection.insertOne(result);

		operationResponse.setParameter(ParameterCode.TicketId, result.ticketId);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_CreateMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
