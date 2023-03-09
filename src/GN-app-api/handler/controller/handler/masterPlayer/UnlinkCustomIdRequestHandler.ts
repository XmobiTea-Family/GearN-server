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

class UnlinkCustomIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@StringDataMember({ code: GNParameterCode.CustomId, minLength: 6, maxLength: 64, mustNonNull: true })
	customId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerUnlinkCustomIdOperationRequest extends UnlinkCustomIdOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminUnlinkCustomIdOperationRequest extends ServerUnlinkCustomIdOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class UnlinkCustomIdRequestHandler extends MasterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.UnlinkCustomId;
	}

	public override getCommonOperationRequest() {
		return UnlinkCustomIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.unlinkCustomId.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.unlinkCustomId.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.unlinkCustomId.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			customId: request.customId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerUnlinkCustomIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.unlinkCustomId.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			customId: request.customId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminUnlinkCustomIdOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.unlinkCustomId.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			customId: request.customId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, customId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_UnlinkCustomId", request, secretInfo, operationRequest);
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
		if (external.custom == null || external.custom.customId != request.customId) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExternalNotLinked);
			return operationResponse;
		}

		external.custom = null;
		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_UnlinkCustomId", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
