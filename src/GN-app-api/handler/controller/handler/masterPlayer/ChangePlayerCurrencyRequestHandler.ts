import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { PlayerCurrencyParam } from "./model/PlayerCurrencyParam";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class ChangePlayerCurrencyOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@GNArrayDataMember({ code: ParameterCode.PlayerCurrencies, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: PlayerCurrencyParam })
	public playerCurrencies: Array<PlayerCurrencyParam>;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerChangePlayerCurrencyOperationRequest extends ChangePlayerCurrencyOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminChangePlayerCurrencyOperationRequest extends ServerChangePlayerCurrencyOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangePlayerCurrencyRequestHandler extends MasterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.ChangePlayerCurrency;
	}

	public override getCommonOperationRequest() {
		return ChangePlayerCurrencyOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.changePlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.changePlayerCurrency.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.changePlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerChangePlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.changePlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminChangePlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.changePlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			playerCurrencies: request.playerCurrencies,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, playerCurrencies: Array<PlayerCurrencyParam>, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_ChangePlayerCurrency", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerCurrencies: true,
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();

		let gnInfoResponseParameters = new GNHashtable();
		let gnPlayerCurrencies = new GNArray();

		for (let i = 0; i < request.playerCurrencies.length; i++) {
			let playerCurrencyParam = request.playerCurrencies[i];

			let key = playerCurrencyParam.key;

			let playerCurrencySettingsItem = masterPlayerSettings.playerCurrencySettings.find(x => x.key == key);
			if (playerCurrencySettingsItem == null) continue;

			let initialValue = playerCurrencySettingsItem.initialValue;

			let amount = playerCurrencyParam.amount;
			let serverValue = 0;

			if (!masterPlayer.hasPlayerCurrency(key)) {
				serverValue = initialValue;
			}
			else {
				serverValue = masterPlayer.getPlayerCurrency(key).value;
			}

			let startValue = serverValue;

			serverValue += amount;
			if (serverValue <= 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.NotEnoughCurrency);
				return operationResponse;
			}

			this.gnServer.getDatabase().insertMasterPlayerCurrencyLogAsync(request.userId, key, amount, startValue, serverValue, request.log);

			let gnPlayerCurrency = new GNHashtable();

			gnPlayerCurrency.add(ParameterCode.Key, key);
			gnPlayerCurrency.add(ParameterCode.Value, serverValue);

			gnPlayerCurrencies.add(gnPlayerCurrency);

			masterPlayer.changePlayerCurrency(key, serverValue);
		}

		masterPlayer.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.PlayerCurrencies, gnPlayerCurrencies);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_ChangePlayerCurrency", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
