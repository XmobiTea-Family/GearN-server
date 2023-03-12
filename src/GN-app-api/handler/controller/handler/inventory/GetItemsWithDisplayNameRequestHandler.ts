import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetItemsWithDisplayNameOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.Keyword, minLength: 2, maxLength: 32 })
	keyword: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetItemsWithDisplayNameOperationRequest extends GetItemsWithDisplayNameOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetItemsWithDisplayNameOperationRequest extends ServerGetItemsWithDisplayNameOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetItemsWithDisplayNameRequestHandler extends ItemBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetItemsWithDisplayName;
	}

	public override getCommonOperationRequest() {
		return GetItemsWithDisplayNameOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemsWithDisplayName.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			keyword: request.keyword,
			infoRequestParam: request.infoRequestParam,
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetItemsWithDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemsWithDisplayName.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			keyword: request.keyword,
			infoRequestParam: request.infoRequestParam,
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetItemsWithDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemsWithDisplayName.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			keyword: request.keyword,
			infoRequestParam: request.infoRequestParam,
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { keyword: string, infoRequestParam: InfoRequestParam, skip: number, limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_GetItemsWithDisplayName", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventoryFindOptions = this.convertToInventoryFindOptions(request.infoRequestParam);

		let gnResults = new GNArray();

		let inventorys = await this.gnServer.getDatabase().loadInventoriesWithDisplayNameNormalizeRegexAsync(DisplayNameUtility.normalizeString(request.keyword), request.skip, request.limit, secretInfo.getGameId(), inventoryFindOptions);

		for (let i = 0; i < inventorys.length; i++) {
			let inventory = inventorys[i];

			let gnResult = new GNHashtable();

			gnResult.add(GNParameterCode.ItemId, inventory.getItemId());
			gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(inventory, request.infoRequestParam, secretInfo.getGameId()));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_GetItemsWithDisplayName", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
