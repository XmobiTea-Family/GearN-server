import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import bcrypt from "bcrypt";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterAdminPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";

class LoginByAdminAccountOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	public username: string;

	@StringDataMember({ code: ParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	public password: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByAdminAccountRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.LoginByAdminAccount;
	}

	public override getCommonOperationRequest() {
		return LoginByAdminAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		return this.execute({
			username: request.username,
			password: request.password,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { username: string, password: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_LoginByAdminAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "account", username: request.username });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
			return operationResponse;
		}

		let masterAdminPlayer = new MasterAdminPlayer(result, collection);

		let password = masterAdminPlayer.getPassword();

		let isMatch = await bcrypt.compare(request.password, password);

		if (!isMatch) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
			return operationResponse;
		}

		this.setupAuthInfo(operationResponse, masterAdminPlayer);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_LoginByAdminAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	private setupAuthInfo(operationResponse: OperationResponse, masterAdminPlayer: MasterAdminPlayer) {
		let userId = masterAdminPlayer.getUserId();

		let newAuthInfo = this.gnServer.getApiMiddleware().generateAuthInfo({
			secretKey: masterAdminPlayer.getSecretKey(),
			userId: userId,
			gnToken: null
		});

		operationResponse.setParameter(ParameterCode.AuthToken, newAuthInfo.getAuthToken());
	}
}
