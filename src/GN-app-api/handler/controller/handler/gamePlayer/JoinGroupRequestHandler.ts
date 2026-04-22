import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class JoinGroupOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

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

class ServerJoinGroupOperationRequest extends JoinGroupOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminJoinGroupOperationRequest extends ServerJoinGroupOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class JoinGroupRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.JoinGroup;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return JoinGroupOperationRequest;
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

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.joinGroup.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.joinGroup.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.joinGroup.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			groupId: request.groupId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerJoinGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.joinGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			groupId: request.groupId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminJoinGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.joinGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			groupId: request.groupId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, groupId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_JoinGroup", request, secretInfo, operationRequest);
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

		// Stores the group type value used in the current execution flow.
		let groupType = <OwnerType>group.getGroupType();
		if (groupType != OwnerType.GamePlayer) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the remove status value used in the current execution flow.
		let removeStatus = group.getRemoveStatus();
		if (removeStatus.tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the catalog ID value used in the current execution flow.
		let catalogId = group.getCatalogId();
		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		// Stores the player group catalog settings item value used in the current execution flow.
		let playerGroupCatalogSettingsItem = gamePlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == catalogId);
		if (playerGroupCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerGroups: true
		}

		// Stores the game player value used in the current execution flow.
		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (!gamePlayer.hasPlayerGroup(request.groupId)) {
			if (playerGroupCatalogSettingsItem.forceAcceptMember) {
				gamePlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.Member, currentMilliseconds);
				gamePlayer.saveAsync();

				group.setMember(request.userId, GroupStatus.Member);
				group.saveAsync();

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

					// Stores the game player group update operation event value used in the current execution flow.
					let gamePlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

					gamePlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

					this.gnServer.sendEventTo(request.userId, gamePlayerGroupUpdateOperationEvent);
				}

				{
					// Stores the GearN members value used in the current execution flow.
					let gnMembers = new GNArray();

					// Stores the GearN member value used in the current execution flow.
					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.MemberId, request.userId);
					gnMember.add(ParameterCode.Status, GroupStatus.Member);

					gnMembers.add(gnMember);

					// Stores the group member update operation event value used in the current execution flow.
					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
					groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}

				this.gnServer.joinRoom(request.userId, request.groupId);
			}
			else {
				gamePlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.SentRequestAndWaitingAccept, currentMilliseconds);
				gamePlayer.saveAsync();

				group.setMember(request.userId, GroupStatus.WaitingAccept);
				group.saveAsync();

				{
					// Stores the GearN player groups value used in the current execution flow.
					let gnPlayerGroups = new GNArray();

					// Stores the GearN player group value used in the current execution flow.
					let gnPlayerGroup = new GNHashtable();
					gnPlayerGroup.add(ParameterCode.GroupId, request.groupId);
					gnPlayerGroup.add(ParameterCode.CatalogId, catalogId);
					gnPlayerGroup.add(ParameterCode.Status, GroupStatus.SentRequestAndWaitingAccept);
					gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerGroups.add(gnPlayerGroup);

					// Stores the game player group update operation event value used in the current execution flow.
					let gamePlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

					gamePlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

					this.gnServer.sendEventTo(request.userId, gamePlayerGroupUpdateOperationEvent);
				}

				{
					// Stores the GearN members value used in the current execution flow.
					let gnMembers = new GNArray();

					// Stores the GearN member value used in the current execution flow.
					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.MemberId, request.userId);
					gnMember.add(ParameterCode.Status, GroupStatus.WaitingAccept);

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
			// Stores the group item value used in the current execution flow.
			let groupItem = gamePlayer.getPlayerGroup(request.groupId);

			if (groupItem.status == GroupStatus.WaitingAccept) {
				gamePlayer.setPlayerGroup(request.groupId, catalogId, GroupStatus.Member, currentMilliseconds);
				gamePlayer.saveAsync();

				group.setMember(request.userId, GroupStatus.Member);
				group.saveAsync();

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

					// Stores the game player group update operation event value used in the current execution flow.
					let gamePlayerGroupUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerGroupUpdate, null);

					gamePlayerGroupUpdateOperationEvent.setParameter(ParameterCode.PlayerGroups, gnPlayerGroups);

					this.gnServer.sendEventTo(request.userId, gamePlayerGroupUpdateOperationEvent);
				}

				{
					// Stores the GearN members value used in the current execution flow.
					let gnMembers = new GNArray();

					// Stores the GearN member value used in the current execution flow.
					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.MemberId, request.userId);
					gnMember.add(ParameterCode.Status, GroupStatus.Member);

					gnMembers.add(gnMember);

					// Stores the group member update operation event value used in the current execution flow.
					let groupMemberUpdateOperationEvent = new OperationEvent(EventCode.OnGroupMemberUpdate, null);

					groupMemberUpdateOperationEvent.setParameter(ParameterCode.Members, gnMembers);
					groupMemberUpdateOperationEvent.setParameter(ParameterCode.GroupId, request.groupId);

					this.gnServer.sendEventToRoom(request.groupId, groupMemberUpdateOperationEvent);
				}

				this.gnServer.joinRoom(request.userId, request.groupId);
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_JoinGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
