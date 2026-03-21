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

class SetDisplayNameOperationRequest extends OperationRequest {
	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	// Stores the display name value used by this instance.
	@StringDataMember({ code: ParameterCode.DisplayName, minLength: 5, maxLength: 32, mustNonNull: true })
	public displayName: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetDisplayNameOperationRequest extends SetDisplayNameOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetDisplayNameOperationRequest extends ServerGetDisplayNameOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetDisplayNameRequestHandler extends ItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetDisplayName;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetDisplayNameOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setDisplayName);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			displayName: request.displayName
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setDisplayName.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			displayName: request.displayName
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.setDisplayName.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			itemId: request.itemId,
			displayName: request.displayName
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { itemId: string, displayName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetDisplayName", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the inventory find options value used in the current execution flow.
		let inventoryFindOptions: InventoryFindOptions = {
			displayName: true,
		}

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		inventory.setDisplayName(request.displayName);
		inventory.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetDisplayName", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
