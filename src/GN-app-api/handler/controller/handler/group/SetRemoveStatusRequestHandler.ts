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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";

class SetRemoveStatusOperationRequest extends OperationRequest {

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	// Stores the reason value used by this instance.
	@StringDataMember({ code: ParameterCode.Reason, isOptional: true, defaultValue: "" })
	public reason?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetRemoveStatusOperationRequest extends SetRemoveStatusOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetRemoveStatusOperationRequest extends ServerSetRemoveStatusOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetRemoveStatusRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetRemoveStatus;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetRemoveStatusOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setRemoveStatus);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			reason: request.reason,
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetRemoveStatusOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setRemoveStatus.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			reason: request.reason,
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetRemoveStatusOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setRemoveStatus.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			reason: request.reason,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { groupId: string, reason: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetRemoveStatus", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			removeStatus: true,
			members: true,
			groupType: true,
			groupInventories: true,
		}

		// Stores the group value used in the current execution flow.
		let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (role == SecretRole.Client) {
			// Stores the remove status value used in the current execution flow.
			let removeStatus = group.getRemoveStatus();
			if (removeStatus.tsRemove != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
				operationResponse.setDebugMessage("Group is removed, reason " + removeStatus.reason);

				return operationResponse;
			}
		}

		const members = group.getGroupType() == OwnerType.GamePlayer
			? await Promise.all(group.getAllMembers().map((member) => this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(member.memberId, secretInfo.getGameId(), { userId: true, playerGroups: true })))
			: await Promise.all(group.getAllMembers().map((member) => this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(member.memberId, secretInfo.getGameId(), { owner: true, playerGroups: true })));

		let inventoryFindOptions: InventoryFindOptions = {
			owner: true,
		}
		let inventories = await Promise.all(group.getAllGroupInventories().map((inventory) => this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(inventory.itemId, secretInfo.getGameId(), inventoryFindOptions)));

		// Stores the remove status value used in the current execution flow.
		let removeStatus = group.getRemoveStatus();
		if (removeStatus.tsRemove == 0) {
			const session = this.gnServer.getDatabase().startSession();

			try {
				session.startTransaction();

				group.setRemoveStatus(currentMilliseconds, request.reason);

				// Stores the group type value used in the current execution flow.
				let groupType = group.getGroupType();

				if (groupType == OwnerType.GamePlayer) {
					for (let i = 0; i < members.length; i++) {
						let gamePlayer = members[i] as GamePlayer;

						if (gamePlayer != null) {
							if (gamePlayer.hasPlayerGroup(request.groupId)) {
								gamePlayer.removePlayerGroup(request.groupId);
								await gamePlayer.saveAsync(session);

								this.gnServer.leaveRoom(gamePlayer.getUserId(), request.groupId);
							}
						}
					}
				}
				else if (groupType == OwnerType.CharacterPlayer) {
					for (let i = 0; i < members.length; i++) {
						let characterPlayer = members[i] as CharacterPlayer;
						if (characterPlayer != null) {
							if (characterPlayer.hasPlayerGroup(request.groupId)) {
								characterPlayer.removePlayerGroup(request.groupId);
								await characterPlayer.saveAsync(session);

								this.gnServer.leaveRoom(characterPlayer.getOwner().id, request.groupId);
							}
						}
					}
				}

				for (const inventory of inventories) {
					if (inventory != null) {
						if (inventory.getOwner().id == request.groupId) {
							inventory.setRemoveStatus(currentMilliseconds, "Group owned remove by SetRemoveStatus, reason " + request.reason);

							await inventory.saveAsync(session);
						}
					}
				}

				await group.saveAsync(session);

				await session.commitTransaction();
			}
			catch (err) {
				await session.abortTransaction();

				Debug.logError(err);

				throw err;
			}
			finally {
				await session.endSession();
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_SetRemoveStatus", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
