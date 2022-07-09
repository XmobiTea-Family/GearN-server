import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { GNArray } from "./../../../../GN-common/common/GNData";
import { GetAppConfigParameterCode } from "./../../../../GN-common/constant/parameterCode/GetAppConfigParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { GetAppConfigErrorCode } from "./../../../../GN-common/constant/errorCode/GetAppConfigErrorCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class GetAppConfigOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: GetAppConfigParameterCode.ConfigTypes, mustNonNull: true, minLength: 1 })
	configTypes: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetAppConfigRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.GetAppConfig;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, GetAppConfigOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setScriptData(ParameterCode.ErrorCode, GetAppConfigErrorCode.Ok);

		let configNotUptodateLst: string[] = [];

		let configGame = this.gameApplication.getConfigGame();

		let configTypes = request.configTypes;

		for (let i = 0; i < configTypes.count(); i++) {
			let configType = configTypes.getGNArray(i);

			let configName = configType.getString(0);
			let config = configGame.getConfig(configName);

			if (config != null) {
				let configVersion = configType.getNumber(1);
				if (configVersion < config.getVersion()) {
					configNotUptodateLst.push(configName);
				}
			}
		}

		operationResponse.setScriptData(GetAppConfigParameterCode.ConfigNotUptodateLst, configNotUptodateLst);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse);
		}

		return operationResponse;
	}
}
