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

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { UploadFileInfo } from "./../../../../../GN-library/xdatabase/lib/entity/pro/UploadFileInfo";

class GetFileUploadInfoListOperationRequest extends OperationRequest {

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}

}

class ServerGetFileUploadInfoListOperationRequest extends GetFileUploadInfoListOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetFileUploadInfoListOperationRequest extends ServerGetFileUploadInfoListOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetFileUploadInfoListRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetFileUploadInfoList;
	}

	public override getCommonOperationRequest() {
		return GetFileUploadInfoListOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getFileUploadInfoList.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetFileUploadInfoListOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getFileUploadInfoList.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetFileUploadInfoListOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getFileUploadInfoList.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { skip: number, limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_GetFileUploadInfoList", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("UploadFileInfo");
		let uploadFileInfos = await collection.find({ gameId: secretInfo.getGameId() }, {
			projection: {
				fileId: true
			}
		}).sort({ _id: -1 }).skip(request.skip).limit(request.limit);

		let gnResults = new GNArray();

		while (await uploadFileInfos.hasNext()) {
			let uploadFileInfo = new UploadFileInfo(await uploadFileInfos.next(), collection);

			let gnUploadFileInfo = new GNHashtable();

			gnUploadFileInfo.add(ParameterCode.FileId, uploadFileInfo.getFileId());

			gnResults.add(gnUploadFileInfo);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_GetFileUploadInfoList", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
