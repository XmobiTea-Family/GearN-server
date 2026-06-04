import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import bcrypt from "bcrypt";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterAdminPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";

class CreateAdminAccountOperationRequest extends OperationRequest {
    // Indicates whether rname should be used.
    @StringDataMember({ code: ParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
    public username: string;

    // Stores the password value used by this instance.
    @StringDataMember({ code: ParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
    public password: string;

    // Stores the secret key value used by this instance.
    @StringDataMember({ code: ParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
    public secretKey: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class CreateAdminAccountRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.CreateAdminAccount;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return CreateAdminAccountOperationRequest;
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

        if (!secretInfo.getPermission().dashboard.createAdminAccount.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                username: request.username,
                password: request.password,
                secretKey: request.secretKey,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { username: string; password: string; secretKey: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_CreateAdminAccount", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the collection value used in the current execution flow.
        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

        // Stores the this user value used in the current execution flow.
        let thisUser = await collection.findOne({ type: "account", username: request.username });

        if (thisUser != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountUsernameExists);
            return operationResponse;
        }

        // Stores the result value used in the current execution flow.
        let resultSecretInfo = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

        if (resultSecretInfo == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.SecretInfoNotFound);
            return operationResponse;
        }

        // Stores the result value used in the current execution flow.
        let result = {
            type: "account",
            userId: StringUtility.generateRandomString(10, 0),
            username: request.username,
            password: await bcrypt.hash(request.password, 10),
            secretKey: request.secretKey,
        } as any;

        await collection.insertOne(result);

        // Stores the master admin player value used in the current execution flow.
        let masterAdminPlayer = new MasterAdminPlayer(result, collection);

        operationResponse.setParameter(ParameterCode.UserId, masterAdminPlayer.getUserId());

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_CreateAdminAccount", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
