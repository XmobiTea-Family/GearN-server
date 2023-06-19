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

class SetPrivateDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: CharacterPlayerParameterCode.PrivateData, minLength: 1, maxLength: 32, mustNonNull: true })
	privateData: GNArray;

	@StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPrivateDataOperationRequest extends SetPrivateDataOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPrivateDataOperationRequest extends ServerSetPrivateDataOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPrivateDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetPrivateData;
	}

	public override getCommonOperationRequest() {
		return SetPrivateDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setScriptData.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.privateData, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPrivateDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setScriptData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.privateData, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPrivateDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.setScriptData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.privateData, operationRequest);
    }

    private async execute(characterId: string, gameId: string, privateData: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            privateData: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        for (let i = 0; i < privateData.count(); i++) {
            let gnHashtable = privateData.getGNHashtable(i);

            let key = gnHashtable.getString(CharacterPlayerParameterCode.Key);
            let value = gnHashtable.getObject(CharacterPlayerParameterCode.Value);
    
            if (value == null) {
                characterPlayer.removePrivateData(key);
            }
            else {
                characterPlayer.setPrivateData(key, value as any);
            }
        }
		
		characterPlayer.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
