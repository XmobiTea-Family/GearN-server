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

class GetAllMatchOperationRequest extends OperationRequest {
    @BooleanDataMember({ code: ParameterCode.ReturnMember, isOptional: true, defaultValue: false })
    returnMember?: boolean;

    @NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
    skip?: number;

    @NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    limit?: number;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetAllMatchOperationRequest extends GetAllMatchOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetAllMatchOperationRequest extends ServerGetAllMatchOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetAllMatchRequestHandler extends MultiplayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetAllMatch;
    }

    public override getCommonOperationRequest() {
        return GetAllMatchOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getAllMatch.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            returnMember: request.returnMember,
            skip: request.skip,
            limit: request.limit,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetAllMatchOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getAllMatch.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            returnMember: request.returnMember,
            skip: request.skip,
            limit: request.limit,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetAllMatchOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getAllMatch.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            returnMember: request.returnMember,
            skip: request.skip,
            limit: request.limit,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { returnMember: boolean, skip: number, limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetAllMatch", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", secretInfo.getGameId());

        let projection: any = null;
        if (!request.returnMember) {
            projection = {
                members: false
            }
        }

        // find tat ca nhung cai ticket nay
        let results = await matchCollection
            .find({}, {
                projection: projection
            })
            .sort({ "_id": -1 }).skip(request.skip).limit(request.limit);

        let gnResults = new GNArray();

        while (await results.hasNext()) {
            let result = await results.next();

            let match = new Match(result, matchCollection);

            let gnMatch = new GNHashtable();

            gnMatch.add(ParameterCode.MatchId, match.getMatchId());
            gnMatch.add(ParameterCode.TsCreate, match.getTsCreate());
            gnMatch.add(ParameterCode.QueueName, match.getQueueName());
            gnMatch.add(ParameterCode.TimeToMatchInSeconds, match.getTimeToMatchInSeconds());

            if (request.returnMember) {
                let gnMembers = new GNArray();

                let members = match.getMembers();
                for (let i = 0; i < members.length; i++) {
                    let member = members[i];

                    let gnMember = new GNHashtable();

                    gnMember.add(ParameterCode.UserId, member.userId);
                    gnMember.add(ParameterCode.TeamId, member.teamId);
                    gnMember.add(ParameterCode.Attribute, member.attribute);

                    gnMembers.add(gnMember);
                }

                gnMatch.add(ParameterCode.Members, gnMembers);
            }

            let serverDetail = match.getServerDetail();
            if (serverDetail != null) {
                let gnServerDetail = new GNHashtable();

                gnServerDetail.add(ParameterCode.IpV4Address, serverDetail.ipV4Address);

                let gnPorts = new GNArray();
                let ports = serverDetail.ports;

                for (let i = 0; i < ports.length; i++) {
                    let port = ports[i];

                    let gnPort = new GNHashtable();

                    gnPort.add(ParameterCode.Name, port.name);
                    gnPort.add(ParameterCode.PublicPort, port.publicPort);
                    gnPort.add(ParameterCode.PrivatePort, port.privatePort);
                    gnPort.add(ParameterCode.Protocol, port.protocol);

                    gnPorts.add(gnPort);
                }

                gnServerDetail.add(ParameterCode.Ports, gnPorts);

                gnMatch.add(ParameterCode.ServerDetail, gnServerDetail);
            }

            gnResults.add(gnMatch);
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);
        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetAllMatch", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
