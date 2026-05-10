import { RequestHandler } from "./../base/RequestHandler";

import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";

class CreateNewFileUploadInfoOperationRequest extends OperationRequest {
    // Stores the file name value used by this instance.
    @StringDataMember({ code: ParameterCode.FileName, mustNonNull: true, minLength: 5, maxLength: 50 })
    public fileName: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerCreateNewFileUploadInfoOperationRequest extends CreateNewFileUploadInfoOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminCreateNewFileUploadInfoOperationRequest extends ServerCreateNewFileUploadInfoOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class CreateNewFileUploadInfoRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.CreateNewFileUploadInfo;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return CreateNewFileUploadInfoOperationRequest;
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

        if (!secretInfo.getPermission().content.createNewFileUploadInfo.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                fileName: request.fileName,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreateNewFileUploadInfoOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().content.createNewFileUploadInfo.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                fileName: request.fileName,
            },
            SecretRole.Server,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreateNewFileUploadInfoOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().content.createNewFileUploadInfo.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                fileName: request.fileName,
            },
            SecretRole.Admin,
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
    private async execute(request: { fileName: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_CreateNewFileUploadInfo", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the current milliseconds value used in the current execution flow.
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        // Stores the doc value used in the current execution flow.
        let doc = {
            fileId: StringUtility.generateRandomString(15, 0),
            fileName: request.fileName,
            tsCreate: currentMilliseconds,
            tsUploadExpire: currentMilliseconds + 5 * xDatetime.ONE_MINUTE_MILLISECOND,
            removeStatus: { tsRemove: 0, reason: "" },
            gameId: secretInfo.getGameId(),
        };

        await this.gnServer.getDatabase().systemCollection("UploadFileInfo").insertOne(doc);

        operationResponse.setParameter(ParameterCode.FileId, doc["fileId"]);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("content_CreateNewFileUploadInfo", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
