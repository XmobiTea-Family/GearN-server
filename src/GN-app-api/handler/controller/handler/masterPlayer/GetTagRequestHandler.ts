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

class GetTagOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.TagKeys })
	tagKeys: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetTagOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.TagKeys })
	tagKeys: GNArray;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetTagOperationRequest extends ServerGetTagOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetTagRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetTag;
	}

	public override getCommonOperationRequest() {
		return GetTagOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.getTag.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.getTag.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

        return this.execute(request.userId, request.tagKeys, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getTag.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.tagKeys, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getTag.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.tagKeys, operationRequest);
    }

    private async execute(userId: string, tagKeys: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
            tags: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let tags = masterPlayer.getAllTags();
        let gnTags = new GNArray();
        tags.forEach((value: string | number | boolean, key: string) => {
            if (tagKeys.indexOf(key) != -1) {
                let gnTag = new GNHashtable();

                gnTag.add(MasterPlayerParameterCode.Key, key);
                gnTag.add(MasterPlayerParameterCode.Value, value);
    
                gnTags.add(gnTag);
            }
        });
        gnInfoGetParameters.add(MasterPlayerParameterCode.Tags, gnTags);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
