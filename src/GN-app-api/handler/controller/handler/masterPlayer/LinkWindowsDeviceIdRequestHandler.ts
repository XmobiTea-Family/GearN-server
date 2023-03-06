import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class LinkWindowsDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@StringDataMember({ code: GNParameterCode.WindowsDeviceId, minLength: 6, maxLength: 64, mustNonNull: true })
	windowsDeviceId: string;

	@BooleanDataMember({ code: GNParameterCode.ForceLink, isOptional: true, defaultValue: false })
	forceLink?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkWindowsDeviceIdOperationRequest extends LinkWindowsDeviceIdOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkWindowsDeviceIdOperationRequest extends ServerLinkWindowsDeviceIdOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkWindowsDeviceIdRequestHandler extends MasterPlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.LinkWindowsDeviceId;
	}

	public override getCommonOperationRequest() {
		return LinkWindowsDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.linkWindowsDeviceId.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.linkWindowsDeviceId.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.linkWindowsDeviceId.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			windowsDeviceId: request.windowsDeviceId,
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkWindowsDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkWindowsDeviceId.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			windowsDeviceId: request.windowsDeviceId,
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkWindowsDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkWindowsDeviceId.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			windowsDeviceId: request.windowsDeviceId,
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, windowsDeviceId: string, forceLink: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkWindowsDeviceId", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			external: true,
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		let external = masterPlayer.getExternal();
		if (external.device != null && external.device.windowsDeviceId != null && !request.forceLink) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExternalLinkedOtherValue);
			return operationResponse;
		}

		let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByWindowsDeviceIdAsync(request.windowsDeviceId, masterPlayerFindOptions);
		if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
			if (!request.forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExternalLinkedOtherAccount);
				return operationResponse;
			}

			let otherExternal = otherMasterPlayer.getExternal();
			otherExternal.device.windowsDeviceId = null;

			otherMasterPlayer.setExternal(otherExternal);
			otherMasterPlayer.saveAsync();
		}

		if (external.device == null) external.device = {};

		external.device.windowsDeviceId = request.windowsDeviceId;
		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(GNParameterCode.External, this.generateExternal(masterPlayer));
		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkWindowsDeviceId", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
