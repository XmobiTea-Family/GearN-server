import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { CustomDataParam } from "./model/CustomDataParam";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "./../../../../../GN-common/constant/enumType/PermissionDataItem";

class SetCustomDataOperationRequest extends OperationRequest {
    // Stores the character ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    public characterId: string;

    // Stores the custom datas value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.CustomDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: CustomDataParam })
    public customDatas: Array<CustomDataParam>;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetCustomDataOperationRequest extends SetCustomDataOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetCustomDataOperationRequest extends ServerSetCustomDataOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetCustomDataRequestHandler extends CharacterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.SetCustomData;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return SetCustomDataOperationRequest;
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
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.setCustomData);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                customDatas: request.customDatas,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetCustomDataOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.setCustomData.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                customDatas: request.customDatas,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetCustomDataOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.setCustomData.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                customDatas: request.customDatas,
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
    private async execute(request: { characterId: string; customDatas: Array<CustomDataParam> }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_SetCustomData", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the resolved character player settings instance for the current execution flow.
        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

        for (let i = 0; i < request.customDatas.length; i++) {
            // Stores the custom data parameter value used in the current execution flow.
            let customDataParameter = request.customDatas[i];

            // Stores the key value used in the current execution flow.
            let key = customDataParameter.key;

            // Stores the custom datas settings item value used in the current execution flow.
            let customDatasSettingsItem = characterPlayerSettings.customDatasSettings.find((x) => x.key == key);
            if (customDatasSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
                operationResponse.setDebugMessage("CustomKey not found " + key);
                return operationResponse;
            }

            if (customDatasSettingsItem.permission == PermissionDataItem.ReadOnly && role == SecretRole.Client) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
                operationResponse.setDebugMessage("CustomKey is readOnly " + key + ", change it by server or admin role");
                return operationResponse;
            }
        }

        // Stores the character player find options value used in the current execution flow.
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            customDatas: true,
            playerBan: true,
            removeStatus: true,
        };

        // Stores the character player value used in the current execution flow.
        let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

        if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
            return operationResponse;
        }

        // Stores the current milliseconds value used in the current execution flow.
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        if (role == SecretRole.Client) {
            // Stores the character ban value used in the current execution flow.
            let playerBan = characterPlayer.getPlayerBan();

            if (playerBan.tsExpire != 0) {
                if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
                    operationResponse.setDebugMessage("CharacterPlayer is banned, reason " + playerBan.reason);

                    return operationResponse;
                }
            }

            let removeStatus = characterPlayer.getRemoveStatus();

            if (removeStatus.tsRemove != 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
                operationResponse.setDebugMessage("CharacterPlayer is removed, reason " + removeStatus.reason);

                return operationResponse;
            }
        }

        // Stores the GearN info response parameters value used in the current execution flow.
        let gnInfoResponseParameters = new GNHashtable();
        // Stores the GearN custom datas value used in the current execution flow.
        let gnCustomDatas = new GNArray();

        for (let i = 0; i < request.customDatas.length; i++) {
            // Stores the custom data parameter value used in the current execution flow.
            let customDataParameter = request.customDatas[i];

            // Stores the key value used in the current execution flow.
            let key = customDataParameter.key;

            // Stores the custom datas settings item value used in the current execution flow.
            let customDatasSettingsItem = characterPlayerSettings.customDatasSettings.find((x) => x.key == key);
            if (customDatasSettingsItem == null) continue;

            // Stores the value value used in the current execution flow.
            let value = customDataParameter.value;

            let permission = customDatasSettingsItem.permission;

            if (permission == PermissionDataItem.ReadOnly && role == SecretRole.Client) {
            } else {
                if (value == null) {
                    if (characterPlayer.hasCustomData(key)) {
                        characterPlayer.removeCustomData(key);
                    }
                } else {
                    if (value instanceof GNData) {
                        value = (value as GNData).toData();
                    }

                    characterPlayer.setCustomData(key, value as DataValueType);
                }

                // Stores the GearN item data value used in the current execution flow.
                let gnCustomData = new GNHashtable();
                gnCustomData.add(ParameterCode.Key, key);
                gnCustomData.add(ParameterCode.Value, customDataParameter.value);

                gnCustomDatas.add(gnCustomData);
            }
        }

        await characterPlayer.saveAsync();

        gnInfoResponseParameters.add(ParameterCode.CustomDatas, gnCustomDatas);

        operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_SetCustomData", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
