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

class LinkGameCenterOperationRequest extends OperationRequest {
    // Indicates whether r ID should be used.
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    public userId?: string;

    // Stores the player ID value used by this instance.
    @StringDataMember({ code: ParameterCode.PlayerId, minLength: 2, maxLength: 64, mustNonNull: true })
    public playerId: string;

    // Stores the name value used by this instance.
    @StringDataMember({ code: ParameterCode.Name, minLength: 2, maxLength: 128, mustNonNull: true })
    public name: string;

    // Stores the public key URL value used by this instance.
    @StringDataMember({ code: ParameterCode.PublicKeyUrl, minLength: 2, maxLength: 2048, mustNonNull: true })
    public publicKeyUrl: string;

    // Stores the signature value used by this instance.
    @StringDataMember({ code: ParameterCode.Signature, minLength: 2, maxLength: 2048, mustNonNull: true })
    public signature: string;

    // Stores the salt value used by this instance.
    @StringDataMember({ code: ParameterCode.Salt, minLength: 2, maxLength: 256, mustNonNull: true })
    public salt: string;

    // Stores the timestamp value used by this instance.
    @NumberDataMember({ code: ParameterCode.Timestamp })
    public timestamp: number;

    // Indicates whether force link.
    @BooleanDataMember({ code: ParameterCode.ForceLink, isOptional: true, defaultValue: false })
    public forceLink?: boolean;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerLinkGameCenterOperationRequest extends LinkGameCenterOperationRequest {
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

class AdminLinkGameCenterOperationRequest extends ServerLinkGameCenterOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class LinkGameCenterRequestHandler extends MasterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.LinkGameCenter;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return LinkGameCenterOperationRequest;
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
            if (!secretInfo.getPermission().masterPlayer.linkGameCenter.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        } else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().masterPlayer.linkGameCenter.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        } else {
            if (!secretInfo.getPermission().masterPlayer.linkGameCenter.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute(
            {
                userId: request.userId,
                playerId: request.playerId,
                name: request.name,
                publicKeyUrl: request.publicKeyUrl,
                signature: request.signature,
                salt: request.salt,
                timestamp: request.timestamp,
                forceLink: request.forceLink,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkGameCenterOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.linkGameCenter.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
                playerId: request.playerId,
                name: request.name,
                publicKeyUrl: request.publicKeyUrl,
                signature: request.signature,
                salt: request.salt,
                timestamp: request.timestamp,
                forceLink: request.forceLink,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkGameCenterOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.linkGameCenter.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
                playerId: request.playerId,
                name: request.name,
                publicKeyUrl: request.publicKeyUrl,
                signature: request.signature,
                salt: request.salt,
                timestamp: request.timestamp,
                forceLink: request.forceLink,
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
    private async execute(request: { userId: string; playerId: string; name: string; publicKeyUrl: string; signature: string; salt: string; timestamp: number; forceLink: boolean }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkGameCenter", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the master player find options value used in the current execution flow.
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            external: true,
            userId: true,
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

        // Stores the external value used in the current execution flow.
        let external = masterPlayer.getExternal();
        if (external.gameCenter != null && external.gameCenter.playerId != null && !request.forceLink) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherValue);
            return operationResponse;
        }

        // Stores the result value used in the current execution flow.
        let result = await this.gnServer.getGameCenterService().verifyToken({
            name: request.name,
            playerId: request.playerId,
            publicKeyUrl: request.publicKeyUrl,
            salt: request.salt,
            signature: request.signature,
            timestamp: request.timestamp,
        });

        if (result["error"] != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VerifyTokenError);
            return operationResponse;
        }

        // Stores the player ID value used in the current execution flow.
        let playerId = result["playerId"];
        // Stores the display name value used in the current execution flow.
        let displayName = result["name"] ?? "";
        // Stores the email value used in the current execution flow.
        let email = result["email"] ?? "";

        // Stores the other master player value used in the current execution flow.
        let otherMasterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerByGameCenterAsync(playerId, masterPlayerFindOptions);
        if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
            if (!request.forceLink) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherAccount);
                return operationResponse;
            }

            // Stores the other external value used in the current execution flow.
            let otherExternal = otherMasterPlayer.getExternal();
            otherExternal.gameCenter = null;

            otherMasterPlayer.setExternal(otherExternal);
            await otherMasterPlayer.saveAsync();
        }

        external.gameCenter = {
            playerId: playerId,
            displayName: displayName,
            email: email,
        };
        masterPlayer.setExternal(external);
        await masterPlayer.saveAsync();

        // Stores the GearN info response parameters value used in the current execution flow.
        let gnInfoResponseParameters = new GNHashtable();

        if (role == SecretRole.Client) {
            if (secretInfo.getPermission().masterPlayer.getExternal.selfEnable) {
                gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
            }
        } else if (role == SecretRole.Server) {
            if (secretInfo.getPermission().masterPlayer.getExternal.serverSelfEnable) {
                gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
            }
        } else if (role == SecretRole.Admin) {
            if (secretInfo.getPermission().masterPlayer.getExternal.adminSelfEnable) {
                gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
            }
        }

        operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkGameCenter", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
