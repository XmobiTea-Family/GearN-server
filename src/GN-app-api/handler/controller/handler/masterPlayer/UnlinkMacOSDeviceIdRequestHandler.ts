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

class UnlinkMacOSDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@StringDataMember({ code: GNParameterCode.MacOSDeviceId, minLength: 6, maxLength: 64, mustNonNull: true })
	macOSDeviceId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerUnlinkMacOSDeviceIdOperationRequest extends UnlinkMacOSDeviceIdOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminUnlinkMacOSDeviceIdOperationRequest extends ServerUnlinkMacOSDeviceIdOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class UnlinkMacOSDeviceIdRequestHandler extends MasterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.UnlinkMacOSDeviceId;
	}

	public override getCommonOperationRequest() {
		return UnlinkMacOSDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.unlinkMacOSDeviceId.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.unlinkMacOSDeviceId.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.unlinkMacOSDeviceId.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			macOSDeviceId: request.macOSDeviceId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerUnlinkMacOSDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.unlinkMacOSDeviceId.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			macOSDeviceId: request.macOSDeviceId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminUnlinkMacOSDeviceIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.unlinkMacOSDeviceId.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			macOSDeviceId: request.macOSDeviceId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, macOSDeviceId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_UnlinkMacOSDeviceId", request, secretInfo, operationRequest);
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
		if (external.device == null || external.device.macOSDeviceId != request.macOSDeviceId) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExternalNotLinked);
			return operationResponse;
		}

		external.device.macOSDeviceId = null;
		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_UnlinkMacOSDeviceId", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
