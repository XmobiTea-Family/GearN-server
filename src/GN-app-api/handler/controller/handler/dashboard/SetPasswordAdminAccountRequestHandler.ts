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

class SetPasswordAdminAccountOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public userId: string;

	@StringDataMember({ code: ParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	public password: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPasswordAdminAccountRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.SetPasswordAdminAccount;
	}

	public override getCommonOperationRequest() {
		return SetPasswordAdminAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.setPasswordAdminAccount.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			password: request.password,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, password: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetPasswordAdminAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "account", userId: request.userId });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
			return operationResponse;
		}

		let masterAdminPlayer = new MasterAdminPlayer(result, collection);
		masterAdminPlayer.setPassword(await bcrypt.hash(request.password, 10));
		masterAdminPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetPasswordAdminAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
