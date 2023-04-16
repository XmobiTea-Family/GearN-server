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

class GetEventCallbackCloudScriptOperationRequest extends OperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetEventCallbackCloudScriptRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.GetEventCallbackCloudScript;
    }

    public override getCommonOperationRequest() {
        return GetEventCallbackCloudScriptOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(operationRequest);
        }

        if (!secretInfo.getPermission().masterAdmin.getEventCallbackCloudScript.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({}, secretInfo, operationRequest);
    }

    private async execute(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetEventCallbackCloudScript", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let results = await this.gnServer.getEventCallbackCloudScriptService().getAllCloudScriptFunction();

        let gnResults = new GNArray();

        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            let gnResult = new GNHashtable();

            gnResult.add(GNParameterCode.Type, result.type);
            gnResult.add(GNParameterCode.TsLastUpdate, result.tsLastUpdate);
            gnResult.add(GNParameterCode.Version, result.version);
            // gnResult.add(GNParameterCode.FullScript, result.fullScript);

            let gnChildScripts = new GNArray();
            let childScripts = result.childScripts;
            for (let j = 0; j < childScripts.length; j++) {
                let childScript = childScripts[j];

                let gnChildScript = new GNHashtable();
                gnChildScript.add(GNParameterCode.EventName, childScript.eventName);
                gnChildScript.add(GNParameterCode.Script, childScript.script);
                gnChildScript.add(GNParameterCode.HasEdit, childScript.hasEdit);

                gnChildScripts.add(gnChildScript);
            }

            gnResult.add(GNParameterCode.ChildScripts, gnChildScripts);

            gnResults.add(gnResult);
        }

        operationResponse.setParameter(GNParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetEventCallbackCloudScript", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
