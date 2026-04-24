import { RequestHandler } from "./../base/RequestHandler";

import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { Md5Generate } from "./../../../../../GN-common/helper/Md5Generate";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { UploadFileInfo } from "./../../../../../GN-library/xdatabase/lib/entity/pro/UploadFileInfo";

class RequestDownloadFileUploadInfoOperationRequest extends OperationRequest {

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

class ServerRequestDownloadFileUploadInfoOperationRequest extends RequestDownloadFileUploadInfoOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminRequestDownloadFileUploadInfoOperationRequest extends ServerRequestDownloadFileUploadInfoOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RequestDownloadFileUploadInfoRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.RequestDownloadFileUploadInfo;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return RequestDownloadFileUploadInfoOperationRequest;
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

		if (!secretInfo.getPermission().content.requestDownloadFileUploadInfo.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRequestDownloadFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.requestDownloadFileUploadInfo.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRequestDownloadFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.requestDownloadFileUploadInfo.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { fileId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_RequestDownloadFileUploadInfo", request, role, secretInfo, operationRequest);
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
			operationResponse.setDebugMessage("gameId not correct to get file");
			return operationResponse;
		}

		if (uploadFileInfo.getRemoveStatus().tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
			return operationResponse;
		}

		// Stores the file upload value used in the current execution flow.
		let fileUpload = uploadFileInfo.getFileUpload();

		if (fileUpload == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotUpload);
			return operationResponse;
		}

		// Stores the download token value used in the current execution flow.
		let downloadToken = Md5Generate.getMd5(StringUtility.generateRandomString(15, 0));

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("DownloadFileSession");
		await collection.insertOne({
			fileId: request.fileId,
			createdAt: xDatetime.getCurrentDate(),
			downloadToken: downloadToken,
			fileUpload: {
				fullPath: fileUpload.fullPath,
				folderFileName: fileUpload.folderFileName,
				mimeType: fileUpload.mimeType,
			}
		});

		operationResponse.setParameter(ParameterCode.DownloadToken, downloadToken);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_RequestDownloadFileUploadInfo", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
