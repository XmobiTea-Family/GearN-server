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

class LinkMacOSDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: MasterPlayerParameterCode.MacOSDeviceId, minLength: 8, maxLength: 64, mustNonNull: true })
	macOSDeviceId: string;

	@BooleanDataMember({ code: MasterPlayerParameterCode.ForceLink, isOptional: true, defaultValue: false })
	forceLink: boolean;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkMacOSDeviceIdOperationRequest extends LinkMacOSDeviceIdOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkMacOSDeviceIdOperationRequest extends ServerLinkMacOSDeviceIdOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkMacOSDeviceIdRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.LinkMacOSDeviceId;
	}

	public override getCommonOperationRequest() {
		return LinkMacOSDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkMacOSDeviceId.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), request.macOSDeviceId, request.forceLink, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkMacOSDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkMacOSDeviceId.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.macOSDeviceId, request.forceLink, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkMacOSDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkMacOSDeviceId.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.macOSDeviceId, request.forceLink, operationRequest);
    }

    private async execute(userId: string, macOSDeviceId: string, forceLink: boolean, operationRequest: OperationRequest): Promise<OperationResponse> {
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
        if (external.device != null && external.device.macOSDeviceId != null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.ExternalLinked);
            return operationResponse;
        }

        let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByMacOSDeviceIdAsync(macOSDeviceId, masterPlayerFindOptions);
        if (otherMasterPlayer != null) {
			if (!forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.ExternalLinkedOtherPlayer);
				return operationResponse;
			}

			let otherExternal = otherMasterPlayer.getExternal();
			otherExternal.device.macOSDeviceId = null;

			otherMasterPlayer.setExternal(otherExternal);
			otherMasterPlayer.saveAsync();
        }

        if (external.device == null) external.device = {};

        external.device.macOSDeviceId = macOSDeviceId;
        masterPlayer.setExternal(external);
        masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
