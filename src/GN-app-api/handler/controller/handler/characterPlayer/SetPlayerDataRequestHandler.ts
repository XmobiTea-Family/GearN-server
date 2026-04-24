import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "./../../../../../GN-common/constant/enumType/PermissionDataItem";
import { PlayerDataParam } from "./model/PlayerDataParam";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class SetPlayerDataOperationRequest extends OperationRequest {

	// Stores the character ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	// Stores the player datas value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PlayerDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerDataParam })
	public playerDatas: Array<PlayerDataParam>;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerDataOperationRequest extends SetPlayerDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPlayerDataOperationRequest extends ServerSetPlayerDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerDataRequestHandler extends CharacterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetPlayerData;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetPlayerDataOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.setPlayerData);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerDatas: request.playerDatas
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setPlayerData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerDatas: request.playerDatas
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setPlayerData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerDatas: request.playerDatas
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { characterId: string, playerDatas: Array<PlayerDataParam> }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_SetPlayerData", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

		for (let i = 0; i < request.playerDatas.length; i++) {
			// Stores the player data parameter value used in the current execution flow.
			let playerDataParam = request.playerDatas[i];

			// Stores the key value used in the current execution flow.
			let key = playerDataParam.key;
			// Stores the player datas settings item value used in the current execution flow.
			let playerDatasSettingsItem = characterPlayerSettings.playerDatasSettings.find(x => x.key == key);
			if (playerDatasSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("DataKey not found " + key);
				return operationResponse;
			}

			if (playerDatasSettingsItem.permission == PermissionDataItem.ReadOnly && role == SecretRole.Client) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("DataKey is readOnly " + key + ", change it by server or admin role");
				return operationResponse;
			}
		}

		// Stores the character player find options value used in the current execution flow.
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerDatas: true,
			playerBan: true,
			removeStatus: true,
		}

		// Stores the character player value used in the current execution flow.
		let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (role == SecretRole.Client) {
			// Stores the character ban value used in the current execution flow.
			let playerBan = characterPlayer.getPlayerBan();

			if (playerBan.tsExpire != 0) {
				if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
					operationResponse.setDebugMessage("CharacterPlayer is banned, reason " + playerBan.reason);

					return operationResponse;
				}
			}

			let removeStatus = characterPlayer.getRemoveStatus();

			if (removeStatus.tsRemove != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
				operationResponse.setDebugMessage("CharacterPlayer is removed, reason " + removeStatus.reason);

				return operationResponse;
			}
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN player datas value used in the current execution flow.
		let gnPlayerDatas = new GNArray();

		for (let i = 0; i < request.playerDatas.length; i++) {
			// Stores the player data parameter value used in the current execution flow.
			let playerDataParam = request.playerDatas[i];

			// Stores the key value used in the current execution flow.
			let key = playerDataParam.key;
			// Stores the player datas settings item value used in the current execution flow.
			let playerDatasSettingsItem = characterPlayerSettings.playerDatasSettings.find(x => x.key == key);
			if (playerDatasSettingsItem == null) continue;

			// Stores the value value used in the current execution flow.
			let value = playerDataParam.value;
			// Stores the permission value used in the current execution flow.
			let permission = playerDatasSettingsItem.permission;

			if (permission == PermissionDataItem.ReadOnly && role == SecretRole.Client) {

			}
			else {
				if (value == null) {
					if (characterPlayer.hasPlayerData(key)) {
						characterPlayer.removePlayerData(key);
					}
				}
				else {
					if (value instanceof GNData) {
						value = (value as GNData).toData();
					}

					characterPlayer.setPlayerData(key, value as DataValueType);
				}

				// Stores the GearN player data value used in the current execution flow.
				let gnPlayerData = new GNHashtable();
				gnPlayerData.add(ParameterCode.Key, key);
				gnPlayerData.add(ParameterCode.Value, playerDataParam.value);

				gnPlayerDatas.add(gnPlayerData);
			}
		}

		characterPlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerDatas, gnPlayerDatas);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_SetPlayerData", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
