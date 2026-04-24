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
import { PlayerCurrencyParam } from "./model/PlayerCurrencyParam";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class ChangePlayerCurrencyOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

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

class AdminChangePlayerCurrencyOperationRequest extends ServerChangePlayerCurrencyOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangePlayerCurrencyRequestHandler extends GamePlayerBaseRequestHandler {

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

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.changePlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.changePlayerCurrency.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.changePlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.changePlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.changePlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, playerCurrencies: Array<PlayerCurrencyParam>, log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_ChangePlayerCurrency", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

		for (let i = 0; i < request.playerCurrencies.length; i++) {
			// Stores the player currency parameter value used in the current execution flow.
			let playerCurrencyParam = request.playerCurrencies[i];

			// Stores the key value used in the current execution flow.
			let key = playerCurrencyParam.key;

			// Stores the player currencies settings item value used in the current execution flow.
			let playerCurrenciesSettingsItem = gamePlayerSettings.playerCurrenciesSettings.find(x => x.key == key);
			if (playerCurrenciesSettingsItem == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);
				operationResponse.setDebugMessage("CurrencyKey not found " + key);
				return operationResponse;
			}
		}

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerCurrencies: true,
		}

		// Stores the game player value used in the current execution flow.
		let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}
		if (role == SecretRole.Client) {
			// Stores the player ban value used in the current execution flow.
			let playerBan = gamePlayer.getPlayerBan();

			if (playerBan.tsExpire != 0) {
				let currentMilliseconds = xDatetime.getCurrentMilliseconds();
				if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
					operationResponse.setDebugMessage("GamePlayer is banned, reason " + playerBan.reason);
					
					return operationResponse;
				}
			}
		}

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		// Stores the GearN player currencies value used in the current execution flow.
		let gnPlayerCurrencies = new GNArray();

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let logs: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

		for (let i = 0; i < request.playerCurrencies.length; i++) {
			// Stores the player currency parameter value used in the current execution flow.
			let playerCurrencyParam = request.playerCurrencies[i];

			// Stores the key value used in the current execution flow.
			let key = playerCurrencyParam.key;

			// Stores the player currencies settings item value used in the current execution flow.
			let playerCurrenciesSettingsItem = gamePlayerSettings.playerCurrenciesSettings.find(x => x.key == key);
			if (playerCurrenciesSettingsItem == null) continue;

			// Stores the initial value value used in the current execution flow.
			let initialValue = playerCurrenciesSettingsItem.initialValue;

			// Stores the amount value used in the current execution flow.
			let amount = playerCurrencyParam.amount;
			// Stores the server value value used in the current execution flow.
			let serverValue = 0;

			// Tracks whether set player currency should be used.
			let useSetPlayerCurrency = false;
			if (!gamePlayer.hasPlayerCurrency(key)) {
				useSetPlayerCurrency = true;
				serverValue = initialValue;
			}
			else {
				serverValue = gamePlayer.getPlayerCurrency(key).value;
			}

			// Stores the start value value used in the current execution flow.
			let startValue = serverValue;

			serverValue += amount;
			if (serverValue < 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.NotEnoughCurrency);
				return operationResponse;
			}

			logs.push({
				userId: request.userId,
				key: key,
				amount: amount,
				startValue: startValue,
				finalValue: serverValue,
				tsCreate: currentMilliseconds,
				log: request.log
			});

			// Stores the GearN player currency value used in the current execution flow.
			let gnPlayerCurrency = new GNHashtable();

			gnPlayerCurrency.add(ParameterCode.Key, key);
			gnPlayerCurrency.add(ParameterCode.Value, serverValue);

			gnPlayerCurrencies.add(gnPlayerCurrency);

			if (useSetPlayerCurrency) {
				gamePlayer.setPlayerCurrency(key, serverValue);
			}
			else {
				gamePlayer.changePlayerCurrency(key, amount);
			}
		}

		this.gnServer.getDatabase().gamePlayerRepository.insertGamePlayerCurrencyLogsAsync(logs, secretInfo.getGameId());

		gamePlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerCurrencies, gnPlayerCurrencies);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_ChangePlayerCurrency", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
