import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNArray, GNHashtableBuilder } from "./../../../../../GN-common/common/GNData";

class GetFunctionsOperationRequest extends OperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetFunctionsOperationRequest extends GetFunctionsOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetFunctionsOperationRequest extends ServerGetFunctionsOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetFunctionsRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetFunctions;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetFunctionsOperationRequest;
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

        if (!secretInfo.getPermission().cloudScript.getFunctions.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({}, SecretRole.Client, secretInfo, operationRequest);
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFunctionsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.getFunctions.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({}, SecretRole.Server, secretInfo, operationRequest);
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFunctionsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.getFunctions.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({}, SecretRole.Admin, secretInfo, operationRequest);
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param role Provides the role value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_GetFunctions", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the cloud script service value used in the current execution flow.
        let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
        if (!cloudScriptService) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
            return operationResponse;
        }

        // Stores the response value used in the current execution flow.
        let response = cloudScriptService.getCloudScriptFunctions();

        // Stores the GearN results value used in the current execution flow.
        let gnResults = new GNArray();
        for (let i = 0; i < response.length; i++) {
            // Stores the function 1 value used in the current execution flow.
            let function1 = response[i];

            gnResults.add(new GNHashtableBuilder().add(ParameterCode.Version, function1.version).add(ParameterCode.CanExecute, function1.canExecute).build());
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
        operationResponse.setParameter(ParameterCode.Results, gnResults);
        operationResponse.setParameter(ParameterCode.LatestVersion, cloudScriptService.getLatestVersion());
        operationResponse.setParameter(ParameterCode.LiveLatestVersion, cloudScriptService.getLiveLatestVersion());

        await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_GetFunctions", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
