import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { ExecuteResponseStatus } from "./../../../../service/ICloudScriptService";

class ExecuteFunctionOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    @StringDataMember({ code: GNParameterCode.FunctionName, minLength: 3, maxLength: 30, mustNonNull: true })
    functionName: string;

    @DataMember({ code: GNParameterCode.FunctionParameters, isOptional: true })
    functionParameters?: object;

    @StringDataMember({ code: GNParameterCode.Version, minLength: 7, maxLength: 7, isOptional: true })
    version: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerExecuteFunctionOperationRequest extends ExecuteFunctionOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminExecuteFunctionOperationRequest extends ServerExecuteFunctionOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class ExecuteFunctionRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.ExecuteFunction;
    }

    public override getCommonOperationRequest() {
        return ExecuteFunctionOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!request.userId) {
            if (!secretInfo.getPermission().cloudScript.executeFunction.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().cloudScript.executeFunction.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().cloudScript.executeFunction.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: authInfo.getUserId(),
            functionName: request.functionName,
            functionParameters: request.functionParameters,
            version: request.version,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerExecuteFunctionOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.executeFunction.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            functionName: request.functionName,
            functionParameters: request.functionParameters,
            version: request.version,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminExecuteFunctionOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.executeFunction.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            functionName: request.functionName,
            functionParameters: request.functionParameters,
            version: request.version,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, functionName: string, functionParameters: object, version: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_ExecuteFunction", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let customTags = operationRequest.getParameters().getGNHashtable("CustomTags");
        let customTagsData = customTags == null ? null : customTags.toData();

        let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
        if (!cloudScriptService) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GameNotFound);
            return operationResponse;
        }

        let response = await cloudScriptService.executeCloudScriptFunction(request.userId, request.functionName, request.functionParameters, request.version, customTagsData);

        operationResponse.setParameter(GNParameterCode.FunctionLogs, response.logs);

        if (response.response.status == ExecuteResponseStatus.Ok) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);
            operationResponse.setParameter(GNParameterCode.Status, <number>response.response.status);

            operationResponse.setParameter(GNParameterCode.ExecutionTimeInMs, response.stats.executeTimeInMs);
            operationResponse.setParameter(GNParameterCode.MemoryUsedInBytes, response.stats.memoryUsedInBytes);
            operationResponse.setParameter(GNParameterCode.FunctionResult, response.response.result);
        }
        else {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExecuteError);
            operationResponse.setParameter(GNParameterCode.Status, <number>response.response.status);

            operationResponse.setParameter(GNParameterCode.Message, response.response.errorMessage);
        }

        await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_ExecuteFunction", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
