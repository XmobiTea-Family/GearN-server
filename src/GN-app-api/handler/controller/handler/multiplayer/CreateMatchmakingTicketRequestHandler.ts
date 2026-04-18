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

	// Stores the give up after seconds value used by this instance.
	@NumberDataMember({ code: ParameterCode.GiveUpAfterSeconds, mustInt: true, minValue: 20 })
	public giveUpAfterSeconds: number;

	// Stores the queue name value used by this instance.
	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	// Stores the attribute value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.Attribute, isOptional: true })
	public attribute?: GNHashtable;

	// Stores the members value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.Members, isOptional: true, elementCls: String })
	public members?: Array<string>;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateMatchmakingTicketOperationRequest extends CreateMatchmakingTicketOperationRequest {

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

class AdminCreateMatchmakingTicketOperationRequest extends ServerCreateMatchmakingTicketOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.CreateMatchmakingTicket;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return CreateMatchmakingTicketOperationRequest;
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, giveUpAfterSeconds: number, queueName: string, attribute: GNHashtable, members: Array<string> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_CreateMatchmakingTicket", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved matchmaking queue settings instance for the current execution flow.
		let matchmakingQueueSettings = this.getMatchmakingQueueSettings(request.queueName, secretInfo.getGameId());

		if (matchmakingQueueSettings == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingQueueNotFound);
			return operationResponse;
		}

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// Stores the results value used in the current execution flow.
		let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: request.queueName, status: { $in: [MatchmakingTicketStatus.WaitingForMatch, MatchmakingTicketStatus.WaitingForMembers] } }, {
			projection: {
				members: true,
			}
		});

		// Tracks whether join other ticket.
		let isJoinOtherTicket = false;
		while (await results.hasNext()) {
			// Stores the matchmaking ticket value used in the current execution flow.
			let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);

			// Stores the member value used in the current execution flow.
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

		// Tracks whether r IDs should be used.
		let userIds: string[] = [];
		userIds.push(request.userId);

		// Stores the members value used in the current execution flow.
		let members: MatchmakingTicketMember[] = [];
		members.push({
			userId: request.userId,
			status: MatchmakingMemberStatus.Joined,
			attribute: request.attribute == null ? null : request.attribute.toData(),
			attributeForQueue: await this.getAttributeForQueue(request.userId, secretInfo.getGameId(), request.attribute, matchmakingQueueSettings)
		});

		// Stores the matchmaking ticket status value used in the current execution flow.
		let matchmakingTicketStatus: MatchmakingTicketStatus = MatchmakingTicketStatus.WaitingForMatch;

		if (request.members != null) {
			for (let i = 0; i < request.members.length; i++) {
				// Stores the member value used in the current execution flow.
				let member = request.members[i];

				if (!userIds.includes(member)) {
					userIds.push(member);

					members.push({
						userId: member,
						status: MatchmakingMemberStatus.Pending,
						attribute: null,
						attributeForQueue: null,
					});

					matchmakingTicketStatus = MatchmakingTicketStatus.WaitingForMembers;
				}
			}
		}

		// Stores the ticket size value used in the current execution flow.
		let ticketSize = matchmakingQueueSettings.ticketSize;
		if (members.length < ticketSize.min || members.length > ticketSize.max) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.TicketSizeError);
			return operationResponse;
		}

		// Stores the result value used in the current execution flow.
		let result = {
			ticketId: StringUtility.generateRandomString(10, 0),
			queueName: request.queueName,
			creatorId: request.userId,
			giveUpAfterSeconds: request.giveUpAfterSeconds,
			userIds: userIds,
			members: members,
			status: matchmakingTicketStatus,
			tsCreate: xDatetime.getCurrentMilliseconds(),
		}

		await matchmakingTicketCollection.insertOne(result);

		operationResponse.setParameter(ParameterCode.TicketId, result.ticketId);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_CreateMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
