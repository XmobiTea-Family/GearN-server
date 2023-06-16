import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { StatisticsAggregationMethod } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsAggregationMethod";
import { DataValueType } from "../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/PermissionDataItem";

class SetPlayerDataOperationRequest extends OperationRequest {
	@GNArrayDataMember({ code: MasterPlayerParameterCode.PlayerDatas, minLength: 1, maxLength: 32, mustNonNull: true })
	playerDatas: GNArray;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetPlayerDataOperationRequest extends SetPlayerDataOperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

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

		if (!secretInfo.getPermission().masterPlayer.setPlayerData.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(authInfo.getUserId(), request.playerDatas, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetPlayerDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.setPlayerData.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.playerDatas, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetPlayerDataOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.setPlayerData.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.userId, request.playerDatas, operationRequest);
    }

    private async execute(userId: string, playerDatas: GNArray, operationRequest: OperationRequest): Promise<OperationResponse> {
        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            playerDatas: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();
        let gnPlayerDatas = new GNArray();

        for (let i = 0; i < playerDatas.count(); i++) {
            let gnHashtable = playerDatas.getGNHashtable(i);

            let key = gnHashtable.getString(MasterPlayerParameterCode.Key);
            let value = gnHashtable.getObject(MasterPlayerParameterCode.Value);
            let permission = gnHashtable.getNumber(MasterPlayerParameterCode.Permission);
            
            let gnPlayerData = new GNHashtable();
            gnPlayerData.add(MasterPlayerParameterCode.Key, key);

            if (!masterPlayer.hasPlayerData(key)) {
                masterPlayer.setPlayerData(key, value as DataValueType, permission);
                gnPlayerData.add(MasterPlayerParameterCode.Value, value);
                gnPlayerData.add(MasterPlayerParameterCode.Permission, permission);
            }
            else {
                let playerData = masterPlayer.getPlayerData(key);
                let playerDataPermissionDataItem = <PermissionDataItem>playerData.permission;

                if (playerDataPermissionDataItem == PermissionDataItem.ReadOnlyPrivate || playerDataPermissionDataItem == PermissionDataItem.ReadOnlyPublic) {

                }
                else {
                    masterPlayer.setPlayerData(key, value as DataValueType, permission);
                    gnPlayerData.add(MasterPlayerParameterCode.Value, value);
                    gnPlayerData.add(MasterPlayerParameterCode.Permission, permission);
                }
            }

            gnPlayerDatas.add(gnPlayerData);
        }

		masterPlayer.saveAsync();

        gnInfoGetParameters.add(MasterPlayerParameterCode.PlayerDatas, gnPlayerDatas);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);

		return operationResponse;
    }
}
