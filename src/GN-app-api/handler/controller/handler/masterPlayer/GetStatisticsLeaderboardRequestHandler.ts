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
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class GetStatisticsLeaderboardOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@BooleanDataMember({ code: ParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	loadFromCache?: boolean;

	@StringDataMember({ code: ParameterCode.Version, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	version?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardOperationRequest extends GetStatisticsLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardOperationRequest extends ServerGetStatisticsLeaderboardOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardRequestHandler extends MasterPlayerBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetStatisticsLeaderboard;
	}

	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboard.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboard.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getStatisticsLeaderboard.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			key: request.key,
			skip: request.skip,
			limit: request.limit,
			infoRequestParam: request.infoRequestParam,
			loadFromCache: request.loadFromCache,
			version: request.version,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, version: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("masterPlayer_GetStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayerSettings = this.gnServer.getGNSettings().getMasterPlayerSettings();
		let playerStatisticsSettingsItem = masterPlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.KeyNotFound);

			return operationResponse;
		}

        let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		if (!request.version) {
			let cacheKey = "masterPlayerStatisticsLeaderboard_" + request.key;

			if (request.loadFromCache) {
				if (request.skip + request.limit > 100) {
					request.loadFromCache = false;
				}
			}

			if (request.loadFromCache) {
				if (!(await cacheData.isValid(cacheKey))) {
					request.loadFromCache = false;
				}
			}

			let gnResults = new GNArray();

			let masterPlayers: MasterPlayer[];

			if (request.loadFromCache) {
				masterPlayers = await cacheData.getData(cacheKey);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= masterPlayers.length) break;

					let masterPlayer = masterPlayers[i];

					let gnResult = new GNHashtable();

					gnResult.add(ParameterCode.Position, i);

					gnResult.add(ParameterCode.UserId, masterPlayer.getUserId());

					gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

					gnResults.add(gnResult);
				}
			}
			else {
                let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);

                let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
                let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;
        
				if (request.skip + request.limit <= 100) {
					masterPlayerFindOptions = null;

					masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithStatisticsAsync(request.key, 0, 100, direction, masterPlayerFindOptions);

					for (let i = request.skip; i < request.skip + request.limit; i++) {
						if (i >= masterPlayers.length) break;

						let masterPlayer = masterPlayers[i];

						let gnResult = new GNHashtable();

						gnResult.add(ParameterCode.Position, i);

						gnResult.add(ParameterCode.UserId, masterPlayer.getUserId());

						gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

						gnResults.add(gnResult);
					}

					await cacheData.setData(cacheKey, masterPlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
				}
				else {
					masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersLeaderboardWithStatisticsAsync(request.key, request.skip, request.limit, direction, masterPlayerFindOptions);

					for (let i = 0; i < masterPlayers.length; i++) {

						let masterPlayer = masterPlayers[i];

						let gnResult = new GNHashtable();

						gnResult.add(ParameterCode.Position, i + request.skip);

						gnResult.add(ParameterCode.UserId, masterPlayer.getUserId());

						gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

						gnResults.add(gnResult);
					}
				}
			}

			operationResponse.setParameter(ParameterCode.Results, gnResults);
		}
		else {
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");

			let key = request.key;
			let version = request.version;

			let cacheKey = "masterPlayerStatisticsLeaderboard_" + key + "_" + version;

			if (!(await cacheData.isValid(cacheKey))) {
				let result = await backupStatisticsLeaderboardCollection.findOne({ key: key, version: version });

				if (result == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.VersionInvalid);
					return operationResponse;
				}

				await cacheData.setData(cacheKey, result, xDatetime.ONE_MINUTE_MILLISECOND * 5);
			}

			let backupData: {
				key: string,
				version: string,
				log: string,
				tsCreate: number,
				results: {
					position: number,
					userId: string,
					value: number,
					tsLastUpdate: number,
				}[]
			} = await cacheData.getData(cacheKey);

			let gnResults = new GNArray();

			let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= backupData.results.length) break;

				let result = backupData.results[i];

				let gnResult = new GNHashtable();

				gnResult.add(ParameterCode.Position, result.position);
				gnResult.add(ParameterCode.BackupValue, result.value);

				gnResult.add(ParameterCode.UserId, result.userId);

				let masterPlayer = masterPlayerFindOptions == null ? null
					: await this.gnServer.getDatabase().loadMasterPlayerAsync(result.userId, masterPlayerFindOptions);

				if (masterPlayer == null) gnResult.add(ParameterCode.InfoResponseParameters, new GNHashtable());
				else gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));

				gnResults.add(gnResult);
			}

			operationResponse.setParameter(ParameterCode.Results, gnResults);
			operationResponse.setParameter(ParameterCode.TsCreate, backupData.tsCreate);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("masterPlayer_GetStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
