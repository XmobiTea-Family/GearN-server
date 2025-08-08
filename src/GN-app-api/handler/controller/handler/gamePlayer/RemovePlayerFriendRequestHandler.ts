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
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";

class RemovePlayerFriendOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.FriendId, minLength: 10, maxLength: 10, mustNonNull: true })
	public friendId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerRemovePlayerFriendOperationRequest extends RemovePlayerFriendOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminRemovePlayerFriendOperationRequest extends ServerRemovePlayerFriendOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemovePlayerFriendRequestHandler extends GamePlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.RemovePlayerFriend;
	}

	public override getCommonOperationRequest() {
		return RemovePlayerFriendOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, friendId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_RemovePlayerFriend", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		if (request.userId != request.friendId) {
			let gamePlayerFindOptions: GamePlayerFindOptions = {
				playerFriends: true
			}

			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);
			let friendPlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.friendId, secretInfo.getGameId(), gamePlayerFindOptions);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
				return operationResponse;
			}

			if (friendPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
				return operationResponse;
			}

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			if (gamePlayer.hasPlayerFriend(request.friendId)) {
				let playerFriendItem = gamePlayer.getPlayerFriend(request.friendId);

				gamePlayer.removePlayerFriend(request.friendId);
				gamePlayer.saveAsync();

				{
					let gnPlayerFriends = new GNArray();

					let gnPlayerFriend = new GNHashtable();
					gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
					gnPlayerFriend.add(ParameterCode.CatalogId, playerFriendItem.catalogId);
					gnPlayerFriend.add(ParameterCode.Status, <number>FriendStatus.NotFriend);
					gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerFriends.add(gnPlayerFriend);

					let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null);

					gamePlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);

					this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
				}
			}

			if (friendPlayer.hasPlayerFriend(request.userId)) {
				let playerFriendItem = friendPlayer.getPlayerFriend(request.userId);

				friendPlayer.removePlayerFriend(request.userId);
				friendPlayer.saveAsync();

				{
					let gnPlayerFriends = new GNArray();

					let gnPlayerFriend = new GNHashtable();
					gnPlayerFriend.add(ParameterCode.FriendId, request.userId);
					gnPlayerFriend.add(ParameterCode.CatalogId, playerFriendItem.catalogId);
					gnPlayerFriend.add(ParameterCode.Status, <number>FriendStatus.NotFriend);
					gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
					gnPlayerFriends.add(gnPlayerFriend);

					let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null);

					gamePlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);

					this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_RemovePlayerFriend", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
