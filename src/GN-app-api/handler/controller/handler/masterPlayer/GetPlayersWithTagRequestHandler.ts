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
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetPlayersWithTagOperationRequest extends OperationRequest {
    // Stores the key value used by this instance.
    @StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
    public key: string;

    // Stores the value value used by this instance.
    @StringDataMember({ code: ParameterCode.Value, minLength: 2, maxLength: 32, mustNonNull: true })
    public value: string;

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

class ServerGetPlayersWithTagOperationRequest extends GetPlayersWithTagOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetPlayersWithTagOperationRequest extends ServerGetPlayersWithTagOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetPlayersWithTagRequestHandler extends MasterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetPlayersWithTag;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetPlayersWithTagOperationRequest;
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

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithTag.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                key: request.key,
                value: request.value,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithTagOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithTag.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                key: request.key,
                value: request.value,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithTagOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithTag.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                key: request.key,
                value: request.value,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
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
    private async execute(request: { key: string; value: string; skip: number; limit: number; infoRequestParam: InfoRequestParam }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_GetPlayersWithTag", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the master player find options value used in the current execution flow.
        let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);

        // Stores the resolved master player settings instance for the current execution flow.
        let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();
        // Stores the tags settings item value used in the current execution flow.
        let tagsSettingsItem = masterPlayerSettings.tagsSettings.find((x) => x.key == request.key);

        if (tagsSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

            return operationResponse;
        }

        // Stores the GearN results value used in the current execution flow.
        let gnResults = new GNArray();

        // Stores the master players value used in the current execution flow.
        let masterPlayers = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayersWithTagAsync(request.key, request.value, request.skip, request.limit, masterPlayerFindOptions);

        for (let i = 0; i < masterPlayers.length; i++) {
            // Stores the master player value used in the current execution flow.
            let masterPlayer = masterPlayers[i];

            // Stores the GearN result value used in the current execution flow.
            let gnResult = new GNHashtable();

            gnResult.add(ParameterCode.UserId, masterPlayer.getUserId());

            gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

            gnResults.add(gnResult);
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_GetPlayersWithTag", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
