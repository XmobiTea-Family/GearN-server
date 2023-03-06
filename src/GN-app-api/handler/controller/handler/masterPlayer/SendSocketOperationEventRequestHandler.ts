import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { OperationEvent } from "../../../../../GN-common/entity/operationEvent/OperationEvent";

class SendSocketOperationEventOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    @NumberDataMember({ code: GNParameterCode.EventCode, minValue: 1000, mustInt: true })
    eventCode: number;

    @GNHashtableDataMember({ code: GNParameterCode.EventParameters, mustNonNull: true, minLength: 0, maxLength: 128, isOptional: true })
    eventParameters?: GNHashtable;

    @BooleanDataMember({ code: GNParameterCode.EventEncrypted, isOptional: true, defaultValue: false })
    eventEncrypted?: boolean;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSendSocketOperationEventOperationRequest extends SendSocketOperationEventOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSendSocketOperationEventOperationRequest extends ServerSendSocketOperationEventOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SendSocketOperationEventRequestHandler extends MasterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.SendSocketOperationEvent;
    }

    public override getCommonOperationRequest() {
        return SendSocketOperationEventOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!request.userId) {
            if (!secretInfo.getPermission().masterPlayer.sendSocketOperationEvent.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().masterPlayer.sendSocketOperationEvent.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().masterPlayer.sendSocketOperationEvent.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: request.userId,
            eventCode: request.eventCode,
            eventParameters: request.eventParameters?.toData() ?? null,
            eventEncrypted: request.eventEncrypted,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSendSocketOperationEventOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.sendSocketOperationEvent.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            eventCode: request.eventCode,
            eventParameters: request.eventParameters?.toData() ?? null,
            eventEncrypted: request.eventEncrypted,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSendSocketOperationEventOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.sendSocketOperationEvent.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            eventCode: request.eventCode,
            eventParameters: request.eventParameters?.toData() ?? null,
            eventEncrypted: request.eventEncrypted,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, eventCode: number, eventParameters: { [k: string]: any }, eventEncrypted: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_SendSocketOperationEvent", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        this.gnServer.sendEventTo(request.userId, new OperationEvent(request.eventCode, request.eventParameters != null ? GNHashtable.builder().addAll(request.eventParameters).build() : null, request.eventEncrypted));

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_SendSocketOperationEvent", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
