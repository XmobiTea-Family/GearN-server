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
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetPlayersWithGenericServiceOperationRequest extends OperationRequest {

	// Stores the service name value used by this instance.
	@StringDataMember({ code: ParameterCode.ServiceName, minLength: 2, maxLength: 32, mustNonNull: true })
	public serviceName: string;

	// Stores the generic IDs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GenericIds, mustNonNull: true, elementCls: String, minLength: 1, maxLength: 20 })
	public genericIds: Array<string>;

	// Stores the info request parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayersWithGenericServiceOperationRequest extends GetPlayersWithGenericServiceOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayersWithGenericServiceOperationRequest extends ServerGetPlayersWithGenericServiceOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersWithGenericServiceRequestHandler extends MasterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetPlayersWithGenericService;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetPlayersWithGenericServiceOperationRequest;
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

		if (!secretInfo.getPermission().masterPlayer.getPlayersWithGenericService.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			serviceName: request.serviceName,
			genericIds: request.genericIds,
			infoRequestParam: request.infoRequestParam,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithGenericServiceOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getPlayersWithGenericService.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			serviceName: request.serviceName,
			genericIds: request.genericIds,
			infoRequestParam: request.infoRequestParam,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithGenericServiceOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getPlayersWithGenericService.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			serviceName: request.serviceName,
			genericIds: request.genericIds,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { serviceName: string, genericIds: Array<string>, infoRequestParam: InfoRequestParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_GetPlayersWithGenericService", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);
		if (masterPlayerFindOptions != null) masterPlayerFindOptions.external = true;

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		// Stores the master players value used in the current execution flow.
		let masterPlayers = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayersWithGenericServiceAsync(request.serviceName, request.genericIds, masterPlayerFindOptions);

		for (let i = 0; i < masterPlayers.length; i++) {
			// Stores the master player value used in the current execution flow.
			let masterPlayer = masterPlayers[i];

			// Stores the GearN result value used in the current execution flow.
			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.UserId, masterPlayer.getUserId());
			gnResult.add(ParameterCode.ServiceId, masterPlayer.getExternal().genericService.genericServices.get(request.serviceName).serviceId);

			gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_GetPlayersWithGenericService", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
