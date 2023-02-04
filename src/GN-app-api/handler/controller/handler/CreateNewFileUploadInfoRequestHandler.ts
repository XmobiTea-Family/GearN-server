import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { FileUploadInfoParameterCode } from "./../../../../GN-common/constant/parameterCode/FileUploadInfoParameterCode";
import { FileUploadInfoErrorCode } from "./../../../../GN-common/constant/errorCode/FileUploadInfoErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { StringUtility } from "./../../../../GN-common/helper/StringUtility";

class CreateNewFileUploadInfoOperationRequest extends OperationRequest {
	@StringDataMember({ code: FileUploadInfoParameterCode.OriginFileName, mustNonNull: true, minLength: 5, maxLength: 50 })
	originFileName: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateNewFileUploadInfoRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.CreateNewFileUploadInfo;
	}

	public override getCommonOperationRequest() {
		return CreateNewFileUploadInfoOperationRequest;
	}

	public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let doc = {
			FileId: StringUtility.generateRandomString(20),
			UserId: authInfo.getUserId(),
			OriginFileName: request.originFileName,
			TsCreate: currentMilliseconds,
			TsUploadExpire: currentMilliseconds + 15 * xDatetime.ONE_MINUTE_MILLISECOND,
		};

		this.gnServer.getDatabase().systemGameCollection("UploadFileInfo").insertOne(doc);

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setScriptData(ParameterCode.ErrorCode, FileUploadInfoErrorCode.Ok);

		operationResponse.setScriptData(FileUploadInfoParameterCode.FileId, doc["FileId"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.OriginFileName, doc["OriginFileName"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.TsCreate, doc["TsCreate"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.TsUploadExpire, doc["TsUploadExpire"]);
		operationResponse.setScriptData(FileUploadInfoParameterCode.UserId, doc["UserId"]);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse);
		}

		return operationResponse;
	}

}
