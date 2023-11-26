import { RequestHandler } from "./../base/RequestHandler";

import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";

class CreateNewFileUploadInfoOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.FileName, mustNonNull: true, minLength: 5, maxLength: 50 })
	fileName: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateNewFileUploadInfoOperationRequest extends CreateNewFileUploadInfoOperationRequest {

	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCreateNewFileUploadInfoOperationRequest extends ServerCreateNewFileUploadInfoOperationRequest {

	public override isValidRequest() {
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

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.createNewFileUploadInfo.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			fileName: request.fileName,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreateNewFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.createNewFileUploadInfo.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			fileName: request.fileName,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreateNewFileUploadInfoOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.createNewFileUploadInfo.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			fileName: request.fileName,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, fileName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_CreateNewFileUploadInfo", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let doc = {
			fileId: StringUtility.generateRandomString(15, 0),
			userId: request.userId,
			fileName: request.fileName,
			tsCreate: currentMilliseconds,
			tsUploadExpire: currentMilliseconds + 5 * xDatetime.ONE_MINUTE_MILLISECOND,
			removeStatus: { tsRemove: 0, reason: "" },
			gameId: secretInfo.getGameId(),
		};

		await this.gnServer.getDatabase().createUploadFileInfoAsync(doc);

		operationResponse.setParameter(GNParameterCode.FileId, doc["fileId"]);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_CreateNewFileUploadInfo", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}