import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { GNErrorCode } from "../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo, SecretRole } from "../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "../base/RequestHandler";
import * as mongoDB from "mongodb";
import { OwnerType } from "../../../../../GN-common/constant/enumType/OwnerType";

class GetBackupStatisticsLeaderboardVersionOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
    gameId: string;

    @NumberDataMember({ code: GNParameterCode.OwnerType, mustInt: true })
    type: number;

    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32 })
    key: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetBackupStatisticsLeaderboardVersionRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.GetBackupStatisticsLeaderboardVersion;
    }

    public override getCommonOperationRequest() {
        return GetBackupStatisticsLeaderboardVersionOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(operationRequest);
        }

        if (!secretInfo.getPermission().masterAdmin.getBackupStatisticsLeaderboardVersion.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            gameId: request.gameId,
            type: request.type,
            key: request.key,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { gameId: string, type: number, key: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetBackupStatisticsLeaderboardKey", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let backupStatisticsLeaderboardCollection: mongoDB.Collection<mongoDB.Document>;
        if (request.type == OwnerType.MasterPlayer) {
            backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer.StatisticsBackup");
        }
        else {
            let gameId = request.gameId;

            if (request.type == OwnerType.GamePlayer) {
                backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer.StatisticsBackup", gameId);
            }
            else if (request.type == OwnerType.CharacterPlayer) {
                backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer.StatisticsBackup", gameId);
            }
            else if (request.type == OwnerType.Inventory) {
                backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemGameCollection("Inventory.StatisticsBackup", gameId);
            }
            else if (request.type == OwnerType.Group) {
                backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().systemGameCollection("Group.StatisticsBackup", gameId);
            }
            else {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.OwnerNotFound);
                return operationResponse;
            }
        }

        let type = request.type;
        let key = request.key;

        let results = backupStatisticsLeaderboardCollection.find({ type: type, key: key }, {
            projection: {
                version: true,
                log: true,
                tsCreate: true,
            }
        }).sort({ _id: -1 });

        let gnResults = new GNArray();

        while (await results.hasNext()) {
            let result = await results.next();

            let gnResult = new GNHashtable();
            gnResult.add(GNParameterCode.Version, result["version"]);
            gnResult.add(GNParameterCode.Log, result["log"]);
            gnResult.add(GNParameterCode.TsCreate, result["tsCreate"]);

            gnResults.add(gnResult);
        }

        operationResponse.setParameter(GNParameterCode.Results, gnResults);
        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetBackupStatisticsLeaderboardKey", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
