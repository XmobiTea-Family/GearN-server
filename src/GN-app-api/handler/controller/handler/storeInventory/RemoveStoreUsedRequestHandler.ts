import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import {
    DataMember,
    BooleanDataMember,
    NumberDataMember,
    StringDataMember,
    GNHashtableDataMember,
    GNArrayDataMember,
} from "../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { GNErrorCode } from "../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";

class RemoveStoreUsedOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
    storeId: string;

    @GNArrayDataMember({ code: GNParameterCode.OwnerIds, elementCls: String, isOptional: true })
	ownerIds?: Array<string>;

}

class ServerRemoveStoreUsedOperationRequest extends RemoveStoreUsedOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminRemoveStoreUsedOperationRequest extends ServerRemoveStoreUsedOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class RemoveStoreUsedRequestHandler extends StoreItemBaseRequestHandler {
    public override getCode() {
        return OperationCode.RemoveStoreUsed;
    }

    public override getCommonOperationRequest() {
        return RemoveStoreUsedOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.removeStoreUsed.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                storeId: request.storeId,
                ownerIds: request.ownerIds,
            },
            secretInfo,
            operationRequest
        );
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemoveStoreUsedOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.removeStoreUsed.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                storeId: request.storeId,
                ownerIds: request.ownerIds,
            },
            secretInfo,
            operationRequest
        );
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemoveStoreUsedOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().storeInventory.removeStoreUsed.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                storeId: request.storeId,
                ownerIds: request.ownerIds,
            },
            secretInfo,
            operationRequest
        );
    }

    private async execute(request: { storeId: string, ownerIds: string[] }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_RemoveStoreUsed", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        await this.gnServer.getDatabase().removeStoreInventoryUsedAsync(request.storeId, secretInfo.getGameId(), request.ownerIds);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_RemoveStoreUsed", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
