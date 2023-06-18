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

class GetPlayersWithTagOperationRequest extends OperationRequest {
	@StringDataMember({ code: GamePlayerParameterCode.Key, minLength: 1, maxLength: 32, mustNonNull: true })
	key: string;

	@DataMember({ code: GamePlayerParameterCode.Value })
	value: string | number | boolean;

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

class ServerGetPlayersWithTagOperationRequest extends GetPlayersWithTagOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayersWithTagOperationRequest extends ServerGetPlayersWithTagOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersWithTagRequestHandler extends GetPlayersBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetPlayersWithTag;
	}

	public override getCommonOperationRequest() {
		return GetPlayersWithTagOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.getPlayersWithTag.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.key, request.value, request.skip, request.limit, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.getPlayersWithTag.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.key, request.value, request.skip, request.limit, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.getPlayersWithTag.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.key, request.value, request.skip, request.limit, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(key: string, value: string | number | boolean, skip: number, limit: number, gameId: string, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gnResults = new GNArray();

		let gamePlayers = await this.gnServer.getDatabase().loadGamePlayersWithTagAsync(key, value, skip, limit, gameId, gamePlayerFindOptions);

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
