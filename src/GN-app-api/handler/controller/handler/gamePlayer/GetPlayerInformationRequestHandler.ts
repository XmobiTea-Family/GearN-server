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
import { GamePlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { GamePlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";

class GetPlayerInformationOperationRequest extends OperationRequest {
    @StringDataMember({ code: GamePlayerParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId: string;

	@GNHashtableDataMember({ code: GamePlayerParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayerInformationOperationRequest extends GetPlayerInformationOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayerInformationOperationRequest extends ServerGetPlayerInformationOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayerInformationRequestHandler extends GetPlayersBaseRequestHandler {
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

		if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().gamePlayer.getPlayerInformation.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(userId: string, gameId: string, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let gamePlayerFindOptions = this.convertToGamePlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions);

		if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        operationResponse.setParameter(GamePlayerParameterCode.InfoGetParameters, this.generateGamePlayerOperationResponse(gamePlayer, gamePlayerFindOptions, infoGetParameters, secretInfo));
        
		operationResponse.setParameter(ParameterCode.ErrorCode, GamePlayerErrorCode.Ok);
		return operationResponse;
    }
}
