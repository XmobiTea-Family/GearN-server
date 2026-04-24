import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "./../../../../../GN-common/constant/enumType/PermissionDataItem";
import { GroupDataParam } from "./model/GroupDataParam";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class SetGroupDataOperationRequest extends OperationRequest {

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	// Stores the group datas value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupDataParam })
	public groupDatas: Array<GroupDataParam>;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetGroupDataOperationRequest extends SetGroupDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetGroupDataOperationRequest extends ServerSetGroupDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetGroupDataRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetGroupData;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetGroupDataOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setGroupData);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupDatas: request.groupDatas
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetGroupDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setGroupData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupDatas: request.groupDatas
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetGroupDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setGroupData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupDatas: request.groupDatas
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { groupId: string, groupDatas: Array<GroupDataParam> }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetGroupData", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved group settings instance for the current execution flow.
		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

		// Stores the resolved inventory settings instance for the current execution flow.
		for (let i = 0; i < request.groupDatas.length; i++) {
			// Stores the group data parameter value used in the current execution flow.
			let groupDataParam = request.groupDatas[i];

			// Stores the key value used in the current execution flow.
			let key = groupDataParam.key;
			// Stores the group datas settings item value used in the current execution flow.
			let groupDatasSettingsItem = groupSettings.groupDatasSettings.find(x => x.key == key);
			if (groupDatasSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("DataKey not found " + key);
				return operationResponse;
			}

			if (<PermissionDataItem>groupDatasSettingsItem.permission == PermissionDataItem.ReadOnly && role == SecretRole.Client) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("DataKey is readOnly " + key + ", change it by server or admin role");
				return operationResponse;
			}
		}

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			groupDatas: true,
		}

		// Stores the group value used in the current execution flow.
		let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN group datas value used in the current execution flow.
		let gnGroupDatas = new GNArray();

		for (let i = 0; i < request.groupDatas.length; i++) {
			// Stores the group data parameter value used in the current execution flow.
			let groupDataParam = request.groupDatas[i];

			// Stores the key value used in the current execution flow.
			let key = groupDataParam.key;
			// Stores the group datas settings item value used in the current execution flow.
			let groupDatasSettingsItem = groupSettings.groupDatasSettings.find(x => x.key == key);
			if (groupDatasSettingsItem == null) continue;

			// Stores the value value used in the current execution flow.
			let value = groupDataParam.value;
			// Stores the permission value used in the current execution flow.
			let permission = <PermissionDataItem>groupDatasSettingsItem.permission;

			if (permission == PermissionDataItem.ReadOnly && role == SecretRole.Client) {

			}
			else {
				if (value == null) {
					group.removeGroupData(key);
				}
				else {
					if (value instanceof GNData) {
						value = (value as GNData).toData();
					}

					group.setGroupData(key, value as DataValueType);
				}

				// Stores the GearN group data value used in the current execution flow.
				let gnGroupData = new GNHashtable();
				gnGroupData.add(ParameterCode.Key, key);
				gnGroupData.add(ParameterCode.Value, groupDataParam.value);

				gnGroupDatas.add(gnGroupData);
			}
		}

		group.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.GroupDatas, gnGroupDatas);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_SetGroupData", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
