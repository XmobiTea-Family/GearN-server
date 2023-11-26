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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

import bcrypt from "bcrypt";
import { InfoRequestParam } from "./model/InfoRequestParam";

class RegisterAccountOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	username: string;

	@StringDataMember({ code: GNParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	password: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RegisterAccountRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.RegisterAccount;
	}

	public override getCommonOperationRequest() {
		return RegisterAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().authenticate.registerAccount.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);

		return this.execute({
			username: request.username,
			password: request.password,
			infoRequestParam: request.infoRequestParam,
			ipAddress: (request as any).originRequest.getIP(),
		}, secretInfo, operationRequest);
	}

	private async execute(request: { username: string, password: string, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_RegisterAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByAccountUsernameAsync(request.username.toLowerCase(), masterPlayerFindOptions);

		if (masterPlayer != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountUsernameExists);

			return operationResponse;
		}

		let passwordHash = await bcrypt.hash(request.password, 10);

		let newMasterPlayerResult = this.generateNewMasterPlayerResult(request.ipAddress);
		newMasterPlayerResult["external"]["account"] = {
			"username": request.username.toLowerCase(),
			"password": passwordHash,
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

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		operationResponse.setParameter(GNParameterCode.UserId, masterPlayer.getUserId());
		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

		operationResponse.setParameter(GNParameterCode.NewlyCreated, true);

		masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
		masterPlayer.saveAsync();

		this.setupAuthInfo(operationResponse, masterPlayer, secretInfo);

		await this.gnServer.getPostEventCallbackService().onEvent("authenticate_RegisterAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
