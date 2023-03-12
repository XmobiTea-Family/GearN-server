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

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";

class GetClassIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	itemId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetClassIdOperationRequest extends GetClassIdOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetClassIdOperationRequest extends ServerGetClassIdOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetClassIdRequestHandler extends ItemBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetClassId;
	}

	public override getCommonOperationRequest() {
		return GetClassIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.getClassId);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetClassIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getClassId.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetClassIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getClassId.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { itemId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_GetClassId", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventoryFindOptions: InventoryFindOptions = {
			classId: true,
		}

		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ItemNotFound);
			return operationResponse;
		}

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(GNParameterCode.ClassId, this.generateClassId(inventory));

		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_GetClassId", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
