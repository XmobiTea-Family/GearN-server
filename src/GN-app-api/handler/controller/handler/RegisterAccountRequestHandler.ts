import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { LoginParameterCode } from "./../../../../GN-common/constant/parameterCode/LoginParameterCode";
import { LoginErrorCode } from "./../../../../GN-common/constant/errorCode/LoginErrorCode";
import { LoginOperationRequest, LoginRequestHandler } from "./LoginRequestHandler";

import bcrypt from "bcrypt";
import { LoginType } from "./../../../../GN-common/constant/enumType/LoginType";
import { DataMember } from "./../../../service/RequestConverterService";

class RegisterAccountOperationRequest extends OperationRequest {
	@DataMember(LoginParameterCode.Username)
	username: string;

	@DataMember(LoginParameterCode.Password)
	password: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		if (!this.username) return false;
		if (!this.password) return false;

		return true;
	}
}

export class RegisterAccountRequestHandler extends LoginRequestHandler {
	public getCode() {
		return OperationCode.RegisterAccount;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, RegisterAccountOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (this.gameApplication.getLoginTypeEnables().indexOf(LoginType.Account) == -1) {
			return this.newOperationInvalid(request);
		}

		let username = request.username.toLowerCase();
		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByUsername(username);

		if (sparkPlayer) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.UserDoesExists);

			return operationResponse;
		}

		let password = request.password;
		let passwordHash = await bcrypt.hash(password, 10);

		sparkPlayer = await this.gameApplication
			.getDatabase()
			.createPlayerByUsernameAndPassword(username, passwordHash, this.DefaultSegments, request.getOriginRequest().getIP());
		if (!sparkPlayer) return this.newOperationInternalServerError(request);

		(request as any).isRegisterRequest = true;

		return await this.onAuthenticationResponse(authInfo, request as LoginOperationRequest, sparkPlayer);
	}
}
