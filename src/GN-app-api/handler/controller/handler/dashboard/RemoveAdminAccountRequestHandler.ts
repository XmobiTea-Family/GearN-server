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

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

class RemoveAdminAccountOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RemoveAdminAccountRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.RemoveAdminAccount;
	}

	public override getCommonOperationRequest() {
		return RemoveAdminAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.removeAdminAccount.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		if (authInfo.getUserId() == request.userId) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_RemoveAdminAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let thisUser = await collection.findOne({ type: "account", userId: request.userId });

		if (thisUser == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountNotFound);
			return operationResponse;
		}

		await collection.deleteOne({
			"type": "account",
			"userId": request.userId,
		});

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_RemoveAdminAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
