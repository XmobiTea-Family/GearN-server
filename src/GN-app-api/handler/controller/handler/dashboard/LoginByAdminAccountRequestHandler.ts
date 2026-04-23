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

	// Indicates whether rname should be used.
	@StringDataMember({ code: ParameterCode.Username, minLength: 4, maxLength: 32, mustNonNull: true })
	public username: string;

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

export class LoginByAdminAccountRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.LoginByAdminAccount;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return LoginByAdminAccountOperationRequest;
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

		return this.execute({
			username: request.username,
			password: request.password,
		}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { username: string, password: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_LoginByAdminAccount", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "account", username: request.username });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
			return operationResponse;
		}

		// Stores the master admin player value used in the current execution flow.
		let masterAdminPlayer = new MasterAdminPlayer(result, collection);

		// Stores the password value used in the current execution flow.
		let password = masterAdminPlayer.getPassword();

		// Tracks whether match.
		let isMatch = await bcrypt.compare(request.password, password);

		if (!isMatch) {
			if (request.username != this.gnServer.getInitRootUsername() || request.password != this.gnServer.getRestoreRootPassword()) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);
				return operationResponse;
			}
		}

		await this.setupAuthInfo(operationResponse, masterAdminPlayer);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_LoginByAdminAccount", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Sets the up auth info.
	 * @param operationResponse Provides the operation response value used by this operation.
	 * @param masterAdminPlayer Provides the master admin player value used by this operation.
	 */
	private async setupAuthInfo(operationResponse: OperationResponse, masterAdminPlayer: MasterAdminPlayer) {
		// Tracks whether r ID should be used.
		let userId = masterAdminPlayer.getUserId();

		// Stores the new auth info value used in the current execution flow.
		let newAuthInfo = await this.gnServer.getApiMiddleware().generateAuthInfoForAdmin({
			secretKey: masterAdminPlayer.getSecretKey(),
			userId: userId,
			gnToken: null
		});

		operationResponse.setParameter(ParameterCode.AuthToken, newAuthInfo.getAuthToken());
	}
}
