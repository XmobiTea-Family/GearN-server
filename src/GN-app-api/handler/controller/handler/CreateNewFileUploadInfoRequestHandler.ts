import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { nanoid } from "nanoid";
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { FileUploadInfoParameterCode } from "./../../../../GN-common/constant/parameterCode/FileUploadInfoParameterCode";
import { FileUploadInfoErrorCode } from "./../../../../GN-common/constant/errorCode/FileUploadInfoErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class CreateNewFileUploadInfoOperationRequest extends OperationRequest {
	@StringDataMember({ code: FileUploadInfoParameterCode.OriginFileName, mustNonNull: true, minLength: 5, maxLength: 50 })
	originFileName: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateNewFileUploadInfoRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.CreateNewFileUploadInfo;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, CreateNewFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let doc = {
			FileId: nanoid(),
			UserId: authInfo.getUserId(),
			OriginFileName: request.originFileName,
			TsCreate: currentMilliseconds,
			TsUploadExpire: currentMilliseconds + 15 * xDatetime.ONE_MINUTE_MILLISECOND,
		};

		this.gameApplication.getDatabase().systemGameCollection("UploadFileInfo").insertOne(doc);

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, FileUploadInfoErrorCode.Ok);

		operationResponse.setParameter(FileUploadInfoParameterCode.FileId, doc["FileId"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.OriginFileName, doc["OriginFileName"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.TsCreate, doc["TsCreate"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.TsUploadExpire, doc["TsUploadExpire"]);
		operationResponse.setParameter(FileUploadInfoParameterCode.UserId, doc["UserId"]);

		return operationResponse;
	}
}
