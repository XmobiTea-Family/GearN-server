import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";

class SetOwnerOperationRequest extends OperationRequest {

	// Stores the character ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	// Stores the new owner ID value used by this instance.
	@StringDataMember({ code: ParameterCode.NewOwnerId, minLength: 10, maxLength: 10, mustNonNull: true })
	public newOwnerId: string;

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

export class SetOwnerRequestHandler extends CharacterPlayerBaseRequestHandler {

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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.setOwner);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			newOwnerId: request.newOwnerId,
		}, SecretRole.Player, secretInfo, operationRequest);
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

		if (!secretInfo.getPermission().characterPlayer.setOwner.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			newOwnerId: request.newOwnerId,
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

		if (!secretInfo.getPermission().characterPlayer.setOwner.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			newOwnerId: request.newOwnerId,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { characterId: string, newOwnerId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_SetOwner", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the character player find options value used in the current execution flow.
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			owner: true,
			catalogId: true,
			playerGroups: true,
		}

		// Stores the character player value used in the current execution flow.
		let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		// Stores the owner value used in the current execution flow.
		let owner = characterPlayer.getOwner();

		let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(owner.id, secretInfo.getGameId(), { playerCharacters: true });

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		if (owner.id != request.newOwnerId) {
			// Stores the game player find options value used in the current execution flow.
			let gamePlayerFindOptions: GamePlayerFindOptions = {
				playerCharacters: true,
			}

			// Stores the new character owner player value used in the current execution flow.
			let newCharacterOwnerPlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.newOwnerId, secretInfo.getGameId(), gamePlayerFindOptions);
			if (newCharacterOwnerPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
				return operationResponse;
			}

			// Stores the current character owner player value used in the current execution flow.
			let currentCharacterOwnerPlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(owner.id, secretInfo.getGameId(), gamePlayerFindOptions);
			if (currentCharacterOwnerPlayer != null) {
				if (currentCharacterOwnerPlayer.hasPlayerCharacter(request.characterId)) {
					currentCharacterOwnerPlayer.removePlayerCharacter(request.characterId);
					currentCharacterOwnerPlayer.saveAsync();
				}
			}

			newCharacterOwnerPlayer.setPlayerCharacter(request.characterId, characterPlayer.getCatalogId());
			newCharacterOwnerPlayer.saveAsync();

			characterPlayer.setOwner(request.newOwnerId, owner.type);
			characterPlayer.saveAsync();

			let playerCharacters = gamePlayer.getAllPlayerCharacters().filter(x => x.characterId != request.characterId);

			for (let groupItem of characterPlayer.getAllPlayerGroups()) {
				if (groupItem.status == GroupStatus.Member) {
					this.gnServer.joinRoom(request.newOwnerId, groupItem.groupId);

					const group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(groupItem.groupId, secretInfo.getGameId());
					if (group != null) {
						let hasCharacter = false;
						for (let playerCharacter of playerCharacters) {
							if (group.hasMember(playerCharacter.characterId) && group.getMember(playerCharacter.characterId).status == GroupStatus.Member) {
								hasCharacter = true;
								break;
							}
						}
						if (!hasCharacter) this.gnServer.leaveRoom(owner.id, groupItem.groupId);
					}
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_SetOwner", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
