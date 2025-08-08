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
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class GetLastLoginLeaderboardOperationRequest extends OperationRequest {

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	public loadFromCache?: boolean;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetLastLoginLeaderboardOperationRequest extends GetLastLoginLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetLastLoginLeaderboardOperationRequest extends ServerGetLastLoginLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetLastLoginLeaderboardRequestHandler extends GamePlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetLastLoginLeaderboard;
	}

	public override getCommonOperationRequest() {
		return GetLastLoginLeaderboardOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getLastLoginLeaderboard.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetLastLoginLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getLastLoginLeaderboard.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetLastLoginLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getLastLoginLeaderboard.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetLastLoginLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(request.infoRequestParam);

		let cacheKey = "gamePlayerLastLoginLeaderboard";

		if (request.loadFromCache) {
			if (request.skip + request.limit > 100) {
				request.loadFromCache = false;
			}
		}

		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		if (request.loadFromCache) {
			if (!(await cacheData.isValid(cacheKey))) {
				request.loadFromCache = false;
			}
		}

		let gnResults = new GNArray();

		let gamePlayers: GamePlayer[];

		if (request.loadFromCache) {
			gamePlayers = await cacheData.getData(cacheKey);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= gamePlayers.length) break;

				let gamePlayer = gamePlayers[i];

				let gnResult = new GNHashtable();

				gnResult.add(ParameterCode.Position, i);

				gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

				gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

				gnResults.add(gnResult);
			}
		}
		else {
			if (request.skip + request.limit <= 100) {
				gamePlayerFindOptions = null;

				gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithLastLoginAsync(0, 100, secretInfo.getGameId(), gamePlayerFindOptions);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= gamePlayers.length) break;

					let gamePlayer = gamePlayers[i];

					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i);

					gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}

				await cacheData.setData(cacheKey, gamePlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
			}
			else {
				gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithLastLoginAsync(request.skip, request.limit, secretInfo.getGameId(), gamePlayerFindOptions);

				for (let i = 0; i < gamePlayers.length; i++) {

					let gamePlayer = gamePlayers[i];

					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i + request.skip);

					gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetLastLoginLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
