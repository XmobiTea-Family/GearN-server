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

class GetTsLastLoginOperationRequest extends OperationRequest {
    @StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetTsLastLoginOperationRequest extends GetTsLastLoginOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetTsLastLoginOperationRequest extends ServerGetTsLastLoginOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetTsLastLoginRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetTsLastLogin;
	}

	public override getCommonOperationRequest() {
		return GetTsLastLoginOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetTsLastLoginOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetTsLastLoginOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.getTsLastLogin.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.characterId, secretInfo.getGameId(), operationRequest);
    }

    private async execute(characterId: string, gameId: string, operationRequest: OperationRequest): Promise<OperationResponse> {
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            tsLastLogin: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
		gnInfoGetParameters.add(CharacterPlayerParameterCode.TsLastLogin, characterPlayer.getTsLastLogin());

        operationResponse.setParameter(CharacterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
