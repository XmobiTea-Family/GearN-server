import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class GetMatchmakingTicketOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.TicketId, minLength: 10, maxLength: 10 })
    ticketId: string;

    @BooleanDataMember({ code: GNParameterCode.ReturnMember, isOptional: true, defaultValue: false })
    returnMember?: boolean;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetMatchmakingTicketOperationRequest extends GetMatchmakingTicketOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetMatchmakingTicketOperationRequest extends ServerGetMatchmakingTicketOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetMatchmakingTicket;
    }

    public override getCommonOperationRequest() {
        return GetMatchmakingTicketOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatchmakingTicket.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: authInfo.getUserId(),
            ticketId: request.ticketId,
            returnMember: request.returnMember,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetMatchmakingTicketOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatchmakingTicket.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: "",
            ticketId: request.ticketId,
            returnMember: request.returnMember,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetMatchmakingTicketOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatchmakingTicket.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: "",
            ticketId: request.ticketId,
            returnMember: request.returnMember,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, ticketId: string, returnMember: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetMatchmakingTicket", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

        // find tat ca nhung cai ticket nay
        let result = await matchmakingTicketCollection.findOne({ ticketId: request.ticketId });

        if (result == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingTicketNotFound);
            return operationResponse;
        }

        let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);

        if (secretInfo.getRole() == SecretRole.Player) {
            let member = matchmakingTicket.getMember(request.userId);
            if (member == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchmakingTicketNotFound);
                return operationResponse;
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        let gnMatchmakingTicket = new GNHashtable();

        gnMatchmakingTicket.add(GNParameterCode.TsCreate, matchmakingTicket.getTsCreate());
        gnMatchmakingTicket.add(GNParameterCode.CreatorId, matchmakingTicket.getCreatorId());
        gnMatchmakingTicket.add(GNParameterCode.GiveUpAfterSeconds, matchmakingTicket.getGiveUpAfterSeconds());
        gnMatchmakingTicket.add(GNParameterCode.QueueName, matchmakingTicket.getQueueName());
        gnMatchmakingTicket.add(GNParameterCode.Status, matchmakingTicket.getStatus());

        if (matchmakingTicket.getStatus() == <number>MatchmakingTicketStatus.Matched) {
            gnMatchmakingTicket.add(GNParameterCode.MatchId, matchmakingTicket.getMatchId());
        }

        if (request.returnMember) {
            let gnMembers = new GNArray();

            let members = matchmakingTicket.getMembers();
            for (let i = 0; i < members.length; i++) {
                let member = members[i];

                let gnMember = new GNHashtable();

                gnMember.add(GNParameterCode.UserId, member.userId);
                gnMember.add(GNParameterCode.Status, member.status);
                gnMember.add(GNParameterCode.Attribute, member.attribute);

                gnMembers.add(gnMember);
            }

            gnMatchmakingTicket.add(GNParameterCode.Members, gnMembers);
        }

        operationResponse.setParameter(GNParameterCode.MatchmakingTicket, gnMatchmakingTicket);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
