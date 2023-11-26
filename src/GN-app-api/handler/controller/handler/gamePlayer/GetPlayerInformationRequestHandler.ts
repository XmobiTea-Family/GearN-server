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
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetPlayerInformationOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId?: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerInformationOperationRequest extends GetPlayerInformationOperationRequest {
	@StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

	@BooleanDataMember({ code: GNParameterCode.CreatePlayerIfNotExists, isOptional: true, defaultValue: false })
	createPlayerIfNotExists?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayerInformationOperationRequest extends ServerGetPlayerInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayerInformationRequestHandler extends GamePlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetPlayerInformation;
	}

	public override getCommonOperationRequest() {
		return GetPlayerInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let createPlayerIfNotExists = false;
		let updateTsLastLogin = false;
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
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, infoRequestParam: InfoRequestParam, createPlayerIfNotExists: boolean, ipAddress: string, updateTsLastLogin: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetPlayerInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(request.infoRequestParam);

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			if (!request.createPlayerIfNotExists) {
				operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GamePlayerNotFound);
				return operationResponse;
			}
			else {
				let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.userId, {});
				if (!masterPlayer) {
					operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.MasterPlayerNotFound);
					return operationResponse;
				}
			}

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
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

			let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
			if (ipDetailResponse.statusCode == "Ok") {
				if (ipDetailResponse.detail.countryCode) {
					result["countryCode"] = ipDetailResponse.detail.countryCode;
				}
			}

			gamePlayer = await this.gnServer.getDatabase().createGamePlayerAsync(result, secretInfo.getGameId());
		}

		if (request.updateTsLastLogin === true) {
			gamePlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			gamePlayer.saveAsync();
		}

		operationResponse.setParameter(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetPlayerInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
