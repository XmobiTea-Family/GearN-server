import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { FileUploadInfoParameterCode } from "./../../../../GN-common/constant/parameterCode/FileUploadInfoParameterCode";
import { FileUploadInfoErrorCode } from "./../../../../GN-common/constant/errorCode/FileUploadInfoErrorCode";

class GetFileUploadInfoOperationRequest extends OperationRequest {
	fileId: string;

	constructor(operationRequest: OperationRequest) {
		super(operationRequest);

		this.fileId = this.parameters.getString(FileUploadInfoParameterCode.FileId);
	}

	public isValidRequest() {
		if (!this.fileId) return false;

		return true;
	}
}

export class GetFileUploadInfoRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.GetFileUploadInfo;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = new GetFileUploadInfoOperationRequest(operationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let doc = await this.gameApplication.getDatabase().systemGameCollection("UploadFileInfo").findOne({ FileId: request.fileId });

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		if (!doc) {
			operationResponse.setParameter(ParameterCode.ErrorCode, FileUploadInfoErrorCode.FileIdNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, FileUploadInfoErrorCode.Ok);

		operationResponse.setParameter(FileUploadInfoParameterCode.FileId, doc["FileId"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.OriginFileName, doc["OriginFileName"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.TsCreate, doc["TsCreate"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.UserId, doc["UserId"]);

		if (doc["TsUploadFile"] != null) {
			operationResponse.setParameter(FileUploadInfoParameterCode.TsUploadFile, doc["TsUploadFile"]);
			operationResponse.setParameter(FileUploadInfoParameterCode.MimeType, doc["MimeType"]);
			operationResponse.setParameter(FileUploadInfoParameterCode.Size, doc["Size"]);
			operationResponse.setParameter(FileUploadInfoParameterCode.FolderFileName, doc["FolderFileName"]);
		} else {
			operationResponse.setParameter(FileUploadInfoParameterCode.TsUploadExpire, doc["TsUploadExpire"]);
		}

		return operationResponse;
	}
}
