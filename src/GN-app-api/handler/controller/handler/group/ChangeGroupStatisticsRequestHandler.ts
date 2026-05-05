import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";
import { GroupStatisticsParam } from "./model/GroupStatisticsParam";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class ChangeGroupStatisticsOperationRequest extends OperationRequest {

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	// Stores the group statistics value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupStatistics, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupStatisticsParam })
	public groupStatistics: Array<GroupStatisticsParam>;

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

class ServerChangeGroupStatisticsOperationRequest extends ChangeGroupStatisticsOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangeGroupStatisticsOperationRequest extends ServerChangeGroupStatisticsOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangeGroupStatisticsRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ChangeGroupStatistics;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ChangeGroupStatisticsOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.changeGroupStatistics);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupStatistics: request.groupStatistics,
			log: request.log,
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangeGroupStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.changeGroupStatistics.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupStatistics: request.groupStatistics,
			log: request.log,
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangeGroupStatisticsOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.changeGroupStatistics.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupStatistics: request.groupStatistics,
			log: request.log,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { groupId: string, groupStatistics: Array<GroupStatisticsParam>, log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_ChangeGroupStatistics", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

		for (let i = 0; i < request.groupStatistics.length; i++) {
			// Stores the group statistics parameter value used in the current execution flow.
			let groupStatisticsParam = request.groupStatistics[i];

			// Stores the key value used in the current execution flow.
			let key = groupStatisticsParam.key;

			// Stores the group statistics settings item value used in the current execution flow.
			let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == key);
			if (groupStatisticsSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("StatisticsKey not found " + key);
				return operationResponse;
			}
		}

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			groupStatistics: true,
			removeStatus: true,
		}

		// Stores the group value used in the current execution flow.
		let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		if (role == SecretRole.Client) {
			// Stores the remove status value used in the current execution flow.
			let removeStatus = group.getRemoveStatus();
			if (removeStatus.tsRemove != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				operationResponse.setDebugMessage("Group is removed, reason " + removeStatus.reason);

				return operationResponse;
			}
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN group statistics value used in the current execution flow.
		let gnGroupStatistics = new GNArray();

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let logs: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

		for (let i = 0; i < request.groupStatistics.length; i++) {
			// Stores the group statistics parameter value used in the current execution flow.
			let groupStatisticsParam = request.groupStatistics[i];

			// Stores the key value used in the current execution flow.
			let key = groupStatisticsParam.key;

			// Stores the group statistics settings item value used in the current execution flow.
			let groupStatisticsSettingsItem = groupSettings.groupStatisticsSettings.find(x => x.key == key);
			if (groupStatisticsSettingsItem == null) continue;

			// Stores the value value used in the current execution flow.
			let value = groupStatisticsParam.value;

			// Stores the GearN group statistic value used in the current execution flow.
			let gnGroupStatistic = new GNHashtable();
			gnGroupStatistic.add(ParameterCode.Key, key);

			// Tracks whether set group statistics should be used.
			let useSetGroupStatistics = false;
			if (!group.hasGroupStatistics(key)) {
				useSetGroupStatistics = true;
				group.setGroupStatistics(key, groupStatisticsSettingsItem.initialValue, currentMilliseconds);
			}

			// Stores the group statistics value used in the current execution flow.
			let groupStatistics = group.getGroupStatistics(key);
			// Stores the old value value used in the current execution flow.
			let oldValue = groupStatistics.value;

			// Stores the statistics aggregation method value used in the current execution flow.
			let statisticsAggregationMethod = <xStatisticsAggregationMethod>groupStatisticsSettingsItem.statisticsAggregationMethod;

			if (statisticsAggregationMethod == xStatisticsAggregationMethod.Sum) {
				// Stores the new value value used in the current execution flow.
				let newValue = value + groupStatistics.value;

				if (groupStatisticsSettingsItem.maximumValue != null) {
					if (newValue > groupStatisticsSettingsItem.maximumValue) {
						useSetGroupStatistics = true;
						newValue = groupStatisticsSettingsItem.maximumValue;
					}
				}

				if (groupStatisticsSettingsItem.minimumValue != null) {
					if (newValue < groupStatisticsSettingsItem.minimumValue) {
						useSetGroupStatistics = true;
						newValue = groupStatisticsSettingsItem.minimumValue;
					}
				}

				if (useSetGroupStatistics) {
					group.setGroupStatistics(key, newValue, currentMilliseconds);
				}
				else {
					group.changeGroupStatistics(key, value, currentMilliseconds);
				}

				gnGroupStatistic.add(ParameterCode.Value, newValue);

				logs.push({
					groupId: request.groupId,
					key: key,
					amount: groupStatisticsParam.value,
					startValue: oldValue,
					finalValue: newValue,
					tsCreate: currentMilliseconds,
					log: request.log
				});
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Maximum) {
				if (value > groupStatistics.value) {
					if (groupStatisticsSettingsItem.maximumValue != null) {
						if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
					}

					if (groupStatisticsSettingsItem.minimumValue != null) {
						if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
					}

					group.setGroupStatistics(key, value, currentMilliseconds);
					gnGroupStatistic.add(ParameterCode.Value, value);

					logs.push({
						groupId: request.groupId,
						key: key,
						amount: groupStatisticsParam.value,
						startValue: oldValue,
						finalValue: value,
						tsCreate: currentMilliseconds,
						log: request.log
					});
				}
				else {
					if (groupStatisticsSettingsItem.maximumValue != null) {
						if (groupStatistics.value > groupStatisticsSettingsItem.maximumValue) {
							groupStatistics.value = groupStatisticsSettingsItem.maximumValue;
							group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
						}
					}

					if (groupStatisticsSettingsItem.minimumValue != null) {
						if (groupStatistics.value < groupStatisticsSettingsItem.minimumValue) {
							groupStatistics.value = groupStatisticsSettingsItem.minimumValue;
							group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
						}
					}

					gnGroupStatistic.add(ParameterCode.Value, groupStatistics.value);

					logs.push({
						groupId: request.groupId,
						key: key,
						amount: groupStatisticsParam.value,
						startValue: oldValue,
						finalValue: groupStatistics.value,
						tsCreate: currentMilliseconds,
						log: request.log
					});
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) {
				if (value < groupStatistics.value) {
					if (groupStatisticsSettingsItem.maximumValue != null) {
						if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
					}

					if (groupStatisticsSettingsItem.minimumValue != null) {
						if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
					}

					group.setGroupStatistics(key, value, currentMilliseconds);
					gnGroupStatistic.add(ParameterCode.Value, value);

					logs.push({
						groupId: request.groupId,
						key: key,
						amount: groupStatisticsParam.value,
						startValue: oldValue,
						finalValue: value,
						tsCreate: currentMilliseconds,
						log: request.log
					});
				}
				else {
					if (groupStatisticsSettingsItem.maximumValue != null) {
						if (groupStatistics.value > groupStatisticsSettingsItem.maximumValue) {
							groupStatistics.value = groupStatisticsSettingsItem.maximumValue;
							group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
						}
					}

					if (groupStatisticsSettingsItem.minimumValue != null) {
						if (groupStatistics.value < groupStatisticsSettingsItem.minimumValue) {
							groupStatistics.value = groupStatisticsSettingsItem.minimumValue;
							group.setGroupStatistics(key, groupStatistics.value, currentMilliseconds);
						}
					}

					gnGroupStatistic.add(ParameterCode.Value, groupStatistics.value);

					logs.push({
						groupId: request.groupId,
						key: key,
						amount: groupStatisticsParam.value,
						startValue: oldValue,
						finalValue: groupStatistics.value,
						tsCreate: currentMilliseconds,
						log: request.log
					});
				}
			}
			else if (statisticsAggregationMethod == xStatisticsAggregationMethod.Last) {
				if (groupStatisticsSettingsItem.maximumValue != null) {
					if (value > groupStatisticsSettingsItem.maximumValue) value = groupStatisticsSettingsItem.maximumValue;
				}

				if (groupStatisticsSettingsItem.minimumValue != null) {
					if (value < groupStatisticsSettingsItem.minimumValue) value = groupStatisticsSettingsItem.minimumValue;
				}

				group.setGroupStatistics(key, value, currentMilliseconds);
				gnGroupStatistic.add(ParameterCode.Value, value);

				logs.push({
					groupId: request.groupId,
					key: key,
					amount: groupStatisticsParam.value,
					startValue: oldValue,
					finalValue: value,
					tsCreate: currentMilliseconds,
					log: request.log
				});
			}

			gnGroupStatistics.add(gnGroupStatistic);
		}

		this.gnServer.getDatabase().groupRepository.insertGroupStatisticsLogsAsync(logs, secretInfo.getGameId());

		await group.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.GroupStatistics, gnGroupStatistics);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_ChangeGroupStatistics", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
