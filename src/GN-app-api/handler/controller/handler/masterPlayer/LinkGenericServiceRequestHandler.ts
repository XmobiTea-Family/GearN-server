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

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";

class LinkGenericServiceOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@StringDataMember({ code: GNParameterCode.ServiceName, minLength: 6, maxLength: 32, mustNonNull: true })
	serviceName: string;

	@GNHashtableDataMember({ code: GNParameterCode.ServiceData, mustNonNull: true })
	serviceData: GNHashtable;

	@BooleanDataMember({ code: GNParameterCode.ForceLink, isOptional: true, defaultValue: false })
	forceLink?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkGenericServiceOperationRequest extends LinkGenericServiceOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminLinkGenericServiceOperationRequest extends ServerLinkGenericServiceOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkGenericServiceRequestHandler extends MasterPlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.LinkGenericService;
	}

	public override getCommonOperationRequest() {
		return LinkGenericServiceOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().masterPlayer.linkGenericService.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.linkGenericService.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().masterPlayer.linkGenericService.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			serviceName: request.serviceName,
			serviceData: request.serviceData.toData(),
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerLinkGenericServiceOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkGenericService.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			serviceName: request.serviceName,
			serviceData: request.serviceData.toData(),
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminLinkGenericServiceOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.linkGenericService.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			serviceName: request.serviceName,
			serviceData: request.serviceData.toData(),
			forceLink: request.forceLink
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, serviceName: string, serviceData: { [k: string]: any }, forceLink: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkGenericService", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			external: true,
		}

		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();
		let playerStatisticsSettingsItem = masterPlayerSettings.genericServiceSettings.find(x => x.serviceName == request.serviceName);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		let external = masterPlayer.getExternal();
		if (external.genericService != null && external.genericService.genericServices.has(request.serviceName) && !request.forceLink) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExternalLinkedOtherValue);
			return operationResponse;
		}

		let serviceResponse = await this.gnServer.getGenericService().verifyGenericService(request.serviceName, request.serviceData);

		if (serviceResponse == null || serviceResponse.status == "ServiceNotFound") {
			Debug.log("service name error " + serviceResponse.error);

			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ServiceNameNotFound);
			return operationResponse;
		}

		if (!serviceResponse.serviceId || serviceResponse.status == "VerifyError") {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountNotFound);
			return operationResponse;
		}

		let serviceId = serviceResponse.serviceId;

		let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByGenericServiceAsync(request.serviceName, serviceId);
		if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
			if (!request.forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ExternalLinkedOtherAccount);
				return operationResponse;
			}

			let otherExternal = otherMasterPlayer.getExternal();
			otherExternal.genericService.genericServices.delete(request.serviceName);

			otherMasterPlayer.setExternal(otherExternal);
			otherMasterPlayer.saveAsync();
		}

		if (external.genericService == null) external.genericService = {
			genericServices: new Map<string, any>()
		};

		external.genericService.genericServices.set(request.serviceName, {
			serviceId: serviceId
		});

		masterPlayer.setExternal(external);
		masterPlayer.saveAsync();

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(GNParameterCode.External, this.generateExternal(masterPlayer));
		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkGenericService", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
