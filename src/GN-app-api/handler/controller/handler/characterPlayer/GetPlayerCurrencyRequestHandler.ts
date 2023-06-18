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
import { CurrencyItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/CurrencyItem";

class GetPlayerCurrencyOperationRequest extends OperationRequest {
    @StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    @GNArrayDataMember({ code: CharacterPlayerParameterCode.CurrencyKeys, isOptional: true })
	currencyKeys: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerCurrencyOperationRequest extends GetPlayerCurrencyOperationRequest {

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayerCurrencyOperationRequest extends ServerGetPlayerCurrencyOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayerCurrencyRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetPlayerCurrency;
	}

	public override getCommonOperationRequest() {
		return GetPlayerCurrencyOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.currencyKeys, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.currencyKeys, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getPlayerCurrency.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.currencyKeys, operationRequest);
    }

    private async execute(characterId: string, gameId: string, currencyKeys: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
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
        let playerCurrencys = characterPlayer.getAllPlayerCurrencies();
        let gnPlayerCurrencies = new GNArray();
        playerCurrencys.forEach((value: CurrencyItem, key: string) => {
            if (currencyKeys == null || currencyKeys.indexOf(key) != -1) {
                let gnPlayerCurrency = new GNHashtable();

                gnPlayerCurrency.add(CharacterPlayerParameterCode.Key, key);
                gnPlayerCurrency.add(CharacterPlayerParameterCode.Value, value);
    
                gnPlayerCurrencies.add(gnPlayerCurrency);
            }
        });
        gnInfoGetParameters.add(CharacterPlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);

        operationResponse.setParameter(CharacterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
