import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";

class GetPlayerFriendOperationRequest extends OperationRequest {
    // Indicates whether r ID should be used.
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    public userId?: string;

    // Stores the friend catalog IDs value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.FriendCatalogIds, isOptional: true, elementCls: String })
    public friendCatalogIds?: Array<string>;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetPlayerFriendOperationRequest extends GetPlayerFriendOperationRequest {
    // Indicates whether r ID should be used.
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare public userId: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetPlayerFriendOperationRequest extends ServerGetPlayerFriendOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetPlayerFriendRequestHandler extends GamePlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetPlayerFriend;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetPlayerFriendOperationRequest;
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

        if (!request.userId) {
            if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        } else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        } else {
            if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute(
            {
                userId: request.userId,
                friendCatalogIds: request.friendCatalogIds,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
                friendCatalogIds: request.friendCatalogIds,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.getPlayerFriend.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
                friendCatalogIds: request.friendCatalogIds,
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
    private async execute(request: { userId: string; friendCatalogIds: Array<string> }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetPlayerFriend", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the game player find options value used in the current execution flow.
        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerFriends: true,
        };

        // Stores the game player value used in the current execution flow.
        let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

        if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
            return operationResponse;
        }

        // Stores the GearN info response parameters value used in the current execution flow.
        let gnInfoResponseParameters = new GNHashtable();
        gnInfoResponseParameters.add(ParameterCode.PlayerFriends, this.generatePlayerFriends(gamePlayer, request.friendCatalogIds));

        operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetPlayerFriend", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
