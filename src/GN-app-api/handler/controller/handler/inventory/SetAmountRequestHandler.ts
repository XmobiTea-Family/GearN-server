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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";

class SetAmountOperationRequest extends OperationRequest {

	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	// Stores the amount value used by this instance.
	@NumberDataMember({ code: ParameterCode.Amount, mustInt: true })
	public amount: number;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetAmountOperationRequest extends SetAmountOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetAmountOperationRequest extends ServerSetAmountOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetAmountRequestHandler extends ItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetAmount;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetAmountOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setAmount);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			amount: request.amount,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetAmountOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setAmount.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			amount: request.amount,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetAmountOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setAmount.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			amount: request.amount,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { itemId: string, amount: number }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetAmount", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions: InventoryFindOptions = {
			amount: true,
			itemType: true,
			owner: true,
			removeStatus: true,
		}

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}


		
		// Stores the item type value used in the current execution flow.
		let itemType = <ItemType>inventory.getItemType();
		if (itemType == ItemType.NonStackable) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotStackable);
			return operationResponse;
		}

		inventory.setAmount(inventory.getAmount() + request.amount);

		if (inventory.getAmount() <= 0) {
			// Stores the remove status value used in the current execution flow.
			let removeStatus = inventory.getRemoveStatus();
			if (removeStatus.tsRemove == 0) {
				inventory.setRemoveStatus(xDatetime.getCurrentMilliseconds(), "");

				// Stores the owner value used in the current execution flow.
				let owner = inventory.getOwner();
				// Stores the owner type value used in the current execution flow.
				let ownerType = <OwnerType>owner.type;
				if (ownerType == OwnerType.Group) {
					// Stores the group value used in the current execution flow.
					let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(owner.id, secretInfo.getGameId(), { groupInventories: true });
					if (group != null) {
						if (group.hasGroupInventory(request.itemId)) {
							group.removeGroupInventory(request.itemId);

							group.saveAsync();
						}
					}
				}
				else if (ownerType == OwnerType.GamePlayer) {
					// Stores the game player value used in the current execution flow.
					let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(owner.id, secretInfo.getGameId(), { playerInventories: true });
					if (gamePlayer != null) {
						if (gamePlayer.hasPlayerInventory(request.itemId)) {
							gamePlayer.removePlayerInventory(request.itemId);

							gamePlayer.saveAsync();
						}
					}
				}
				else if (ownerType == OwnerType.CharacterPlayer) {
					// Stores the character player value used in the current execution flow.
					let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(owner.id, secretInfo.getGameId(), { playerInventories: true });
					if (characterPlayer != null) {
						if (characterPlayer.hasPlayerInventory(request.itemId)) {
							characterPlayer.removePlayerInventory(request.itemId);

							characterPlayer.saveAsync();
						}
					}
				}
			}
		}

		inventory.saveAsync();

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.Amount, inventory.getAmount());

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetAmount", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
