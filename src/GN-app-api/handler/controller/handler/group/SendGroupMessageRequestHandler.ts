import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { GroupMessageItem } from "./model/GroupMessageItem";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";

class SendGroupMessageOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.SenderId, minLength: 10, maxLength: 11, mustNonNull: true })
    senderId: string;

    @StringDataMember({ code: GNParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
    groupId: string;

    @StringDataMember({ code: GNParameterCode.Message, minLength: 2, maxLength: 256, mustNonNull: true })
    message: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSendGroupMessageOperationRequest extends SendGroupMessageOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSendGroupMessageOperationRequest extends ServerSendGroupMessageOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SendGroupMessageRequestHandler extends GroupBaseRequestHandler {

    public override getCode() {
        return OperationCode.SendGroupMessage;
    }

    public override getCommonOperationRequest() {
        return SendGroupMessageOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.sendGroupMessage);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            message: request.message,
            senderId: request.senderId,
            userId: authInfo.getUserId(),
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSendGroupMessageOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.sendGroupMessage.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            message: request.message,
            senderId: request.senderId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSendGroupMessageOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.sendGroupMessage.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            message: request.message,
            senderId: request.senderId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { groupId: string, message: string, senderId: string, userId?: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SendGroupMessage", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let groupFindOptions: GroupFindOptions = {
            members: true,
            groupType: true,
            catalogId: true,
            removeStatus: true,
        }

        let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);
        if (group == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GroupNotFound);
            return operationResponse;
        }

        let removeStatus = group.getRemoveStatus();
        if (removeStatus.tsRemove != 0) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GroupNotFound);
            return operationResponse;
        }

        let groupType = <OwnerType>group.getGroupType();
        let catalogId = group.getCatalogId();

        let senderType: number = <number>groupType;

        if (groupType == OwnerType.GamePlayer) {
            let groupSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
            let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
            if (playerGroupCatalogSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GroupNotFound);
                return operationResponse;
            }
        }
        else if (groupType == OwnerType.CharacterPlayer) {
            let groupSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
            let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
            if (playerGroupCatalogSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GroupNotFound);
                return operationResponse;
            }
        }

        let role = <SecretRole>secretInfo.getRole();
        if (role == SecretRole.Player) {
            if (!this.isMember(group, request.userId, secretInfo.getGameId())) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.PlayerNotMember);
                return operationResponse;
            }
        }

        let groupMessageItem: GroupMessageItem = {
            message: request.message,
            senderId: request.senderId,
            senderType: senderType,
            tsCreate: xDatetime.getCurrentMilliseconds()
        };

        this.sendGroupMessage(request.groupId, secretInfo.getGameId(), groupMessageItem);

        {
            let gnGroupMessages = new GNArray();

            let gnGroupMessageItem = new GNHashtable();

            gnGroupMessageItem.add(GNParameterCode.Message, groupMessageItem.message);
            gnGroupMessageItem.add(GNParameterCode.SenderId, groupMessageItem.senderId);
            gnGroupMessageItem.add(GNParameterCode.SenderType, groupMessageItem.senderType);
            gnGroupMessageItem.add(GNParameterCode.TsCreate, groupMessageItem.tsCreate);

            gnGroupMessages.add(gnGroupMessageItem);

            operationResponse.setParameter(GNParameterCode.GroupMessages, gnGroupMessages);

            let groupMessageUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMessageUpdate, null, operationRequest.isEncrypted());

            groupMessageUpdateOperationEvent.setParameter(GNParameterCode.GroupMessages, gnGroupMessages);
            groupMessageUpdateOperationEvent.setParameter(GNParameterCode.GroupId, request.groupId);

            if (groupType == OwnerType.CharacterPlayer)
                groupMessageUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.senderId);

            this.gnServer.sendEventToRoom(request.groupId, groupMessageUpdateOperationEvent);
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_SendGroupMessage", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
