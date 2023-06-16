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

class SetPlayerBanOperationRequest extends OperationRequest {
    @NumberDataMember({ code: MasterPlayerParameterCode.TsExpire })
	tsExpire: number;

    @StringDataMember({ code: MasterPlayerParameterCode.Reason, isOptional: true })
	reason: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerBanOperationRequest extends SetPlayerBanOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
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

		if (!secretInfo.getPermission().masterPlayer.setPlayerBan.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(authInfo.getUserId(), request.tsExpire, request.reason, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerBanOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPlayerBan.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.tsExpire, request.reason, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerBanOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPlayerBan.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.tsExpire, request.reason, operationRequest);
    }

    private async execute(userId: string, tsExpire: number, reason: string, operationRequest: OperationRequest): Promise<OperationResponse> {
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerBan: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        masterPlayer.setPlayerBan(tsExpire, reason);
        masterPlayer.saveAsync();
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
