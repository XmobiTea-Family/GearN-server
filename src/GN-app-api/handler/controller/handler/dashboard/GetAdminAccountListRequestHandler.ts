import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { MasterAdminPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

class GetAdminAccountListOperationRequest extends OperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetAdminAccountListRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.GetAdminAccountList;
	}

	public override getCommonOperationRequest() {
		return GetAdminAccountListOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterAdmin.getAdminAccountList.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({}, secretInfo, operationRequest);
	}

	private async execute(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetAdminAccountList", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let results = await collection.find({ type: "account" });

		let gnMasterAdminPlayers = new GNArray();

		while (await results.hasNext()) {
			let masterAdminPlayer = new MasterAdminPlayer(await results.next(), collection);

			let gnMasterAdminPlayer = new GNHashtable();

			gnMasterAdminPlayer.add(ParameterCode.UserId, masterAdminPlayer.getUserId());
			gnMasterAdminPlayer.add(ParameterCode.Username, masterAdminPlayer.getUsername());
			gnMasterAdminPlayer.add(ParameterCode.SecretKey, masterAdminPlayer.getSecretKey());

			gnMasterAdminPlayers.add(gnMasterAdminPlayer);
		}

		operationResponse.setParameter(ParameterCode.Results, gnMasterAdminPlayers);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetAdminAccountList", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
