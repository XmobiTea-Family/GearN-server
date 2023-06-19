import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { CharacterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/CharacterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { CharacterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/CharacterPlayerErrorCode";

import { CharacterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class SetCountryCodeOperationRequest extends OperationRequest {
    @NumberDataMember({ code: CharacterPlayerParameterCode.CountryCode })
	countryCode: number;

	@StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetCountryCodeOperationRequest extends SetCountryCodeOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetCountryCodeOperationRequest extends ServerGetCountryCodeOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetCountryCodeRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetCountryCode;
	}

	public override getCommonOperationRequest() {
		return SetCountryCodeOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setCountryCode.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.countryCode, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetCountryCodeOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.setCountryCode.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.countryCode, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetCountryCodeOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.setCountryCode.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), request.countryCode, operationRequest);
    }

    private async execute(characterId: string, gameId: string, countryCode: number, operationRequest: OperationRequest): Promise<OperationResponse> {
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            countryCode: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        characterPlayer.setCountryCode(countryCode);
        characterPlayer.saveAsync();
        
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
