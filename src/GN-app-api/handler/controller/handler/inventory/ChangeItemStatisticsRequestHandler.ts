import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { ItemStatisticsParam } from "./model/ItemStatisticsParam";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";

class ChangeItemStatisticsOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	@GNArrayDataMember({ code: ParameterCode.ItemStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: ItemStatisticsParam })
	public itemStatistics: Array<ItemStatisticsParam>;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerChangeItemStatisticsOperationRequest extends ChangeItemStatisticsOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangeItemStatisticsOperationRequest extends ServerChangeItemStatisticsOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangeItemStatisticsRequestHandler extends ItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.ChangeItemStatistics;
	}

	public override getCommonOperationRequest() {
		return ChangeItemStatisticsOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.changeItemStatistics);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			itemStatistics: request.itemStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangeItemStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.changeItemStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			itemStatistics: request.itemStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangeItemStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.changeItemStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			itemStatistics: request.itemStatistics,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { itemId: string, itemStatistics: Array<ItemStatisticsParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_ChangeItemStatistics", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventoryFindOptions: InventoryFindOptions = {
			itemStatistics: true,
		}

		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnItemStatistics = new GNArray();

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		for (let i = 0; i < request.itemStatistics.length; i++) {
			let itemStatisticsParam = request.itemStatistics[i];

			let key = itemStatisticsParam.key;

			let itemStatisticsSettingsItem = inventorySettings.itemStatisticsSettings.find(x => x.key == key);
			if (itemStatisticsSettingsItem == null) continue;

			let value = itemStatisticsParam.value;

			let gnItemStatistic = new GNHashtable();
			gnItemStatistic.add(ParameterCode.Key, key);

			if (!inventory.hasItemStatistics(key))
				inventory.changeItemStatistics(key, itemStatisticsSettingsItem.initialValue, currentMilliseconds);

			let itemStatistics = inventory.getItemStatistics(key);
			let oldValue = itemStatistics.value;

			let statisticsAggregationMethod = <xStatisticsAggregationMethod>itemStatisticsSettingsItem.statisticsAggregationMethod;

			if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
				let newValue = value + itemStatistics.value;

				if (itemStatisticsSettingsItem.maximumValue != null) {
					if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
				}

				if (itemStatisticsSettingsItem.minimumValue != null) {
					if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
				}

				inventory.changeItemStatistics(key, newValue, currentMilliseconds);
				gnItemStatistic.add(ParameterCode.Value, newValue);

				this.gnServer.getDatabase().insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, newValue, request.log);

			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
				if (value > itemStatistics.value) {
					if (itemStatisticsSettingsItem.maximumValue != null) {
						if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
					}

					if (itemStatisticsSettingsItem.minimumValue != null) {
						if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
					}

					inventory.changeItemStatistics(key, value, currentMilliseconds);
					gnItemStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (itemStatisticsSettingsItem.maximumValue != null) {
						if (itemStatistics.value > itemStatisticsSettingsItem.maximumValue) {
							itemStatistics.value = itemStatisticsSettingsItem.maximumValue;
							inventory.changeItemStatistics(key, itemStatistics.value, currentMilliseconds);
						}
					}

					if (itemStatisticsSettingsItem.minimumValue != null) {
						if (itemStatistics.value < itemStatisticsSettingsItem.minimumValue) {
							itemStatistics.value = itemStatisticsSettingsItem.minimumValue;
							inventory.changeItemStatistics(key, itemStatistics.value, currentMilliseconds);
						}
					}

					gnItemStatistic.add(ParameterCode.Value, itemStatistics.value);

					this.gnServer.getDatabase().insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, itemStatistics.value, request.log);
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
				if (value < itemStatistics.value) {
					if (itemStatisticsSettingsItem.maximumValue != null) {
						if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
					}

					if (itemStatisticsSettingsItem.minimumValue != null) {
						if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
					}

					inventory.changeItemStatistics(key, value, currentMilliseconds);
					gnItemStatistic.add(ParameterCode.Value, value);

					this.gnServer.getDatabase().insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, value, request.log);
				}
				else {
					if (itemStatisticsSettingsItem.maximumValue != null) {
						if (itemStatistics.value > itemStatisticsSettingsItem.maximumValue) {
							itemStatistics.value = itemStatisticsSettingsItem.maximumValue;
							inventory.changeItemStatistics(key, itemStatistics.value, currentMilliseconds);
						}
					}

					if (itemStatisticsSettingsItem.minimumValue != null) {
						if (itemStatistics.value < itemStatisticsSettingsItem.minimumValue) {
							itemStatistics.value = itemStatisticsSettingsItem.minimumValue;
							inventory.changeItemStatistics(key, itemStatistics.value, currentMilliseconds);
						}
					}

					gnItemStatistic.add(ParameterCode.Value, itemStatistics.value);

					this.gnServer.getDatabase().insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, itemStatistics.value, request.log);
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
				if (itemStatisticsSettingsItem.maximumValue != null) {
					if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
				}

				if (itemStatisticsSettingsItem.minimumValue != null) {
					if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
				}

				inventory.changeItemStatistics(key, value, currentMilliseconds);
				gnItemStatistic.add(ParameterCode.Value, value);

				this.gnServer.getDatabase().insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, value, request.log);
			}

			gnItemStatistics.add(gnItemStatistic);
		}

		inventory.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.ItemStatistics, gnItemStatistics);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_ChangeItemStatistics", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
