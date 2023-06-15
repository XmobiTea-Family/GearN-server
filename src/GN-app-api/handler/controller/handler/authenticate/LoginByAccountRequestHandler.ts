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

import bcrypt from "bcrypt";
import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";

class LoginByAccountOperationRequest extends OperationRequest {
	@StringDataMember({ code: AuthenticateParameterCode.Username, minLength: 6, maxLength: 128, mustNonNull: true })
	username: string;

	@StringDataMember({ code: AuthenticateParameterCode.Password, minLength: 6, maxLength: 128, mustNonNull: true })
	password: string;

	@GNHashtableDataMember({ code: AuthenticateParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
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

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoGetParameters);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByAccountUsernameAsync(request.username, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.PlayerDoesNotExists);

			return operationResponse;
		}

		let isMatch = await bcrypt.compare(request.password, masterPlayer.getPassword());

		if (!isMatch) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.AccountPasswordWrong);

			return operationResponse;
		}

        operationResponse.setParameter(AuthenticateParameterCode.UserId, masterPlayer.getUserId());
        operationResponse.setParameter(AuthenticateParameterCode.InfoGetParameters, this.generateMasterPlayerOperationResponse(masterPlayer, masterPlayerFindOptions, request.infoGetParameters));
        
		this.setupAuthInfo(operationResponse, masterPlayer);

        masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
        masterPlayer.saveAsync();

		return operationResponse;
	}
}


