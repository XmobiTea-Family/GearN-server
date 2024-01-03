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

import bcrypt from "bcrypt";
import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { InfoRequestParam } from "./model/InfoRequestParam";

class LoginByAccountOperationRequest extends OperationRequest {
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

export class LoginByAccountRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.LoginByAccount;
	}

	public override getCommonOperationRequest() {
		return LoginByAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().authenticate.loginByAccount.selfEnable) {
			return this.newOperationNotAllowError(operationRequest);
		}

		this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);

		return this.execute({
			username: request.username,
			password: request.password,
			infoRequestParam: request.infoRequestParam,
			ipAddress: (request as any).originRequest.getIP(),
		}, secretInfo, operationRequest);
	}

	private async execute(request: { username: string, password: string, infoRequestParam: InfoRequestParam, ipAddress: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_LoginByAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);
		if (masterPlayerFindOptions != null) {
			masterPlayerFindOptions.lastIPDetail = true;
            masterPlayerFindOptions.external = true;
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByAccountUsernameAsync(request.username.toLowerCase(), masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountNotFound);
			return operationResponse;
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

		let isMatch = await bcrypt.compare(request.password, masterPlayer.getExternal().account.password);

		if (!isMatch) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountPasswordWrong);

			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		operationResponse.setParameter(GNParameterCode.UserId, masterPlayer.getUserId());
		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

		this.setupAuthInfo(operationResponse, masterPlayer, secretInfo);

		await this.gnServer.getPostEventCallbackService().onEvent("authenticate_LoginByAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
