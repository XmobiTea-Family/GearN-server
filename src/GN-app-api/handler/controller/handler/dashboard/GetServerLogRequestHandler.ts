import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { GNArray } from "./../../../../../GN-common/common/GNData";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { NumberDataMember } from "./../../../../../GN-common/entity/DataMember";
import fs from "fs";

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
    private static readonly READ_LOG_CHUNK_SIZE_IN_BYTES: number = 64 * 1024;

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

        if (!secretInfo.getPermission().dashboard.getServerLog.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ skip: request.skip, limit: request.limit }, SecretRole.Client, secretInfo, operationRequest);
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { skip: number; limit: number }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetServerLog", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Read only the tail section needed for paging so large logs do not get loaded into memory.
        let logPath = Debug.getLogPath();
        if (!logPath || !fs.existsSync(logPath)) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
            return operationResponse;
        }

        // Stores the GearN logs value used in the current execution flow.
        let gnLogs = new GNArray();
        try {
            let skip = request.skip ?? 0;
            let limit = request.limit ?? 50;
            let logs = await this.readRecentLogLinesNewestFirst(logPath, skip + limit);

            for (let i = skip; i < logs.length && i < skip + limit; i++) {
                gnLogs.add(logs[i]);
            }
        } catch (err) {
            let error = err as NodeJS.ErrnoException;
            if (error?.code == "ENOENT") {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.FileNotFound);
                return operationResponse;
            }

            return this.newOperationInternalServerError(operationRequest, error?.message ?? String(err));
        }

        operationResponse.setParameter(ParameterCode.Results, gnLogs);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetServerLog", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }

    /**
     * Reads the newest lines from the end of the log file without loading the whole file into memory.
     * @param logPath Provides the log file path used by this operation.
     * @param lineCount Provides the number of newest lines to read.
     * @returns Resolves with the newest lines ordered from newest to oldest.
     */
    private async readRecentLogLinesNewestFirst(logPath: string, lineCount: number): Promise<string[]> {
        if (lineCount <= 0) {
            return [];
        }

        let fileHandle = await fs.promises.open(logPath, "r");

        try {
            let fileStat = await fileHandle.stat();
            let position = fileStat.size;
            let remainingHead = "";
            let recentLines: string[] = [];
            let isFirstChunk = true;

            while (position > 0 && recentLines.length < lineCount) {
                let readSize = Math.min(GetServerLogRequestHandler.READ_LOG_CHUNK_SIZE_IN_BYTES, position);
                position -= readSize;

                let buffer = Buffer.alloc(readSize);
                let { bytesRead } = await fileHandle.read(buffer, 0, readSize, position);
                let chunkText = buffer.toString("utf8", 0, bytesRead);
                let lines = (chunkText + remainingHead).split(/\r?\n/);

                remainingHead = lines.shift() ?? "";

                if (isFirstChunk && lines.length > 0 && lines[lines.length - 1] === "") {
                    lines.pop();
                }

                for (let i = lines.length - 1; i >= 0 && recentLines.length < lineCount; i--) {
                    recentLines.push(lines[i]);
                }

                isFirstChunk = false;
            }

            if (recentLines.length < lineCount && remainingHead.length > 0) {
                recentLines.push(remainingHead);
            }

            return recentLines;
        } finally {
            await fileHandle.close();
        }
    }
}
