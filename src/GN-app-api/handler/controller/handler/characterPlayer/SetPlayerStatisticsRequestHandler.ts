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

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { PlayerStatisticsParam } from "./model/PlayerStatisticsParam";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";

class SetPlayerStatisticsOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    characterId: string;

    @GNArrayDataMember({ code: GNParameterCode.PlayerStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerStatisticsParam })
    playerStatisticsParams: Array<PlayerStatisticsParam>;

    @StringDataMember({ code: GNParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    log?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetPlayerStatisticsOperationRequest extends SetPlayerStatisticsOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetPlayerStatisticsOperationRequest extends ServerSetPlayerStatisticsOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetPlayerStatisticsRequestHandler extends CharacterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.SetPlayerStatistics;
    }

    public override getCommonOperationRequest() {
        return SetPlayerStatisticsOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.setPlayerStatistics);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            playerStatisticsParams: request.playerStatisticsParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.setPlayerStatistics.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            playerStatisticsParams: request.playerStatisticsParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.setPlayerStatistics.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            playerStatisticsParams: request.playerStatisticsParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { characterId: string, playerStatisticsParams: Array<PlayerStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_SetPlayerStatistics", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            playerStatistics: true,
        }

        let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

        if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
            return operationResponse;
        }

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

        let gnInfoResponseParameters = new GNHashtable();
        let gnPlayerStatistics = new GNArray();

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < request.playerStatisticsParams.length; i++) {
            let playerStatisticsParam = request.playerStatisticsParams[i];

            let key = playerStatisticsParam.key;

            let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == key);
            if (playerStatisticsSettingsItem == null) continue;

            let value = playerStatisticsParam.value;

            let gnPlayerStatistic = new GNHashtable();
            gnPlayerStatistic.add(GNParameterCode.Key, key);

            if (!characterPlayer.hasPlayerStatistics(key)) 
                characterPlayer.setPlayerStatistics(key, playerStatisticsSettingsItem.initialValue, currentMilliseconds);
            
            let playerStatistics = characterPlayer.getPlayerStatistics(key);
            let oldValue = playerStatistics.value;

            let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;

            if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
                let newValue = value + playerStatistics.value;

                if (playerStatisticsSettingsItem.maximumValue != null) {
                    if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                }

                if (playerStatisticsSettingsItem.minimumValue != null) {
                    if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                }

                characterPlayer.setPlayerStatistics(key, newValue, currentMilliseconds);
                gnPlayerStatistic.add(GNParameterCode.Value, newValue);

                this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, newValue, request.log);
            }
            else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
                if (value > playerStatistics.value) {
                    if (playerStatisticsSettingsItem.maximumValue != null) {
                        if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                    }

                    if (playerStatisticsSettingsItem.minimumValue != null) {
                        if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                    }

                    characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(GNParameterCode.Value, value);

                    this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
                }
                else {
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

                    gnPlayerStatistic.add(GNParameterCode.Value, playerStatistics.value);

                    this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
                }
            }
            else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
                if (value < playerStatistics.value) {
                    if (playerStatisticsSettingsItem.maximumValue != null) {
                        if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                    }

                    if (playerStatisticsSettingsItem.minimumValue != null) {
                        if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                    }

                    characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                    gnPlayerStatistic.add(GNParameterCode.Value, value);

                    this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
                }
                else {
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

                    gnPlayerStatistic.add(GNParameterCode.Value, playerStatistics.value);

                    this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, playerStatistics.value, request.log);
                }
            }
            else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
                if (playerStatisticsSettingsItem.maximumValue != null) {
                    if (value > playerStatisticsSettingsItem.maximumValue) value = playerStatisticsSettingsItem.maximumValue;
                }

                if (playerStatisticsSettingsItem.minimumValue != null) {
                    if (value < playerStatisticsSettingsItem.minimumValue) value = playerStatisticsSettingsItem.minimumValue;
                }

                characterPlayer.setPlayerStatistics(key, value, currentMilliseconds);
                gnPlayerStatistic.add(GNParameterCode.Value, value);

                this.gnServer.getDatabase().insertCharacterPlayerStatisticsLogAsync(request.characterId, secretInfo.getGameId(), key, playerStatisticsParam.value, oldValue, value, request.log);
            }

            gnPlayerStatistics.add(gnPlayerStatistic);
        }

        characterPlayer.saveAsync();

        gnInfoResponseParameters.add(GNParameterCode.PlayerStatistics, gnPlayerStatistics);

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_SetPlayerStatistics", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
