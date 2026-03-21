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

class ChangePasswordAdminAccountOperationRequest extends OperationRequest {

	// Stores the current password value used by this instance.
	@StringDataMember({ code: ParameterCode.CurrentPassword, minLength: 6, maxLength: 64, mustNonNull: true })
	public currentPassword: string;

	// Stores the password value used by this instance.
	@StringDataMember({ code: ParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	public password: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangePasswordAdminAccountRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ChangePasswordAdminAccount;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ChangePasswordAdminAccountOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterAdmin.changePasswordAdminAccount.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			currentPassword: request.currentPassword,
			password: request.password,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, currentPassword: string, password: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_ChangePasswordAdminAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "account", userId: request.userId });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
			return operationResponse;
		}

		// Stores the master admin player value used in the current execution flow.
		let masterAdminPlayer = new MasterAdminPlayer(result, collection);

		// Stores the password value used in the current execution flow.
		let password = masterAdminPlayer.getPassword();

		// Tracks whether match.
		let isMatch = await bcrypt.compare(request.currentPassword, password);

		if (!isMatch) {
			if (this.gnServer.getRestoreRootPassword() != request.currentPassword) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
				return operationResponse;
			}
		}

		masterAdminPlayer.setPassword(await bcrypt.hash(request.password, 10));
		masterAdminPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_ChangePasswordAdminAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
