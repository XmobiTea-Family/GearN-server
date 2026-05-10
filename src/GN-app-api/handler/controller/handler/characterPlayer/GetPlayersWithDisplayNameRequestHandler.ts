import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetPlayersWithDisplayNameOperationRequest extends OperationRequest {
    // Stores the keyword value used by this instance.
    @StringDataMember({ code: ParameterCode.Keyword, minLength: 2, maxLength: 32 })
    public keyword: string;

    // Stores the info request parameter value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
    public infoRequestParam: InfoRequestParam;

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

class ServerGetPlayersWithDisplayNameOperationRequest extends GetPlayersWithDisplayNameOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetPlayersWithDisplayNameOperationRequest extends ServerGetPlayersWithDisplayNameOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetPlayersWithDisplayNameRequestHandler extends CharacterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetPlayersWithDisplayName;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetPlayersWithDisplayNameOperationRequest;
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

        if (!secretInfo.getPermission().characterPlayer.getPlayersWithDisplayName.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                keyword: request.keyword,
                infoRequestParam: request.infoRequestParam,
                skip: request.skip,
                limit: request.limit,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithDisplayNameOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.getPlayersWithDisplayName.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                keyword: request.keyword,
                infoRequestParam: request.infoRequestParam,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithDisplayNameOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.getPlayersWithDisplayName.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                keyword: request.keyword,
                infoRequestParam: request.infoRequestParam,
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
    private async execute(request: { keyword: string; infoRequestParam: InfoRequestParam; skip: number; limit: number }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetPlayersWithDisplayName", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the character player find options value used in the current execution flow.
        let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(request.infoRequestParam);

        // Stores the GearN results value used in the current execution flow.
        let gnResults = new GNArray();

        // Stores the character players value used in the current execution flow.
        let characterPlayers = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayersWithDisplayNameNormalizeRegexAsync(request.keyword, request.skip, request.limit, secretInfo.getGameId(), characterPlayerFindOptions);

        for (let i = 0; i < characterPlayers.length; i++) {
            // Stores the character player value used in the current execution flow.
            let characterPlayer = characterPlayers[i];

            // Stores the GearN result value used in the current execution flow.
            let gnResult = new GNHashtable();

            gnResult.add(ParameterCode.CharacterId, characterPlayer.getCharacterId());
            gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

            gnResults.add(gnResult);
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetPlayersWithDisplayName", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
