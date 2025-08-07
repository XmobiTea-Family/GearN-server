import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class LeaveGroupOperationRequest extends OperationRequest {
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    @StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
    groupId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerLeaveGroupOperationRequest extends LeaveGroupOperationRequest {
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminLeaveGroupOperationRequest extends ServerLeaveGroupOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class LeaveGroupRequestHandler extends GamePlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.LeaveGroup;
    }

    public override getCommonOperationRequest() {
        return LeaveGroupOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!request.userId) {
            if (!secretInfo.getPermission().gamePlayer.leaveGroup.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().gamePlayer.leaveGroup.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().gamePlayer.leaveGroup.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: request.userId,
            groupId: request.groupId,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLeaveGroupOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.leaveGroup.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            groupId: request.groupId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLeaveGroupOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.leaveGroup.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            groupId: request.groupId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, groupId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_LeaveGroup", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let groupFindOptions: GroupFindOptions = {
            members: true,
            groupType: true,
            catalogId: true,
        }

        let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);
        if (group == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
            return operationResponse;
        }

        let groupType = <OwnerType>group.getGroupType();
        if (groupType != OwnerType.GamePlayer) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
            return operationResponse;
        }

        let removeStatus = group.getRemoveStatus();
        if (removeStatus.tsRemove != 0) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
            return operationResponse;
        }

        let catalogId = group.getCatalogId();
        let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
        let playerGroupCatalogSettingsItem = gamePlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
        if (playerGroupCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
            return operationResponse;
        }

        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerGroups: true
        }

        let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

        if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
            return operationResponse;
        }

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        if (gamePlayer.hasPlayerGroup(request.groupId)) {
            gamePlayer.removePlayerGroup(request.groupId);
            gamePlayer.saveAsync();

            {
                let gnPlayerGroups = new GNArray();

                let gnPlayerGroup = new GNHashtable();
                gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
                gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
                gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.NotMember);
                gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                gnPlayerGroups.add(gnPlayerGroup);

                let gamePlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

                gamePlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

                this.gnServer.sendEventTo(request.userId, gamePlayerGroupUpdateOperationEvent);
            }
        }

        if (group.hasMember(request.userId)) {
            group.removeMember(request.userId);
            group.saveAsync();

            {
                let gnMembers = new GNArray();

                let gnMember = new GNHashtable();

                gnMember.add(ParameterCode.UserId, request.userId);
                gnMember.add(ParameterCode.Status, <number>GroupStatus.NotMember);

                gnMembers.add(gnMember);

                let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

                groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

                this.gnServer.leaveRoom(request.userId, request.groupId);

                this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_LeaveGroup", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
