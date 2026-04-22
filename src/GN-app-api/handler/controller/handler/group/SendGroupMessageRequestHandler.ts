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

	// Stores the sender ID value used by this instance.
	@StringDataMember({ code: ParameterCode.SenderId, minLength: 10, maxLength: 11, mustNonNull: true })
	public senderId: string;

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	// Stores the message value used by this instance.
	@StringDataMember({ code: ParameterCode.Message, minLength: 2, maxLength: 256, mustNonNull: true })
	public message: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSendGroupMessageOperationRequest extends SendGroupMessageOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSendGroupMessageOperationRequest extends ServerSendGroupMessageOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SendGroupMessageRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SendGroupMessage;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SendGroupMessageOperationRequest;
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { groupId: string, message: string, senderId: string, userId?: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SendGroupMessage", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			members: true,
			groupType: true,
			catalogId: true,
			removeStatus: true,
		}

		// Stores the group value used in the current execution flow.
		let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);
		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the remove status value used in the current execution flow.
		let removeStatus = group.getRemoveStatus();
		if (removeStatus.tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the group type value used in the current execution flow.
		let groupType = <OwnerType>group.getGroupType();
		// Stores the catalog ID value used in the current execution flow.
		let catalogId = group.getCatalogId();

		// Stores the sender type value used in the current execution flow.
		let senderType: number = groupType;

		if (groupType == OwnerType.GamePlayer) {
			if (request.userId) {
				if (request.userId != request.senderId) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerNotMember);
					operationResponse.setDebugMessage("GamePlayer use other senderId");

					return operationResponse;
				}
			}

			// Stores the resolved group settings instance for the current execution flow.
			let groupSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
			// Stores the player group catalog settings item value used in the current execution flow.
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}
		}
		else if (groupType == OwnerType.CharacterPlayer) {
			if (request.userId) {
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), {
					playerCharacters: true,
				});

				if (!gamePlayer.hasPlayerCharacter(request.senderId)) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerNotMember);
					operationResponse.setDebugMessage("GamePlayer not owned of the CharacterPlayer with senderId");
				
					return operationResponse;
				}
			}

			// Stores the resolved group settings instance for the current execution flow.
			let groupSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
			// Stores the player group catalog settings item value used in the current execution flow.
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}
		}

		// Stores the role value used in the current execution flow.
		let role = <SecretRole>secretInfo.getRole();
		if (role == SecretRole.Player) {
			if (!(await this.isMember(group, request.userId, secretInfo.getGameId()))) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerNotMember);
				return operationResponse;
			}
		}

		// Stores the group message item value used in the current execution flow.
		let groupMessageItem: GroupMessageItem = {
			message: request.message,
			senderId: request.senderId,
			senderType: senderType,
			tsCreate: xDatetime.getCurrentMilliseconds()
		};

		this.sendGroupMessage(request.groupId, secretInfo.getGameId(), groupMessageItem);

		{
			// Stores the GearN group messages value used in the current execution flow.
			let gnGroupMessages = new GNArray();

			// Stores the GearN group message item value used in the current execution flow.
			let gnGroupMessageItem = new GNHashtable();

			gnGroupMessageItem.add(ParameterCode.Message, groupMessageItem.message);
			gnGroupMessageItem.add(ParameterCode.SenderId, groupMessageItem.senderId);
			gnGroupMessageItem.add(ParameterCode.SenderType, groupMessageItem.senderType);
			gnGroupMessageItem.add(ParameterCode.TsCreate, groupMessageItem.tsCreate);

			gnGroupMessages.add(gnGroupMessageItem);

			operationResponse.setParameter(ParameterCode.GroupMessages, gnGroupMessages);

			// Stores the group message update operation event value used in the current execution flow.
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
