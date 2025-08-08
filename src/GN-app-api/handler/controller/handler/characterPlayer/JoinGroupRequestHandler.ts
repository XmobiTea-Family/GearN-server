import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class JoinGroupOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerJoinGroupOperationRequest extends JoinGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminJoinGroupOperationRequest extends ServerJoinGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class JoinGroupRequestHandler extends CharacterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.JoinGroup;
	}

	public override getCommonOperationRequest() {
		return JoinGroupOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.joinGroup);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerJoinGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.joinGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminJoinGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.joinGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, groupId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_JoinGroup", request, secretInfo, operationRequest);
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

		let groupType = <OwnerType>group.getGroupType();
		if (groupType != OwnerType.CharacterPlayer) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let removeStatus = group.getRemoveStatus();
		if (removeStatus.tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let catalogId = group.getCatalogId();
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let playerGroupCatalogSettingsItem = characterPlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
		if (playerGroupCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerGroups: true,
			owner: true,
		}

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (!characterPlayer.hasPlayerGroup(request.groupId)) {
			if (playerGroupCatalogSettingsItem.forceAcceptMember) {
				characterPlayer.setPlayerGroup(request.groupId, catalogId, <number>GroupStatus.Member, currentMilliseconds);
				characterPlayer.saveAsync();

				group.setMember(request.characterId, <number>GroupStatus.Member);
				group.saveAsync();

				{
					let gnPlayerGroups = new GNArray();

					let gnPlayerGroup = new GNHashtable();
					gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
					gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
					gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.Member);
					gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerGroups.add(gnPlayerGroup);

					let characterPlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

					characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
					characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

					this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerGroupUpdateOperationEvent);
				}

				{
					let gnMembers = new GNArray();

					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.CharacterId, request.characterId);
					gnMember.add(ParameterCode.Status, <number>GroupStatus.Member);

					gnMembers.add(gnMember);

					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}
			}
			else {
				characterPlayer.setPlayerGroup(request.groupId, catalogId, <number>GroupStatus.SentRequestAndWaitingAccept, currentMilliseconds);
				characterPlayer.saveAsync();

				group.setMember(request.characterId, <number>GroupStatus.WaitingAccept);
				group.saveAsync();

				{
					let gnPlayerGroups = new GNArray();

					let gnPlayerGroup = new GNHashtable();
					gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
					gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
					gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.SentRequestAndWaitingAccept);
					gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerGroups.add(gnPlayerGroup);

					let characterPlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

					characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
					characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

					this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerGroupUpdateOperationEvent);
				}

				{
					let gnMembers = new GNArray();

					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.CharacterId, request.characterId);
					gnMember.add(ParameterCode.Status, <number>GroupStatus.WaitingAccept);

					gnMembers.add(gnMember);

					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}
			}
		}
		else {
			let groupItem = characterPlayer.getPlayerGroup(request.groupId);

			if (groupItem.status == <number>GroupStatus.WaitingAccept) {
				characterPlayer.setPlayerGroup(request.groupId, catalogId, <number>GroupStatus.Member, currentMilliseconds);
				characterPlayer.saveAsync();

				group.setMember(request.characterId, <number>GroupStatus.Member);
				group.saveAsync();

				{
					let gnPlayerGroups = new GNArray();

					let gnPlayerGroup = new GNHashtable();
					gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
					gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
					gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.Member);
					gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerGroups.add(gnPlayerGroup);

					let characterPlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

					characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
					characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

					this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerGroupUpdateOperationEvent);
				}

				{
					let gnMembers = new GNArray();

					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.CharacterId, request.characterId);
					gnMember.add(ParameterCode.Status, <number>GroupStatus.Member);

					gnMembers.add(gnMember);

					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_JoinGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
