import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetStoreItemInformationOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
	public storeId: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStoreItemInformationOperationRequest extends GetStoreItemInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStoreItemInformationOperationRequest extends ServerGetStoreItemInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStoreItemInformationRequestHandler extends StoreItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetStoreItemInformation;
	}

	public override getCommonOperationRequest() {
		return GetStoreItemInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreItemInformation.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStoreItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreItemInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStoreItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreItemInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { storeId: string, infoRequestParam: InfoRequestParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetStoreItemInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let storeInventoryFindOptions = this.convertToStoreInventoryFindOptions(request.infoRequestParam);

		let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(request.storeId, secretInfo.getGameId(), storeInventoryFindOptions);

		if (storeInventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetStoreItemInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
