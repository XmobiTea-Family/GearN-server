import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingTicket } from "../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class GetAllMatchmakingTicketOperationRequest extends OperationRequest {
    @NumberDataMember({ code: GNParameterCode.Status, minValue: 1, maxValue: 5, isOptional: true, mustInt: true })
    status?: number;

    @BooleanDataMember({ code: GNParameterCode.ReturnMember, isOptional: true, defaultValue: false })
    returnMember?: boolean;

    @NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
    skip?: number;

    @NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    limit?: number;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetAllMatchmakingTicketOperationRequest extends GetAllMatchmakingTicketOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetAllMatchmakingTicketOperationRequest extends ServerGetAllMatchmakingTicketOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetAllMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetAllMatchmakingTicket;
    }

    public override getCommonOperationRequest() {
        return GetAllMatchmakingTicketOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getAllMatchmakingTicket.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            status: request.status,
            returnMember: request.returnMember,
            skip: request.skip,
            limit: request.limit,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetAllMatchmakingTicketOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getAllMatchmakingTicket.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            status: request.status,
            returnMember: request.returnMember,
            skip: request.skip,
            limit: request.limit,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetAllMatchmakingTicketOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getAllMatchmakingTicket.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            status: request.status,
            returnMember: request.returnMember,
            skip: request.skip,
            limit: request.limit,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { status: number, returnMember: boolean, skip: number, limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetAllMatchmakingTicket", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

        let $filter = {} as any;
        if (request.status != null && request.status != 0) {
            $filter["status"] = request.status;
        }

        let projection = null;
        if (!request.returnMember) {
            projection = {
                "members": false
            }
        }

        let gnResults = new GNArray();
        let results = await matchmakingTicketCollection
            .find($filter, { projection: projection })
            .sort({ "_id": -1 })
            .skip(request.skip)
            .limit(request.limit);

        while (await results.hasNext()) {
            let result = await results.next();

            let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);

            let gnMatchmakingTicket = new GNHashtable();

            gnMatchmakingTicket.add(GNParameterCode.TicketId, matchmakingTicket.getTicketId());
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

            gnResults.add(gnMatchmakingTicket);
        }

        operationResponse.setParameter(GNParameterCode.Results, gnResults);
        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetAllMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
