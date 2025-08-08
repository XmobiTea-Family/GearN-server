import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

class GetCurrencyLogOperationRequest extends OperationRequest {

	@GNArrayDataMember({ code: ParameterCode.Keys, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: String, isOptional: true })
	public keys?: Array<string>;

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true, isOptional: true })
	public userId?: string;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	@StringDataMember({ code: ParameterCode.Token, minLength: 24, maxLength: 24, mustNonNull: true, isOptional: true })
	public token?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetCurrencyLogOperationRequest extends GetCurrencyLogOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCurrencyLogOperationRequest extends ServerGetCurrencyLogOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetCurrencyLogRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetCurrencyLog;
	}

	public override getCommonOperationRequest() {
		return GetCurrencyLogOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getCurrencyLog.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			token: request.token,
			limit: request.limit,
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCurrencyLogOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getCurrencyLog.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			token: request.token,
			limit: request.limit,
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCurrencyLogOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getCurrencyLog.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			token: request.token,
			limit: request.limit,
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { keys: Array<string>, token: string, limit: number, userId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetCurrencyLog", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

		let keys: string[] = [];
		if (request.keys) {
			for (let i = 0; i < request.keys.length; i++) {
				let playerCurrencySettingsItem = gamePlayerSettings.playerCurrencySettings.find(x => x.key == request.keys[i]);

				if (playerCurrencySettingsItem != null) {
					keys.push(playerCurrencySettingsItem.key);
				}
			}
		}

		let $filter = {} as any;

		if (request.userId) {
			$filter["userId"] = request.userId;
		}

		if (keys.length != 0) {
			if (keys.length == 1) $filter["key"] = keys[0];
			else $filter["key"] = { $in: keys };
		}

		if (request.token) {
			$filter["_id"] = { $lt: request.token };
		}

		let gnResults = new GNArray();

		let results = await this.gnServer.getDatabase().loadGamePlayerCurrencyLogAsync($filter, secretInfo.getGameId(), request.limit);

		let token: string;

		while (await results.hasNext()) {
			let result = await results.next();

			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.UserId, result["userId"]);
			gnResult.add(ParameterCode.TsCreate, result["tsCreate"]);
			gnResult.add(ParameterCode.Log, result["log"]);
			gnResult.add(ParameterCode.Key, result["key"]);
			gnResult.add(ParameterCode.Amount, result["amount"]);
			gnResult.add(ParameterCode.StartValue, result["startValue"]);
			gnResult.add(ParameterCode.FinalValue, result["finalValue"]);

			gnResults.add(gnResult);

			token = result["_id"].toString();
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		if (token) {
			operationResponse.setParameter(ParameterCode.Token, token);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetCurrencyLog", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
