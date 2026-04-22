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
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class AddMemberOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.MemberId, minLength: 10, maxLength: 11, mustNonNull: true })
	public memberId: string;

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerAddMemberOperationRequest extends AddMemberOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminAddMemberOperationRequest extends ServerAddMemberOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class AddMemberRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.AddMember;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return AddMemberOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.addMember);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			memberId: request.memberId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerAddMemberOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.addMember.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			memberId: request.memberId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminAddMemberOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.addMember.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			memberId: request.memberId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { groupId: string, memberId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_AddMember", request, secretInfo, operationRequest);
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

		if (groupType == OwnerType.GamePlayer) {
			// Stores the resolved group settings instance for the current execution flow.
			let groupSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
			// Stores the player group catalog settings item value used in the current execution flow.
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}

			// Stores the game player find options value used in the current execution flow.
			let gamePlayerFindOptions: GamePlayerFindOptions = {
				playerGroups: true
			}

			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.memberId, secretInfo.getGameId(), gamePlayerFindOptions);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MemberNotFound);
				return operationResponse;
			}

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			if (!group.hasMember(request.memberId)) {
				if (playerGroupCatalogSettingsItem.forceAcceptMember) {
					group.setMember(request.memberId, GroupStatus.Member);
					group.saveAsync();

					gamePlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.Member, currentMilliseconds);
					gamePlayer.saveAsync();

					{
						// Stores the GearN player groups value used in the current execution flow.
						let gnPlayerGroups = new GNArray();

						// Stores the GearN player group value used in the current execution flow.
						let gnPlayerGroup = new GNHashtable();
						gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
						gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
						gnPlayerGroup.add(ParameterCode.Status, GroupStatus.Member);
						gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
						gnPlayerGroups.add(gnPlayerGroup);

						// Stores the group group update operation event value used in the current execution flow.
						let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

						groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

						this.gnServer.sendEventTo(request.memberId, groupGroupUpdateOperationEvent);
					}

					{
						// Stores the GearN members value used in the current execution flow.
						let gnMembers = new GNArray();

						// Stores the GearN member value used in the current execution flow.
						let gnMember = new GNHashtable();

						gnMember.add(ParameterCode.MemberId, request.memberId);
						gnMember.add(ParameterCode.Status, GroupStatus.Member);

						gnMembers.add(gnMember);

						// Stores the group member update operation event value used in the current execution flow.
						let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

						groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
						groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

						this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
					}

					this.gnServer.joinRoom(request.memberId, request.groupId);
				}
				else {
					group.setMember(request.memberId, GroupStatus.SentRequestAndWaitingAccept);
					group.saveAsync();

					gamePlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.WaitingAccept, currentMilliseconds);
					gamePlayer.saveAsync();

					{
						// Stores the GearN player groups value used in the current execution flow.
						let gnPlayerGroups = new GNArray();

						// Stores the GearN player group value used in the current execution flow.
						let gnPlayerGroup = new GNHashtable();
						gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
						gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
						gnPlayerGroup.add(ParameterCode.Status, GroupStatus.WaitingAccept);
						gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
						gnPlayerGroups.add(gnPlayerGroup);

						// Stores the group group update operation event value used in the current execution flow.
						let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

						groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

						this.gnServer.sendEventTo(request.memberId, groupGroupUpdateOperationEvent);
					}

					{
						// Stores the GearN members value used in the current execution flow.
						let gnMembers = new GNArray();

						// Stores the GearN member value used in the current execution flow.
						let gnMember = new GNHashtable();

						gnMember.add(ParameterCode.MemberId, request.memberId);
						gnMember.add(ParameterCode.Status, GroupStatus.SentRequestAndWaitingAccept);

						gnMembers.add(gnMember);

						// Stores the group member update operation event value used in the current execution flow.
						let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

						groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
						groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

						this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
					}
				}
			}
			else {
				// Stores the member item value used in the current execution flow.
				let memberItem = group.getMember(request.memberId);

				if (memberItem.status == GroupStatus.WaitingAccept) {
					group.setMember(request.memberId, GroupStatus.Member);
					group.saveAsync();

					gamePlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.Member, currentMilliseconds);
					gamePlayer.saveAsync();

					{
						// Stores the GearN player groups value used in the current execution flow.
						let gnPlayerGroups = new GNArray();

						// Stores the GearN player group value used in the current execution flow.
						let gnPlayerGroup = new GNHashtable();
						gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
						gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
						gnPlayerGroup.add(ParameterCode.Status, GroupStatus.Member);
						gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
						gnPlayerGroups.add(gnPlayerGroup);

						// Stores the group group update operation event value used in the current execution flow.
						let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

						groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

						this.gnServer.sendEventTo(request.memberId, groupGroupUpdateOperationEvent);
					}

					{
						// Stores the GearN members value used in the current execution flow.
						let gnMembers = new GNArray();

						// Stores the GearN member value used in the current execution flow.
						let gnMember = new GNHashtable();

						gnMember.add(ParameterCode.MemberId, request.memberId);
						gnMember.add(ParameterCode.Status, GroupStatus.Member);

						gnMembers.add(gnMember);

						// Stores the group member update operation event value used in the current execution flow.
						let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

						groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
						groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

						this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
					}

					this.gnServer.joinRoom(request.memberId, request.groupId);
				}
			}
		}
		else {
			// Stores the resolved group settings instance for the current execution flow.
			let groupSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
			// Stores the player group catalog settings item value used in the current execution flow.
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}

			// Stores the character player find options value used in the current execution flow.
			let characterPlayerFindOptions: CharacterPlayerFindOptions = {
				playerGroups: true,
				owner: true,
			}

			// Stores the character player value used in the current execution flow.
			let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.memberId, secretInfo.getGameId(), characterPlayerFindOptions);

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MemberNotFound);
				return operationResponse;
			}

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			if (!group.hasMember(request.memberId)) {
				if (playerGroupCatalogSettingsItem.forceAcceptMember) {
					group.setMember(request.memberId, GroupStatus.Member);
					group.saveAsync();

					characterPlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.Member, currentMilliseconds);
					characterPlayer.saveAsync();

					{
						// Stores the GearN player groups value used in the current execution flow.
						let gnPlayerGroups = new GNArray();

						// Stores the GearN player group value used in the current execution flow.
						let gnPlayerGroup = new GNHashtable();
						gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
						gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
						gnPlayerGroup.add(ParameterCode.Status, GroupStatus.Member);
						gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
						gnPlayerGroups.add(gnPlayerGroup);

						// Stores the group group update operation event value used in the current execution flow.
						let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

						groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
						groupGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.memberId);

						this.gnServer.sendEventTo(characterPlayer.getOwner().id, groupGroupUpdateOperationEvent);
					}

					{
						// Stores the GearN members value used in the current execution flow.
						let gnMembers = new GNArray();

						// Stores the GearN member value used in the current execution flow.
						let gnMember = new GNHashtable();

						gnMember.add(ParameterCode.MemberId, request.memberId);
						gnMember.add(ParameterCode.Status, GroupStatus.Member);

						gnMembers.add(gnMember);

						// Stores the group member update operation event value used in the current execution flow.
						let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

						groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
						groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

						this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
					}

					this.gnServer.joinRoom(characterPlayer.getOwner().id, request.groupId);
				}
				else {
					group.setMember(request.memberId, GroupStatus.SentRequestAndWaitingAccept);
					group.saveAsync();

					characterPlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.WaitingAccept, currentMilliseconds);
					characterPlayer.saveAsync();

					{
						// Stores the GearN player groups value used in the current execution flow.
						let gnPlayerGroups = new GNArray();

						// Stores the GearN player group value used in the current execution flow.
						let gnPlayerGroup = new GNHashtable();
						gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
						gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
						gnPlayerGroup.add(ParameterCode.Status, GroupStatus.WaitingAccept);
						gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
						gnPlayerGroups.add(gnPlayerGroup);

						// Stores the group group update operation event value used in the current execution flow.
						let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

						groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
						groupGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.memberId);

						this.gnServer.sendEventTo(characterPlayer.getOwner().id, groupGroupUpdateOperationEvent);
					}

					{
						// Stores the GearN members value used in the current execution flow.
						let gnMembers = new GNArray();

						// Stores the GearN member value used in the current execution flow.
						let gnMember = new GNHashtable();

						gnMember.add(ParameterCode.MemberId, request.memberId);
						gnMember.add(ParameterCode.Status, GroupStatus.SentRequestAndWaitingAccept);

						gnMembers.add(gnMember);

						// Stores the group member update operation event value used in the current execution flow.
						let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

						groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
						groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

						this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
					}

					this.gnServer.joinRoom(characterPlayer.getOwner().id, request.groupId);
				}
			}
			else {
				// Stores the member item value used in the current execution flow.
				let memberItem = group.getMember(request.memberId);

				if (memberItem.status == GroupStatus.WaitingAccept) {
					group.setMember(request.memberId, GroupStatus.Member);
					group.saveAsync();

					characterPlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.Member, currentMilliseconds);
					characterPlayer.saveAsync();

					{
						// Stores the GearN player groups value used in the current execution flow.
						let gnPlayerGroups = new GNArray();

						// Stores the GearN player group value used in the current execution flow.
						let gnPlayerGroup = new GNHashtable();
						gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
						gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
						gnPlayerGroup.add(ParameterCode.Status, GroupStatus.Member);
						gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
						gnPlayerGroups.add(gnPlayerGroup);

						// Stores the group group update operation event value used in the current execution flow.
						let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

						groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
						groupGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.memberId);

						this.gnServer.sendEventTo(characterPlayer.getOwner().id, groupGroupUpdateOperationEvent);
					}

					{
						// Stores the GearN members value used in the current execution flow.
						let gnMembers = new GNArray();

						// Stores the GearN member value used in the current execution flow.
						let gnMember = new GNHashtable();

						gnMember.add(ParameterCode.MemberId, request.memberId);
						gnMember.add(ParameterCode.Status, GroupStatus.Member);

						gnMembers.add(gnMember);

						// Stores the group member update operation event value used in the current execution flow.
						let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

						groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
						groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

						this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
					}
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_AddMember", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
