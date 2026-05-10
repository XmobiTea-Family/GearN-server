import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { PlayerStatisticsParam } from "./model/PlayerStatisticsParam";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";

class ChangePlayerStatisticsOperationRequest extends OperationRequest {
    // Stores the character ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    public characterId: string;

    // Stores the player statistics value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerStatisticsParam })
    public playerStatistics: Array<PlayerStatisticsParam>;

    // Stores the log value used by this instance.
    @StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    public log?: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerChangePlayerStatisticsOperationRequest extends ChangePlayerStatisticsOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminChangePlayerStatisticsOperationRequest extends ServerChangePlayerStatisticsOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class ChangePlayerStatisticsRequestHandler extends CharacterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.ChangePlayerStatistics;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return ChangePlayerStatisticsOperationRequest;
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
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.changePlayerStatistics);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                playerStatistics: request.playerStatistics,
                log: request.log,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.changePlayerStatistics.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                playerStatistics: request.playerStatistics,
                log: request.log,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.changePlayerStatistics.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                playerStatistics: request.playerStatistics,
                log: request.log,
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
    private async execute(request: { characterId: string; playerStatistics: Array<PlayerStatisticsParam>; log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_ChangePlayerStatistics", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the resolved character player settings instance for the current execution flow.
        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

        for (let i = 0; i < request.playerStatistics.length; i++) {
            // Stores the player statistics parameter value used in the current execution flow.
            let playerStatisticsParam = request.playerStatistics[i];

            // Stores the key value used in the current execution flow.
            let key = playerStatisticsParam.key;

            // Stores the player statistics settings item value used in the current execution flow.
            let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find((x) => x.key == key);
            if (playerStatisticsSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
                operationResponse.setDebugMessage("StatisticsKey not found " + key);
                return operationResponse;
            }
        }

        // Stores the character player find options value used in the current execution flow.
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            playerStatistics: true,
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
        // Stores the GearN player statistics value used in the current execution flow.
        let gnPlayerStatistics = new GNArray();

        let logs: { characterId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string }[] = [];

        for (let i = 0; i < request.playerStatistics.length; i++) {
            // Stores the player statistics parameter value used in the current execution flow.
            let playerStatisticsParam = request.playerStatistics[i];

            // Stores the key value used in the current execution flow.
            let key = playerStatisticsParam.key;

            // Stores the player statistics settings item value used in the current execution flow.
            let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find((x) => x.key == key);
            if (playerStatisticsSettingsItem == null) continue;

            // Stores the value value used in the current execution flow.
            let value = playerStatisticsParam.value;

            // Stores the GearN player statistic value used in the current execution flow.
            let gnPlayerStatistic = new GNHashtable();
            gnPlayerStatistic.add(ParameterCode.Key, key);

            // Tracks whether set player statistics should be used.
            let useSetPlayerStatistics = false;
            if (!characterPlayer.hasPlayerStatistics(key)) {
                useSetPlayerStatistics = true;
                characterPlayer.setPlayerStatistics(key, playerStatisticsSettingsItem.initialValue, currentMilliseconds);
            }

            // Stores the player statistics value used in the current execution flow.
            let playerStatistics = characterPlayer.getPlayerStatistics(key);
            // Stores the old value value used in the current execution flow.
            let oldValue = playerStatistics.value;

            // Stores the statistics aggregation method value used in the current execution flow.
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

            if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
                // Stores the new value value used in the current execution flow.
                let newValue = value + playerStatistics.value;

                if (playerStatisticsSettingsItem.maximumValue != null) {
                    if (newValue > playerStatisticsSettingsItem.maximumValue) {
                        useSetPlayerStatistics = true;
                        newValue = playerStatisticsSettingsItem.maximumValue;
                    }
                }

                if (playerStatisticsSettingsItem.minimumValue != null) {
                    if (newValue < playerStatisticsSettingsItem.minimumValue) {
                        useSetPlayerStatistics = true;
                        newValue = playerStatisticsSettingsItem.minimumValue;
                    }
                }

                if (useSetPlayerStatistics) {
                    characterPlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
                } else {
                    characterPlayer.changePlayerStatistics(key, value, currentMilliseconds);
                }

                gnPlayerStatistic.add(ParameterCode.Value, newValue);

                logs.push({
                    characterId: request.characterId,
                    key: key,
                    amount: playerStatisticsParam.value,
                    startValue: oldValue,
                    finalValue: newValue,
                    tsCreate: currentMilliseconds,
                    log: request.log,
                });
            } else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
                if (value > playerStatistics.value) {
                    if (playerStatisticsSettingsItem.maximumValue != null) {
                        if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                    }

                    if (playerStatisticsSettingsItem.minimumValue != null) {
                        if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                    }

                    characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(ParameterCode.Value, value);

                    logs.push({
                        characterId: request.characterId,
                        key: key,
                        amount: playerStatisticsParam.value,
                        startValue: oldValue,
                        finalValue: value,
                        tsCreate: currentMilliseconds,
                        log: request.log,
                    });
                } else {
                    if (playerStatisticsSettingsItem.maximumValue != null) {
                        if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
                            playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
                            characterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
                        }
                    }

                    if (playerStatisticsSettingsItem.minimumValue != null) {
                        if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
                            playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
                            characterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
                        }
                    }

                    gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

                    logs.push({
                        characterId: request.characterId,
                        key: key,
                        amount: playerStatisticsParam.value,
                        startValue: oldValue,
                        finalValue: playerStatistics.value,
                        tsCreate: currentMilliseconds,
                        log: request.log,
                    });
                }
            } else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
                if (value < playerStatistics.value) {
                    if (playerStatisticsSettingsItem.maximumValue != null) {
                        if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                    }

                    if (playerStatisticsSettingsItem.minimumValue != null) {
                        if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                    }

                    characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(ParameterCode.Value, value);

                    logs.push({
                        characterId: request.characterId,
                        key: key,
                        amount: playerStatisticsParam.value,
                        startValue: oldValue,
                        finalValue: value,
                        tsCreate: currentMilliseconds,
                        log: request.log,
                    });
                } else {
                    if (playerStatisticsSettingsItem.maximumValue != null) {
                        if (playerStatistics.value > playerStatisticsSettingsItem.maximumValue) {
                            playerStatistics.value = playerStatisticsSettingsItem.maximumValue;
                            characterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
                        }
                    }

                    if (playerStatisticsSettingsItem.minimumValue != null) {
                        if (playerStatistics.value < playerStatisticsSettingsItem.minimumValue) {
                            playerStatistics.value = playerStatisticsSettingsItem.minimumValue;
                            characterPlayer.setPlayerStatistics(key, playerStatistics.value, currentMilliseconds);
                        }
                    }

                    gnPlayerStatistic.add(ParameterCode.Value, playerStatistics.value);

                    logs.push({
                        characterId: request.characterId,
                        key: key,
                        amount: playerStatisticsParam.value,
                        startValue: oldValue,
                        finalValue: playerStatistics.value,
                        tsCreate: currentMilliseconds,
                        log: request.log,
                    });
                }
            } else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
                if (playerStatisticsSettingsItem.maximumValue != null) {
                    if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                }

                if (playerStatisticsSettingsItem.minimumValue != null) {
                    if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                }

                characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                gnPlayerStatistic.add(ParameterCode.Value, value);

                logs.push({
                    characterId: request.characterId,
                    key: key,
                    amount: playerStatisticsParam.value,
                    startValue: oldValue,
                    finalValue: value,
                    tsCreate: currentMilliseconds,
                    log: request.log,
                });
            }

            gnPlayerStatistics.add(gnPlayerStatistic);
        }

        this.gnServer.getDatabase().characterPlayerRepository.insertCharacterPlayerStatisticsLogsAsync(logs, secretInfo.getGameId());

        await characterPlayer.saveAsync();

        gnInfoResponseParameters.add(ParameterCode.PlayerStatistics, gnPlayerStatistics);

        operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_ChangePlayerStatistics", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
