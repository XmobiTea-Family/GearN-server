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
    @StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
    queueName: string;

    @NumberDataMember({ code: ParameterCode.TimeInSeconds, mustInt: true, minValue: 20 })
    timeInSeconds: number;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetQueueStatisticsOperationRequest extends GetQueueStatisticsOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetQueueStatisticsOperationRequest extends ServerGetQueueStatisticsOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetQueueStatisticsRequestHandler extends MultiplayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetQueueStatistics;
    }

    public override getCommonOperationRequest() {
        return GetQueueStatisticsOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

    private async execute(request: { queueName: string, timeInSeconds: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetQueueStatistics", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", secretInfo.getGameId());

        let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

        let results = await matchmakingTicketCollection.find({ queueName: request.queueName, status: { $in: [<number>MatchmakingTicketStatus.WaitingForMatch, <number>MatchmakingTicketStatus.WaitingForMembers] }, tsCreate: { $gt: currentMilliseconds - request.timeInSeconds * 1000 } }, {
            projection: {
                members: true,
            }
        });

        let pendingMemberCount = 0;
        let pendingTicketCount = 0;
        while (await results.hasNext()) {
            let matchmakingTicket = new MatchmakingTicket(await results.next(), matchmakingTicketCollection);
            pendingTicketCount += 1;

            matchmakingTicket.getMembers().forEach(member => {
                if (member.status == MatchmakingMemberStatus.Joined) {
                    pendingMemberCount += 1;
                }
            });
        }

        let results2 = await matchCollection.find({ queueName: request.queueName, tsCreate: { $gt: currentMilliseconds - request.timeInSeconds * 1000 } }, {
            projection: {
                timeToMatchInSeconds: true,
            }
        });

        let totalMatchSuccess = 0;
        let totalMatchSuccessTimeInSeconds = 0;

        while (await results2.hasNext()) {
            let match = new Match(await results2.next(), matchCollection);

            totalMatchSuccessTimeInSeconds += match.getTimeToMatchInSeconds();
            totalMatchSuccess += 1;
        }

        let averageMatchmakingTimeInSeconds = totalMatchSuccess == 0 ? -1 : totalMatchSuccessTimeInSeconds / totalMatchSuccess;

        operationResponse.setParameter(ParameterCode.PendingMemberCount, pendingMemberCount);
        operationResponse.setParameter(ParameterCode.PendingTicketCount, pendingTicketCount);
        operationResponse.setParameter(ParameterCode.AverageMatchmakingTimeInSeconds, averageMatchmakingTimeInSeconds);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetQueueStatistics", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
