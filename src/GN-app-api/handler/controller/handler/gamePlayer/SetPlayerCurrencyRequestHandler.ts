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
import { PlayerCurrencyParam } from "./model/PlayerCurrencyParam";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";

class SetPlayerCurrenciesOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@GNArrayDataMember({ code: ParameterCode.PlayerCurrencies, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerCurrencyParam })
	playerCurrencyParams: Array<PlayerCurrencyParam>;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerCurrenciesOperationRequest extends SetPlayerCurrenciesOperationRequest {
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPlayerCurrenciesOperationRequest extends ServerSetPlayerCurrenciesOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerCurrencyRequestHandler extends GamePlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.SetPlayerCurrency;
	}

	public override getCommonOperationRequest() {
		return SetPlayerCurrenciesOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			playerCurrencyParams: request.playerCurrencyParams,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerCurrencyParams: request.playerCurrencyParams,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerCurrencyParams: request.playerCurrencyParams,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, playerCurrencyParams: Array<PlayerCurrencyParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_SetPlayerCurrency", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerCurrencies: true,
		}

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnPlayerCurrencies = new GNArray();

		for (let i = 0; i < request.playerCurrencyParams.length; i++) {
			let playerCurrencyParam = request.playerCurrencyParams[i];

			let key = playerCurrencyParam.key;

			let playerCurrencySettingsItem = gamePlayerSettings.playerCurrencySettings.find(x => x.key == key);
			if (playerCurrencySettingsItem == null) continue;

			let initialValue = playerCurrencySettingsItem.initialValue;

			let amount = playerCurrencyParam.amount;
			let serverValue = 0;

			if (!gamePlayer.hasPlayerCurrency(key)) {
				serverValue = initialValue;
			}
			else {
				serverValue = gamePlayer.getPlayerCurrency(key).value;
			}

			let startValue = serverValue;

			serverValue += amount;
			if (serverValue <= 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.NotEnoughCurrency);
				return operationResponse;
			}

			this.gnServer.getDatabase().insertGamePlayerCurrencyLogAsync(request.userId, secretInfo.getGameId(), key, amount, startValue, serverValue, request.log);

			let gnPlayerCurrency = new GNHashtable();

			gnPlayerCurrency.add(ParameterCode.Key, key);
			gnPlayerCurrency.add(ParameterCode.Value, serverValue);

			gnPlayerCurrencies.add(gnPlayerCurrency);

			gamePlayer.setPlayerCurrency(key, serverValue);
		}

		gamePlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerCurrencies, gnPlayerCurrencies);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_SetPlayerCurrency", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
