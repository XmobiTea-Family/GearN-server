import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";

class GetItemInformationOperationRequest extends OperationRequest {

	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	// Stores the info request parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetItemInformationOperationRequest extends GetItemInformationOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetItemInformationOperationRequest extends ServerGetItemInformationOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetItemInformationRequestHandler extends ItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetItemInformation;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetItemInformationOperationRequest;
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

		if (!secretInfo.getPermission().inventory.getItemInformation.otherSelfEnable && !secretInfo.getPermission().inventory.getItemInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		// Tracks whether method is allowed.
		let allowMethod = false;
		// Stores the owned value used in the current execution flow.
		let owned = false;

		if (secretInfo.getPermission().inventory.getItemInformation.otherSelfEnable) {
			allowMethod = true;
		}

		if (secretInfo.getPermission().inventory.getItemInformation.selfEnable) {
			// Stores the inventory value used in the current execution flow.
			let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.itemId, secretInfo.getGameId(), { owner: true });
			if (inventory != null) {
				// Stores the owner value used in the current execution flow.
				let owner = inventory.getOwner();
				if (owner != null) {
					if (owner.type == OwnerType.GamePlayer) {
						if (owner.id == authInfo.getUserId()) {
							allowMethod = true;
							owned = true;
						}
					}
					else if (owner.type == OwnerType.CharacterPlayer) {
						// Stores the game player value used in the current execution flow.
						let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

						if (gamePlayer != null) {
							if (gamePlayer.hasPlayerCharacter(owner.id)) {
								allowMethod = true;
								owned = true;
							}
						}
					}
					else if (owner.type == OwnerType.Group) {
						// Stores the game player value used in the current execution flow.
						let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

						if (gamePlayer != null) {
							// Stores the player group value used in the current execution flow.
							let groupItem = gamePlayer.getPlayerGroup(owner.id);
							if (groupItem != null && groupItem.status == GroupStatus.Member) {
								allowMethod = true;
								owned = true;
							}
						}
					}
				}
			}
		}

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		if (owned) {
			this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);
		}
		else {
			this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);
		}

		return this.execute({
			itemId: request.itemId,
			infoRequestParam: request.infoRequestParam,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			infoRequestParam: request.infoRequestParam,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			infoRequestParam: request.infoRequestParam,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { itemId: string, infoRequestParam: InfoRequestParam }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_GetItemInformation", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions = this.convertToInventoryFindOptions(request.infoRequestParam);

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(inventory, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_GetItemInformation", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
