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

import { Md5Generate } from "./../../../../../GN-common/helper/Md5Generate";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class RequestDownloadFileUploadInfoOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.FileId, mustNonNull: true, minLength: 15, maxLength: 15 })
	public fileId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}

}

class ServerRequestDownloadFileUploadInfoOperationRequest extends RequestDownloadFileUploadInfoOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminRequestDownloadFileUploadInfoOperationRequest extends ServerRequestDownloadFileUploadInfoOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RequestDownloadFileUploadInfoRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.RequestDownloadFileUploadInfo;
	}

	public override getCommonOperationRequest() {
		return RequestDownloadFileUploadInfoOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.requestDownloadFileUploadInfo.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRequestDownloadFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.requestDownloadFileUploadInfo.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRequestDownloadFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.requestDownloadFileUploadInfo.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			fileId: request.fileId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { fileId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_RequestDownloadFileUploadInfo", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let uploadFileInfo = await this.gnServer.getDatabase().loadUploadFileInfoAsync(request.fileId, {
			removeStatus: true,
			fileUpload: true,
		});

		if (uploadFileInfo == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
			return operationResponse;
		}

		if (uploadFileInfo.getRemoveStatus().tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
			return operationResponse;
		}

		let fileUpload = uploadFileInfo.getFileUpload();

		if (fileUpload == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotUpload);
			return operationResponse;
		}

		let downloadToken = Md5Generate.getMd5(StringUtility.generateRandomString(15, 0));

		let collection = this.gnServer.getDatabase().systemCollection("DownloadFileSession");
		collection.insertOne({
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

		await this.gnServer.getPostEventCallbackService().onEvent("content_RequestDownloadFileUploadInfo", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
