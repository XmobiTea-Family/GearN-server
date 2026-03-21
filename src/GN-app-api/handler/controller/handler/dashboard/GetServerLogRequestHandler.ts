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

	// Stores the skip value used by this instance.
	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	// Stores the limit value used by this instance.
	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 50, minValue: 5, maxValue: 200, mustInt: true, isOptional: true })
	public limit?: number;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetServerLogRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetServerLog;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetServerLogOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.getServerLog.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ skip: request.skip, limit: request.limit }, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { skip: number; limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetServerLog", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the logs value used in the current execution flow.
		let logs: string[] = [];
		// Stores the file stream value used in the current execution flow.
		let fileStream = fs.createReadStream(Debug.getLogPath());

		// Stores the rl value used in the current execution flow.
		let rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity,
		});

		for await (const line of rl) {
			logs.push(line);
		}

		rl.close();

		// Stores the GearN logs value used in the current execution flow.
		let gnLogs = new GNArray();

		// Stores the remain skip value used in the current execution flow.
		let remainSkip = request.skip;
		// Stores the remain limit value used in the current execution flow.
		let remainLimit = request.limit;

		for (let i = logs.length - 1; i >= 0; i--) {
			if (remainSkip > 0) {
				remainSkip--;
			} else {
				remainLimit--;
				if (remainLimit > -1) {
					// Stores the log value used in the current execution flow.
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
