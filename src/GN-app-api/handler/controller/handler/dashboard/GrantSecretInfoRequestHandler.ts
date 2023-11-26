import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo, SecretPermissionItem, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { SecretInfoItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { PermissionParam } from "./model/PermissionParam";

class GrantSecretInfoOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true, isOptional: true })
	secretKey?: string;

	@StringDataMember({ code: GNParameterCode.GameId, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true })
	gameId?: string;

	@NumberDataMember({ code: GNParameterCode.Role, mustInt: true })
	role: number;

	@GNHashtableDataMember({ code: GNParameterCode.Permission, isOptional: true })
	permissionParam?: PermissionParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GrantSecretInfoRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GrantSecretInfo;
	}

	public override getCommonOperationRequest() {
		return GrantSecretInfoOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.grantSecretInfo.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			secretKey: request.secretKey,
			creatorId: authInfo.getUserId(),
			gameId: request.gameId,
			role: request.role,
			permissionParam: request.permissionParam,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { secretKey: string, gameId: string, role: number, creatorId: string, permissionParam: PermissionParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		if (!request.secretKey) request.secretKey = StringUtility.generateRandomString(20, 0);

		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GrantSecretInfo", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

		if (result != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.SecretInfoIsExists);
			return operationResponse;
		}

		let permission = request.permissionParam ?? (request.role == SecretRole.Player ? GrantSecretInfoRequestHandler.generateRecommendPlayerPermission() : GrantSecretInfoRequestHandler.generateDefaultPermission(false, false, false, false));

		result = {
			type: "secretInfo",
			secretKey: request.secretKey,
			gameId: request.gameId,
			role: request.role,
			permission: permission,
			creatorId: request.creatorId,
			remove: false,
			tsExpire: -1,
			tsCreate: xDatetime.getCurrentMilliseconds(),
		} as any;

		await collection.insertOne(result);

		let secretInfoItem = new SecretInfoItem(result, collection);

		let newSecretInfo = SecretInfo.Builder()
			.setGameId(secretInfoItem.getGameId())
			.setIsRemove(secretInfoItem.getRemove())
			.setPermission(secretInfoItem.getPermission())
			.setRole(secretInfoItem.getRole())
			.setSecretKey(secretInfoItem.getSecretKey())
			.setTsExpire(secretInfoItem.getTsExpire())
			.build();

		this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

		operationResponse.setParameter(GNParameterCode.SecretKey, request.secretKey);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GrantSecretInfo", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

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
				setPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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

				setPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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
				grantGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				grantPlayerItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				grantPlayerCharacter: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

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
				sendSocketOperationEvent: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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

				setPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getPlayerCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setPlayerStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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
				grantPlayerItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				grantGroup: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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

				setGroupCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGroupCurrency: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

				setGroupStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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
				grantGroupItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },

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

				setItemStatistics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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
				grantStoreItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setRemoveStatus: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setStoreItemInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				validateAppleAppStoreReceipt: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				validateGooglePlayStoreReceipt: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				validateFacebookStoreReceipt: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getCreateLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getStoreLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				presentStoreItem: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
			},
			masterAdmin: {
				setMasterGameSettings: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				grantAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				removeAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setPasswordAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setSecretKeyAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setGameInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				grantGame: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				changePasswordAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAdminAccountList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGameInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getGameList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getMasterGameSettings: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getServerLog: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSecretInfoInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getSecretInfoList: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				grantSecretInfo: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setSecretInfoInformation: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getUsernameAdminAccount: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getAnalytics: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				setEventCallbackCloudScript: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getEventCallbackCloudScript: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				resetStatisticsLeaderboard: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getBackupStatisticsLeaderboardVersion: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
				getServerGameData: { selfEnable: selfEnable, otherSelfEnable: otherSelfEnable, adminSelfEnable: adminSelfEnable, serverSelfEnable: serverSelfEnable, },
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
				linkAndroidDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkApple: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkCustomDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkCustomId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkEditorDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkFacebook: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkGenericService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkGoogle: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkiOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkLinuxDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkMacOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkWindowsDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkWindowsPhoneDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkGooglePlayGameService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				linkGameCenter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkAccount: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkAndroidDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkApple: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkCustomDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkCustomId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkEditorDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkFacebook: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGenericService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGoogle: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkiOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkLinuxDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkMacOSDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkWindowsDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkWindowsPhoneDeviceId: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				unlinkGooglePlayGameService: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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
				setPlayerCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setPlayerStatistics: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
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
				getExternal: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayersWithDisplayName: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				setEmail: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getEmail: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCurrencyLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getLastLoginLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				getStatisticsLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCurrencyLog: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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

				setPlayerCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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
				grantGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				grantPlayerItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				grantPlayerCharacter: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

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
				sendSocketOperationEvent: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
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

				setPlayerCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getPlayerCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setPlayerStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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
				grantPlayerItem: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

				grantGroup: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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

				setGroupCurrency: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGroupCurrency: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },

				setGroupStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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
				grantGroupItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },

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

				setItemStatistics: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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
				grantStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setRemoveStatus: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setStoreItemInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				validateAppleAppStoreReceipt: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				validateGooglePlayStoreReceipt: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				validateFacebookStoreReceipt: { selfEnable: true, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getCreateLeaderboard: { selfEnable: true, otherSelfEnable: true, adminSelfEnable: false, serverSelfEnable: false, },
				presentStoreItem: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getStoreLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
			},
			masterAdmin: {
				setMasterGameSettings: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				grantAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				removeAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setPasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretKeyAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				grantGame: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				changePasswordAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAdminAccountList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getGameList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getMasterGameSettings: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerLog: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getSecretInfoList: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				grantSecretInfo: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setSecretInfoInformation: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getUsernameAdminAccount: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getAnalytics: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getEventCallbackCloudScript: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				setEventCallbackCloudScript: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				resetStatisticsLeaderboard: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getBackupStatisticsLeaderboardVersion: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
				getServerGameData: { selfEnable: false, otherSelfEnable: false, adminSelfEnable: false, serverSelfEnable: false, },
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
