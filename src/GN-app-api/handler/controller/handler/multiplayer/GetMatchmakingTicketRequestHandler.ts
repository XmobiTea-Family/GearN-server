import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class GetMatchmakingTicketOperationRequest extends OperationRequest {
    // Stores the ticket ID value used by this instance.
    @StringDataMember({ code: ParameterCode.TicketId, minLength: 10, maxLength: 10 })
    public ticketId: string;

    // Indicates whether return member.
    @BooleanDataMember({ code: ParameterCode.ReturnMember, isOptional: true, defaultValue: false })
    public returnMember?: boolean;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetMatchmakingTicketOperationRequest extends GetMatchmakingTicketOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetMatchmakingTicketOperationRequest extends ServerGetMatchmakingTicketOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetMatchmakingTicket;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetMatchmakingTicketOperationRequest;
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

        if (!secretInfo.getPermission().multiplayer.getMatchmakingTicket.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: authInfo.getUserId(),
                ticketId: request.ticketId,
                returnMember: request.returnMember,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetMatchmakingTicketOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatchmakingTicket.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: null,
                ticketId: request.ticketId,
                returnMember: request.returnMember,
            },
            SecretRole.Server,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetMatchmakingTicketOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().multiplayer.getMatchmakingTicket.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: null,
                ticketId: request.ticketId,
                returnMember: request.returnMember,
            },
            SecretRole.Admin,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { userId: string; ticketId: string; returnMember: boolean }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetMatchmakingTicket", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the matchmaking ticket collection value used in the current execution flow.
        let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

        // find tat ca nhung cai ticket nay
        let result = await matchmakingTicketCollection.findOne({ ticketId: request.ticketId });

        if (result == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketNotFound);
            return operationResponse;
        }

        // Stores the matchmaking ticket value used in the current execution flow.
        let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);

        if (role == SecretRole.Client) {
            // Stores the member value used in the current execution flow.
            let member = matchmakingTicket.getMember(request.userId);
            if (member == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchmakingTicketNotFound);
                return operationResponse;
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        // Stores the GearN matchmaking ticket value used in the current execution flow.
        let gnMatchmakingTicket = new GNHashtable();

        gnMatchmakingTicket.add(ParameterCode.TsCreate, matchmakingTicket.getTsCreate());
        gnMatchmakingTicket.add(ParameterCode.CreatorId, matchmakingTicket.getCreatorId());
        gnMatchmakingTicket.add(ParameterCode.GiveUpAfterSeconds, matchmakingTicket.getGiveUpAfterSeconds());
        gnMatchmakingTicket.add(ParameterCode.QueueName, matchmakingTicket.getQueueName());
        gnMatchmakingTicket.add(ParameterCode.Status, matchmakingTicket.getStatus());

        if (matchmakingTicket.getStatus() == MatchmakingTicketStatus.Matched || matchmakingTicket.getStatus() == MatchmakingTicketStatus.WaitingForServer) {
            gnMatchmakingTicket.add(ParameterCode.MatchId, matchmakingTicket.getMatchId());
        }

        if (request.returnMember) {
            // Stores the GearN members value used in the current execution flow.
            let gnMembers = new GNArray();

            // Stores the members value used in the current execution flow.
            let members = matchmakingTicket.getMembers();
            for (let i = 0; i < members.length; i++) {
                // Stores the member value used in the current execution flow.
                let member = members[i];

                // Stores the GearN member value used in the current execution flow.
                let gnMember = new GNHashtable();

                gnMember.add(ParameterCode.UserId, member.userId);
                gnMember.add(ParameterCode.Status, member.status);
                gnMember.add(ParameterCode.Attribute, member.attribute);

                gnMembers.add(gnMember);
            }

            gnMatchmakingTicket.add(ParameterCode.Members, gnMembers);
        }

        operationResponse.setParameter(ParameterCode.MatchmakingTicket, gnMatchmakingTicket);

        await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetMatchmakingTicket", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
