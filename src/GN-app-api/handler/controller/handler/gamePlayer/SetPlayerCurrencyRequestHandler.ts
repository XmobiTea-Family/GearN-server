import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GamePlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/GamePlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GamePlayerErrorCode } from "../../../../../GN-common/constant/errorCode/GamePlayerErrorCode";

import { GamePlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class SetPlayerCurrenciesOperationRequest extends OperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.Key, minLength: 2, maxLength: 10 })
	key: string;

    @NumberDataMember({ code: GamePlayerParameterCode.Value })
	value: number;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerCurrenciesOperationRequest extends SetPlayerCurrenciesOperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPlayerCurrenciesOperationRequest extends ServerSetPlayerCurrenciesOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerCurrenciesRequestHandler extends RequestHandler {
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

		if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), secretInfo.getGameId(), request.key, request.value, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.key, request.value, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.setPlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.key, request.value, operationRequest);
    }

    private async execute(userId: string, gameId: string, key: string, value: number, operationRequest: OperationRequest): Promise<OperationResponse> {
        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerCurrencies: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);

		if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerCurrencies = new GNArray();

        if (!gamePlayer.hasPlayerCurrency(key)) {
            if (value < 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerDoesNotEnoughCurrency);
                return operationResponse;
            }
            
            gamePlayer.setPlayerCurrency(key, value);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(GamePlayerParameterCode.Key, key);
            gnPlayerCurrency.add(GamePlayerParameterCode.Value, value);

            gnPlayerCurrencies.add(gnPlayerCurrency);
        }
        else {
            let playerCurrencyItem = gamePlayer.getPlayerCurrency(key);

            if (value < 0 && playerCurrencyItem.value + value < 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerDoesNotEnoughCurrency);
                return operationResponse;
            }

            gamePlayer.setPlayerCurrency(key, playerCurrencyItem.value + value);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(GamePlayerParameterCode.Key, key);
            gnPlayerCurrency.add(GamePlayerParameterCode.Value, playerCurrencyItem.value + value);

            gnPlayerCurrencies.add(gnPlayerCurrency);
        }

		gamePlayer.saveAsync();

        gnInfoGetParameters.add(GamePlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);

        operationResponse.setParameter(GamePlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.Ok);

		return operationResponse;
    }
}
