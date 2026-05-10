import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { ItemStatisticsParam } from "./model/ItemStatisticsParam";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";

class ChangeItemStatisticsOperationRequest extends OperationRequest {
    // Stores the item ID value used by this instance.
    @StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
    public itemId: string;

    // Stores the item statistics value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.ItemStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: ItemStatisticsParam })
    public itemStatistics: Array<ItemStatisticsParam>;

    // Stores the log value used by this instance.
    @StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    public log?: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerChangeItemStatisticsOperationRequest extends ChangeItemStatisticsOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminChangeItemStatisticsOperationRequest extends ServerChangeItemStatisticsOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class ChangeItemStatisticsRequestHandler extends ItemBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.ChangeItemStatistics;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return ChangeItemStatisticsOperationRequest;
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
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.changeItemStatistics);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                itemId: request.itemId,
                itemStatistics: request.itemStatistics,
                log: request.log,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangeItemStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().inventory.changeItemStatistics.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                itemId: request.itemId,
                itemStatistics: request.itemStatistics,
                log: request.log,
            },
            SecretRole.Server,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangeItemStatisticsOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().inventory.changeItemStatistics.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                itemId: request.itemId,
                itemStatistics: request.itemStatistics,
                log: request.log,
            },
            SecretRole.Admin,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { itemId: string; itemStatistics: Array<ItemStatisticsParam>; log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_ChangeItemStatistics", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the resolved inventory settings instance for the current execution flow.
        let inventorySettings = this.gnServer.getGNSettings().getInventorySettings(secretInfo.getGameId());

        for (let i = 0; i < request.itemStatistics.length; i++) {
            // Stores the item statistics parameter value used in the current execution flow.
            let itemStatisticsParam = request.itemStatistics[i];

            // Stores the key value used in the current execution flow.
            let key = itemStatisticsParam.key;

            // Stores the item statistics settings item value used in the current execution flow.
            let itemStatisticsSettingsItem = inventorySettings.itemStatisticsSettings.find((x) => x.key == key);
            if (itemStatisticsSettingsItem == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
                operationResponse.setDebugMessage("StatisticsKey not found " + key);
                return operationResponse;
            }
        }

        // Stores the inventory find options value used in the current execution flow.
        let inventoryFindOptions: InventoryFindOptions = {
            itemStatistics: true,
            removeStatus: true,
        };

        // Stores the inventory value used in the current execution flow.
        let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

        if (inventory == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
            return operationResponse;
        }

        if (role == SecretRole.Client) {
            // Stores the remove status value used in the current execution flow.
            let removeStatus = inventory.getRemoveStatus();
            if (removeStatus.tsRemove != 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                operationResponse.setDebugMessage("Item is removed, reason " + removeStatus.reason);

                return operationResponse;
            }
        }

        // Stores the GearN info response parameters value used in the current execution flow.
        let gnInfoResponseParameters = new GNHashtable();
        // Stores the GearN item statistics value used in the current execution flow.
        let gnItemStatistics = new GNArray();

        // Stores the current milliseconds value used in the current execution flow.
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < request.itemStatistics.length; i++) {
            // Stores the item statistics parameter value used in the current execution flow.
            let itemStatisticsParam = request.itemStatistics[i];

            // Stores the key value used in the current execution flow.
            let key = itemStatisticsParam.key;

            // Stores the item statistics settings item value used in the current execution flow.
            let itemStatisticsSettingsItem = inventorySettings.itemStatisticsSettings.find((x) => x.key == key);
            if (itemStatisticsSettingsItem == null) continue;

            // Stores the value value used in the current execution flow.
            let value = itemStatisticsParam.value;

            // Stores the GearN item statistic value used in the current execution flow.
            let gnItemStatistic = new GNHashtable();
            gnItemStatistic.add(ParameterCode.Key, key);

            // Tracks whether set item statistics should be used.
            let useSetItemStatistics = false;
            if (!inventory.hasItemStatistics(key)) {
                useSetItemStatistics = true;
                inventory.setItemStatistics(key, itemStatisticsSettingsItem.initialValue, currentMilliseconds);
            }

            // Stores the item statistics value used in the current execution flow.
            let itemStatistics = inventory.getItemStatistics(key);
            // Stores the old value value used in the current execution flow.
            let oldValue = itemStatistics.value;

            // Stores the statistics aggregation method value used in the current execution flow.
            let statisticsAggregationMethod = <xStatisticsAggregationMethod>itemStatisticsSettingsItem.statisticsAggregationMethod;

            if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
                // Stores the new value value used in the current execution flow.
                let newValue = value + itemStatistics.value;

                if (itemStatisticsSettingsItem.maximumValue != null) {
                    if (newValue > itemStatisticsSettingsItem.maximumValue) {
                        useSetItemStatistics = true;
                        newValue = itemStatisticsSettingsItem.maximumValue;
                    }
                }

                if (itemStatisticsSettingsItem.minimumValue != null) {
                    if (newValue < itemStatisticsSettingsItem.minimumValue) {
                        useSetItemStatistics = true;
                        newValue = itemStatisticsSettingsItem.minimumValue;
                    }
                }

                if (useSetItemStatistics) {
                    inventory.setItemStatistics(key, newValue, currentMilliseconds);
                } else {
                    inventory.changeItemStatistics(key, value, currentMilliseconds);
                }

                gnItemStatistic.add(ParameterCode.Value, newValue);

                this.gnServer.getDatabase().inventoryRepository.insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, newValue, request.log);
            } else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
                if (value > itemStatistics.value) {
                    if (itemStatisticsSettingsItem.maximumValue != null) {
                        if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
                    }

                    if (itemStatisticsSettingsItem.minimumValue != null) {
                        if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
                    }

                    inventory.setItemStatistics(key, value, currentMilliseconds);
                    gnItemStatistic.add(ParameterCode.Value, value);

                    this.gnServer.getDatabase().inventoryRepository.insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, value, request.log);
                } else {
                    if (itemStatisticsSettingsItem.maximumValue != null) {
                        if (itemStatistics.value > itemStatisticsSettingsItem.maximumValue) {
                            itemStatistics.value = itemStatisticsSettingsItem.maximumValue;
                            inventory.setItemStatistics(key, itemStatistics.value, currentMilliseconds);
                        }
                    }

                    if (itemStatisticsSettingsItem.minimumValue != null) {
                        if (itemStatistics.value < itemStatisticsSettingsItem.minimumValue) {
                            itemStatistics.value = itemStatisticsSettingsItem.minimumValue;
                            inventory.setItemStatistics(key, itemStatistics.value, currentMilliseconds);
                        }
                    }

                    gnItemStatistic.add(ParameterCode.Value, itemStatistics.value);

                    this.gnServer.getDatabase().inventoryRepository.insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, itemStatistics.value, request.log);
                }
            } else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
                if (value < itemStatistics.value) {
                    if (itemStatisticsSettingsItem.maximumValue != null) {
                        if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
                    }

                    if (itemStatisticsSettingsItem.minimumValue != null) {
                        if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
                    }

                    inventory.setItemStatistics(key, value, currentMilliseconds);
                    gnItemStatistic.add(ParameterCode.Value, value);

                    this.gnServer.getDatabase().inventoryRepository.insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, value, request.log);
                } else {
                    if (itemStatisticsSettingsItem.maximumValue != null) {
                        if (itemStatistics.value > itemStatisticsSettingsItem.maximumValue) {
                            itemStatistics.value = itemStatisticsSettingsItem.maximumValue;
                            inventory.setItemStatistics(key, itemStatistics.value, currentMilliseconds);
                        }
                    }

                    if (itemStatisticsSettingsItem.minimumValue != null) {
                        if (itemStatistics.value < itemStatisticsSettingsItem.minimumValue) {
                            itemStatistics.value = itemStatisticsSettingsItem.minimumValue;
                            inventory.setItemStatistics(key, itemStatistics.value, currentMilliseconds);
                        }
                    }

                    gnItemStatistic.add(ParameterCode.Value, itemStatistics.value);

                    this.gnServer.getDatabase().inventoryRepository.insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, itemStatistics.value, request.log);
                }
            } else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
                if (itemStatisticsSettingsItem.maximumValue != null) {
                    if (value > itemStatisticsSettingsItem.maximumValue) value = itemStatisticsSettingsItem.maximumValue;
                }

                if (itemStatisticsSettingsItem.minimumValue != null) {
                    if (value < itemStatisticsSettingsItem.minimumValue) value = itemStatisticsSettingsItem.minimumValue;
                }

                inventory.setItemStatistics(key, value, currentMilliseconds);
                gnItemStatistic.add(ParameterCode.Value, value);

                this.gnServer.getDatabase().inventoryRepository.insertInventoryStatisticsLogAsync(request.itemId, secretInfo.getGameId(), key, itemStatisticsParam.value, oldValue, value, request.log);
            }

            gnItemStatistics.add(gnItemStatistic);
        }

        await inventory.saveAsync();

        gnInfoResponseParameters.add(ParameterCode.ItemStatistics, gnItemStatistics);

        operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("inventory_ChangeItemStatistics", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
