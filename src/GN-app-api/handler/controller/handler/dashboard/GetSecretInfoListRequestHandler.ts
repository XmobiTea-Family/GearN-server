import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { SecretInfoItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";

class GetSecretInfoListOperationRequest extends OperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetSecretInfoListRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetSecretInfoList;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetSecretInfoListOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.getSecretInfoList.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetSecretInfoList", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ type: "secretInfo" }, { secretKey: true, role: true } as any);

		// Stores the GearN admin secret keys value used in the current execution flow.
		let gnAdminSecretKeys = new GNArray();
		// Stores the GearN server secret keys value used in the current execution flow.
		let gnServerSecretKeys = new GNArray();
		// Stores the GearN player secret keys value used in the current execution flow.
		let gnPlayerSecretKeys = new GNArray();

		while (await results.hasNext()) {
			// Stores the secret info item value used in the current execution flow.
			let secretInfoItem = new SecretInfoItem(await results.next(), collection);

			// Stores the GearN secret info item value used in the current execution flow.
			let gnSecretInfoItem = new GNHashtable();
			gnSecretInfoItem.add(ParameterCode.SecretKey, secretInfoItem.getSecretKey());

			// Stores the role value used in the current execution flow.
			let role = <SecretRole>secretInfoItem.getRole();
			if (role == SecretRole.Admin) gnAdminSecretKeys.add(gnSecretInfoItem);
			else if (role == SecretRole.Server) gnServerSecretKeys.add(gnSecretInfoItem);
			else gnPlayerSecretKeys.add(gnSecretInfoItem);
		}

		operationResponse.setParameter(ParameterCode.AdminSecretKeys, gnAdminSecretKeys);
		operationResponse.setParameter(ParameterCode.ServerSecretKeys, gnServerSecretKeys);
		operationResponse.setParameter(ParameterCode.PlayerSecretKeys, gnPlayerSecretKeys);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetSecretInfoList", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
