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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { InfoRequestParam } from "./model/InfoRequestParam";

class LoginByGameCenterOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.PlayerId, minLength: 2, maxLength: 64, mustNonNull: true })
	public playerId: string;

	@StringDataMember({ code: ParameterCode.Name, minLength: 2, maxLength: 128, mustNonNull: true })
	public name: string;

	@StringDataMember({ code: ParameterCode.PublicKeyUrl, minLength: 2, maxLength: 2048, mustNonNull: true })
	public publicKeyUrl: string;

	@StringDataMember({ code: ParameterCode.Signature, minLength: 2, maxLength: 2048, mustNonNull: true })
	public signature: string;

	@StringDataMember({ code: ParameterCode.Salt, minLength: 2, maxLength: 256, mustNonNull: true })
	public salt: string;

	@NumberDataMember({ code: ParameterCode.Timestamp })
	public timestamp: number;

	@BooleanDataMember({ code: ParameterCode.CreatePlayerIfNotExists, isOptional: true, defaultValue: false })
	public createPlayerIfNotExists?: boolean;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByGameCenterRequestHandler extends LoginBaseRequestHandler {

	public override getCode() {
		return OperationCode.LoginByGameCenter;
	}

	public override getCommonOperationRequest() {
		return LoginByGameCenterOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().authenticate.loginByGameCenter.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);

		return this.execute({
			playerId: request.playerId,
			name: request.name,
			publicKeyUrl: request.publicKeyUrl,
			signature: request.signature,
			salt: request.salt,
			timestamp: request.timestamp,
			createPlayerIfNotExists: request.createPlayerIfNotExists,
			infoRequestParam: request.infoRequestParam,
			ipAddress: (request as any).originRequest.getIP(),
		}, secretInfo, operationRequest);
	}

	private async execute(request: { playerId: string, name: string, publicKeyUrl: string, signature: string, salt: string, timestamp: number, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_LoginByGameCenter", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let result = await this.gnServer.getGameCenterService().verifyToken({
			playerId: request.playerId,
			name: request.name,
			publicKeyUrl: request.publicKeyUrl,
			salt: request.salt,
			signature: request.signature,
			timestamp: request.timestamp,
		});

		if (result["error"] != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VerifyTokenError);
			return operationResponse;
		}

		let playerId = result["playerId"];
		let displayName = result["name"] ?? "";
		let email = result["email"] ?? "";

		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);
		if (masterPlayerFindOptions != null) {
			masterPlayerFindOptions.lastIPDetail = true;
			masterPlayerFindOptions.external = true;
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByGameCenterAsync(playerId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			if (!request.createPlayerIfNotExists) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);

				return operationResponse;
			}
			else {
				let newMasterPlayerResult = this.generateNewMasterPlayerResult(request.ipAddress);
				newMasterPlayerResult["external"]["gameCenter"] = {
					"playerId": playerId,
					"displayName": displayName,
					"email": email,
				}

				let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
				if (ipDetailResponse.statusCode == "Ok") {
					if (ipDetailResponse.detail.countryCode) {
						newMasterPlayerResult["countryCode"] = ipDetailResponse.detail.countryCode;
					}

					let lastIPDetail = newMasterPlayerResult["lastIPDetail"];
					lastIPDetail.countryCode = ipDetailResponse.detail.countryCode ?? "Unknown";
					lastIPDetail.regionCode = ipDetailResponse.detail.regionCode ?? "Unknown";

					this.gnServer.getCountryIPDetailService().updateUserIP(newMasterPlayerResult["userId"], request.ipAddress, null, null, lastIPDetail.countryCode, lastIPDetail.regionCode);
				}

				masterPlayer = await this.gnServer.getDatabase().createMasterPlayerAsync(newMasterPlayerResult);
				operationResponse.setParameter(ParameterCode.NewlyCreated, true);
			}
		}
		else {
			let lastIPDetail = masterPlayer.getLastIPDetail();
			if (lastIPDetail.ipAddress != request.ipAddress) {
				lastIPDetail.ipAddress = lastIPDetail.ipAddress;

				let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
				if (ipDetailResponse.statusCode == "Ok") {
					lastIPDetail.countryCode = ipDetailResponse.detail.countryCode ?? "Unknown";
					lastIPDetail.regionCode = ipDetailResponse.detail.regionCode ?? "Unknown";

					this.gnServer.getCountryIPDetailService().updateUserIP(masterPlayer.getUserId(), request.ipAddress, null, null, lastIPDetail.countryCode, lastIPDetail.regionCode);
				}

				masterPlayer.setLastIPDetail(lastIPDetail);
			}

			let external = masterPlayer.getExternal();
			external.gameCenter.displayName = displayName;
			external.gameCenter.email = email;
			masterPlayer.setExternal(external);

			masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			masterPlayer.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		operationResponse.setParameter(ParameterCode.UserId, masterPlayer.getUserId());
		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

		this.setupAuthInfo(operationResponse, masterPlayer, secretInfo);

		await this.gnServer.getPostEventCallbackService().onAuthenticateEvent("system_OnAuthenticateSuccess", {
			authenticationType: "loginByGameCenter",
			userId: masterPlayer.getUserId(),
			ipAddress: request.ipAddress,
			isNewUser: operationResponse.getParameters().getBoolean(ParameterCode.NewlyCreated, false),
		}, secretInfo, operationRequest, operationResponse);

		await this.gnServer.getPostEventCallbackService().onEvent("authenticate_LoginByGameCenter", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
