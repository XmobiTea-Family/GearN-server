import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";

class SendEmailOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the subject value used by this instance.
	@StringDataMember({ code: ParameterCode.Subject, minLength: 2, maxLength: 256, mustNonNull: true })
	public subject: string;

	// Stores the content html value used by this instance.
	@StringDataMember({ code: ParameterCode.ContentHtml, minLength: 2, maxLength: 8192, mustNonNull: true })
	public contentHtml: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSendEmailOperationRequest extends SendEmailOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSendEmailOperationRequest extends ServerSendEmailOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SendEmailRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SendEmail;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SendEmailOperationRequest;
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, subject: string, contentHtml: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_SendEmail", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, {
			email: true,
		});

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);

			return operationResponse;
		}

		// Stores the email value used in the current execution flow.
		let email = masterPlayer.getEmail();
		if (!email) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.EmailInvalid);

			return operationResponse;
		}

		this.gnServer.getEmailService().sendMail(email, request.subject, request.contentHtml);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_SendEmail", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
