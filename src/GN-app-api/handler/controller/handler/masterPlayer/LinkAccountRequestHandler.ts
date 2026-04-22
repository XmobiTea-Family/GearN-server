import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

import bcrypt from "bcrypt";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class LinkAccountOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Indicates whether rname should be used.
	@StringDataMember({ code: ParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	public username: string;

	// Stores the password value used by this instance.
	@StringDataMember({ code: ParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	public password: string;

	// Indicates whether force link.
	@BooleanDataMember({ code: ParameterCode.ForceLink, isOptional: true, defaultValue: false })
	public forceLink?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkAccountOperationRequest extends LinkAccountOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkAccountOperationRequest extends ServerLinkAccountOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkAccountRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.LinkAccount;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return LinkAccountOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.linkAccount.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.linkAccount.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.linkAccount.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			username: request.username,
			password: request.password,
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkAccountOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkAccount.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			username: request.username,
			password: request.password,
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkAccountOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkAccount.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			username: request.username,
			password: request.password,
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, username: string, password: string, forceLink: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			external: true,
			userId: true,
		}

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		// Stores the external value used in the current execution flow.
		let external = masterPlayer.getExternal();
		if (external.account != null && !request.forceLink) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherValue);
			return operationResponse;
		}

		// Stores the other master player value used in the current execution flow.
		let otherMasterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerByAccountUsernameAsync(request.username.toLowerCase(), masterPlayerFindOptions);
		if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
			if (!request.forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherAccount);
				return operationResponse;
			}

			// Stores the other external value used in the current execution flow.
			let otherExternal = otherMasterPlayer.getExternal();
			otherExternal.account = null;

			otherMasterPlayer.setExternal(otherExternal);
			otherMasterPlayer.saveAsync();
		}

		// Stores the password hash value used in the current execution flow.
		let passwordHash = await bcrypt.hash(request.password, 10);

		external.account = {
			username: request.username.toLowerCase(),
			password: passwordHash
		}
		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
