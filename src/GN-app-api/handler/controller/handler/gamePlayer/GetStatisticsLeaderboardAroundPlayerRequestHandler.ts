import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { GamePlayerParameterCode } from "../../../../../GN-common/constant/parameterCode/GamePlayerParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { GamePlayerErrorCode } from "../../../../../GN-common/constant/errorCode/GamePlayerErrorCode";

import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { GetPlayersBaseRequestHandler } from "./GetPlayersBaseRequestHandler";

class GetStatisticsLeaderboardAroundPlayerOperationRequest extends OperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId: string;

	@StringDataMember({ code: GamePlayerParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: GamePlayerParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

    @NumberDataMember({ code: GamePlayerParameterCode.Skip, defaultValue: 0, isOptional: true })
	skip: number;

    @NumberDataMember({ code: GamePlayerParameterCode.Limit, defaultValue: 10, isOptional: true })
	limit: number;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStatisticsLeaderboardAroundPlayerOperationRequest extends OperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

	@StringDataMember({ code: GamePlayerParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: GamePlayerParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

    @NumberDataMember({ code: GamePlayerParameterCode.Skip, defaultValue: 0, isOptional: true })
	skip: number;

    @NumberDataMember({ code: GamePlayerParameterCode.Limit, defaultValue: 10, isOptional: true })
	limit: number;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStatisticsLeaderboardAroundPlayerOperationRequest extends ServerGetStatisticsLeaderboardAroundPlayerOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStatisticsLeaderboardAroundPlayerRequestHandler extends GetPlayersBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetStatisticsLeaderboardAroundPlayer;
	}

	public override getCommonOperationRequest() {
		return GetStatisticsLeaderboardAroundPlayerOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

        return this.execute(request.userId, request.key, secretInfo.getGameId(), request.skip, request.limit, request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.key, secretInfo.getGameId(), request.skip, request.limit, request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStatisticsLeaderboardAroundPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.getStatisticsLeaderboardAroundPlayer.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, request.key, secretInfo.getGameId(), request.skip, request.limit, request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(userId: string, key: string, gameId: string, skip: number, limit: number, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gnResults = new GNArray();

        let thisPosition = await this.gnServer.getDatabase().loadPositionGamePlayerLeaderboardWithStatisticsAsync(key, userId, gameId);

		let gamePlayers = await this.gnServer.getDatabase().loadGamePlayersLeaderboardWithStatisticsAsync(key, thisPosition + skip, limit, gameId, gamePlayerFindOptions);

		for (let i = 0; i < gamePlayers.length; i++) {
			let gamePlayer = gamePlayers[i];

			let gnResult = new GNHashtable();

			gnResult.add(GamePlayerParameterCode.UserId, gamePlayer.getUserId());

			gnResult.add(GamePlayerParameterCode.InfoGetParameters, this.generateGamePlayerOperationResponse(gamePlayer, gamePlayerFindOptions, infoGetParameters, secretInfo));

			gnResults.add(gnResult);
		}

        operationResponse.setParameter(GamePlayerParameterCode.Results, gnResults);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.Ok);
		return operationResponse;
    }
}
