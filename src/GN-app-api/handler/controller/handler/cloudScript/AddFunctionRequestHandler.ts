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

class AddFunctionOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.Script, minLength: 0, maxLength: Number.MAX_SAFE_INTEGER, mustNonNull: true })
    script: string;

    @BooleanDataMember({ code: GNParameterCode.CanExecute })
    canExecute: boolean;

    @BooleanDataMember({ code: GNParameterCode.IsLive })
    isLive: boolean;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerAddFunctionOperationRequest extends AddFunctionOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminAddFunctionOperationRequest extends ServerAddFunctionOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class AddFunctionRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.AddFunction;
    }

    public override getCommonOperationRequest() {
        return AddFunctionOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.addFunction.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ script: request.script, canExecute: request.canExecute, isLive: request.isLive }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerAddFunctionOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.addFunction.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ script: request.script, canExecute: request.canExecute, isLive: request.isLive }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminAddFunctionOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.addFunction.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ script: request.script, canExecute: request.canExecute, isLive: request.isLive }, secretInfo, operationRequest);
    }

    private async execute(request: { script: string, canExecute: boolean, isLive: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_AddFunction", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let cloudScriptService = this.gnServer.getCloudScriptService(secretInfo.getGameId());
        if (!cloudScriptService) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GameNotFound);
            return operationResponse;
        }

        if (request.script.includes("GNNetwork")) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExecuteError);
            operationResponse.setParameter(GNParameterCode.Message, "Can not use keywork GNNetwork on cloudscript");
            return operationResponse;
        }

        let response = await cloudScriptService.addCloudScriptFunction(request.script, request.isLive, request.canExecute);

        if (response.success) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);
            operationResponse.setParameter(GNParameterCode.Version, response.version);
        }
        else {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExecuteError);
            operationResponse.setParameter(GNParameterCode.Message, response.errorMessage);
        }

        await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_AddFunction", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
