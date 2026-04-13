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
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { PlayerCurrencyParam } from "./model/PlayerCurrencyParam";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";

class ChangePlayerCurrencyOperationRequest extends OperationRequest {

	// Stores the character ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	// Stores the player currencies value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PlayerCurrencies, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerCurrencyParam })
	public playerCurrencies: Array<PlayerCurrencyParam>;

	// Stores the log value used by this instance.
	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerChangePlayerCurrencyOperationRequest extends ChangePlayerCurrencyOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangePlayerCurrencyOperationRequest extends ServerChangePlayerCurrencyOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangePlayerCurrencyRequestHandler extends CharacterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ChangePlayerCurrency;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ChangePlayerCurrencyOperationRequest;
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
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.changePlayerCurrency);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.changePlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.changePlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { characterId: string, playerCurrencies: Array<PlayerCurrencyParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_ChangePlayerCurrency", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

		for (let i = 0; i < request.playerCurrencies.length; i++) {
			// Stores the player currency parameter value used in the current execution flow.
			let playerCurrencyParam = request.playerCurrencies[i];

			// Stores the key value used in the current execution flow.
			let key = playerCurrencyParam.key;

			// Stores the player currencies settings item value used in the current execution flow.
			let playerCurrenciesSettingsItem = characterPlayerSettings.playerCurrenciesSettings.find(x => x.key == key);
			if (playerCurrenciesSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("CurrencyKey not found " + key);
				return operationResponse;
			}
		}

		// Stores the character player find options value used in the current execution flow.
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerCurrencies: true,
		}

		// Stores the character player value used in the current execution flow.
		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN player currencies value used in the current execution flow.
		let gnPlayerCurrencies = new GNArray();

		let logs: {
			key: string, amount: number, startValue: number, finalValue: number
		}[] = [];

		for (let i = 0; i < request.playerCurrencies.length; i++) {
			// Stores the player currency parameter value used in the current execution flow.
			let playerCurrencyParam = request.playerCurrencies[i];

			// Stores the key value used in the current execution flow.
			let key = playerCurrencyParam.key;

			// Stores the player currencies settings item value used in the current execution flow.
			let playerCurrenciesSettingsItem = characterPlayerSettings.playerCurrenciesSettings.find(x => x.key == key);
			if (playerCurrenciesSettingsItem == null) continue;

			// Stores the amount value used in the current execution flow.
			let amount = playerCurrencyParam.amount;
			// Stores the server value value used in the current execution flow.
			let serverValue = 0;

			// Tracks whether set player currency should be used.
			let useSetPlayerCurrency = false;
			if (!characterPlayer.hasPlayerCurrency(key)) {
				useSetPlayerCurrency = true;
				serverValue = playerCurrenciesSettingsItem.initialValue;
			}
			else {
				serverValue = characterPlayer.getPlayerCurrency(key).value;
			}

			// Stores the start value value used in the current execution flow.
			let startValue = serverValue;

			serverValue += amount;
			if (serverValue < 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.NotEnoughCurrency);
				return operationResponse;
			}

			logs.push({
				key: key,
				amount: amount,
				startValue: startValue,
				finalValue: serverValue,
			});

			// Stores the GearN player currency value used in the current execution flow.
			let gnPlayerCurrency = new GNHashtable();

			gnPlayerCurrency.add(ParameterCode.Key, key);
			gnPlayerCurrency.add(ParameterCode.Value, serverValue);

			gnPlayerCurrencies.add(gnPlayerCurrency);

			if (useSetPlayerCurrency) {
				characterPlayer.setPlayerCurrency(key, serverValue);
			}
			else {
				characterPlayer.changePlayerCurrency(key, amount);
			}
		}

		for (const log of logs) {
			this.gnServer.getDatabase().insertCharacterPlayerCurrencyLogAsync(request.characterId, secretInfo.getGameId(), log.key, log.amount, log.startValue, log.finalValue, request.log);
		}

		characterPlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerCurrencies, gnPlayerCurrencies);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_ChangePlayerCurrency", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
