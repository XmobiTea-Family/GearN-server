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
import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";

class SendPushNotificationOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.Title })
	public title: string;

	@StringDataMember({ code: ParameterCode.Body })
	public body: string;

	@NumberDataMember({ code: ParameterCode.Badge, mustInt: true, isOptional: true, defaultValue: null })
	public badge?: number;

	@StringDataMember({ code: ParameterCode.Sound, isOptional: true })
	public sound?: string;

	@StringDataMember({ code: ParameterCode.Icon, isOptional: true })
	public icon?: string;

	@GNHashtableDataMember({ code: ParameterCode.Data, isOptional: true })
	public data?: GNHashtable;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSendPushNotificationOperationRequest extends SendPushNotificationOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSendPushNotificationOperationRequest extends ServerSendPushNotificationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SendPushNotificationRequestHandler extends MasterPlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.SendPushNotification;
	}

	public override getCommonOperationRequest() {
		return SendPushNotificationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.sendPushNotification.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.sendPushNotification.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.sendPushNotification.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			title: request.title,
			body: request.body,
			badge: request.badge,
			sound: request.sound,
			icon: request.icon,
			data: request.data?.toData() ?? null,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSendPushNotificationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.sendPushNotification.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			title: request.title,
			body: request.body,
			badge: request.badge,
			sound: request.sound,
			icon: request.icon,
			data: request.data?.toData() ?? null,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSendPushNotificationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.sendPushNotification.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			title: request.title,
			body: request.body,
			badge: request.badge,
			sound: request.sound,
			icon: request.icon,
			data: request.data?.toData() ?? null,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, title: string, body: string, badge: number, sound: string, icon: string, data: { [k: string]: any } }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_SendPushNotification", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			pushNotifications: true,
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		let allPushNotifications = masterPlayer.getAllPushNotifications();
		if (allPushNotifications.length != 0) {
			let tokens: string[] = [];

			for (let i = 0; i < allPushNotifications.length; i++) {
				tokens.push(allPushNotifications[i].token);
			}

			let response = await this.gnServer.getPushNotificationService().sendNotificationToMore(tokens, request.title, request.body, request.badge, request.sound, request.icon, request.data);
			operationResponse.setParameter(ParameterCode.Message, response);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_SendPushNotification", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
