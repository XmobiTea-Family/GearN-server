import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class SetPlayerCurrenciesOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.Key, minLength: 2, maxLength: 10 })
	key: string;

    @NumberDataMember({ code: MasterPlayerParameterCode.Value })
	value: number;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerCurrenciesOperationRequest extends SetPlayerCurrenciesOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
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

		if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), request.key, request.value, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.key, request.value, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPlayerCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.key, request.value, operationRequest);
    }

    private async execute(userId: string, key: string, value: number, operationRequest: OperationRequest): Promise<OperationResponse> {
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerCurrencies: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerCurrencies = new GNArray();

        if (!masterPlayer.hasPlayerCurrency(key)) {
            if (value < 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerDoesNotEnoughCurrency);
                return operationResponse;
            }
            
            masterPlayer.setPlayerCurrency(key, value);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(MasterPlayerParameterCode.Key, key);
            gnPlayerCurrency.add(MasterPlayerParameterCode.Value, value);

            gnPlayerCurrencies.add(gnPlayerCurrency);
        }
        else {
            let playerCurrencyItem = masterPlayer.getPlayerCurrency(key);

            if (value < 0 && playerCurrencyItem.value + value < 0) {
                operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerDoesNotEnoughCurrency);
                return operationResponse;
            }

            masterPlayer.setPlayerCurrency(key, playerCurrencyItem.value + value);

            let gnPlayerCurrency = new GNHashtable();

            gnPlayerCurrency.add(MasterPlayerParameterCode.Key, key);
            gnPlayerCurrency.add(MasterPlayerParameterCode.Value, playerCurrencyItem.value + value);

            gnPlayerCurrencies.add(gnPlayerCurrency);
        }

		masterPlayer.saveAsync();

        gnInfoGetParameters.add(MasterPlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);

		return operationResponse;
    }
}
