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
import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class ChangeAccountPasswordOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

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

export class ChangeAccountPasswordRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ChangeAccountPassword;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ChangeAccountPasswordOperationRequest;
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

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.changeAccountPassword.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.changeAccountPassword.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.changeAccountPassword.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
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
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_ChangeAccountPassword", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			external: true,
		}

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		// Stores the external value used in the current execution flow.
		let external = masterPlayer.getExternal();
		if (external.account == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalNotLinked);
			return operationResponse;
		}

		// Tracks whether match.
		let isMatch = await bcrypt.compare(request.currentPassword, masterPlayer.getPassword());

		if (!isMatch) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountPasswordWrong);
			return operationResponse;
		}

		external.account.password = await bcrypt.hash(request.password, 10);

		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_ChangeAccountPassword", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
