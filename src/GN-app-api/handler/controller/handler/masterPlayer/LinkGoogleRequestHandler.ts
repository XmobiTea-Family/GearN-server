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

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.Token, minLength: 32, maxLength: 2048, mustNonNull: true })
	public token: string;

	@NumberDataMember({ code: ParameterCode.Type, minValue: 1, maxValue: 2 })
	public type: number;

	@BooleanDataMember({ code: ParameterCode.ForceLink, isOptional: true, defaultValue: false })
	public forceLink?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkGoogleOperationRequest extends LinkGoogleOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkGoogleOperationRequest extends ServerLinkGoogleOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkGoogleRequestHandler extends MasterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.LinkGoogle;
	}

	public override getCommonOperationRequest() {
		return LinkGoogleOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	private async execute(request: { userId: string, token: string, googleLoginType: GoogleLoginType, forceLink: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkGoogle", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			external: true,
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		let external = masterPlayer.getExternal();
		if (external.google != null && external.google.googleId != null && !request.forceLink) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherValue);
			return operationResponse;
		}

		let result = request.googleLoginType == GoogleLoginType.AccessToken ? await this.gnServer.getGoogleService().verifyGoogleTokenViaAccessToken(request.token) : request.googleLoginType == GoogleLoginType.IdToken ? await this.gnServer.getGoogleService().verifyGoogleTokenViaIdToken(request.token) : { "error": "Invalid GoogleLoginType" };

		if (result["error"] != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VerifyTokenError);
			return operationResponse;
		}

		let googleUserId = result["sub"];
		let displayName = result["name"] ?? "";
		let email = result["email"] ?? "";

		let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByGoogleAsync(googleUserId, masterPlayerFindOptions);
		if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
			if (!request.forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherAccount);
				return operationResponse;
			}

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

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkGoogle", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
