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

class SendEmailOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    @StringDataMember({ code: GNParameterCode.Subject, minLength: 2, maxLength: 256, mustNonNull: true })
    subject: string;

    @StringDataMember({ code: GNParameterCode.ContentHtml, minLength: 2, maxLength: 8192, mustNonNull: true })
    contentHtml: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSendEmailOperationRequest extends SendEmailOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare userId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSendEmailOperationRequest extends ServerSendEmailOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SendEmailRequestHandler extends MasterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.SendEmail;
    }

    public override getCommonOperationRequest() {
        return SendEmailOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!request.userId) {
            if (!secretInfo.getPermission().masterPlayer.sendEmail.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().masterPlayer.sendEmail.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().masterPlayer.sendEmail.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: request.userId,
            subject: request.subject,
            contentHtml: request.contentHtml,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSendEmailOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.sendEmail.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            subject: request.subject,
            contentHtml: request.contentHtml,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSendEmailOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().masterPlayer.sendEmail.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            subject: request.subject,
            contentHtml: request.contentHtml,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, subject: string, contentHtml: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_SendEmail", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, {
            email: true,
        });

        if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountNotFound);

            return operationResponse;
        }

        let email = masterPlayer.getEmail();
        if (!email) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.EmailInvalid);

            return operationResponse;
        }

        this.gnServer.getEmailService().sendMail(email, request.subject, request.contentHtml);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_SendEmail", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
