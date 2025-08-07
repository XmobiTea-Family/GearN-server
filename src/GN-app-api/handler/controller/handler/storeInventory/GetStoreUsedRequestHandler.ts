import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import {
    DataMember,
    BooleanDataMember,
    NumberDataMember,
    StringDataMember,
    GNHashtableDataMember,
    GNArrayDataMember,
} from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";

class GetStoreUsedOperationRequest extends OperationRequest {
    @StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
    storeId: string;
}

class ServerGetStoreUsedOperationRequest extends GetStoreUsedOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetStoreUsedOperationRequest extends ServerGetStoreUsedOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetStoreUsedRequestHandler extends StoreItemBaseRequestHandler {
    public override getCode() {
        return OperationCode.GetStoreUsed;
    }

    public override getCommonOperationRequest() {
        return GetStoreUsedOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.getStoreUsed.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                storeId: request.storeId,
            },
            secretInfo,
            operationRequest
        );
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStoreUsedOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.getStoreUsed.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                storeId: request.storeId,
            },
            secretInfo,
            operationRequest
        );
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStoreUsedOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.getStoreUsed.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                storeId: request.storeId,
            },
            secretInfo,
            operationRequest
        );
    }

    private async execute(request: { storeId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetStoreUsed", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let gnResults = new GNArray();

        let result = await this.gnServer.getDatabase().getStoreInventoryUsedAsync(request.storeId, secretInfo.getGameId());

        if (result != null) {
            for (let i = 0; i < result.useIds.length; i++) {
                let useId = result.useIds[i];

                let gnResult = new GNHashtable();

                gnResult.add(ParameterCode.OwnerId, useId.id);
                gnResult.add(ParameterCode.OwnerType, useId.type);
                gnResult.add(ParameterCode.TsCreate, useId.tsCreate);

                gnResults.add(gnResult);
            }
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetStoreUsed", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
