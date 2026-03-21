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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";

class GetCreateLeaderboardOperationRequest extends OperationRequest {

	// Stores the info request parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	// Stores the skip value used by this instance.
	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	// Stores the limit value used by this instance.
	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	// Indicates whether load from cache.
	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	public loadFromCache?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetCreateLeaderboardOperationRequest extends GetCreateLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCreateLeaderboardOperationRequest extends ServerGetCreateLeaderboardOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetCreateLeaderboardRequestHandler extends GamePlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetCreateLeaderboard;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetCreateLeaderboardOperationRequest;
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

		if (!secretInfo.getPermission().gamePlayer.getCreateLeaderboard.otherSelfEnable) {
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCreateLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getCreateLeaderboard.serverSelfEnable) {
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCreateLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getCreateLeaderboard.adminSelfEnable) {
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GetCreateLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(request.infoRequestParam);

		// Stores the cache key value used in the current execution flow.
		let cacheKey = "gamePlayerCreateLeaderboard";

		if (request.loadFromCache) {
			if (request.skip + request.limit > 100) {
				request.loadFromCache = false;
			}
		}

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		if (request.loadFromCache) {
			if (!(await cacheData.isValid(cacheKey))) {
				request.loadFromCache = false;
			}
		}

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		// Stores the game players value used in the current execution flow.
		let gamePlayers: GamePlayer[];

		if (request.loadFromCache) {
			gamePlayers = await cacheData.getData(cacheKey);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= gamePlayers.length) break;

				// Stores the game player value used in the current execution flow.
				let gamePlayer = gamePlayers[i];

				// Stores the GearN result value used in the current execution flow.
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

				gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithCreateAsync(0, 100, secretInfo.getGameId(), gamePlayerFindOptions);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= gamePlayers.length) break;

					// Stores the game player value used in the current execution flow.
					let gamePlayer = gamePlayers[i];

					// Stores the GearN result value used in the current execution flow.
					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i);

					gnResult.add(ParameterCode.UserId, gamePlayer.getUserId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(gamePlayer, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}

				await cacheData.setData(cacheKey, gamePlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
			}
			else {
				gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithCreateAsync(request.skip, request.limit, secretInfo.getGameId(), gamePlayerFindOptions);

				for (let i = 0; i < gamePlayers.length; i++) {

					// Stores the game player value used in the current execution flow.
					let gamePlayer = gamePlayers[i];

					// Stores the GearN result value used in the current execution flow.
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

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GetCreateLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
