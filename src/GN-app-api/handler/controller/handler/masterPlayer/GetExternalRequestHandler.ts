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

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class GetExternalOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetExternalOperationRequest extends GetExternalOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetExternalOperationRequest extends ServerGetExternalOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetExternalRequestHandler extends MasterPlayerBaseRequestHandler {

    public override getCode() {
        return OperationCode.GetExternal;
    }

    public override getCommonOperationRequest() {
        return GetExternalOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!request.userId) {
            if (!secretInfo.getPermission().masterPlayer.getExternal.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().masterPlayer.getExternal.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().masterPlayer.getExternal.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: request.userId,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetExternalOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getExternal.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetExternalOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.getExternal.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_GetExternal", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            external: true,
        }

        let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

        if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MasterPlayerNotFound);
            return operationResponse;
        }

        let gnInfoResponseParameters = new GNHashtable();
        gnInfoResponseParameters.add(GNParameterCode.External, this.generateExternal(masterPlayer));

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_GetExternal", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
