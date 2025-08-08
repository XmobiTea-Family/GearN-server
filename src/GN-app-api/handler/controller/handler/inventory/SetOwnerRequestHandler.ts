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
import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";

class SetOwnerOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.ItemId, minLength: 11, maxLength: 11, mustNonNull: true })
	public itemId: string;

	@StringDataMember({ code: ParameterCode.OwnerId, minLength: 10, maxLength: 12, mustNonNull: true })
	public newOwnerId: string;

	@NumberDataMember({ code: ParameterCode.OwnerType, mustInt: true })
	public newOwnerType: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetOwnerOperationRequest extends SetOwnerOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetOwnerOperationRequest extends ServerSetOwnerOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetOwnerRequestHandler extends ItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.SetOwner;
	}

	public override getCommonOperationRequest() {
		return SetOwnerOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setOwner);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			newOwnerId: request.newOwnerId,
			newOwnerType: request.newOwnerType,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	private async execute(request: { itemId: string, newOwnerId: string, newOwnerType: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetOwner", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventoryFindOptions: InventoryFindOptions = {
			owner: true,
			catalogId: true,
			classId: true,
		}

		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		let owner = inventory.getOwner();
		if (owner.id != request.newOwnerId) {
			if (request.newOwnerType == OwnerType.Group) {
				let groupFindOptions: GroupFindOptions = {
					groupInventories: true,
				}

				let newItemOwnerPlayer = await this.gnServer.getDatabase().loadGroupAsync(request.newOwnerId, secretInfo.getGameId(), groupFindOptions);
				if (newItemOwnerPlayer == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
					return operationResponse;
				}

				newItemOwnerPlayer.setGroupInventory(request.itemId, inventory.getCatalogId(), inventory.getClassId());
				newItemOwnerPlayer.saveAsync();
			}
			else if (request.newOwnerType == OwnerType.GamePlayer) {
				let gamePlayerFindOptions: GamePlayerFindOptions = {
					playerInventories: true,
				}

				let newItemOwnerPlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.newOwnerId, secretInfo.getGameId(), gamePlayerFindOptions);
				if (newItemOwnerPlayer == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
					return operationResponse;
				}

				newItemOwnerPlayer.setPlayerInventory(request.itemId, inventory.getCatalogId(), inventory.getClassId());
				newItemOwnerPlayer.saveAsync();
			}
			else if (request.newOwnerType == OwnerType.CharacterPlayer) {
				let characterPlayerFindOptions: CharacterPlayerFindOptions = {
					playerInventories: true,
				}

				let newItemOwnerPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.newOwnerId, secretInfo.getGameId(), characterPlayerFindOptions);
				if (newItemOwnerPlayer == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
					return operationResponse;
				}

				newItemOwnerPlayer.setPlayerInventory(request.itemId, inventory.getCatalogId(), inventory.getClassId());
				newItemOwnerPlayer.saveAsync();
			}
			else {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerTypeNotSupport);
				return operationResponse;
			}

			if (owner.type == OwnerType.Group) {
				let groupFindOptions: GroupFindOptions = {
					groupInventories: true,
				}

				let currentItemOwnerPlayer = await this.gnServer.getDatabase().loadGroupAsync(owner.id, secretInfo.getGameId(), groupFindOptions);
				if (currentItemOwnerPlayer != null) {
					if (currentItemOwnerPlayer.hasGroupInventory(request.itemId)) {
						currentItemOwnerPlayer.removeGroupInventory(request.itemId);
						currentItemOwnerPlayer.saveAsync();
					}
				}
			}
			else if (owner.type == OwnerType.GamePlayer) {
				let gamePlayerFindOptions: GamePlayerFindOptions = {
					playerInventories: true,
				}

				let currentItemOwnerPlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(owner.id, secretInfo.getGameId(), gamePlayerFindOptions);
				if (currentItemOwnerPlayer != null) {
					if (currentItemOwnerPlayer.hasPlayerInventory(request.itemId)) {
						currentItemOwnerPlayer.removePlayerInventory(request.itemId);
						currentItemOwnerPlayer.saveAsync();
					}
				}
			}
			else if (owner.type == OwnerType.CharacterPlayer) {
				let characterPlayerFindOptions: CharacterPlayerFindOptions = {
					playerInventories: true,
				}

				let currentItemOwnerPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(owner.id, secretInfo.getGameId(), characterPlayerFindOptions);
				if (currentItemOwnerPlayer != null) {
					if (currentItemOwnerPlayer.hasPlayerInventory(request.itemId)) {
						currentItemOwnerPlayer.removePlayerInventory(request.itemId);
						currentItemOwnerPlayer.saveAsync();
					}
				}
			}

			inventory.setOwner(request.newOwnerId, request.newOwnerType);
			inventory.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetOwner", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
