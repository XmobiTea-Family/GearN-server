import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingMemberStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingMemberStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class JoinMatchmakingTicketOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.TicketId, minLength: 10, maxLength: 10 })
    ticketId: string;

    @GNHashtableDataMember({ code: GNParameterCode.Attribute, isOptional: true })
    attribute?: GNHashtable;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerJoinMatchmakingTicketOperationRequest extends JoinMatchmakingTicketOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10 })
    userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminJoinMatchmakingTicketOperationRequest extends ServerJoinMatchmakingTicketOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class JoinMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.JoinMatchmakingTicket;
    }

    public override getCommonOperationRequest() {
        return JoinMatchmakingTicketOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, ticketId: string, attribute: GNHashtable }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_JoinMatchmakingTicket", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
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
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingTicketNotFound);
            return operationResponse;
        }

        let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);
        if (matchmakingTicket.getStatus() != MatchmakingTicketStatus.WaitingForMembers) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingTicketAlreadyCompleted);
            return operationResponse;
        }

        let member = matchmakingTicket.getMember(request.userId);
        if (member == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingTicketNotFound);
            return operationResponse;
        }

        if (member.status != <number>MatchmakingMemberStatus.Pending) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingTicketAlreadyCompleted);
            return operationResponse;
        }

        let matchmakingQueueSettings = this.getMatchmakingQueueSettings(matchmakingTicket.getQueueName(), secretInfo.getGameId());

        if (matchmakingQueueSettings == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingQueueNotFound);
            return operationResponse;
        }

        let results = await matchmakingTicketCollection.find({ userIds: request.userId, queueName: matchmakingTicket.getQueueName(), status: { $in: [<number>MatchmakingTicketStatus.WaitingForMatch, <number>MatchmakingTicketStatus.WaitingForMembers] } }, {
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
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingPlayerHasJoinedOtherTicket);
            return operationResponse;
        }

        matchmakingTicket.setMemberAttribute(request.userId, request.attribute != null ? request.attribute.toData() : null, await this.getAttributeForQueue(request.userId, secretInfo.getGameId(), request.attribute, matchmakingQueueSettings));
        matchmakingTicket.setMemberStatus(request.userId, <number>MatchmakingMemberStatus.Joined);

        let allIsReady = matchmakingTicket.getMembers().find(x => x.status == <number>MatchmakingMemberStatus.Pending) == null;
        if (allIsReady) {
            matchmakingTicket.setStatus(<number>MatchmakingTicketStatus.WaitingForMatch);
        }

        matchmakingTicket.saveAsync();

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_JoinMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
