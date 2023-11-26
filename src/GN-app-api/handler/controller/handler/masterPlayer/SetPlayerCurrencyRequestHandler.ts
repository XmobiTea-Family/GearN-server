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

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { PlayerCurrencyParam } from "./model/PlayerCurrencyParam";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class SetPlayerCurrenciesOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    @GNArrayDataMember({ code: GNParameterCode.PlayerCurrencies, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerCurrencyParam })
    playerCurrencyParams: Array<PlayerCurrencyParam>;

    @StringDataMember({ code: GNParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    log?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetPlayerCurrenciesOperationRequest extends SetPlayerCurrenciesOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetPlayerCurrenciesOperationRequest extends ServerSetPlayerCurrenciesOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetPlayerCurrencyRequestHandler extends MasterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.SetPlayerCurrency;
    }

    public override getCommonOperationRequest() {
        return SetPlayerCurrenciesOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!request.userId) {
            if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: request.userId,
            playerCurrencyParams: request.playerCurrencyParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerCurrenciesOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            playerCurrencyParams: request.playerCurrencyParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerCurrenciesOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            playerCurrencyParams: request.playerCurrencyParams,
            log: request.log,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, playerCurrencyParams: Array<PlayerCurrencyParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_SetPlayerCurrency", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerCurrencies: true,
        }

        let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

        if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MasterPlayerNotFound);
            return operationResponse;
        }

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

        let gnInfoResponseParameters = new GNHashtable();
        let gnPlayerCurrencies = new GNArray();

        for (let i = 0; i < request.playerCurrencyParams.length; i++) {
            let playerCurrencyParam = request.playerCurrencyParams[i];

            let key = playerCurrencyParam.key;

            let playerCurrencySettingsItem = masterPlayerSettings.playerCurrencySettings.find(x => x.key == key);
            if (playerCurrencySettingsItem == null) continue;

            let initialValue = playerCurrencySettingsItem.initialValue;

            let amount = playerCurrencyParam.amount;
            let serverValue = 0;

            if (!masterPlayer.hasPlayerCurrency(key)) {
                serverValue = initialValue;
            }
            else {
                serverValue = masterPlayer.getPlayerCurrency(key).value;
            }

            let startValue = serverValue;

            serverValue += amount;
            if (serverValue <= 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.NotEnoughCurrency);
                return operationResponse;
            }

            this.gnServer.getDatabase().insertMasterPlayerCurrencyLogAsync(request.userId, key, amount, startValue, serverValue, request.log);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(GNParameterCode.Key, key);
            gnPlayerCurrency.add(GNParameterCode.Value, serverValue);

            gnPlayerCurrencies.add(gnPlayerCurrency);

            masterPlayer.setPlayerCurrency(key, serverValue);
        }

        masterPlayer.saveAsync();

        gnInfoResponseParameters.add(GNParameterCode.PlayerCurrencies, gnPlayerCurrencies);

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_SetPlayerCurrency", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
