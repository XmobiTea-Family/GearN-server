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

class SetScriptDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: MasterPlayerParameterCode.ScriptData, minLength: 1, maxLength: 32, mustNonNull: true })
	scriptData: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetScriptDataOperationRequest extends SetScriptDataOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
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

		if (!secretInfo.getPermission().masterPlayer.setPrivateData.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), request.scriptData, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetScriptDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPrivateData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.scriptData, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetScriptDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPrivateData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.scriptData, operationRequest);
    }

    private async execute(userId: string, scriptData: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            scriptData: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        for (let i = 0; i < scriptData.count(); i++) {
            let gnHashtable = scriptData.getGNHashtable(i);

            let key = gnHashtable.getString(MasterPlayerParameterCode.Key);
            let value = gnHashtable.getObject(MasterPlayerParameterCode.Value);
    
            if (value == null) {
                masterPlayer.removeScriptData(key);
            }
            else {
                masterPlayer.setScriptData(key, value as any);
            }
        }

		masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
