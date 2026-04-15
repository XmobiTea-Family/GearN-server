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
import { ContentDataParam } from "./model/ContentDataParam";
import { ConfigService } from "./../../../../service/ConfigService";

class SetContentDataOperationRequest extends OperationRequest {

	// Stores the configs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.Configs, elementCls: ContentDataParam, mustNonNull: true })
	public configs: Array<ContentDataParam>;

	// Stores the label value used by this instance.
	@StringDataMember({ code: ParameterCode.Label, minLength: 2, maxLength: 32, isOptional: true })
	public label?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetContentDataOperationRequest extends SetContentDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetContentDataOperationRequest extends ServerSetContentDataOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetContentDataRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetContentData;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetContentDataOperationRequest;
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

		if (!secretInfo.getPermission().content.setContentData.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			configs: request.configs,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.setContentData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			configs: request.configs,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetContentDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().content.setContentData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			configs: request.configs,
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
	private async execute(request: { configs: Array<ContentDataParam>, label: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("content_SetContentData", request, secretInfo, operationRequest);
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

		// Stores the configs value used in the current execution flow.
		let configs: { key: string, data: {} }[] = [];

		for (let i = 0; i < request.configs.length; i++) {
			// Stores the configuration value used in the current execution flow.
			let config = request.configs[i];

			configs.push({
				key: config.key,
				data: config.data != null ? config.data.toData() : null,
			});
		}

		await this.gnServer.getHttpApp().getClusterHandler().sendEvent("content_SetContentData", {
			configs: configs,
			label: request.label,
			gameId: secretInfo.getGameId(),
		});

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("content_SetContentData", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Executes the apply settings workflow.
	 * @param request Provides the request value used by this operation.
	 */
	private applySettings(request: { configs: Array<{ key: string, data: {} }>, label: string, gameId: string }) {
		// Stores the configuration game value used in the current execution flow.
		let configGame = this.gnServer.getConfigService(request.gameId);
		if (!configGame) {
			return;
		}

		if (this.gnServer.isPrimary()) {
			for (let i = 0; i < request.configs.length; i++) {
				// Stores the configuration value used in the current execution flow.
				let config = request.configs[i];

				(<ConfigService>configGame).setConfigAsync(config.key, request.label, config.data, true);
			}
		}
		else {
			for (let i = 0; i < request.configs.length; i++) {
				// Stores the configuration value used in the current execution flow.
				let config = request.configs[i];

				(<ConfigService>configGame).setConfigAsync(config.key, request.label, config.data, false);
			}
		}
	}

	/**
	 * Executes the init workflow.
	 */
	protected init(): void {
		// Stores the thiz value used in the current execution flow.
		let thiz = this;
		this.gnServer.getHttpApp().getClusterHandler().onEvent("content_SetContentData", data => {
			thiz.applySettings(data);
		});
	}
}
