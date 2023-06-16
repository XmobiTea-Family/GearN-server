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

class SetAvatarOperationRequest extends OperationRequest {
    @NumberDataMember({ code: MasterPlayerParameterCode.Type })
	type: number;

    @NumberDataMember({ code: MasterPlayerParameterCode.Value })
	value: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetAvatarOperationRequest extends SetAvatarOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetAvatarOperationRequest extends ServerGetAvatarOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetAvatarRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetAvatar;
	}

	public override getCommonOperationRequest() {
		return SetAvatarOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.setAvatar.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(authInfo.getUserId(), request.type, request.value, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetAvatarOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setAvatar.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.type, request.value, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetAvatarOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setAvatar.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.type, request.value, operationRequest);
    }

    private async execute(userId: string, type: number, value: string, operationRequest: OperationRequest): Promise<OperationResponse> {
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
            avatar: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        masterPlayer.setAvatar(type, value);
        masterPlayer.saveAsync();
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
