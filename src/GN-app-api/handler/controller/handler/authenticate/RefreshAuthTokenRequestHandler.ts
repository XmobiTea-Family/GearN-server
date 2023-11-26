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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

class RefreshAuthTokenOperationRequest extends OperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class RefreshAuthTokenRequestHandler extends LoginBaseRequestHandler {
    public override getCode() {
        return OperationCode.RefreshAuthToken;
    }

    public override getCommonOperationRequest() {
        return RefreshAuthTokenOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().authenticate.refreshAuthToken.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: authInfo.getUserId(),
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_RefreshAuthToken", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerBan: true
        }

        let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

        if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountNotFound);

            return operationResponse;
        }

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        masterPlayer.setTsLastLogin(currentMilliseconds);
        masterPlayer.saveAsync();

        let playerBan = masterPlayer.getPlayerBan();
        if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
            operationResponse.setParameter(GNParameterCode.PlayerBan, this.generatePlayerBan(masterPlayer));
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.PlayerBan);
        }
        else {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

            let newAuthInfo = this.gnServer.getApiMiddleware().generateAuthInfo({
                gnToken: null,
                secretKey: secretInfo.getSecretKey(),
                userId: request.userId,
            });
    
            operationResponse.setParameter(ParameterCode.AuthToken, newAuthInfo.getAuthToken());
        }

        await this.gnServer.getPostEventCallbackService().onEvent("authenticate_RefreshAuthToken", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
