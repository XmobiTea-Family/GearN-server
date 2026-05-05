import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { RequestHandler } from "./../base/RequestHandler";
import { UploadFileInfo } from "./../../../../../GN-library/xdatabase/lib/entity/pro/UploadFileInfo";

class RemoveFileUploadInfoOperationRequest extends OperationRequest {

	// Stores the file ID value used by this instance.
	@StringDataMember({ code: ParameterCode.FileId, mustNonNull: true, minLength: 15, maxLength: 15 })
	public fileId: string;

	// Stores the reason value used by this instance.
	@StringDataMember({ code: ParameterCode.Reason, isOptional: true, defaultValue: "" })
	public reason?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerRemoveFileUploadInfoOperationRequest extends RemoveFileUploadInfoOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminRemoveFileUploadInfoOperationRequest extends ServerRemoveFileUploadInfoOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemoveFileUploadInfoRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.RemoveFileUploadInfo;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return RemoveFileUploadInfoOperationRequest;
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

		if (!secretInfo.getPermission().content.removeFileUploadInfo.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
			reason: request.reason,
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemoveFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.removeFileUploadInfo.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
			reason: request.reason,
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemoveFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.removeFileUploadInfo.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
			reason: request.reason,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { fileId: string, reason: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_RemoveFileUploadInfo", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let uploadFileInfoCollection = this.gnServer.getDatabase().systemCollection("UploadFileInfo");

		// Stores the upload file info value used in the current execution flow.
		let uploadFileInfoResult = await uploadFileInfoCollection.findOne({
			fileId: request.fileId
		}, {
			projection: {
				removeStatus: true,
				fileUpload: true,
				gameId: true,
			}
		});

		if (uploadFileInfoResult == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
			return operationResponse;
		}

		let uploadFileInfo = new UploadFileInfo(uploadFileInfoResult, uploadFileInfoCollection);

		if (uploadFileInfo.getGameId() != secretInfo.getGameId()) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
			operationResponse.setDebugMessage("gameId not correct to remove file");
			return operationResponse;
		}

		// Stores the remove status value used in the current execution flow.
		let removeStatus = uploadFileInfo.getRemoveStatus();
		if (removeStatus.tsRemove == 0) {
			uploadFileInfo.setRemoveStatus(xDatetime.getCurrentMilliseconds(), request.reason);

			// Stores the file upload value used in the current execution flow.
			let fileUpload = uploadFileInfo.getFileUpload();
			if (fileUpload != null) {
				if (!this.gnServer.getHttpApp().getUploadFileHandler().removeFile(fileUpload.fullPath)) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
					operationResponse.setDebugMessage("the origin file is dir remove failed");

					return operationResponse;
				}
				// remove khoi storage nao
			}

			await uploadFileInfo.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_RemoveFileUploadInfo", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
