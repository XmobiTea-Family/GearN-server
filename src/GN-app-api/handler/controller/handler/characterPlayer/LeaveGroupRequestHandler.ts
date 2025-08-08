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

class LeaveGroupOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLeaveGroupOperationRequest extends LeaveGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLeaveGroupOperationRequest extends ServerLeaveGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LeaveGroupRequestHandler extends CharacterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.LeaveGroup;
	}

	public override getCommonOperationRequest() {
		return LeaveGroupOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.leaveGroup);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLeaveGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.leaveGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLeaveGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.leaveGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, groupId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_LeaveGroup", request, secretInfo, operationRequest);
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

				let characterPlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerGroupUpdate, null);

				characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);
				characterPlayerGroupUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

				this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerGroupUpdateOperationEvent);
			}
		}

		if (group.hasMember(request.characterId)) {
			group.removeMember(request.characterId);
			group.saveAsync();

			{
				let gnMembers = new GNArray();

				let gnMember = new GNHashtable();

				gnMember.add(ParameterCode.CharacterId, request.characterId);
				gnMember.add(ParameterCode.Status, <number>GroupStatus.NotMember);

				gnMembers.add(gnMember);

				let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

				groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);

				this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_LeaveGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
