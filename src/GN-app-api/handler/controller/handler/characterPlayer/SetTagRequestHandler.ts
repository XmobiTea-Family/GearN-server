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

class SetTagOperationRequest extends OperationRequest {
	@StringDataMember({ code: CharacterPlayerParameterCode.Key, minLength: 1, maxLength: 32, mustNonNull: true })
	key: string;

	@DataMember({ code: CharacterPlayerParameterCode.Value })
	value: string | number | boolean;

	@StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetTagOperationRequest extends SetTagOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetTagOperationRequest extends ServerSetTagOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetTagRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetTag;
	}

	public override getCommonOperationRequest() {
		return SetTagOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setTag.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.key, request.value, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setTag.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.key, request.value, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetTagOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setTag.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.key, request.value, operationRequest);
    }

    private async execute(characterId: string, gameId: string, key: string, value: string | number | boolean, operationRequest: OperationRequest): Promise<OperationResponse> {
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            tags: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		characterPlayer.setTag(key, value);
		characterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
