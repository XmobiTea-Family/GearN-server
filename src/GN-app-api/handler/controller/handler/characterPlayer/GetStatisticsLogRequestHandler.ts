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

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "../base/RequestHandler";

class GetStatisticsLogOperationRequest extends OperationRequest {
    @GNArrayDataMember({ code: GNParameterCode.Keys, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: String, isOptional: true })
    keys?: Array<string>;

    @StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true, isOptional: true })
    characterId?: string;

    @NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    limit?: number;

    @StringDataMember({ code: GNParameterCode.Token, minLength: 24, maxLength: 24, mustNonNull: true, isOptional: true })
    token?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetStatisticsLogOperationRequest extends GetStatisticsLogOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetStatisticsLogOperationRequest extends ServerGetStatisticsLogOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetStatisticsLogRequestHandler extends RequestHandler {

    public override getCode() {
        return OperationCode.GetStatisticsLog;
    }

    public override getCommonOperationRequest() {
        return GetStatisticsLogOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.getStatisticsLog.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            keys: request.keys,
            token: request.token,
            limit: request.limit,
            characterId: request.characterId,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLogOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.getStatisticsLog.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            keys: request.keys,
            token: request.token,
            limit: request.limit,
            characterId: request.characterId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLogOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.getStatisticsLog.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            keys: request.keys,
            token: request.token,
            limit: request.limit,
            characterId: request.characterId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { keys: Array<string>, token: string, limit: number, characterId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetStatisticsLog", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

        let keys: string[] = [];
        if (request.keys) {
            for (let i = 0; i < request.keys.length; i++) {
                let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == request.keys[i]);

                if (playerStatisticsSettingsItem != null) {
                    keys.push(playerStatisticsSettingsItem.key);
                }
            }
        }

        let $filter = {} as any;

        if (request.characterId) {
            $filter["characterId"] = request.characterId;
        }

        if (keys.length != 0) {
            if (keys.length == 1) $filter["key"] = keys[0];
            else $filter["key"] = { $in: keys };
        }

        if (request.token) {
            $filter["_id"] = { $lt: request.token };
        }

        let gnResults = new GNArray();

        let results = await this.gnServer.getDatabase().loadCharacterPlayerStatisticsLogAsync($filter, secretInfo.getGameId(), request.limit);

        let token: string;

        while (await results.hasNext()) {
            let result = await results.next();

            let gnResult = new GNHashtable();

            gnResult.add(GNParameterCode.CharacterId, result["characterId"]);
            gnResult.add(GNParameterCode.TsCreate, result["tsCreate"]);
            gnResult.add(GNParameterCode.Log, result["log"]);
            gnResult.add(GNParameterCode.Key, result["key"]);
            gnResult.add(GNParameterCode.Amount, result["amount"]);
            gnResult.add(GNParameterCode.StartValue, result["startValue"]);
            gnResult.add(GNParameterCode.FinalValue, result["finalValue"]);

            gnResults.add(gnResult);

            token = result["_id"].toString();
        }

        operationResponse.setParameter(GNParameterCode.Results, gnResults);

        if (token) {
            operationResponse.setParameter(GNParameterCode.Token, token);
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetStatisticsLog", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
