import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class UpdateTsLastLoginOperationRequest extends OperationRequest {
    // Indicates whether r ID should be used.
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    public userId?: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerUpdateTsLastLoginOperationRequest extends UpdateTsLastLoginOperationRequest {
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

class AdminUpdateTsLastLoginOperationRequest extends ServerUpdateTsLastLoginOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class UpdateTsLastLoginRequestHandler extends MasterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.UpdateTsLastLogin;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return UpdateTsLastLoginOperationRequest;
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
            if (!secretInfo.getPermission().masterPlayer.updateTsLastLogin.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        } else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().masterPlayer.updateTsLastLogin.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        } else {
            if (!secretInfo.getPermission().masterPlayer.updateTsLastLogin.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute(
            {
                userId: request.userId,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerUpdateTsLastLoginOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.updateTsLastLogin.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminUpdateTsLastLoginOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.updateTsLastLogin.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
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
    private async execute(request: { userId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_UpdateTsLastLogin", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the master player find options value used in the current execution flow.
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            tsLastLogin: true,
            playerBan: true,
        };

        // Stores the master player value used in the current execution flow.
        let masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

        if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
            return operationResponse;
        }
        if (role == SecretRole.Client) {
            // Stores the player ban value used in the current execution flow.
            let playerBan = masterPlayer.getPlayerBan();

            if (playerBan.tsExpire != 0) {
                let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
                    operationResponse.setDebugMessage("MasterPlayer is banned, reason " + playerBan.reason);

                    return operationResponse;
                }
            }
        }

        masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
        await masterPlayer.saveAsync();

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_UpdateTsLastLogin", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
