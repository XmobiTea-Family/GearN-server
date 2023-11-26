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

class GetFunctionOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.Version, minLength: 7, maxLength: 7, mustNonNull: true })
    version: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetFunctionOperationRequest extends GetFunctionOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetFunctionOperationRequest extends ServerGetFunctionOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetFunctionRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.GetFunction;
    }

    public override getCommonOperationRequest() {
        return GetFunctionOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.getFunction.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ version: request.version }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFunctionOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.getFunction.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ version: request.version }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFunctionOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().cloudScript.getFunction.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ version: request.version }, secretInfo, operationRequest);
    }

    private async execute(request: { version: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("cloudScript_GetFunction", request, secretInfo, operationRequest);
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

        let response = await cloudScriptService.getCloudScriptFunction(request.version);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);
        operationResponse.setParameter(GNParameterCode.Script, response.script);
        operationResponse.setParameter(GNParameterCode.CanExecute, response.canExecute);
        operationResponse.setParameter(GNParameterCode.IsLive, response.isLive);
        operationResponse.setParameter(GNParameterCode.TsCreate, response.tsCreate);

        await this.gnServer.getPostEventCallbackService().onEvent("cloudScript_GetFunction", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
