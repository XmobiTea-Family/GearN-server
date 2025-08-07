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
import { GroupMessageItem } from "./model/GroupMessageItem";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";

class SendGroupMessageOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.SenderId, minLength: 10, maxLength: 11, mustNonNull: true })
	senderId: string;

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	groupId: string;

	@StringDataMember({ code: ParameterCode.Message, minLength: 2, maxLength: 256, mustNonNull: true })
	message: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSendGroupMessageOperationRequest extends SendGroupMessageOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSendGroupMessageOperationRequest extends ServerSendGroupMessageOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SendGroupMessageRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.SendGroupMessage;
	}

	public override getCommonOperationRequest() {
		return SendGroupMessageOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.sendGroupMessage);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			message: request.message,
			senderId: request.senderId,
			userId: authInfo.getUserId(),
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSendGroupMessageOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.sendGroupMessage.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			message: request.message,
			senderId: request.senderId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSendGroupMessageOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.sendGroupMessage.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			message: request.message,
			senderId: request.senderId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, message: string, senderId: string, userId?: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SendGroupMessage", request, secretInfo, operationRequest);
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

		let senderType: number = <number>groupType;

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

		let groupMessageItem: GroupMessageItem = {
			message: request.message,
			senderId: request.senderId,
			senderType: senderType,
			tsCreate: xDatetime.getCurrentMilliseconds()
		};

		this.sendGroupMessage(request.groupId, secretInfo.getGameId(), groupMessageItem);

		{
			let gnGroupMessages = new GNArray();

			let gnGroupMessageItem = new GNHashtable();

			gnGroupMessageItem.add(ParameterCode.Message, groupMessageItem.message);
			gnGroupMessageItem.add(ParameterCode.SenderId, groupMessageItem.senderId);
			gnGroupMessageItem.add(ParameterCode.SenderType, groupMessageItem.senderType);
			gnGroupMessageItem.add(ParameterCode.TsCreate, groupMessageItem.tsCreate);

			gnGroupMessages.add(gnGroupMessageItem);

			operationResponse.setParameter(ParameterCode.GroupMessages, gnGroupMessages);

			let groupMessageUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMessageUpdate, null);

			groupMessageUpdateOperationEvent.setParameter(ParameterCode.GroupMessages, gnGroupMessages);
			groupMessageUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

			if (groupType == OwnerType.CharacterPlayer)
				groupMessageUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.senderId);

			this.gnServer.sendEventToRoom(request.groupId, groupMessageUpdateOperationEvent);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_SendGroupMessage", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
