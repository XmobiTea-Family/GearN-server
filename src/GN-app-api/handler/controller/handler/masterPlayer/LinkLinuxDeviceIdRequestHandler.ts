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

class LinkLinuxDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: MasterPlayerParameterCode.LinuxDeviceId, minLength: 8, maxLength: 64, mustNonNull: true })
	linuxDeviceId: string;

	@BooleanDataMember({ code: MasterPlayerParameterCode.ForceLink, isOptional: true, defaultValue: false })
	forceLink: boolean;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkLinuxDeviceIdOperationRequest extends LinkLinuxDeviceIdOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkLinuxDeviceIdOperationRequest extends ServerLinkLinuxDeviceIdOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkLinuxDeviceIdRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.LinkLinuxDeviceId;
	}

	public override getCommonOperationRequest() {
		return LinkLinuxDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkLinuxDeviceId.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), request.linuxDeviceId, request.forceLink, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkLinuxDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkLinuxDeviceId.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.linuxDeviceId, request.forceLink, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkLinuxDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkLinuxDeviceId.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.linuxDeviceId, request.forceLink, operationRequest);
    }

    private async execute(userId: string, linuxDeviceId: string, forceLink: boolean, operationRequest: OperationRequest): Promise<OperationResponse> {
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            external: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        let external = masterPlayer.getExternal();
        if (external.device != null && external.device.linuxDeviceId != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.ExternalLinked);
            return operationResponse;
        }

        let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByLinuxDeviceIdAsync(linuxDeviceId, masterPlayerFindOptions);
        if (otherMasterPlayer != null) {
			if (!forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.ExternalLinkedOtherPlayer);
				return operationResponse;
			}

			let otherExternal = otherMasterPlayer.getExternal();
			otherExternal.device.linuxDeviceId = null;

			otherMasterPlayer.setExternal(otherExternal);
			otherMasterPlayer.saveAsync();
        }

        if (external.device == null) external.device = {};

        external.device.linuxDeviceId = linuxDeviceId;
        masterPlayer.setExternal(external);
        masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
