import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

class GetContentDataOperationRequest extends OperationRequest {

	// Stores the keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.Keys, elementCls: String, isOptional: true })
	public keys?: Array<string>;

	// Stores the label value used by this instance.
	@StringDataMember({ code: ParameterCode.Label, minLength: 2, maxLength: 32, isOptional: true, defaultValue: "" })
	public label?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetContentDataOperationRequest extends GetContentDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetContentDataOperationRequest extends ServerGetContentDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetContentDataRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetContentData;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetContentDataOperationRequest;
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

		if (!secretInfo.getPermission().content.getContentData.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			label: request.label,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getContentData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			label: request.label,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.getContentData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			keys: request.keys,
			label: request.label,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { keys: Array<string>, label: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_GetContentData", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the configuration game value used in the current execution flow.
		let configGame = this.gnServer.getConfigService(secretInfo.getGameId());
		if (!configGame) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
			return operationResponse;
		}

		if (!request.label) request.label = "origin";

		// Stores the GearN configs value used in the current execution flow.
		let gnConfigs = new GNArray();

		// Stores the configuration dictionary value used in the current execution flow.
		let configDic = configGame.getConfigDicViaLabel(request.label);

		configDic.forEach((value, key) => {
			if (request.keys == null || request.keys.indexOf(key) != -1) {
				// Stores the GearN configuration value used in the current execution flow.
				let gnConfig = new GNHashtable();

				gnConfig.add(ParameterCode.Key, key);
				gnConfig.add(ParameterCode.Data, value.getData());

				gnConfigs.add(gnConfig);
			}
		});

		operationResponse.setParameter(ParameterCode.Configs, gnConfigs);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_GetContentData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
