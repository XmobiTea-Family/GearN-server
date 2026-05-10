import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GameItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

class GetGameListOperationRequest extends OperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetGameListRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetGameList;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetGameListOperationRequest;
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

        if (!secretInfo.getPermission().dashboard.getGameList.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({}, SecretRole.Client, secretInfo, operationRequest);
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetGameList", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the collection value used in the current execution flow.
        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

        // Stores the results value used in the current execution flow.
        let results = await collection.find({ type: "gameSettings" }, { gameId: true } as any);

        // Stores the GearN game items value used in the current execution flow.
        let gnGameItems = new GNArray();

        while (await results.hasNext()) {
            // Stores the game item value used in the current execution flow.
            let gameItem = new GameItem(await results.next(), collection);

            // Stores the GearN game item value used in the current execution flow.
            let gnGameItem = new GNHashtable();

            gnGameItem.add(ParameterCode.GameId, gameItem.getGameId());

            gnGameItems.add(gnGameItem);
        }

        operationResponse.setParameter(ParameterCode.Results, gnGameItems);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetGameList", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
