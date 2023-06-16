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
import { CurrencyItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/CurrencyItem";

class GetPlayerCurrencyOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.CurrencyKeys, isOptional: true })
	currencyKeys: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerCurrencyOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.CurrencyKeys, isOptional: true })
	currencyKeys: GNArray;

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

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

        return this.execute(request.userId, request.currencyKeys, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.currencyKeys, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerCurrencyOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayerCurrency.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.currencyKeys, operationRequest);
    }

    private async execute(userId: string, currencyKeys: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
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
        let playerCurrencys = masterPlayer.getAllPlayerCurrencies();
        let gnPlayerCurrencies = new GNArray();
        playerCurrencys.forEach((value: CurrencyItem, key: string) => {
            if (currencyKeys == null || currencyKeys.indexOf(key) != -1) {
                let gnPlayerCurrency = new GNHashtable();

                gnPlayerCurrency.add(MasterPlayerParameterCode.Key, key);
                gnPlayerCurrency.add(MasterPlayerParameterCode.Value, value);
    
                gnPlayerCurrencies.add(gnPlayerCurrency);
            }
        });
        gnInfoGetParameters.add(MasterPlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
