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

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	@GNArrayDataMember({ code: ParameterCode.GroupDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupDataParam })
	public groupDatas: Array<GroupDataParam>;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetGroupDataOperationRequest extends SetGroupDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetGroupDataOperationRequest extends ServerSetGroupDataOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetGroupDataRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.SetGroupData;
	}

	public override getCommonOperationRequest() {
		return SetGroupDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setGroupData);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupDatas: request.groupDatas
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, groupDatas: Array<GroupDataParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetGroupData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions: GroupFindOptions = {
			groupDatas: true,
		}

		let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnGroupDatas = new GNArray();

		for (let i = 0; i < request.groupDatas.length; i++) {
			let groupDataParam = request.groupDatas[i];

			let key = groupDataParam.key;
			let groupDatasSettingsItem = groupSettings.groupDatasSettings.find(x => x.key == key);
			if (groupDatasSettingsItem == null) continue;

			let value = groupDataParam.value;
			let permission = <PermissionDataItem>groupDatasSettingsItem.permission;

			if (permission == PermissionDataItem.ReadOnly && <SecretRole>secretInfo.getRole() == SecretRole.Player) {

			}
			else {
				if (value != null && value instanceof GNData) {
					value = (value as GNData).toData();
				}

				group.setGroupData(key, value as DataValueType);

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

		await this.gnServer.getPostEventCallbackService().onEvent("group_SetGroupData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
