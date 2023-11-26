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
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetCurrencyLeaderboardOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
    key: string;

    @GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
    infoRequestParam: InfoRequestParam;

    @NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
    skip?: number;

    @NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 5, maxValue: 100, mustInt: true, isOptional: true })
    limit?: number;

    @BooleanDataMember({ code: GNParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
    loadFromCache?: boolean;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetCurrencyLeaderboardOperationRequest extends GetCurrencyLeaderboardOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetCurrencyLeaderboardOperationRequest extends ServerGetCurrencyLeaderboardOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetCurrencyLeaderboardRequestHandler extends MasterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetCurrencyLeaderboard;
    }

    public override getCommonOperationRequest() {
        return GetCurrencyLeaderboardOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getCurrencyLeaderboard.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

        return this.execute({
            key: request.key,
            skip: request.skip,
            limit: request.limit,
            infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCurrencyLeaderboardOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getCurrencyLeaderboard.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

        return this.execute({
            key: request.key,
            skip: request.skip,
            limit: request.limit,
            infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCurrencyLeaderboardOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getCurrencyLeaderboard.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

        return this.execute({
            key: request.key,
            skip: request.skip,
            limit: request.limit,
            infoRequestParam: request.infoRequestParam,
            loadFromCache: request.loadFromCache,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_GetCurrencyLeaderboard", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);

        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();
        let playerCurrencySettingsItem = masterPlayerSettings.playerCurrencySettings.find(x => x.key == request.key);

        if (playerCurrencySettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

            return operationResponse;
        }

        let cacheKey = "masterPlayerCurrencyLeaderboard_" + request.key;

        if (request.loadFromCache) {
            if (request.skip + request.limit > 100) {
                request.loadFromCache = false;
            }
        }

        if (request.loadFromCache) {
            if (!this.gnServer.getCacheData().isValid(cacheKey)) {
                request.loadFromCache = false;
            }
        }

        let gnResults = new GNArray();

        let masterPlayers: MasterPlayer[];

        if (request.loadFromCache) {
            masterPlayers = this.gnServer.getCacheData().getData(cacheKey);

            for (let i = request.skip; i < request.skip + request.limit; i++) {
                if (i >= masterPlayers.length) break;

                let masterPlayer = masterPlayers[i];

                let gnResult = new GNHashtable();

                gnResult.add(GNParameterCode.Position, i);

                gnResult.add(GNParameterCode.UserId, masterPlayer.getUserId());

                gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

                gnResults.add(gnResult);
            }
        }
        else {
            if (request.skip + request.limit <= 100) {
                masterPlayerFindOptions = null;

                masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithCurrenciesAsync(request.key, 0, 100, masterPlayerFindOptions);

                for (let i = request.skip; i < request.skip + request.limit; i++) {
                    if (i >= masterPlayers.length) break;

                    let masterPlayer = masterPlayers[i];

                    let gnResult = new GNHashtable();

                    gnResult.add(GNParameterCode.Position, i);

                    gnResult.add(GNParameterCode.UserId, masterPlayer.getUserId());

                    gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

                    gnResults.add(gnResult);
                }

                this.gnServer.getCacheData().setData(cacheKey, masterPlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
            }
            else {
                masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithCurrenciesAsync(request.key, request.skip, request.limit, masterPlayerFindOptions);

                for (let i = 0; i < masterPlayers.length; i++) {

                    let masterPlayer = masterPlayers[i];

                    let gnResult = new GNHashtable();

                    gnResult.add(GNParameterCode.Position, i + request.skip);

                    gnResult.add(GNParameterCode.UserId, masterPlayer.getUserId());

                    gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

                    gnResults.add(gnResult);
                }
            }
        }

        operationResponse.setParameter(GNParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_GetCurrencyLeaderboard", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
