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
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { NumberDataMember } from "./../../../../../GN-common/entity/DataMember";
import fs from "fs";
import readline from "readline";

class GetServerLogOperationRequest extends OperationRequest {
	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 50, minValue: 5, maxValue: 200, mustInt: true, isOptional: true })
	limit?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetServerLogRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetServerLog;
	}

	public override getCommonOperationRequest() {
		return GetServerLogOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getServerLog.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ skip: request.skip, limit: request.limit }, secretInfo, operationRequest);
	}

	private async execute(request: { skip: number; limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetServerLog", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let logs: string[] = [];
		let fileStream = fs.createReadStream(Debug.getLogPath());

		let rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});

		for await (const line of rl) {
			logs.push(line);
		}

		rl.close();

		let gnLogs = new GNArray();

		let remainSkip = request.skip;
		let remainLimit = request.limit;

		for (let i = logs.length - 1; i >= 0; i--) {
			if (remainSkip > 0) {
				remainSkip--;
			} else {
				remainLimit--;
				if (remainLimit > -1) {
					let log = logs[i];
					gnLogs.add(log);
				}
				else {
					break;
				}
			}
		}

		operationResponse.setParameter(ParameterCode.Results, gnLogs);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetServerLog", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
