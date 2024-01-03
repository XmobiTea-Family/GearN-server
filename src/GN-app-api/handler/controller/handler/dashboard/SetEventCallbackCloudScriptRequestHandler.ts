import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { StringDataMember } from "../../../../../GN-common/entity/DataMember";

class SetEventCallbackCloudScriptOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.EventName, minLength: 6, maxLength: 128, mustNonNull: true })
    eventName: string;

    @StringDataMember({ code: GNParameterCode.Script, minLength: 6, maxLength: 40960, mustNonNull: true })
    script: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetEventCallbackCloudScriptRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.SetEventCallbackCloudScript;
    }

    public override getCommonOperationRequest() {
        return SetEventCallbackCloudScriptOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(operationRequest);
        }

        if (!secretInfo.getPermission().masterAdmin.setEventCallbackCloudScript.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            eventName: request.eventName,
            script: request.script,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { eventName: string, script: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetEventCallbackCloudScript", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        if (request.script.includes("GNNetwork")) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExecuteError);
            operationResponse.setParameter(GNParameterCode.Message, "Can not use keywork GNNetwork on cloudscript");
            return operationResponse;
        }

        let response = await this.gnServer.getEventCallbackCloudScriptService().addCloudScriptFunction(request.eventName, request.script);

        if (response.success) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);
        }
        else {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExecuteError);
            operationResponse.setParameter(GNParameterCode.Message, response.errorMessage);
        }

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetEventCallbackCloudScript", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
