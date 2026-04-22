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
import { CustomDataParam } from "./model/CustomDataParam";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "./../../../../../GN-common/constant/enumType/PermissionDataItem";

class SetCustomDataOperationRequest extends OperationRequest {

	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	// Stores the custom datas value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.CustomDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: CustomDataParam })
	public customDatas: Array<CustomDataParam>;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetCustomDataOperationRequest extends SetCustomDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetCustomDataOperationRequest extends ServerSetCustomDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetCustomDataRequestHandler extends ItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetCustomData;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetCustomDataOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		// Tracks whether method is allowed.
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setCustomData);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			customDatas: request.customDatas
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetCustomDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setCustomData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			customDatas: request.customDatas
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetCustomDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setCustomData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			customDatas: request.customDatas
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { itemId: string, customDatas: Array<CustomDataParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetCustomData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved inventory settings instance for the current execution flow.
		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(secretInfo.getGameId());

		for (let i = 0; i < request.customDatas.length; i++) {
			// Stores the custom data parameter value used in the current execution flow.
			let customDataParameter = request.customDatas[i];

			// Stores the key value used in the current execution flow.
			let key = customDataParameter.key;

			// Stores the custom datas settings item value used in the current execution flow.
			let customDatasSettingsItem = inventorySettings.customDatasSettings.find(x => x.key == key);
			if (customDatasSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("CustomKey not found " + key);
				return operationResponse;
			}

			if (<PermissionDataItem>customDatasSettingsItem.permission == PermissionDataItem.ReadOnly && <SecretRole>secretInfo.getRole() == SecretRole.Player) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("CustomKey is readOnly " + key + ", change it by server or admin role");
				return operationResponse;
			}
		}

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions: InventoryFindOptions = {
			customDatas: true,
		}

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN custom datas value used in the current execution flow.
		let gnCustomDatas = new GNArray();

		for (let i = 0; i < request.customDatas.length; i++) {
			// Stores the custom data parameter value used in the current execution flow.
			let customDataParameter = request.customDatas[i];

			// Stores the key value used in the current execution flow.
			let key = customDataParameter.key;

			// Stores the custom datas settings item value used in the current execution flow.
			let customDatasSettingsItem = inventorySettings.customDatasSettings.find(x => x.key == key);
			if (customDatasSettingsItem == null) continue;

			// Stores the value value used in the current execution flow.
			let value = customDataParameter.value;

			let permission = <PermissionDataItem>customDatasSettingsItem.permission;

			if (permission == PermissionDataItem.ReadOnly && <SecretRole>secretInfo.getRole() == SecretRole.Player) {

			}
			else {
				if (value == null) {
					inventory.removeCustomData(key);
				}
				else {
					if (value instanceof GNData) {
						value = (value as GNData).toData();
					}

					inventory.setCustomData(key, value as DataValueType);
				}

				// Stores the GearN item data value used in the current execution flow.
				let gnCustomData = new GNHashtable();
				gnCustomData.add(ParameterCode.Key, key);
				gnCustomData.add(ParameterCode.Value, customDataParameter.value);

				gnCustomDatas.add(gnCustomData);
			}
		}

		inventory.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.CustomDatas, gnCustomDatas);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetCustomData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
