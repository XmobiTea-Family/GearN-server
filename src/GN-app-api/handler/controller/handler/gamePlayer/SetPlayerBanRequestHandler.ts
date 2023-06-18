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

class SetPlayerBanOperationRequest extends OperationRequest {
    @NumberDataMember({ code: GamePlayerParameterCode.TsExpire })
	tsExpire: number;

    @StringDataMember({ code: GamePlayerParameterCode.Reason, isOptional: true })
	reason: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerBanOperationRequest extends SetPlayerBanOperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayerBanOperationRequest extends ServerGetPlayerBanOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerBanRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetPlayerBan;
	}

	public override getCommonOperationRequest() {
		return SetPlayerBanOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.setPlayerBan.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(authInfo.getUserId(), secretInfo.getGameId(), request.tsExpire, request.reason, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerBanOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.setPlayerBan.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, secretInfo.getGameId(), request.tsExpire, request.reason, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerBanOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.setPlayerBan.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, secretInfo.getGameId(), request.tsExpire, request.reason, operationRequest);
    }

    private async execute(userId: string, gameId: string, tsExpire: number, reason: string, operationRequest: OperationRequest): Promise<OperationResponse> {
		let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerBan: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);

		if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        gamePlayer.setPlayerBan(tsExpire, reason);
        gamePlayer.saveAsync();
        
		operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.Ok);
		return operationResponse;
    }
}
