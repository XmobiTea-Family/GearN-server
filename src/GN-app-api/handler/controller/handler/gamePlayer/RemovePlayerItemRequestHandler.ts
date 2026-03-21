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

class RemovePlayerItemOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the item ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerRemovePlayerItemOperationRequest extends RemovePlayerItemOperationRequest {

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

class AdminRemovePlayerItemOperationRequest extends ServerRemovePlayerItemOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemovePlayerItemRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.RemovePlayerItem;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return RemovePlayerItemOperationRequest;
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
			if (!secretInfo.getPermission().gamePlayer.removePlayerItem.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.removePlayerItem.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.removePlayerItem.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			itemId: request.itemId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemovePlayerItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.removePlayerItem.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			itemId: request.itemId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemovePlayerItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.removePlayerItem.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			itemId: request.itemId,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, itemId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_RemovePlayerItem", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerInventories: true,
		}

		// Stores the game player value used in the current execution flow.
		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		if (!gamePlayer.hasPlayerInventory(request.itemId)) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		gamePlayer.removePlayerInventory(request.itemId);
		gamePlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_RemovePlayerItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
