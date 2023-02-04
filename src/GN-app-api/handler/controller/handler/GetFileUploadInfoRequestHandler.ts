import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { FileUploadInfoParameterCode } from "./../../../../GN-common/constant/parameterCode/FileUploadInfoParameterCode";
import { FileUploadInfoErrorCode } from "./../../../../GN-common/constant/errorCode/FileUploadInfoErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class GetFileUploadInfoOperationRequest extends OperationRequest {
	@StringDataMember({ code: FileUploadInfoParameterCode.FileId, mustNonNull: true, minLength: 10, maxLength: 20 })
	fileId: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}

}

export class GetFileUploadInfoRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetFileUploadInfo;
	}

	public override getCommonOperationRequest() {
		return GetFileUploadInfoOperationRequest;
	}

	public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let doc = await this.gnServer.getDatabase().systemGameCollection("UploadFileInfo").findOne({ FileId: request.fileId });

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		if (!doc) {
			operationResponse.setScriptData(ParameterCode.ErrorCode, FileUploadInfoErrorCode.FileIdNotFound);
			return operationResponse;
		}

		operationResponse.setScriptData(ParameterCode.ErrorCode, FileUploadInfoErrorCode.Ok);

		operationResponse.setScriptData(FileUploadInfoParameterCode.FileId, doc["FileId"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.OriginFileName, doc["OriginFileName"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.TsCreate, doc["TsCreate"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.UserId, doc["UserId"]);

		if (doc["TsUploadFile"] != null) {
			operationResponse.setScriptData(FileUploadInfoParameterCode.TsUploadFile, doc["TsUploadFile"]);
			operationResponse.setScriptData(FileUploadInfoParameterCode.MimeType, doc["MimeType"]);
			operationResponse.setScriptData(FileUploadInfoParameterCode.Size, doc["Size"]);
			operationResponse.setScriptData(FileUploadInfoParameterCode.FolderFileName, doc["FolderFileName"]);
		} else {
			operationResponse.setScriptData(FileUploadInfoParameterCode.TsUploadExpire, doc["TsUploadExpire"]);
		}

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse);
        }

		return operationResponse;
	}

}
