import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MasterPlayerBaseRequestHandler } from "./MasterPlayerBaseRequestHandler";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";

class LinkGenericServiceOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the service name value used by this instance.
	@StringDataMember({ code: ParameterCode.ServiceName, minLength: 6, maxLength: 32, mustNonNull: true })
	public serviceName: string;

	// Stores the service data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ServiceData, mustNonNull: true })
	public serviceData: GNHashtable;

	// Indicates whether force link.
	@BooleanDataMember({ code: ParameterCode.ForceLink, isOptional: true, defaultValue: false })
	public forceLink?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerLinkGenericServiceOperationRequest extends LinkGenericServiceOperationRequest {

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

class AdminLinkGenericServiceOperationRequest extends ServerLinkGenericServiceOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LinkGenericServiceRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.LinkGenericService;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return LinkGenericServiceOperationRequest;
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, serviceName: string, serviceData: { [k: string]: any }, forceLink: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_LinkGenericService", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
			external: true,
		}

		// Stores the resolved master player settings instance for the current execution flow.
		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();
		// Stores the generic service settings item value used in the current execution flow.
		let genericServiceSettingsItem = masterPlayerSettings.genericServiceSettings.find(x => x.serviceName == request.serviceName);

		if (genericServiceSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VerifyFailed);
			operationResponse.setParameter(ParameterCode.ErrorMessage, "GenericServiceSettings not found");

			return operationResponse;
		}

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
			return operationResponse;
		}

		// Stores the external value used in the current execution flow.
		let external = masterPlayer.getExternal();
		if (external.genericService != null && external.genericService.genericServices.has(request.serviceName) && !request.forceLink) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherValue);
			return operationResponse;
		}

		// Stores the service response value used in the current execution flow.
		let serviceResponse = await this.gnServer.getEventCallbackCloudScriptService().executeVerifyGenericService(request.serviceName, request.serviceData);

		if (!serviceResponse.success) {
			Debug.log("service name error " + serviceResponse.errorMessage);

			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VerifyFailed);
			operationResponse.setParameter(ParameterCode.ErrorMessage, serviceResponse.errorMessage);
			return operationResponse;
		}

		// Stores the service ID value used in the current execution flow.
		let serviceId = serviceResponse.serviceId;

		// Stores the other master player value used in the current execution flow.
		let otherMasterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByGenericServiceAsync(request.serviceName, serviceId);
		if (otherMasterPlayer != null && otherMasterPlayer.getUserId() != masterPlayer.getUserId()) {
			if (!request.forceLink) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExternalLinkedOtherAccount);
				return operationResponse;
			}

			// Stores the other external value used in the current execution flow.
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

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.External, this.generateExternal(masterPlayer));
		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_LinkGenericService", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
