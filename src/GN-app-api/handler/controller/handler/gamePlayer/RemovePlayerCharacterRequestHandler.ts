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
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";

class RemovePlayerCharacterOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the character ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerRemovePlayerCharacterOperationRequest extends RemovePlayerCharacterOperationRequest {

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

class AdminRemovePlayerCharacterOperationRequest extends ServerRemovePlayerCharacterOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemovePlayerCharacterRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.RemovePlayerCharacter;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return RemovePlayerCharacterOperationRequest;
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
			if (!secretInfo.getPermission().gamePlayer.removePlayerCharacter.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.removePlayerCharacter.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.removePlayerCharacter.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			characterId: request.characterId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemovePlayerCharacterOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.removePlayerCharacter.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			characterId: request.characterId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemovePlayerCharacterOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.removePlayerCharacter.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			characterId: request.characterId,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, characterId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_RemovePlayerCharacter", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerCharacters: true,
			playerBan: true,
		}

		// Stores the game player value used in the current execution flow.
		let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}
		if (role == SecretRole.Client) {
			// Stores the player ban value used in the current execution flow.
			let playerBan = gamePlayer.getPlayerBan();

			if (playerBan.tsExpire != 0) {
				let currentMilliseconds = xDatetime.getCurrentMilliseconds();
				if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
					operationResponse.setDebugMessage("GamePlayer is banned, reason " + playerBan.reason);

					return operationResponse;
				}
			}
		}

		if (!gamePlayer.hasPlayerCharacter(request.characterId)) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		// Stores the character player find options value used in the current execution flow.
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			removeStatus: true,
			owner: true,
			playerGroups: true,
			playerInventories: true,
		}

		// Stores the character player value used in the current execution flow.
		let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		const session = this.gnServer.getDatabase().startSession();

		try {
			session.startTransaction();

			if (characterPlayer != null) {
				// Stores the current milliseconds value used in the current execution flow.
				let currentMilliseconds = xDatetime.getCurrentMilliseconds();

				// Stores the remove status value used in the current execution flow.
				let removeStatus = characterPlayer.getRemoveStatus();
				if (removeStatus.tsRemove == 0) {
					if (characterPlayer.getOwner().id == request.userId) {
						characterPlayer.setRemoveStatus(currentMilliseconds, "GamePlayer owned remove by RemovePlayerCharacter");

						// Stores the owner value used in the current execution flow.
						let owner = characterPlayer.getOwner();

						let groupFindOptions: GroupFindOptions = {
							groupId: true,
							members: true,
						}
						let groups = await Promise.all(characterPlayer.getAllPlayerGroups().map((group) => this.gnServer.getDatabase().groupRepository.loadGroupAsync(group.groupId, secretInfo.getGameId(), groupFindOptions)));

						let inventoryFindOptions: InventoryFindOptions = {
							owner: true,
						}
						let inventories = await Promise.all(characterPlayer.getAllPlayerInventories().map((inventory) => this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(inventory.itemId, secretInfo.getGameId(), inventoryFindOptions)));

						for (const group of groups) {
							if (group != null) {
								if (group.hasMember(request.characterId)) {
									group.removeMember(request.characterId);

									await group.saveAsync(session);

									if (gamePlayer != null) {
										let hasCharacter = false;

										for (let characterItem of gamePlayer.getAllPlayerCharacters()) {
											if (group.hasMember(characterItem.characterId) && group.getMember(characterItem.characterId).status == GroupStatus.Member) {
												hasCharacter = true;
												break;
											}
										}

										if (!hasCharacter) {
											this.gnServer.leaveRoom(owner.id, group.getGroupId());
										}
									}
								}
							}
						}

						for (const inventory of inventories) {
							if (inventory != null) {
								if (inventory.getOwner().id == request.characterId) {
									inventory.setRemoveStatus(currentMilliseconds, "GamePlayer owned remove by RemovePlayerCharacter, but the CharacterPlayer owned this item.");

									await inventory.saveAsync(session);
								}
							}
						}

						await characterPlayer.saveAsync(session);
					}
				}
			}

			gamePlayer.removePlayerCharacter(request.characterId);
			await gamePlayer.saveAsync(session);

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



		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_RemovePlayerCharacter", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
