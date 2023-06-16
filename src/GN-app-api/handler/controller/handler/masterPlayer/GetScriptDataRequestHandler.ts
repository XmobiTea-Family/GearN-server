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
import { DataValueType } from "../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";

class GetScriptDataOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.ScriptDataKeys, isOptional: true })
	scriptDataKeys: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetScriptDataOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.ScriptDataKeys, isOptional: true })
	scriptDataKeys: GNArray;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetScriptDataOperationRequest extends ServerGetScriptDataOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetScriptDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetScriptData;
	}

	public override getCommonOperationRequest() {
		return GetScriptDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.getScriptData.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.getScriptData.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

        return this.execute(request.userId, request.scriptDataKeys, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetScriptDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getScriptData.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.scriptDataKeys, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetScriptDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getScriptData.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.scriptDataKeys, operationRequest);
    }

    private async execute(userId: string, scriptDataKeys: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
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

		let gnInfoGetParameters = new GNHashtable();
        let scriptDatas = masterPlayer.getAllScriptData();
        let gnScriptDatas = new GNArray();
        scriptDatas.forEach((value: DataValueType, key: string) => {
            if (scriptDataKeys == null || scriptDataKeys.indexOf(key) != -1) {
                let gnScriptData = new GNHashtable();

                gnScriptData.add(MasterPlayerParameterCode.Key, key);
                gnScriptData.add(MasterPlayerParameterCode.Value, value);
    
                gnScriptDatas.add(gnScriptData);
            }
        });
        gnInfoGetParameters.add(MasterPlayerParameterCode.ScriptData, gnScriptDatas);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
