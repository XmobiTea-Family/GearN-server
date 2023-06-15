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

class LinkAndroidDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: MasterPlayerParameterCode.AndroidDeviceId, minLength: 8, maxLength: 64, mustNonNull: true })
	androidDeviceId: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkAndroidDeviceIdOperationRequest extends LinkAndroidDeviceIdOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkAndroidDeviceIdOperationRequest extends ServerLinkAndroidDeviceIdOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkAccountRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.LinkAndroidDeviceId;
	}

	public override getCommonOperationRequest() {
		return LinkAndroidDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        return this.execute(authInfo.getUserId(), request.androidDeviceId, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkAndroidDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        return this.execute(request.userId, request.androidDeviceId, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkAndroidDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        return this.execute(request.userId, request.androidDeviceId, operationRequest);
    }

    private async execute(userId: string, androidDeviceId: string, operationRequest: OperationRequest): Promise<OperationResponse> {
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            external: true
        }

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByCustomIdAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            return this.newOperationInternalServerError(operationRequest);
		}

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

        let external = masterPlayer.getExternal();
        if (external.device != null && external.device.androidDeviceId != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.ExternalLinked);
            return operationResponse;
        }

        let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByAndroidDeviceIdAsync(androidDeviceId, masterPlayerFindOptions);
        if (otherMasterPlayer != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.ExternalLinkedOtherPlayer);
            return operationResponse;
        }

        if (external.device == null) external.device = {};

        external.device.androidDeviceId = androidDeviceId;
        masterPlayer.setExternal(external);
        masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
