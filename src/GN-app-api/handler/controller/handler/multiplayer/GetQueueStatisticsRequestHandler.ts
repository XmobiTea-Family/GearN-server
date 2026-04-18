import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { Match } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Match";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingMemberStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingMemberStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetQueueStatisticsOperationRequest extends OperationRequest {

	// Stores the queue name value used by this instance.
	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	// Stores the time in seconds value used by this instance.
	@NumberDataMember({ code: ParameterCode.TimeInSeconds, mustInt: true, minValue: 20 })
	public timeInSeconds: number;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetQueueStatisticsOperationRequest extends GetQueueStatisticsOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetQueueStatisticsOperationRequest extends ServerGetQueueStatisticsOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetQueueStatisticsRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetQueueStatistics;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetQueueStatisticsOperationRequest;
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

		if (!secretInfo.getPermission().multiplayer.getQueueStatistics.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			queueName: request.queueName,
			timeInSeconds: request.timeInSeconds,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetQueueStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getQueueStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			queueName: request.queueName,
			timeInSeconds: request.timeInSeconds,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetQueueStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getQueueStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			queueName: request.queueName,
			timeInSeconds: request.timeInSeconds,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { queueName: string, timeInSeconds: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetQueueStatistics", request, secretInfo, operationRequest);
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

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// Stores the match collection value used in the current execution flow.
		let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", secretInfo.getGameId());

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// Stores the results value used in the current execution flow.
		let results = await matchmakingTicketCollection.find({ queueName: request.queueName, status: { $in: [MatchmakingTicketStatus.WaitingForMatch, MatchmakingTicketStatus.WaitingForMembers] }, tsCreate: { $gt: currentMilliseconds - request.timeInSeconds * 1000 } }, {
			projection: {
				members: true,
			}
		});

		// Stores the pending member count value used in the current execution flow.
		let pendingMemberCount = 0;
		// Stores the pending ticket count value used in the current execution flow.
		let pendingTicketCount = 0;
		while (await results.hasNext()) {
			// Stores the matchmaking ticket value used in the current execution flow.
			let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);
			pendingTicketCount += 1;

			matchmakingTicket.getMembers().forEach(member => {
				if (member.status == MatchmakingMemberStatus.Joined) {
					pendingMemberCount += 1;
				}
			});
		}

		// Stores the results 2 value used in the current execution flow.
		let results2 = await matchCollection.find({ queueName: request.queueName, tsCreate: { $gt: currentMilliseconds - request.timeInSeconds * 1000 } }, {
			projection: {
				timeToMatchInSeconds: true,
			}
		});

		// Stores the total match success value used in the current execution flow.
		let totalMatchSuccess = 0;
		// Stores the total match success time in seconds value used in the current execution flow.
		let totalMatchSuccessTimeInSeconds = 0;

		while (await results2.hasNext()) {
			// Stores the match value used in the current execution flow.
			let match = new Match(await results2.next(), matchCollection);

			totalMatchSuccessTimeInSeconds += match.getTimeToMatchInSeconds();
			totalMatchSuccess += 1;
		}

		// Stores the average matchmaking time in seconds value used in the current execution flow.
		let averageMatchmakingTimeInSeconds = totalMatchSuccess == 0 ? -1 : totalMatchSuccessTimeInSeconds / totalMatchSuccess;

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		operationResponse.setParameter(ParameterCode.PendingMemberCount, pendingMemberCount);
		operationResponse.setParameter(ParameterCode.PendingTicketCount, pendingTicketCount);
		operationResponse.setParameter(ParameterCode.AverageMatchmakingTimeInSeconds, averageMatchmakingTimeInSeconds);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetQueueStatistics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
