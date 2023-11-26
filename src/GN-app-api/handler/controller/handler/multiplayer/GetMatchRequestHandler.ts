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
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { Match } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Match";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class GetMatchOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.MatchId, minLength: 15, maxLength: 15 })
    matchId: string;

    @BooleanDataMember({ code: GNParameterCode.ReturnMember, isOptional: true, defaultValue: false })
    returnMember?: boolean;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetMatchOperationRequest extends GetMatchOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetMatchOperationRequest extends ServerGetMatchOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetMatchRequestHandler extends MultiplayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetMatch;
    }

    public override getCommonOperationRequest() {
        return GetMatchOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatch.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            matchId: request.matchId,
            returnMember: request.returnMember,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetMatchOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatch.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            matchId: request.matchId,
            returnMember: request.returnMember,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetMatchOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatch.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            matchId: request.matchId,
            returnMember: request.returnMember,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { matchId: string, returnMember: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetMatch", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", secretInfo.getGameId());

        let projection: any = null;
        if (!request.returnMember) {
            projection = {
                members: false
            }
        }

        // find tat ca nhung cai ticket nay
        let result = await matchCollection.findOne({ matchId: request.matchId }, {
            projection: projection
        });

        if (result == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MatchNotFound);
            return operationResponse;
        }

        let match = new Match(result, matchCollection);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        let gnMatch = new GNHashtable();

        gnMatch.add(GNParameterCode.TsCreate, match.getTsCreate());
        gnMatch.add(GNParameterCode.QueueName, match.getQueueName());
        gnMatch.add(GNParameterCode.TimeToMatchInSeconds, match.getTimeToMatchInSeconds());

        if (request.returnMember) {
            let gnMembers = new GNArray();

            let members = match.getMembers();
            for (let i = 0; i < members.length; i++) {
                let member = members[i];

                let gnMember = new GNHashtable();

                gnMember.add(GNParameterCode.UserId, member.userId);
                gnMember.add(GNParameterCode.TeamId, member.teamId);
                gnMember.add(GNParameterCode.Attribute, member.attribute);

                gnMembers.add(gnMember);
            }

            gnMatch.add(GNParameterCode.Members, gnMembers);
        }

        let serverDetail = match.getServerDetail();
        if (serverDetail != null) {
            let gnServerDetail = new GNHashtable();

            gnServerDetail.add(GNParameterCode.IpV4Address, serverDetail.ipV4Address);

            let gnPorts = new GNArray();
            let ports = serverDetail.ports;

            for (let i = 0; i < ports.length; i++) {
                let port = ports[i];

                let gnPort = new GNHashtable();

                gnPort.add(GNParameterCode.Name, port.name);
                gnPort.add(GNParameterCode.PublicPort, port.publicPort);
                gnPort.add(GNParameterCode.PrivatePort, port.privatePort);
                gnPort.add(GNParameterCode.Protocol, port.protocol);

                gnPorts.add(gnPort);
            }

            gnServerDetail.add(GNParameterCode.Ports, gnPorts);

            gnMatch.add(GNParameterCode.ServerDetail, gnServerDetail);
        }

        operationResponse.setParameter(GNParameterCode.Match, gnMatch);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetMatch", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
