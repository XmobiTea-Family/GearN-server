import { RequestHandler } from "./../base/RequestHandler";

import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GNHashtable } from "./../../../../../GN-common/common/GNData";

class GetFileUploadInfoOperationRequest extends OperationRequest {

	// Stores the file ID value used by this instance.
	@StringDataMember({ code: ParameterCode.FileId, mustNonNull: true, minLength: 15, maxLength: 15 })
	public fileId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}

}

class ServerGetFileUploadInfoOperationRequest extends GetFileUploadInfoOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetFileUploadInfoOperationRequest extends ServerGetFileUploadInfoOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetFileUploadInfoRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetFileUploadInfo;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetFileUploadInfoOperationRequest;
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

		if (!secretInfo.getPermission().content.getFileUploadInfo.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getFileUploadInfo.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getFileUploadInfo.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { fileId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_GetFileUploadInfo", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the upload file info value used in the current execution flow.
		let uploadFileInfo = await this.gnServer.getDatabase().loadUploadFileInfoAsync(request.fileId);

		if (uploadFileInfo == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.FileId, uploadFileInfo.getFileId());
		operationResponse.setParameter(ParameterCode.FileName, uploadFileInfo.getFileName());
		operationResponse.setParameter(ParameterCode.TsCreate, uploadFileInfo.getTsCreate());

		// Stores the GearN remove status value used in the current execution flow.
		let gnRemoveStatus = new GNHashtable();
		// Stores the remove status value used in the current execution flow.
		let removeStatus = uploadFileInfo.getRemoveStatus();
		gnRemoveStatus.add(ParameterCode.TsRemove, removeStatus.tsRemove);
		gnRemoveStatus.add(ParameterCode.Reason, removeStatus.reason);
		operationResponse.setParameter(ParameterCode.RemoveStatus, gnRemoveStatus);

		// Stores the file upload value used in the current execution flow.
		let fileUpload = uploadFileInfo.getFileUpload();

		if (fileUpload != null) {
			// Stores the GearN file upload value used in the current execution flow.
			let gnFileUpload = new GNHashtable();

			gnFileUpload.add(ParameterCode.MimeType, fileUpload.mimeType);
			gnFileUpload.add(ParameterCode.Size, fileUpload.size);
			gnFileUpload.add(ParameterCode.FolderFileName, fileUpload.folderFileName);

			operationResponse.setParameter(ParameterCode.FileUpload, gnFileUpload);
		} else {
			operationResponse.setParameter(ParameterCode.TsUploadExpire, uploadFileInfo.getTsUploadExpire());
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_GetFileUploadInfo", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
