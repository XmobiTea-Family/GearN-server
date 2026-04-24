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
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";

class RemovePlayerFriendOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the friend ID value used by this instance.
	@StringDataMember({ code: ParameterCode.FriendId, minLength: 10, maxLength: 10, mustNonNull: true })
	public friendId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerRemovePlayerFriendOperationRequest extends RemovePlayerFriendOperationRequest {

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

class AdminRemovePlayerFriendOperationRequest extends ServerRemovePlayerFriendOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemovePlayerFriendRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.RemovePlayerFriend;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return RemovePlayerFriendOperationRequest;
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
			if (!secretInfo.getPermission().gamePlayer.removePlayerFriend.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.removePlayerFriend.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.removePlayerFriend.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			friendId: request.friendId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemovePlayerFriendOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.removePlayerFriend.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			friendId: request.friendId,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemovePlayerFriendOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.removePlayerFriend.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			friendId: request.friendId,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, friendId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_RemovePlayerFriend", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		if (request.userId != request.friendId) {
			// Stores the game player find options value used in the current execution flow.
			let gamePlayerFindOptions: GamePlayerFindOptions = {
				playerFriends: true
			}

			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);
			// Stores the friend player value used in the current execution flow.
			let friendPlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.friendId, secretInfo.getGameId(), gamePlayerFindOptions);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
				return operationResponse;
			}

			if (friendPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
				return operationResponse;
			}

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			if (gamePlayer.hasPlayerFriend(request.friendId)) {
				// Stores the player friend item value used in the current execution flow.
				let playerFriendItem = gamePlayer.getPlayerFriend(request.friendId);

				gamePlayer.removePlayerFriend(request.friendId);
				gamePlayer.saveAsync();

				{
					// Stores the GearN player friends value used in the current execution flow.
					let gnPlayerFriends = new GNArray();

					// Stores the GearN player friend value used in the current execution flow.
					let gnPlayerFriend = new GNHashtable();
					gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
					gnPlayerFriend.add(ParameterCode.CatalogId, playerFriendItem.catalogId);
					gnPlayerFriend.add(ParameterCode.Status, FriendStatus.NotFriend);
					gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerFriends.add(gnPlayerFriend);

					// Stores the game player friend update operation event value used in the current execution flow.
					let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null);

					gamePlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);

					this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
				}
			}

			if (friendPlayer.hasPlayerFriend(request.userId)) {
				// Stores the player friend item value used in the current execution flow.
				let playerFriendItem = friendPlayer.getPlayerFriend(request.userId);

				friendPlayer.removePlayerFriend(request.userId);
				friendPlayer.saveAsync();

				{
					// Stores the GearN player friends value used in the current execution flow.
					let gnPlayerFriends = new GNArray();

					// Stores the GearN player friend value used in the current execution flow.
					let gnPlayerFriend = new GNHashtable();
					gnPlayerFriend.add(ParameterCode.FriendId, request.userId);
					gnPlayerFriend.add(ParameterCode.CatalogId, playerFriendItem.catalogId);
					gnPlayerFriend.add(ParameterCode.Status, FriendStatus.NotFriend);
					gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerFriends.add(gnPlayerFriend);

					// Stores the game player friend update operation event value used in the current execution flow.
					let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null);

					gamePlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);

					this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_RemovePlayerFriend", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
