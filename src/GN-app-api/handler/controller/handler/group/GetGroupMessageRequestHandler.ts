import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GetGroupMessageOperationRequest extends OperationRequest {
    // Stores the group ID value used by this instance.
    @StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
    public groupId: string;

    // Stores the skip value used by this instance.
    @NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
    public skip?: number;

    // Stores the limit value used by this instance.
    @NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    public limit?: number;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetGroupMessageOperationRequest extends GetGroupMessageOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetGroupMessageOperationRequest extends ServerGetGroupMessageOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetGroupMessageRequestHandler extends GroupBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetGroupMessage;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetGroupMessageOperationRequest;
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

        // Tracks whether method is allowed.
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.getGroupMessage);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                groupId: request.groupId,
                skip: request.skip,
                limit: request.limit,
                userId: authInfo.getUserId(),
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetGroupMessageOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getGroupMessage.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                groupId: request.groupId,
                skip: request.skip,
                limit: request.limit,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetGroupMessageOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getGroupMessage.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                groupId: request.groupId,
                skip: request.skip,
                limit: request.limit,
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
    private async execute(request: { groupId: string; skip: number; limit: number; userId?: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetGroupMessage", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the group find options value used in the current execution flow.
        let groupFindOptions: GroupFindOptions = {
            members: true,
            groupType: true,
            catalogId: true,
            removeStatus: true,
        };

        // Stores the group value used in the current execution flow.
        let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);
        if (group == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
            return operationResponse;
        }

        // Stores the remove status value used in the current execution flow.
        let removeStatus = group.getRemoveStatus();
        if (removeStatus.tsRemove != 0) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
            return operationResponse;
        }

        // Stores the group type value used in the current execution flow.
        let groupType = group.getGroupType();
        // Stores the catalog ID value used in the current execution flow.
        let catalogId = group.getCatalogId();

        if (groupType == OwnerType.GamePlayer) {
            // Stores the resolved group settings instance for the current execution flow.
            let groupSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
            // Stores the player group catalog settings item value used in the current execution flow.
            let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find((x) => x.catalogId == catalogId);
            if (playerGroupCatalogSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
                return operationResponse;
            }
        } else if (groupType == OwnerType.CharacterPlayer) {
            // Stores the resolved group settings instance for the current execution flow.
            let groupSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
            // Stores the player group catalog settings item value used in the current execution flow.
            let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find((x) => x.catalogId == catalogId);
            if (playerGroupCatalogSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
                return operationResponse;
            }
        }

        if (role == SecretRole.Client) {
            if (!(await this.isMember(group, request.userId, secretInfo.getGameId()))) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerNotMember);
                return operationResponse;
            }
        }

        // Stores the group message items value used in the current execution flow.
        let groupMessageItems = await this.getGroupMessages(request.groupId, secretInfo.getGameId(), request.skip, request.limit);

        // Stores the GearN group messages value used in the current execution flow.
        let gnGroupMessages = new GNArray();

        for (let i = 0; i < groupMessageItems.length; i++) {
            // Stores the group message item value used in the current execution flow.
            let groupMessageItem = groupMessageItems[i];

            // Stores the GearN group message item value used in the current execution flow.
            let gnGroupMessageItem = new GNHashtable();

            gnGroupMessageItem.add(ParameterCode.Message, groupMessageItem.message);
            gnGroupMessageItem.add(ParameterCode.SenderId, groupMessageItem.senderId);
            gnGroupMessageItem.add(ParameterCode.SenderType, groupMessageItem.senderType);
            gnGroupMessageItem.add(ParameterCode.TsCreate, groupMessageItem.tsCreate);

            gnGroupMessages.add(gnGroupMessageItem);
        }

        operationResponse.setParameter(ParameterCode.GroupMessages, gnGroupMessages);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_GetGroupMessage", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
