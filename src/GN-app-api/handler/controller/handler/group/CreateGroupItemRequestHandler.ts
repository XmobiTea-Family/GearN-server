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
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class CreateGroupItemOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	public catalogId: string;

	@StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32, mustNonNull: true })
	public classId: string;

	@StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true })
	public displayName?: string;

	@NumberDataMember({ code: ParameterCode.Amount, defaultValue: 1, mustInt: true, isOptional: true })
	public amount?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateGroupItemOperationRequest extends CreateGroupItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCreateGroupItemOperationRequest extends ServerCreateGroupItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateGroupItemRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.CreateGroupItem;
	}

	public override getCommonOperationRequest() {
		return CreateGroupItemOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.createGroupItem);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreateGroupItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.createGroupItem.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreateGroupItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.createGroupItem.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, catalogId: string, classId: string, displayName: string, amount: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_CreateGroupItem", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions: GroupFindOptions = {
			groupInventories: true,
		}

		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());
		let groupItemCatalogSettingsItem = groupSettings.groupItemCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (groupItemCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);
			return operationResponse;
		}

		let itemClassSettingsItem = groupItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == request.classId);
		if (itemClassSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ClassIdNotFound);
			return operationResponse;
		}

		let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let amount = request.amount;

		if (groupItemCatalogSettingsItem.itemType == <number>ItemType.NonStackable) {
			amount = 1;
		}

		let itemId = StringUtility.generateRandomString(12, this.gnServer.getIdTypeCase());
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let result = {} as any;
		result["itemId"] = itemId;
		result["catalogId"] = request.catalogId;
		result["classId"] = request.classId;
		result["amount"] = amount;
		result["itemType"] = groupItemCatalogSettingsItem.itemType;
		result["owner"] = { "id": request.groupId, "type": <number>OwnerType.Group };
		result["itemDatas"] = [];
		result["itemStatistics"] = {};
		result["removeStatus"] = { "tsRemove": 0, "reason": "" };
		result["segments"] = [];
		result["customDatas"] = {};
		result["tsCreate"] = currentMilliseconds;
		result["displayName"] = request.displayName;
		result["displayNameNormalize"] = DisplayNameUtility.normalizeString(request.displayName);
		result["avatar"] = { "type": 0, "value": "0" };
		result["tags"] = {};

		let inventory = await this.gnServer.getDatabase().createInventoryAsync(result, secretInfo.getGameId());

		group.setGroupInventory(itemId, request.catalogId, request.classId);
		group.saveAsync();

		let gnGroupInventories = new GNArray();

		let gnGroupInventory = new GNHashtable();

		gnGroupInventory.add(ParameterCode.ItemId, inventory.getItemId());
		gnGroupInventory.add(ParameterCode.CatalogId, inventory.getCatalogId());
		gnGroupInventory.add(ParameterCode.ClassId, inventory.getClassId());

		gnGroupInventories.add(gnGroupInventory);

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.GroupInventories, gnGroupInventories);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_CreateGroupItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
