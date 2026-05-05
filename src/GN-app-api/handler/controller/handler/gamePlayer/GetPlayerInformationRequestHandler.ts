import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetPlayerInformationOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

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

class ServerGetPlayerInformationOperationRequest extends GetPlayerInformationOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	// Indicates whether create player if not exists.
	@BooleanDataMember({ code: ParameterCode.CreatePlayerIfNotExists, isOptional: true, defaultValue: false })
	public createPlayerIfNotExists?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayerInformationOperationRequest extends ServerGetPlayerInformationOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayerInformationRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetPlayerInformation;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetPlayerInformationOperationRequest;
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

		// Stores the create player if not exists value used in the current execution flow.
		let createPlayerIfNotExists = false;
		// Stores the update timestamp last login value used in the current execution flow.
		let updateTsLastLogin = false;
		// Stores the IP address create value used in the current execution flow.
		let ipAddressCreate: string = null;

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();

			createPlayerIfNotExists = true;
			updateTsLastLogin = true;
			ipAddressCreate = (request as any).originRequest.getIP();

			this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}

			this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			createPlayerIfNotExists = true;
			updateTsLastLogin = true;
			ipAddressCreate = (request as any).originRequest.getIP();

			this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);
		}

		return this.execute({
			userId: request.userId,
			infoRequestParam: request.infoRequestParam,
			createPlayerIfNotExists: createPlayerIfNotExists,
			updateTsLastLogin: updateTsLastLogin,
			ipAddress: ipAddressCreate,
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			userId: request.userId,
			infoRequestParam: request.infoRequestParam,
			createPlayerIfNotExists: request.createPlayerIfNotExists,
			updateTsLastLogin: false,
			ipAddress: (request as any).originRequest.getIP(),
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			userId: request.userId,
			infoRequestParam: request.infoRequestParam,
			createPlayerIfNotExists: request.createPlayerIfNotExists,
			updateTsLastLogin: false,
			ipAddress: (request as any).originRequest.getIP(),
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, infoRequestParam: InfoRequestParam, createPlayerIfNotExists: boolean, ipAddress: string, updateTsLastLogin: boolean }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetPlayerInformation", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(request.infoRequestParam);

		// Stores the game player value used in the current execution flow.
		let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			if (!request.createPlayerIfNotExists) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
				return operationResponse;
			}
			else {
				// Stores the master player value used in the current execution flow.
				let masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerAsync(request.userId, {});
				if (!masterPlayer) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MasterPlayerNotFound);
					return operationResponse;
				}
			}

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			// Stores the result value used in the current execution flow.
			let result = {} as any;

			result["userId"] = request.userId;
			result["socketId"] = "";
			result["playerCharacters"] = [];
			result["playerInventories"] = [];
			result["playerGroups"] = [];
			result["playerFriends"] = [];
			result["segments"] = [];
			result["customDatas"] = {};
			result["displayName"] = "";
			result["displayNameNormalize"] = "";
			result["avatar"] = { "type": 0, "value": "0" };
			result["tsCreate"] = currentMilliseconds;
			result["tags"] = {};
			result["playerBan"] = { "tsExpire": 0, "reason": "" };
			result["playerDatas"] = [];
			result["playerCurrencies"] = {};
			result["playerStatistics"] = {};
			result["tsLastLogin"] = currentMilliseconds;
			result["ipAddressCreate"] = request.ipAddress;
			result["countryCode"] = "";

			// Stores the IP detail response value used in the current execution flow.
			let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
			if (ipDetailResponse.statusCode == "Ok") {
				if (ipDetailResponse.detail.countryCode) {
					result["countryCode"] = ipDetailResponse.detail.countryCode;
				}
			}

			const lastCheck = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), {});
			if (lastCheck != null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameExists);
				operationResponse.setDebugMessage("create game player but already exists, userId: " + request.userId);
				return operationResponse;
			}

			gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.createGamePlayerAsync(result, secretInfo.getGameId());
		}

		if (request.updateTsLastLogin) {
			gamePlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			await gamePlayer.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetPlayerInformation", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
