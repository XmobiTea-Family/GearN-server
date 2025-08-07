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

class LoginByiOSDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.iOSDeviceId, minLength: 6, maxLength: 64, mustNonNull: true })
	iOSDeviceId: string;

	@BooleanDataMember({ code: ParameterCode.CreatePlayerIfNotExists, isOptional: true, defaultValue: false })
	createPlayerIfNotExists?: boolean;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByiOSDeviceIdRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.LoginByiOSDeviceId;
	}

	public override getCommonOperationRequest() {
		return LoginByiOSDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().authenticate.loginByiOSDeviceId.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);

		return this.execute({
			iOSDeviceId: request.iOSDeviceId,
			createPlayerIfNotExists: request.createPlayerIfNotExists,
			infoRequestParam: request.infoRequestParam,
			ipAddress: (request as any).originRequest.getIP(),
		}, secretInfo, operationRequest);
	}

	private async execute(request: { iOSDeviceId: string, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_LoginByiOSDeviceId", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);
		if (masterPlayerFindOptions != null) {
			masterPlayerFindOptions.lastIPDetail = true;
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByiOSDeviceIdAsync(request.iOSDeviceId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			if (!request.createPlayerIfNotExists) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);

				return operationResponse;
			}
			else {
				let newMasterPlayerResult = this.generateNewMasterPlayerResult(request.ipAddress);
				newMasterPlayerResult["external"]["device"] = {
					"iOSDeviceId": request.iOSDeviceId
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

			masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			masterPlayer.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		operationResponse.setParameter(ParameterCode.UserId, masterPlayer.getUserId());
		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

		this.setupAuthInfo(operationResponse, masterPlayer, secretInfo);

		await this.gnServer.getPostEventCallbackService().onAuthenticateEvent("system_OnAuthenticateSuccess", {
			authenticationType: "loginByiOSDeviceId",
			userId: masterPlayer.getUserId(),
			ipAddress: request.ipAddress,
			isNewUser: operationResponse.getParameters().getBoolean(ParameterCode.NewlyCreated, false),
		}, secretInfo, operationRequest, operationResponse);

		await this.gnServer.getPostEventCallbackService().onEvent("authenticate_LoginByiOSDeviceId", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
