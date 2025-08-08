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

class RemoveMemberOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 11, mustNonNull: true })
	public userId: string;

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerRemoveMemberOperationRequest extends RemoveMemberOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminRemoveMemberOperationRequest extends ServerRemoveMemberOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemoveMemberRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.RemoveMember;
	}

	public override getCommonOperationRequest() {
		return RemoveMemberOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.removeMember);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemoveMemberOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.removeMember.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemoveMemberOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.removeMember.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, userId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_RemoveMember", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions: GroupFindOptions = {
			members: true,
			groupType: true,
			catalogId: true,
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

			let gamePlayerFindOptions: GamePlayerFindOptions = {
				playerGroups: true
			}

			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MemberNotFound);
				return operationResponse;
			}

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			if (group.hasMember(request.userId)) {
				group.removeMember(request.userId);
				group.saveAsync();

				{
					let gnMembers = new GNArray();

					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.UserId, request.userId);
					gnMember.add(ParameterCode.Status, <number>GroupStatus.NotMember);

					gnMembers.add(gnMember);

					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

					this.gnServer.leaveRoom(request.userId, request.groupId);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}
			}

			if (gamePlayer.hasPlayerGroup(request.groupId)) {
				gamePlayer.removePlayerGroup(request.groupId);
				gamePlayer.saveAsync();

				{
					let gnPlayerGroups = new GNArray();

					let gnPlayerGroup = new GNHashtable();
					gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
					gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
					gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.NotMember);
					gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerGroups.add(gnPlayerGroup);

					let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

					groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

					this.gnServer.sendEventTo(request.userId, groupGroupUpdateOperationEvent);
				}
			}
		}
		else {
			let groupSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
			let playerGroupCatalogSettingsItem = groupSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
			if (playerGroupCatalogSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				return operationResponse;
			}

			let characterPlayerFindOptions: CharacterPlayerFindOptions = {
				playerGroups: true,
				owner: true,
			}

			let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.userId, secretInfo.getGameId(), characterPlayerFindOptions);

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MemberNotFound);
				return operationResponse;
			}

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			if (group.hasMember(request.userId)) {
				group.removeMember(request.userId);
				group.saveAsync();

				{
					let gnMembers = new GNArray();

					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.UserId, request.userId);
					gnMember.add(ParameterCode.Status, <number>GroupStatus.NotMember);

					gnMembers.add(gnMember);

					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}
			}

			if (characterPlayer.hasPlayerGroup(request.groupId)) {
				characterPlayer.removePlayerGroup(request.groupId);
				characterPlayer.saveAsync();

				{
					let gnPlayerGroups = new GNArray();

					let gnPlayerGroup = new GNHashtable();
					gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
					gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
					gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.NotMember);
					gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerGroups.add(gnPlayerGroup);

					let groupGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

					groupGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
					groupGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.userId);

					this.gnServer.sendEventTo(characterPlayer.getOwner().id, groupGroupUpdateOperationEvent);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_RemoveMember", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
