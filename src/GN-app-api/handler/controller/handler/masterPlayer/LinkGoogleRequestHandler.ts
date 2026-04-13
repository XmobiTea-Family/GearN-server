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
import { GoogleLoginType } from "./../../../../../GN-common/constant/enumType/GoogleLoginType";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class LinkGoogleOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the token value used by this instance.
	@StringDataMember({ code: ParameterCode.Token, minLength: 32, maxLength: 2048, mustNonNull: true })
	public token: string;

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, minValue: 1, maxValue: 2 })
	public type: number;

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

class ServerLinkGoogleOperationRequest extends LinkGoogleOperationRequest {

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

class AdminLinkGoogleOperationRequest extends ServerLinkGoogleOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkGoogleRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.LinkGoogle;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return LinkGoogleOperationRequest;
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
			if (!secretInfo.getPermission().masterPlayer.linkGoogle.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.linkGoogle.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.linkGoogle.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			token: request.token,
			googleLoginType: <GoogleLoginType>request.type,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkGoogleOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkGoogle.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			token: request.token,
			googleLoginType: <GoogleLoginType>request.type,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkGoogleOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkGoogle.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			token: request.token,
			googleLoginType: <GoogleLoginType>request.type,
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
	private async execute(request: { userId: string, token: string, googleLoginType: GoogleLoginType, forceLink: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkGoogle", request, secretInfo, operationRequest);
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
		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		// Stores the external value used in the current execution flow.
		let external = masterPlayer.getExternal();
		if (external.google != null && external.google.googleId != null && !request.forceLink) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherValue);
			return operationResponse;
		}

		// Stores the result value used in the current execution flow.
		let result = request.googleLoginType == GoogleLoginType.AccessToken ? await this.gnServer.getGoogleService().verifyGoogleTokenViaAccessToken(request.token) : request.googleLoginType == GoogleLoginType.IdToken ? await this.gnServer.getGoogleService().verifyGoogleTokenViaIdToken(request.token) : { "error": "Invalid GoogleLoginType" };

		if (result["error"] != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VerifyTokenError);
			return operationResponse;
		}

		// Stores the google user ID value used in the current execution flow.
		let googleUserId = result["sub"];
		// Stores the display name value used in the current execution flow.
		let displayName = result["name"] ?? "";
		// Stores the email value used in the current execution flow.
		let email = result["email"] ?? "";

		// Stores the other master player value used in the current execution flow.
		let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByGoogleAsync(googleUserId, masterPlayerFindOptions);
		if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
			if (!request.forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherAccount);
				return operationResponse;
			}

			// Stores the other external value used in the current execution flow.
			let otherExternal = otherMasterPlayer.getExternal();
			otherExternal.google = null;

			otherMasterPlayer.setExternal(otherExternal);
			otherMasterPlayer.saveAsync();
		}

		external.google = {
			googleId: googleUserId,
			displayName: displayName,
			email: email
		};
		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkGoogle", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
