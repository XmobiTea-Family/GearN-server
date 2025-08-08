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

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetSecretInfoListRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetSecretInfoList;
	}

	public override getCommonOperationRequest() {
		return GetSecretInfoListOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getSecretInfoList.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	private async execute(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetSecretInfoList", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let results = await collection.find({ type: "secretInfo" }, { secretKey: true, role: true } as any);

		let gnAdminSecretKeys = new GNArray();
		let gnServerSecretKeys = new GNArray();
		let gnPlayerSecretKeys = new GNArray();

		while (await results.hasNext()) {
			let secretInfoItem = new SecretInfoItem(await results.next(), collection);

			let gnSecretInfoItem = new GNHashtable();
			gnSecretInfoItem.add(ParameterCode.SecretKey, secretInfoItem.getSecretKey());

			let role = <SecretRole>secretInfoItem.getRole();
			if (role == SecretRole.Admin) gnAdminSecretKeys.add(gnSecretInfoItem);
			else if (role == SecretRole.Server) gnServerSecretKeys.add(gnSecretInfoItem);
			else gnPlayerSecretKeys.add(gnSecretInfoItem);
		}

		operationResponse.setParameter(ParameterCode.AdminSecretKeys, gnAdminSecretKeys);
		operationResponse.setParameter(ParameterCode.ServerSecretKeys, gnServerSecretKeys);
		operationResponse.setParameter(ParameterCode.PlayerSecretKeys, gnPlayerSecretKeys);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetSecretInfoList", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
