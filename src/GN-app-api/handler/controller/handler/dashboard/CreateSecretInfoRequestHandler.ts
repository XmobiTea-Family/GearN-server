import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo, SecretPermissionItem, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { SecretInfoItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { PermissionParam } from "./model/PermissionParam";

class CreateSecretInfoOperationRequest extends OperationRequest {

	// Stores the secret key value used by this instance.
	@StringDataMember({ code: ParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true, isOptional: true })
	public secretKey?: string;

	// Stores the game ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true, isOptional: true })
	public gameId?: string;

	// Stores the role value used by this instance.
	@NumberDataMember({ code: ParameterCode.Role, mustInt: true, minValue: 1, maxValue: 3 })
	public role: number;

	// Stores the permission parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.PermissionParam, isOptional: true })
	public permissionParam?: PermissionParam;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateSecretInfoRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.CreateSecretInfo;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return CreateSecretInfoOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.createSecretInfo.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			secretKey: request.secretKey,
			creatorId: authInfo.getUserId(),
			gameId: request.gameId,
			role: request.role,
			permissionParam: request.permissionParam,
		}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { secretKey: string, gameId: string, role: number, creatorId: string, permissionParam: PermissionParam }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		if (!request.secretKey) request.secretKey = StringUtility.generateRandomString(20, 0);

		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_CreateSecretInfo", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

		if (result != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.SecretInfoIsExists);
			return operationResponse;
		}

		// Stores the permission value used in the current execution flow.
		let permission = request.permissionParam ?? (request.role == SecretRole.Player ? CreateSecretInfoRequestHandler.generateRecommendPlayerPermission() : request.role == SecretRole.Server ? CreateSecretInfoRequestHandler.generateRecommendServerPermission() : request.role == SecretRole.Admin ? CreateSecretInfoRequestHandler.generateRecommendAdminPermission() : CreateSecretInfoRequestHandler.generateDefaultPermission(false, false, false, false));

		result = {
			type: "secretInfo",
			secretKey: request.secretKey,
			gameId: request.gameId,
			role: request.role,
			permission: permission,
			creatorId: request.creatorId,
			remove: false,
			tsExpire: -1,
			description: "",
			tsCreate: xDatetime.getCurrentMilliseconds(),
		} as any;

		await collection.insertOne(result);

		// Stores the secret info item value used in the current execution flow.
		let secretInfoItem = new SecretInfoItem(result, collection);

		// Stores the new secret info value used in the current execution flow.
		let newSecretInfo = SecretInfo.Builder()
			.setGameId(secretInfoItem.getGameId())
			.setIsRemove(secretInfoItem.getRemove())
			.setPermission(secretInfoItem.getPermission())
			.setRole(secretInfoItem.getRole())
			.setSecretKey(secretInfoItem.getSecretKey())
			.setTsExpire(secretInfoItem.getTsExpire())
			.setDescription(secretInfoItem.getDescription())
			.build();

		this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

		operationResponse.setParameter(ParameterCode.SecretKey, request.secretKey);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_CreateSecretInfo", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Executes the generate default permission workflow.
	 * @param selfEnable Provides the self enable value used by this operation.
	 * @param otherSelfEnable Provides the other self enable value used by this operation.
	 * @param adminSelfEnable Provides the admin self enable value used by this operation.
	 * @param serverSelfEnable Provides the server self enable value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static generateDefaultPermission(selfEnable: boolean, otherSelfEnable: boolean, adminSelfEnable: boolean, serverSelfEnable: boolean): SecretPermissionItem {
		//let answer = {} as any;

		let answer: SecretPermissionItem = {
			authenticate: {
				loginByAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByAndroidDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByApple: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByCustomDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByCustomId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByFacebook: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByGenericService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByGoogle: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByGameCenter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByGooglePlayGameService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByiOSDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByWindowsPhoneDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				registerAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByEditorDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByLinuxDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByMacOSDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				loginByWindowsDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				refreshAuthToken: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			masterPlayer: {
				linkAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkAndroidDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkApple: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkCustomDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkCustomId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkEditorDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkFacebook: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkGenericService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkGoogle: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkiOSDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkLinuxDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkMacOSDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkWindowsDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkWindowsPhoneDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkGooglePlayGameService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				linkGameCenter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkAndroidDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkApple: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkCustomDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkCustomId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkEditorDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkFacebook: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkGenericService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkGoogle: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkiOSDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkLinuxDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkMacOSDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkWindowsDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkWindowsPhoneDeviceId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkGooglePlayGameService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				unlinkGameCenter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				addSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTsCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getIpAddressCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setTsLastLogin: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTsLastLogin: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setPlayerBan: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerBan: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setCountryCode: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCountryCode: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				changeAccountPassword: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				resetAccountPassword: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				changePlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				changePlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setPlayerData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithApple: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithFacebook: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithGoogle: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithGenericService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithGooglePlayGameService: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithGameCenter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getExternal: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setEmail: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getEmail: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCurrencyLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getLastLoginLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCurrencyLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				sendSocketOperationEvent: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				sendEmail: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				sendPushNotification: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPushNotification: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				addPushNotification: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removePushNotification: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			gamePlayer: {
				addSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getTsCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getIpAddressCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTsLastLogin: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setPlayerBan: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerBan: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setCountryCode: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCountryCode: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changePlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changePlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setPlayerData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayerInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayersWithSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayerCharacter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerInventory: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerFriend: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				removePlayerItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getOnlineStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createPlayerItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createPlayerCharacter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				addPlayerFriend: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removePlayerFriend: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				removePlayerCharacter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				joinGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				leaveGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayersWithDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getFriendStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCurrencyLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getLastLoginLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getStatisticsLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCurrencyLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			characterPlayer: {
				addSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getTsCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getIpAddressCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTsLastLogin: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setPlayerBan: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerBan: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setCountryCode: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCountryCode: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changePlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changePlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setPlayerData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayerInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayersWithSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayersWithTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCatalogId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getOwner: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayerFriend: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerInventory: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removePlayerItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createPlayerItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				createGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				joinGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				leaveGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setOwner: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				addPlayerFriend: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removePlayerFriend: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getPlayersWithDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getFriendStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCurrencyLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getLastLoginLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCurrencyLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			content: {
				getContentData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setContentData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createNewFileUploadInfo: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getFileUploadInfo: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getFileUploadInfoList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeFileUploadInfo: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				requestDownloadFileUploadInfo: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			group: {
				addSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getTsCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changeGroupCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGroupCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changeGroupStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGroupStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLeaderboardAroundGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setGroupData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGroupData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getGroupInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getGroupsWithSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGroupsWithTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCatalogId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getGroupInventory: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeGroupItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createGroupItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getMembers: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				addMember: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeMember: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				sendGroupMessage: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGroupMessage: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getGroupsWithDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCurrencyLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCurrencyLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			inventory: {
				addSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getTsCreate: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAvatar: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				changeItemStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getItemStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLeaderboardAroundItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setCustomData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setItemData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getItemData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getItemInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getItemsWithSegment: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getItemsWithTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getCatalogId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getClassId: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getItemType: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAmount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getOwner: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setAmount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setOwner: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				getItemsWithDisplayName: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStatisticsLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			storeInventory: {
				buyStoreItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStoreItemInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStoreItemsWithTag: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createStoreItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setStoreItemInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				validateAppleAppStoreReceipt: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				validateGooglePlayStoreReceipt: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				validateFacebookStoreReceipt: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStoreLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				presentStoreItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStoreUsed: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeStoreUsed: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			masterAdmin: {
				setMasterGameSettings: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setPasswordAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setSecretKeyAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setGameInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createGame: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				changePasswordAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAdminAccountList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGameInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGameList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getMasterGameSettings: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getServerLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSecretInfoInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSecretInfoList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createSecretInfo: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setSecretInfoInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getUsernameAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAnalytics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setEventCallbackCloudScript: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getEventCallbackCloudScript: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				resetStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getBackupStatisticsLeaderboardVersion: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getServerGameData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				deleteInDatabase: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			multiplayer: {
				cancelAllMatchmakingTicket: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				cancelMatchmakingTicket: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				createMatchmakingTicket: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getMatch: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getMatchmakingTicket: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getQueueStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				joinMatchmakingTicket: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				listMatchmakingTicketsForPlayer: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAllMatchmakingTicket: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAllMatch: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			cloudScript: {
				addFunction: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable },
				editFunction: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable },
				executeFunction: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable },
				getFunction: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable },
				getFunctions: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable },
			},

		};

		return answer;
	}

	/**
	 * Executes the generate recommend server permission workflow.
	 * @returns Returns the operation result.
	 */
	public static generateRecommendServerPermission(): SecretPermissionItem {
		// Stores the answer value used in the current execution flow.
		let answer: SecretPermissionItem = {
			authenticate: {
				loginByAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByAndroidDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByCustomDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByCustomId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByiOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByWindowsPhoneDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				registerAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByEditorDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByLinuxDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByMacOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByWindowsDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				refreshAuthToken: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			masterPlayer: {
				linkAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkAndroidDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkAndroidDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkCustomDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkCustomDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkCustomId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkCustomId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkEditorDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkEditorDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkiOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkiOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkLinuxDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkLinuxDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkMacOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkMacOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkWindowsDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkWindowsDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkWindowsPhoneDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkWindowsPhoneDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getIpAddressCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changeAccountPassword: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				resetAccountPassword: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changePlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				changePlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayerInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayersWithApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getExternal: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getLastLoginLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				sendSocketOperationEvent: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				sendEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				sendPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				addPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removePushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

			},
			gamePlayer: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getIpAddressCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changePlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changePlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayerInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayersWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayerCharacter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerInventory: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				removePlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getOnlineStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createPlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createPlayerCharacter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				addPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removePlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				removePlayerCharacter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				joinGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				leaveGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayersWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getFriendStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getLastLoginLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			characterPlayer: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getIpAddressCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changePlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changePlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayerInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayersWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayersWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCatalogId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getPlayerInventory: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removePlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createPlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				createGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				joinGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				leaveGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				addPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removePlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getPlayersWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getFriendStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getLastLoginLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			content: {
				getContentData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setContentData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createNewFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getFileUploadInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				requestDownloadFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			group: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changeGroupCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getGroupCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changeGroupStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getGroupStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLeaderboardAroundGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setGroupData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getGroupData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getGroupInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getGroupsWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getGroupsWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCatalogId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getGroupInventory: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getMembers: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				addMember: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeMember: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				sendGroupMessage: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getGroupMessage: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getGroupsWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			inventory: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				changeItemStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getItemStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLeaderboardAroundItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setItemData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getItemData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getItemsWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getItemsWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getCatalogId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getClassId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getItemType: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAmount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setAmount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },

				getItemsWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			storeInventory: {
				buyStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStoreItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStoreItemsWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				setStoreItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				validateAppleAppStoreReceipt: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				validateGooglePlayStoreReceipt: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				validateFacebookStoreReceipt: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				presentStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStoreLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getStoreUsed: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				removeStoreUsed: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			masterAdmin: {
				setMasterGameSettings: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setPasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretKeyAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createGame: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				changePasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAdminAccountList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getMasterGameSettings: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createSecretInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getUsernameAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAnalytics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getEventCallbackCloudScript: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setEventCallbackCloudScript: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				resetStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getBackupStatisticsLeaderboardVersion: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerGameData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				deleteInDatabase: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			multiplayer: {
				cancelAllMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				cancelMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				createMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getMatch: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getQueueStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				joinMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				listMatchmakingTicketsForPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAllMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
				getAllMatch: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true, },
			},
			cloudScript: {
				addFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				editFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				executeFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: true },
				getFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				getFunctions: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
			},

		};

		return answer;
	}

	/**
	 * Executes the generate recommend admin permission workflow.
	 * @returns Returns the operation result.
	 */
	public static generateRecommendAdminPermission(): SecretPermissionItem {
		// Stores the answer value used in the current execution flow.
		let answer: SecretPermissionItem = {
			authenticate: {
				loginByAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByAndroidDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByCustomDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByCustomId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByiOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByWindowsPhoneDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				registerAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByEditorDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByLinuxDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByMacOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByWindowsDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				refreshAuthToken: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			masterPlayer: {
				linkAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkAndroidDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkAndroidDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkCustomDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkCustomDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkCustomId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkCustomId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkEditorDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkEditorDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkiOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkiOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkLinuxDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkLinuxDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkMacOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkMacOSDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkWindowsDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkWindowsDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkWindowsPhoneDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkWindowsPhoneDeviceId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				linkGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				unlinkGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getIpAddressCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changeAccountPassword: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				resetAccountPassword: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changePlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				changePlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayerInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayersWithApple: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithFacebook: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithGoogle: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithGenericService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithGooglePlayGameService: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithGameCenter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getExternal: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				sendSocketOperationEvent: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				sendEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				sendPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				addPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removePushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

			},
			gamePlayer: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getIpAddressCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changePlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changePlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayerInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayersWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayerCharacter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerInventory: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				removePlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getOnlineStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createPlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createPlayerCharacter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				addPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removePlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				removePlayerCharacter: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				joinGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				leaveGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayersWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getFriendStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			characterPlayer: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getIpAddressCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTsLastLogin: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerBan: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCountryCode: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changePlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changePlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayerInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayersWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayersWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCatalogId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getPlayerInventory: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removePlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createPlayerItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				createGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				joinGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				leaveGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				addPlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removePlayerFriend: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getPlayersWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getFriendStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			content: {
				getContentData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setContentData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createNewFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getFileUploadInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				requestDownloadFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			group: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changeGroupCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getGroupCurrency: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changeGroupStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getGroupStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundGroup: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setGroupData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getGroupData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getGroupInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getGroupsWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getGroupsWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCatalogId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getGroupInventory: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getMembers: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				addMember: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeMember: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				sendGroupMessage: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getGroupMessage: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getGroupsWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			inventory: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getTsCreate: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAvatar: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				changeItemStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getItemStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setCustomData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setItemData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getItemData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getItemsWithSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getItemsWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getCatalogId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getClassId: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getItemType: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAmount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setAmount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setOwner: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },

				getItemsWithDisplayName: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			storeInventory: {
				buyStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStoreItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStoreItemsWithTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				setStoreItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				validateAppleAppStoreReceipt: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				validateGooglePlayStoreReceipt: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				validateFacebookStoreReceipt: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				presentStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStoreLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getStoreUsed: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				removeStoreUsed: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			masterAdmin: {
				setMasterGameSettings: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setPasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretKeyAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createGame: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				changePasswordAdminAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAdminAccountList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameList: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getMasterGameSettings: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoInformation: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createSecretInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getUsernameAdminAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAnalytics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getEventCallbackCloudScript: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setEventCallbackCloudScript: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				resetStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getBackupStatisticsLeaderboardVersion: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerGameData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				deleteInDatabase: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			multiplayer: {
				cancelAllMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				cancelMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				createMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getMatch: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getQueueStatistics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				joinMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				listMatchmakingTicketsForPlayer: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAllMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
				getAllMatch: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false, },
			},
			cloudScript: {
				addFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false },
				editFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false },
				executeFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false },
				getFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false },
				getFunctions: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: true, serverSelfEnable: false },
			},

		};

		return answer;
	}

	/**
	 * Executes the generate recommend player permission workflow.
	 * @returns Returns the operation result.
	 */
	public static generateRecommendPlayerPermission(): SecretPermissionItem {
		//let answer = {} as any;

		let answer: SecretPermissionItem = {
			authenticate: {
				loginByAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByAndroidDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByApple: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByCustomDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByCustomId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByFacebook: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGenericService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGoogle: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGameCenter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByGooglePlayGameService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByiOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByWindowsPhoneDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				registerAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByEditorDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByLinuxDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByMacOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				loginByWindowsDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				refreshAuthToken: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			masterPlayer: {
				linkAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkAndroidDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkAndroidDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkApple: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkApple: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkCustomDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkCustomDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkCustomId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkCustomId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkEditorDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkEditorDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkFacebook: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkFacebook: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGenericService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGenericService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGoogle: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGoogle: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkiOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkiOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkLinuxDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkLinuxDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkMacOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkMacOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkWindowsDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkWindowsDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkWindowsPhoneDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkWindowsPhoneDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGooglePlayGameService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGooglePlayGameService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				linkGameCenter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGameCenter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setDisplayName: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getTsCreate: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getIpAddressCreate: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setTsLastLogin: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTsLastLogin: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerBan: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerBan: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setCountryCode: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCountryCode: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changeAccountPassword: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				resetAccountPassword: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setAvatar: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAvatar: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changePlayerCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayerStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				changePlayerStatistics: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCustomData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setCustomData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayerInformation: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayersWithApple: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithFacebook: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithGoogle: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithGenericService: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithGooglePlayGameService: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithGameCenter: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getExternal: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setEmail: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getEmail: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				sendSocketOperationEvent: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				sendEmail: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				sendPushNotification: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPushNotification: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				addPushNotification: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removePushNotification: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

			},
			gamePlayer: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setDisplayName: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getTsCreate: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getIpAddressCreate: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTsLastLogin: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerBan: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerBan: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setCountryCode: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCountryCode: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setAvatar: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAvatar: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changePlayerCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changePlayerStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerStatistics: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCustomData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setCustomData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayerInformation: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayersWithSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayerCharacter: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerInventory: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerGroup: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerFriend: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				removePlayerItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getOnlineStatus: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				createGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createPlayerItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createPlayerCharacter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				addPlayerFriend: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removePlayerFriend: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				removePlayerCharacter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				joinGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				leaveGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayersWithDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getFriendStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			characterPlayer: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setDisplayName: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getTsCreate: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getIpAddressCreate: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTsLastLogin: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerBan: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerBan: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setCountryCode: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCountryCode: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setAvatar: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAvatar: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changePlayerCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changePlayerStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerStatistics: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundPlayer: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCustomData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setCustomData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayerInformation: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayersWithSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getCatalogId: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getOwner: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getRemoveStatus: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayerFriend: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerGroup: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerInventory: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				removePlayerItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createPlayerItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				createGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				joinGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				leaveGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setOwner: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				addPlayerFriend: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removePlayerFriend: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getPlayersWithDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setRemoveStatus: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getFriendStatisticsLeaderboardAroundPlayer: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getFriendStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			content: {
				getContentData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setContentData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createNewFileUploadInfo: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getFileUploadInfo: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getFileUploadInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeFileUploadInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				requestDownloadFileUploadInfo: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			group: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setDisplayName: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getTsCreate: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setAvatar: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAvatar: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changeGroupCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGroupCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changeGroupStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGroupStatistics: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCustomData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setCustomData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setGroupData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGroupData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getGroupInformation: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getGroupsWithSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getGroupsWithTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getCatalogId: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getRemoveStatus: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getGroupInventory: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getMembers: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				addMember: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeMember: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				sendGroupMessage: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGroupMessage: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getGroupsWithDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getCurrencyLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			inventory: {
				addSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeSegment: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeTag: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setDisplayName: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getTsCreate: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setAvatar: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAvatar: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				changeItemStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getItemStatistics: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getStatisticsLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLeaderboardAroundItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getCustomData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setCustomData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setItemData: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getItemData: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getItemInformation: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getItemsWithSegment: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getItemsWithTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				getCatalogId: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getClassId: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getItemType: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getAmount: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getOwner: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getRemoveStatus: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setAmount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setOwner: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				getItemsWithDisplayName: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
			},
			storeInventory: {
				buyStoreItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getStoreItemInformation: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStoreItemsWithTag: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				createStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setStoreItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				validateAppleAppStoreReceipt: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				validateGooglePlayStoreReceipt: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				validateFacebookStoreReceipt: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				presentStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getStoreLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getStoreUsed: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeStoreUsed: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			masterAdmin: {
				setMasterGameSettings: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setPasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretKeyAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createGame: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				changePasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAdminAccountList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getMasterGameSettings: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createSecretInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getUsernameAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAnalytics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getEventCallbackCloudScript: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setEventCallbackCloudScript: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				resetStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getBackupStatisticsLeaderboardVersion: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerGameData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				deleteInDatabase: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			multiplayer: {
				cancelAllMatchmakingTicket: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				cancelMatchmakingTicket: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				createMatchmakingTicket: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getMatch: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getMatchmakingTicket: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getQueueStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				joinMatchmakingTicket: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				listMatchmakingTicketsForPlayer: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAllMatchmakingTicket: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAllMatch: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			cloudScript: {
				addFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				editFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				executeFunction: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				getFunction: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
				getFunctions: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false },
			},

		};

		return answer;
	}

}
