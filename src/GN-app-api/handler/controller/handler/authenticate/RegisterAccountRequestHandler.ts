import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { AuthenticateParameterCode } from "./../../../../../GN-common/constant/parameterCode/AuthenticateParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { AuthenticateErrorCode } from "../../../../../GN-common/constant/errorCode/AuthenticateErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

import bcrypt from "bcrypt";

class RegisterAccountOperationRequest extends OperationRequest {
	@StringDataMember({ code: AuthenticateParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	username: string;

	@StringDataMember({ code: AuthenticateParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	password: string;

	@GNHashtableDataMember({ code: AuthenticateParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
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

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);
		
		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoGetParameters);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByAccountUsernameAsync(request.username.toLowerCase(), masterPlayerFindOptions);

		if (masterPlayer != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.AccountUsernameExists);

			return operationResponse;
		}

		let password = request.password;
		let passwordHash = await bcrypt.hash(password, 10);
		
		let newMasterPlayerResult = this.generateNewMasterPlayerResult((request as any).originRequest.getIP());
		newMasterPlayerResult["external"]["account"] = {
			"username": request.username.toLowerCase(),
			"password": passwordHash,
		}

		masterPlayer = await this.gnServer.getDatabase().createMasterPlayerAsync(newMasterPlayerResult);

		operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.Ok);

        operationResponse.setParameter(AuthenticateParameterCode.UserId, masterPlayer.getUserId());
        operationResponse.setParameter(AuthenticateParameterCode.InfoGetParameters, this.generateMasterPlayerOperationResponse(masterPlayer, masterPlayerFindOptions, request.infoGetParameters));
		operationResponse.setParameter(AuthenticateParameterCode.NewlyCreated, true);

        masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
        masterPlayer.saveAsync();

		this.setupAuthInfo(operationResponse, masterPlayer);

		return operationResponse;
	}
}
