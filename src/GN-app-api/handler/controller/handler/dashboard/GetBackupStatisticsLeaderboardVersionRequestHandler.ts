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

	// Stores the game ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetBackupStatisticsLeaderboardVersionRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetBackupStatisticsLeaderboardVersion;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetBackupStatisticsLeaderboardVersionOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { gameId: string, type: number, key: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetBackupStatisticsLeaderboardKey", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the type value used in the current execution flow.
		let type = request.type;

		// Stores the backup statistics leaderboard collection value used in the current execution flow.
		let backupStatisticsLeaderboardCollection: mongoDB.Collection<mongoDB.Document>;
		if (type == OwnerType.MasterPlayer) {
			backupStatisticsLeaderboardCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");
		}
		else {
			// Stores the game ID value used in the current execution flow.
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

		// Stores the key value used in the current execution flow.
		let key = request.key;

		// Stores the results value used in the current execution flow.
		let results = backupStatisticsLeaderboardCollection.find({ key: key }, {
			projection: {
				version: true,
				log: true,
				tsCreate: true,
			}
		}).sort({ _id: -1 });

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		while (await results.hasNext()) {
			// Stores the result value used in the current execution flow.
			let result = await results.next();

			// Stores the GearN result value used in the current execution flow.
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
