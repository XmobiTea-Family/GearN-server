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
import { GroupCurrencyParam } from "./model/GroupCurrencyParam";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class ChangeGroupCurrencyOperationRequest extends OperationRequest {

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	// Stores the group currencies value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupCurrencies, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupCurrencyParam })
	public groupCurrencies: Array<GroupCurrencyParam>;

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

class ServerChangeGroupCurrencyOperationRequest extends ChangeGroupCurrencyOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangeGroupCurrencyOperationRequest extends ServerChangeGroupCurrencyOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangeGroupCurrencyRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ChangeGroupCurrency;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ChangeGroupCurrencyOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.changeGroupCurrency);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupCurrencies: request.groupCurrencies,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangeGroupCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.changeGroupCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupCurrencies: request.groupCurrencies,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangeGroupCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.changeGroupCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupCurrencies: request.groupCurrencies,
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
	private async execute(request: { groupId: string, groupCurrencies: Array<GroupCurrencyParam>, log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_ChangeGroupCurrency", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

		for (let i = 0; i < request.groupCurrencies.length; i++) {
			// Stores the group currency parameter value used in the current execution flow.
			let groupCurrencyParam = request.groupCurrencies[i];

			// Stores the key value used in the current execution flow.
			let key = groupCurrencyParam.key;

			// Stores the group currencies settings item value used in the current execution flow.
			let groupCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings.find(x => x.key == key);
			if (groupCurrenciesSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("CurrencyKey not found " + key);
				return operationResponse;
			}
		}

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			groupCurrencies: true,
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
		// Stores the GearN group currencies value used in the current execution flow.
		let gnGroupCurrencies = new GNArray();

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let logs: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

		for (let i = 0; i < request.groupCurrencies.length; i++) {
			// Stores the group currency parameter value used in the current execution flow.
			let groupCurrencyParam = request.groupCurrencies[i];

			// Stores the key value used in the current execution flow.
			let key = groupCurrencyParam.key;

			// Stores the group currencies settings item value used in the current execution flow.
			let groupCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings.find(x => x.key == key);
			if (groupCurrenciesSettingsItem == null) continue;

			// Stores the amount value used in the current execution flow.
			let amount = groupCurrencyParam.amount;
			// Stores the server value value used in the current execution flow.
			let serverValue = 0;

			// Tracks whether set group currency should be used.
			let useSetGroupCurrency = false;
			if (!group.hasGroupCurrency(key)) {
				useSetGroupCurrency = true;
				serverValue = groupCurrenciesSettingsItem.initialValue;
			}
			else {
				serverValue = group.getGroupCurrency(key).value;
			}

			// Stores the start value value used in the current execution flow.
			let startValue = serverValue;

			serverValue += amount;
			if (serverValue < 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.NotEnoughCurrency);
				return operationResponse;
			}

			logs.push({
				groupId: request.groupId,
				key: key,
				amount: amount,
				startValue: startValue,
				finalValue: serverValue,
				tsCreate: currentMilliseconds,
				log: request.log
			});

			// Stores the GearN group currency value used in the current execution flow.
			let gnGroupCurrency = new GNHashtable();

			gnGroupCurrency.add(ParameterCode.Key, key);
			gnGroupCurrency.add(ParameterCode.Value, serverValue);

			gnGroupCurrencies.add(gnGroupCurrency);

			if (useSetGroupCurrency) {
				group.setGroupCurrency(key, serverValue);
			}
			else {
				group.changeGroupCurrency(key, amount);
			}
		}

		this.gnServer.getDatabase().groupRepository.insertGroupCurrencyLogsAsync(logs, secretInfo.getGameId());

		group.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.GroupCurrencies, gnGroupCurrencies);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_ChangeGroupCurrency", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
