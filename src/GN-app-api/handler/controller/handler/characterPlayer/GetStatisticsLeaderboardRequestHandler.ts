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
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { xStatisticsAggregationMethod } from "../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class GetStatisticsLeaderboardOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: GNParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	@NumberDataMember({ code: GNParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	skip?: number;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@BooleanDataMember({ code: GNParameterCode.LoadFromCache, defaultValue: true, isOptional: true })
	loadFromCache?: boolean;

	@StringDataMember({ code: GNParameterCode.Version, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	version?: string;

	@StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	catalogId?: string;

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

export class GetStatisticsLeaderboardRequestHandler extends CharacterPlayerBaseRequestHandler {

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

		if (!secretInfo.getPermission().characterPlayer.getStatisticsLeaderboard.otherSelfEnable) {
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
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getStatisticsLeaderboard.serverSelfEnable) {
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
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getStatisticsLeaderboard.adminSelfEnable) {
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
            catalogId: request.catalogId,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { key: string, skip: number, limit: number, infoRequestParam: InfoRequestParam, loadFromCache: boolean, version: string, catalogId: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GetStatisticsLeaderboard", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let playerStatisticsSettingsItem = characterPlayerSettings.playerStatisticsSettings.find(x => x.key == request.key);

		if (playerStatisticsSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.KeyNotFound);

			return operationResponse;
		}

        let cacheData = this.gnServer.getCacheService(secretInfo.getGameId());

		if (!request.version) {
			let cacheKey = "characterPlayerStatisticsLeaderboard_" + request.key;
            if (request.catalogId) cacheKey += "_" + request.catalogId;

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

			let characterPlayers: CharacterPlayer[];

			if (request.loadFromCache) {
				characterPlayers = await cacheData.getData(cacheKey);

				for (let i = request.skip; i < request.skip + request.limit; i++) {
					if (i >= characterPlayers.length) break;

					let characterPlayer = characterPlayers[i];

					let gnResult = new GNHashtable();

					gnResult.add(GNParameterCode.Position, i);

					gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());

					gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

					gnResults.add(gnResult);
				}
			}
			else {
                let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(request.infoRequestParam);

                let statisticsAggregationMethod = <xStatisticsAggregationMethod>playerStatisticsSettingsItem.statisticsAggregationMethod;
                let direction: -1 | 1 = statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum ? 1 : -1;
    
				if (request.skip + request.limit <= 100) {
					characterPlayerFindOptions = null;

					characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersLeaderboardWithStatisticsAsync(request.key, 0, 100, request.catalogId, secretInfo.getGameId(), direction, characterPlayerFindOptions);

					for (let i = request.skip; i < request.skip + request.limit; i++) {
						if (i >= characterPlayers.length) break;

						let characterPlayer = characterPlayers[i];

						let gnResult = new GNHashtable();

						gnResult.add(GNParameterCode.Position, i);

						gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());

						gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

						gnResults.add(gnResult);
					}

					await cacheData.setData(cacheKey, characterPlayers, xDatetime.ONE_MINUTE_MILLISECOND * 5);
				}
				else {
					characterPlayers = await this.gnServer.getDatabase().loadCharacterPlayersLeaderboardWithStatisticsAsync(request.key, request.skip, request.limit, request.catalogId, secretInfo.getGameId(), direction, characterPlayerFindOptions);

					for (let i = 0; i < characterPlayers.length; i++) {

						let characterPlayer = characterPlayers[i];

						let gnResult = new GNHashtable();

						gnResult.add(GNParameterCode.Position, i + request.skip);

						gnResult.add(GNParameterCode.CharacterId, characterPlayer.getCharacterId());

						gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, secretInfo.getGameId()));

						gnResults.add(gnResult);
					}
				}
			}

			operationResponse.setParameter(GNParameterCode.Results, gnResults);
		}
		else {
			let gameId = secretInfo.getGameId();
			let backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);

			let key = request.key;
			let version = request.version;

			let cacheKey = "characterPlayerStatisticsLeaderboard_" + key + "_" + version;

			if (!(await cacheData.isValid(cacheKey))) {
				let result = await backupStatisticsLeaderboardCollection.findOne({ key: key, version: version });

				if (result == null) {
					operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.VersionInvalid);
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
					characterId: string,
					value: number,
					tsLastUpdate: number,
				}[]
			} = await cacheData.getData(cacheKey);

			let gnResults = new GNArray();

			let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(request.infoRequestParam);

			for (let i = request.skip; i < request.skip + request.limit; i++) {
				if (i >= backupData.results.length) break;

				let result = backupData.results[i];

				let gnResult = new GNHashtable();

				gnResult.add(GNParameterCode.Position, result.position);
				gnResult.add(GNParameterCode.BackupValue, result.value);

				gnResult.add(GNParameterCode.CharacterId, result.characterId);

				let characterPlayer = characterPlayerFindOptions == null ? null
					: await this.gnServer.getDatabase().loadCharacterPlayerAsync(result.characterId, gameId, characterPlayerFindOptions);

				if (characterPlayer == null) gnResult.add(GNParameterCode.InfoResponseParameters, new GNHashtable());
				else gnResult.add(GNParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(characterPlayer, request.infoRequestParam, gameId));

				gnResults.add(gnResult);
			}

			operationResponse.setParameter(GNParameterCode.Results, gnResults);
			operationResponse.setParameter(GNParameterCode.TsCreate, backupData.tsCreate);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GetStatisticsLeaderboard", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
