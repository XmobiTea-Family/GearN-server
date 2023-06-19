import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { CharacterPlayerParameterCode } from "../../../../../GN-common/constant/parameterCode/CharacterPlayerParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { CharacterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/CharacterPlayerErrorCode";

import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { GetPlayersBaseRequestHandler } from "./GetPlayersBaseRequestHandler";
import { CharacterPlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { CharacterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";

class GetPlayerInformationOperationRequest extends OperationRequest {
    @StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

	@GNHashtableDataMember({ code: CharacterPlayerParameterCode.InfoGetParameters, mustNonNull: true })
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

		if (!secretInfo.getPermission().characterPlayer.getPlayerInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getPlayerInformation.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayerInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getPlayerInformation.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(characterId: string, gameId: string, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let characterPlayerFindOptions = this.convertToCharacterPlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        operationResponse.setParameter(CharacterPlayerParameterCode.InfoGetParameters, this.generateCharacterPlayerOperationResponse(characterPlayer, characterPlayerFindOptions, infoGetParameters, secretInfo));
        
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
