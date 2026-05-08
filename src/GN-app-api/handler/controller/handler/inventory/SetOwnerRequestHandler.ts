import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";

class SetOwnerOperationRequest extends OperationRequest {

	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	// Stores the new owner ID value used by this instance.
	@StringDataMember({ code: ParameterCode.NewOwnerId, minLength: 10, maxLength: 12, mustNonNull: true })
	public newOwnerId: string;

	// Stores the new owner type value used by this instance.
	@NumberDataMember({ code: ParameterCode.NewOwnerType, mustInt: true })
	public newOwnerType: number;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetOwnerOperationRequest extends SetOwnerOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetOwnerOperationRequest extends ServerSetOwnerOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetOwnerRequestHandler extends ItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetOwner;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetOwnerOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setOwner);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			newOwnerId: request.newOwnerId,
			newOwnerType: request.newOwnerType,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetOwnerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setOwner.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			newOwnerId: request.newOwnerId,
			newOwnerType: request.newOwnerType,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetOwnerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setOwner.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			newOwnerId: request.newOwnerId,
			newOwnerType: request.newOwnerType,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { itemId: string, newOwnerId: string, newOwnerType: number }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetOwner", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions: InventoryFindOptions = {
			owner: true,
			catalogId: true,
			classId: true,
			removeStatus: true,
		}

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		if (role == SecretRole.Client) {
			// Stores the remove status value used in the current execution flow.
			let removeStatus = inventory.getRemoveStatus();
			if (removeStatus.tsRemove != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				operationResponse.setDebugMessage("Item is removed, reason " + removeStatus.reason);

				return operationResponse;
			}
		}

		const session = this.gnServer.getDatabase().startSession();



		// Stores the owner value used in the current execution flow.
		let owner = inventory.getOwner();
		if (owner.id != request.newOwnerId) {
			try {
				session.startTransaction();

				if (request.newOwnerType == OwnerType.Group) {
					// Stores the group find options value used in the current execution flow.
					let groupFindOptions: GroupFindOptions = {
						groupInventories: true,
					}

					// Stores the new item owner player value used in the current execution flow.
					let newOwnerGroup = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.newOwnerId, secretInfo.getGameId(), groupFindOptions);
					if (newOwnerGroup == null) {
						operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
						return operationResponse;
					}

					newOwnerGroup.setGroupInventory(request.itemId, inventory.getCatalogId(), inventory.getClassId());
					await newOwnerGroup.saveAsync(session);
				}
				else if (request.newOwnerType == OwnerType.GamePlayer) {
					// Stores the game player find options value used in the current execution flow.
					let gamePlayerFindOptions: GamePlayerFindOptions = {
						playerInventories: true,
					}

					// Stores the new item owner player value used in the current execution flow.
					let newOwnerGamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.newOwnerId, secretInfo.getGameId(), gamePlayerFindOptions);
					if (newOwnerGamePlayer == null) {
						operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
						return operationResponse;
					}

					newOwnerGamePlayer.setPlayerInventory(request.itemId, inventory.getCatalogId(), inventory.getClassId());
					await newOwnerGamePlayer.saveAsync(session);
				}
				else if (request.newOwnerType == OwnerType.CharacterPlayer) {
					// Stores the character player find options value used in the current execution flow.
					let characterPlayerFindOptions: CharacterPlayerFindOptions = {
						playerInventories: true,
					}

					// Stores the new item owner player value used in the current execution flow.
					let newOwnerCharacterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.newOwnerId, secretInfo.getGameId(), characterPlayerFindOptions);
					if (newOwnerCharacterPlayer == null) {
						operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
						return operationResponse;
					}

					newOwnerCharacterPlayer.setPlayerInventory(request.itemId, inventory.getCatalogId(), inventory.getClassId());
					await newOwnerCharacterPlayer.saveAsync(session);
				}
				else {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerTypeNotSupport);
					return operationResponse;
				}

				if (owner.type == OwnerType.Group) {
					// Stores the group find options value used in the current execution flow.
					let groupFindOptions: GroupFindOptions = {
						groupInventories: true,
					}

					// Stores the current item owner player value used in the current execution flow.
					let currentOwnerGroup = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(owner.id, secretInfo.getGameId(), groupFindOptions);
					if (currentOwnerGroup != null) {
						if (currentOwnerGroup.hasGroupInventory(request.itemId)) {
							currentOwnerGroup.removeGroupInventory(request.itemId);
							await currentOwnerGroup.saveAsync(session);
						}
					}
				}
				else if (owner.type == OwnerType.GamePlayer) {
					// Stores the game player find options value used in the current execution flow.
					let gamePlayerFindOptions: GamePlayerFindOptions = {
						playerInventories: true,
					}

					// Stores the current item owner player value used in the current execution flow.
					let currentOwnerGamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(owner.id, secretInfo.getGameId(), gamePlayerFindOptions);
					if (currentOwnerGamePlayer != null) {
						if (currentOwnerGamePlayer.hasPlayerInventory(request.itemId)) {
							currentOwnerGamePlayer.removePlayerInventory(request.itemId);
							await currentOwnerGamePlayer.saveAsync(session);
						}
					}
				}
				else if (owner.type == OwnerType.CharacterPlayer) {
					// Stores the character player find options value used in the current execution flow.
					let characterPlayerFindOptions: CharacterPlayerFindOptions = {
						playerInventories: true,
					}

					// Stores the current item owner player value used in the current execution flow.
					let currentOwnerCharacterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(owner.id, secretInfo.getGameId(), characterPlayerFindOptions);
					if (currentOwnerCharacterPlayer != null) {
						if (currentOwnerCharacterPlayer.hasPlayerInventory(request.itemId)) {
							currentOwnerCharacterPlayer.removePlayerInventory(request.itemId);
							await currentOwnerCharacterPlayer.saveAsync(session);
						}
					}
				}

				inventory.setOwner(request.newOwnerId, request.newOwnerType);
				await inventory.saveAsync(session);

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

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetOwner", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
