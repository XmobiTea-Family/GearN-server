import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { CharacterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/CharacterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { CharacterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/CharacterPlayerErrorCode";

import { CharacterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class SetPlayerCurrenciesOperationRequest extends OperationRequest {
    @StringDataMember({ code: CharacterPlayerParameterCode.Key, minLength: 2, maxLength: 10 })
	key: string;

    @NumberDataMember({ code: CharacterPlayerParameterCode.Value })
	value: number;

	@StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerCurrenciesOperationRequest extends SetPlayerCurrenciesOperationRequest {
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

		if (!secretInfo.getPermission().characterPlayer.setPlayerCurrency.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.key, request.value, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setPlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.key, request.value, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.setPlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.key, request.value, operationRequest);
    }

    private async execute(characterId: string, gameId: string, key: string, value: number, operationRequest: OperationRequest): Promise<OperationResponse> {
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            playerCurrencies: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerCurrencies = new GNArray();

        if (!characterPlayer.hasPlayerCurrency(key)) {
            if (value < 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerDoesNotEnoughCurrency);
                return operationResponse;
            }
            
            characterPlayer.setPlayerCurrency(key, value);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(CharacterPlayerParameterCode.Key, key);
            gnPlayerCurrency.add(CharacterPlayerParameterCode.Value, value);

            gnPlayerCurrencies.add(gnPlayerCurrency);
        }
        else {
            let playerCurrencyItem = characterPlayer.getPlayerCurrency(key);

            if (value < 0 && playerCurrencyItem.value + value < 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerDoesNotEnoughCurrency);
                return operationResponse;
            }

            characterPlayer.setPlayerCurrency(key, playerCurrencyItem.value + value);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(CharacterPlayerParameterCode.Key, key);
            gnPlayerCurrency.add(CharacterPlayerParameterCode.Value, playerCurrencyItem.value + value);

            gnPlayerCurrencies.add(gnPlayerCurrency);
        }

		characterPlayer.saveAsync();

        gnInfoGetParameters.add(CharacterPlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);

        operationResponse.setParameter(CharacterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);

		return operationResponse;
    }
}
