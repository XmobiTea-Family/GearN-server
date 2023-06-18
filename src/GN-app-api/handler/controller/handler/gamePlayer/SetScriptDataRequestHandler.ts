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

class SetScriptDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: GamePlayerParameterCode.ScriptData, minLength: 1, maxLength: 32, mustNonNull: true })
	scriptData: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetScriptDataOperationRequest extends SetScriptDataOperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetScriptDataOperationRequest extends ServerSetScriptDataOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetScriptDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetScriptData;
	}

	public override getCommonOperationRequest() {
		return SetScriptDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.setPrivateData.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), secretInfo.getGameId(), request.scriptData, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetScriptDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.setPrivateData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.scriptData, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetScriptDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.setPrivateData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.scriptData, operationRequest);
    }

    private async execute(userId: string, gameId: string, scriptData: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let gamePlayerFindOptions: GamePlayerFindOptions = {
            scriptData: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);

		if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        for (let i = 0; i < scriptData.count(); i++) {
            let gnHashtable = scriptData.getGNHashtable(i);

            let key = gnHashtable.getString(GamePlayerParameterCode.Key);
            let value = gnHashtable.getObject(GamePlayerParameterCode.Value);
    
            if (value == null) {
                gamePlayer.removeScriptData(key);
            }
            else {
                gamePlayer.setScriptData(key, value as any);
            }
        }

		gamePlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.Ok);
		return operationResponse;
    }
}
