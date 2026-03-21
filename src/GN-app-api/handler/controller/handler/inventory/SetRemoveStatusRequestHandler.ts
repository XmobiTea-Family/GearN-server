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
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class SetRemoveStatusOperationRequest extends OperationRequest {

	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

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

export class SetRemoveStatusRequestHandler extends ItemBaseRequestHandler {

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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setRemoveStatus);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			reason: request.reason,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetRemoveStatusOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setRemoveStatus.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			reason: request.reason,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetRemoveStatusOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setRemoveStatus.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			reason: request.reason,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { itemId: string, reason: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetRemoveStatus", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions: InventoryFindOptions = {
			removeStatus: true,
			owner: true,
		}

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		// Stores the remove status value used in the current execution flow.
		let removeStatus = inventory.getRemoveStatus();
		if (removeStatus.tsRemove == 0) {
			inventory.setRemoveStatus(xDatetime.getCurrentMilliseconds(), request.reason);

			// Stores the owner value used in the current execution flow.
			let owner = inventory.getOwner();
			// Stores the owner type value used in the current execution flow.
			let ownerType = <OwnerType>owner.type;
			if (ownerType == OwnerType.Group) {
				// Stores the group value used in the current execution flow.
				let group = await this.gnServer.getDatabase().loadGroupAsync(owner.id, secretInfo.getGameId(), { groupInventories: true });
				if (group != null) {
					if (group.hasGroupInventory(request.itemId)) {
						group.removeGroupInventory(request.itemId);

						group.saveAsync();
					}
				}
			}
			else if (ownerType == OwnerType.GamePlayer) {
				// Stores the game player value used in the current execution flow.
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(owner.id, secretInfo.getGameId(), { playerInventories: true });
				if (gamePlayer != null) {
					if (gamePlayer.hasPlayerInventory(request.itemId)) {
						gamePlayer.removePlayerInventory(request.itemId);

						gamePlayer.saveAsync();
					}
				}
			}
			else if (ownerType == OwnerType.CharacterPlayer) {
				// Stores the character player value used in the current execution flow.
				let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(owner.id, secretInfo.getGameId(), { playerInventories: true });
				if (characterPlayer != null) {
					if (characterPlayer.hasPlayerInventory(request.itemId)) {
						characterPlayer.removePlayerInventory(request.itemId);

						characterPlayer.saveAsync();
					}
				}
			}

			inventory.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetRemoveStatus", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
