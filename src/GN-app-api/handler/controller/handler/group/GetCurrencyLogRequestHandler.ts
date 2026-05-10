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
import { RequestHandler } from "./../base/RequestHandler";
import * as mongodb from "mongodb";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class GetCurrencyLogOperationRequest extends OperationRequest {
    // Stores the keys value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.Keys, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: String, isOptional: true })
    public keys?: Array<string>;

    // Stores the group ID value used by this instance.
    @StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true, isOptional: true })
    public groupId?: string;

    // Stores the limit value used by this instance.
    @NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    public limit?: number;

    // Stores the token value used by this instance.
    @StringDataMember({ code: ParameterCode.Token, minLength: 24, maxLength: 24, mustNonNull: true, isOptional: true })
    public token?: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetCurrencyLogOperationRequest extends GetCurrencyLogOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetCurrencyLogOperationRequest extends ServerGetCurrencyLogOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetCurrencyLogRequestHandler extends GroupBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetCurrencyLog;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetCurrencyLogOperationRequest;
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
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.getCurrencyLog);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                keys: request.keys,
                token: request.token,
                limit: request.limit,
                groupId: request.groupId,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCurrencyLogOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getCurrencyLog.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                keys: request.keys,
                token: request.token,
                limit: request.limit,
                groupId: request.groupId,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCurrencyLogOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getCurrencyLog.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                keys: request.keys,
                token: request.token,
                limit: request.limit,
                groupId: request.groupId,
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
    private async execute(request: { keys: Array<string>; token: string; limit: number; groupId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetCurrencyLog", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the resolved group settings instance for the current execution flow.
        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

        // Stores the keys value used in the current execution flow.
        let keys: string[] = [];
        if (request.keys) {
            for (let i = 0; i < request.keys.length; i++) {
                // Stores the player currencies settings item value used in the current execution flow.
                let playerCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings.find((x) => x.key == request.keys[i]);

                if (playerCurrenciesSettingsItem != null) {
                    keys.push(playerCurrenciesSettingsItem.key);
                }
            }
        }

        // Stores the filter value used in the current execution flow.
        let $filter = {} as any;

        if (request.groupId) {
            $filter["groupId"] = request.groupId;
        }

        if (keys.length != 0) {
            if (keys.length == 1) $filter["key"] = keys[0];
            else $filter["key"] = { $in: keys };
        }

        if (request.token && mongodb.ObjectId.isValid(request.token)) {
            $filter["_id"] = { $lt: new mongodb.ObjectId(request.token) };
        }

        // Stores the GearN results value used in the current execution flow.
        let gnResults = new GNArray();

        // Stores the results value used in the current execution flow.
        let results = await this.gnServer.getDatabase().groupRepository.loadGroupCurrencyLogAsync($filter, secretInfo.getGameId(), request.limit);

        // Stores the token value used in the current execution flow.
        let token: string;

        while (await results.hasNext()) {
            // Stores the result value used in the current execution flow.
            let result = await results.next();

            // Stores the GearN result value used in the current execution flow.
            let gnResult = new GNHashtable();

            gnResult.add(ParameterCode.GroupId, result["groupId"]);
            gnResult.add(ParameterCode.TsCreate, result["tsCreate"]);
            gnResult.add(ParameterCode.Log, result["log"]);
            gnResult.add(ParameterCode.Key, result["key"]);
            gnResult.add(ParameterCode.Amount, result["amount"]);
            gnResult.add(ParameterCode.StartValue, result["startValue"]);
            gnResult.add(ParameterCode.FinalValue, result["finalValue"]);

            gnResults.add(gnResult);

            token = result["_id"].toString();
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);

        if (token) {
            operationResponse.setParameter(ParameterCode.Token, token);
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_GetCurrencyLog", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
