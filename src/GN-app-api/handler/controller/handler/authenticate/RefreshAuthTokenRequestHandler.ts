import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";

class RefreshAuthTokenOperationRequest extends OperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class RefreshAuthTokenRequestHandler extends LoginBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.RefreshAuthToken;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return RefreshAuthTokenOperationRequest;
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

		if (!secretInfo.getPermission().authenticate.refreshAuthToken.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_RefreshAuthToken", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			playerBan: true,
		}

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);

			return operationResponse;
		}

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// Stores the player ban value used in the current execution flow.
		let playerBan = masterPlayer.getPlayerBan();

		if (playerBan.tsExpire != 0 && (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds)) {
			operationResponse.setParameter(ParameterCode.PlayerBan, this.generatePlayerBan(masterPlayer));
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);

			masterPlayer.setTsLastLogin(currentMilliseconds);
			await masterPlayer.saveAsync();

			return operationResponse;
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

			// Stores the new auth info value used in the current execution flow.
			let newAuthInfo = await this.gnServer.getApiMiddleware().generateAuthInfo({
				gnToken: null,
				secretKey: secretInfo.getSecretKey(),
				userId: request.userId,
			});

			operationResponse.setParameter(ParameterCode.AuthToken, newAuthInfo.getAuthToken());
		}

		masterPlayer.setTsLastLogin(currentMilliseconds);
		await masterPlayer.saveAsync();

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("revokeAuthToken", {
			userId: request.userId,
		});

		await this.gnServer.getPostEventCallbackService().onEvent("authenticate_RefreshAuthToken", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
