import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import * as mongoDB from "mongodb";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GetBackupStatisticsLeaderboardVersionOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

	@NumberDataMember({ code: ParameterCode.OwnerType, mustInt: true })
	public type: number;

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

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

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let type = request.type;

		let backupStatisticsLeaderboardCollection: mongoDB.Collection<mongoDB.Document>;
		if (type == OwnerType.MasterPlayer) {
			backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");
		}
		else {
			let gameId = request.gameId;

			if (type == OwnerType.GamePlayer) {
				backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
			}
			else if (type == OwnerType.CharacterPlayer) {
				backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
			}
			else if (type == OwnerType.Inventory) {
				backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
			}
			else if (type == OwnerType.Group) {
				backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
			}
			else {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.OwnerNotFound);
				return operationResponse;
			}
		}

		let key = request.key;

		let results = backupStatisticsLeaderboardCollection.find({ key: key }, {
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
			gnResult.add(ParameterCode.Version, result["version"]);
			gnResult.add(ParameterCode.Log, result["log"]);
			gnResult.add(ParameterCode.TsCreate, result["tsCreate"]);

			gnResults.add(gnResult);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetBackupStatisticsLeaderboardKey", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
