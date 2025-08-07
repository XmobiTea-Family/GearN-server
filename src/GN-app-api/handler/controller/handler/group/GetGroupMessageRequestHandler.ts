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
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GetGroupMessageOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	groupId: string;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetGroupMessageOperationRequest extends GetGroupMessageOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetGroupMessageOperationRequest extends ServerGetGroupMessageOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetGroupMessageRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetGroupMessage;
	}

	public override getCommonOperationRequest() {
		return GetGroupMessageOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.getGroupMessage);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			skip: request.skip,
			limit: request.limit,
			userId: authInfo.getUserId(),
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetGroupMessageOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getGroupMessage.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetGroupMessageOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getGroupMessage.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, skip: number, limit: number, userId?: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetGroupMessage", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions: GroupFindOptions = {
			members: true,
			groupType: true,
			catalogId: true,
			removeStatus: true,
		}

		let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);
		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let removeStatus = group.getRemoveStatus();
		if (removeStatus.tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let groupType = <OwnerType>group.getGroupType();
		let catalogId = group.getCatalogId();

		if (groupType == OwnerType.GamePlayer) {
			let groupSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}
		}
		else if (groupType == OwnerType.CharacterPlayer) {
			let groupSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}
		}

		let role = <SecretRole>secretInfo.getRole();
		if (role == SecretRole.Player) {
			if (!this.isMember(group, request.userId, secretInfo.getGameId())) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerNotMember);
				return operationResponse;
			}
		}

		let groupMessageItems = await this.getGroupMessages(request.groupId, secretInfo.getGameId(), request.skip, request.limit);

		let gnGroupMessages = new GNArray();

		for (let i = 0; i < groupMessageItems.length; i++) {
			let groupMessageItem = groupMessageItems[i];

			let gnGroupMessageItem = new GNHashtable();

			gnGroupMessageItem.add(ParameterCode.Message, groupMessageItem.message);
			gnGroupMessageItem.add(ParameterCode.SenderId, groupMessageItem.senderId);
			gnGroupMessageItem.add(ParameterCode.SenderType, groupMessageItem.senderType);
			gnGroupMessageItem.add(ParameterCode.TsCreate, groupMessageItem.tsCreate);

			gnGroupMessages.add(gnGroupMessageItem);
		}

		operationResponse.setParameter(ParameterCode.GroupMessages, gnGroupMessages);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_GetGroupMessage", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
