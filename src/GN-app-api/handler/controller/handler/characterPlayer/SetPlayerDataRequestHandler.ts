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
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { StatisticsAggregationMethod } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsAggregationMethod";
import { DataValueType } from "../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/PermissionDataItem";

class SetPlayerDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: CharacterPlayerParameterCode.PlayerDatas, minLength: 1, maxLength: 32, mustNonNull: true })
	playerDatas: GNArray;

	@StringDataMember({ code: CharacterPlayerParameterCode.CharacterId, minLength: 10, maxLength: 10, mustNonNull: true })
	characterId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerDataOperationRequest extends SetPlayerDataOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetPlayerDataOperationRequest extends ServerSetPlayerDataOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetPlayerDataRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.SetPlayerData;
	}

	public override getCommonOperationRequest() {
		return SetPlayerDataOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setPlayerData.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.playerDatas, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().characterPlayer.setPlayerData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.playerDatas, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().characterPlayer.setPlayerData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.characterId, secretInfo.getGameId(), request.playerDatas, operationRequest);
    }

    private async execute(characterId: string, gameId: string, playerDatas: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            playerDatas: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions);

		if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerDatas = new GNArray();

        for (let i = 0; i < playerDatas.count(); i++) {
            let gnHashtable = playerDatas.getGNHashtable(i);

            let key = gnHashtable.getString(CharacterPlayerParameterCode.Key);
            let value = gnHashtable.getObject(CharacterPlayerParameterCode.Value);
            let permission = gnHashtable.getNumber(CharacterPlayerParameterCode.Permission);
            
            let gnPlayerData = new GNHashtable();
            gnPlayerData.add(CharacterPlayerParameterCode.Key, key);

            if (!characterPlayer.hasPlayerData(key)) {
                characterPlayer.setPlayerData(key, value as DataValueType, permission);
                gnPlayerData.add(CharacterPlayerParameterCode.Value, value);
                gnPlayerData.add(CharacterPlayerParameterCode.Permission, permission);
            }
            else {
                let playerData = characterPlayer.getPlayerData(key);
                let playerDataPermissionDataItem = <PermissionDataItem>playerData.permission;

                if (playerDataPermissionDataItem == PermissionDataItem.ReadOnlyPrivate || playerDataPermissionDataItem == PermissionDataItem.ReadOnlyPublic) {

                }
                else {
                    characterPlayer.setPlayerData(key, value as DataValueType, permission);
                    gnPlayerData.add(CharacterPlayerParameterCode.Value, value);
                    gnPlayerData.add(CharacterPlayerParameterCode.Permission, permission);
                }
            }

            gnPlayerDatas.add(gnPlayerData);
        }

		characterPlayer.saveAsync();

        gnInfoGetParameters.add(CharacterPlayerParameterCode.PlayerDatas, gnPlayerDatas);

        operationResponse.setParameter(CharacterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, CharacterPlayerErrorCode.Ok);

		return operationResponse;
    }
}
