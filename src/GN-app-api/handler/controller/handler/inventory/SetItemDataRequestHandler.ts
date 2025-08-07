import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "./../../../../../GN-common/constant/enumType/PermissionDataItem";
import { ItemDataParam } from "./model/ItemDataParam";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";

class SetItemDataOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	itemId: string;

	@GNArrayDataMember({ code: ParameterCode.ItemDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: ItemDataParam })
	inventoryDataParams: Array<ItemDataParam>;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetItemDataOperationRequest extends SetItemDataOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetItemDataOperationRequest extends ServerSetItemDataOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetItemDataRequestHandler extends ItemBaseRequestHandler {
	public override getCode() {
		return OperationCode.SetItemData;
	}

	public override getCommonOperationRequest() {
		return SetItemDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setItemData);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			inventoryDataParams: request.inventoryDataParams
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetItemDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setItemData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			inventoryDataParams: request.inventoryDataParams
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetItemDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setItemData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			inventoryDataParams: request.inventoryDataParams
		}, secretInfo, operationRequest);
	}

	private async execute(request: { itemId: string, inventoryDataParams: Array<ItemDataParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetItemData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventoryFindOptions: InventoryFindOptions = {
			itemDatas: true,
		}

		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnItemDatas = new GNArray();

		for (let i = 0; i < request.inventoryDataParams.length; i++) {
			let inventoryDataParam = request.inventoryDataParams[i];

			let key = inventoryDataParam.key;
			let inventoryDatasSettingsItem = inventorySettings.inventoryDatasSettings.find(x => x.key == key);
			if (inventoryDatasSettingsItem == null) continue;

			let value = inventoryDataParam.value;
			let permission = <PermissionDataItem>inventoryDatasSettingsItem.permission;

			if (permission == PermissionDataItem.ReadOnly && <SecretRole>secretInfo.getRole() == SecretRole.Player) {

			}
			else {
				if (value != null && value instanceof GNData) {
					value = (value as GNData).toData();
				}

				inventory.setItemData(key, value as DataValueType);

				let gnItemData = new GNHashtable();
				gnItemData.add(ParameterCode.Key, key);
				gnItemData.add(ParameterCode.Value, inventoryDataParam.value);

				gnItemDatas.add(gnItemData);
			}
		}

		inventory.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.ItemDatas, gnItemDatas);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetItemData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
