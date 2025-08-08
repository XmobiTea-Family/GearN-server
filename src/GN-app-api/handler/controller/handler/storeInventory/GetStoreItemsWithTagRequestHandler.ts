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

class GetStoreItemsWithTagOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	public key: string;

	@StringDataMember({ code: ParameterCode.Value, minLength: 2, maxLength: 32, mustNonNull: true })
	public value: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStoreItemsWithTagOperationRequest extends GetStoreItemsWithTagOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStoreItemsWithTagOperationRequest extends ServerGetStoreItemsWithTagOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStoreItemsWithTagRequestHandler extends StoreItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetStoreItemsWithTag;
	}

	public override getCommonOperationRequest() {
		return GetStoreItemsWithTagOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreItemsWithTag.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			key: request.key,
			value: request.value,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStoreItemsWithTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreItemsWithTag.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			key: request.key,
			value: request.value,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStoreItemsWithTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreItemsWithTag.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			key: request.key,
			value: request.value,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { key: string, value: string, skip: number, limit: number, infoRequestParam: InfoRequestParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetStoreItemsWithTag", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let storeInventoryFindOptions = this.convertToStoreInventoryFindOptions(request.infoRequestParam);

		let gnResults = new GNArray();

		let storeInventorys = await this.gnServer.getDatabase().loadStoreInventoriesWithTagAsync(request.key, request.value, request.skip, request.limit, secretInfo.getGameId(), storeInventoryFindOptions);

		for (let i = 0; i < storeInventorys.length; i++) {
			let storeInventory = storeInventorys[i];

			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.StoreId, storeInventory.getStoreId());

			gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, request.infoRequestParam, secretInfo.getGameId()));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetStoreItemsWithTag", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
