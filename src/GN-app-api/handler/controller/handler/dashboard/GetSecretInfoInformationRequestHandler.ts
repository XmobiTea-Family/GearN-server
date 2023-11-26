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
import { GNHashtable } from "./../../../../../GN-common/common/GNData";

class GetSecretInfoInformationOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
	secretKey: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetSecretInfoInformationRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetSecretInfoInformation;
	}

	public override getCommonOperationRequest() {
		return GetSecretInfoInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.getSecretInfoInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({ secretKey: request.secretKey }, secretInfo, operationRequest);
	}

	private async execute(request: { secretKey: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetSecretInfoInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.SecretInfoNotFound);
			return operationResponse;
		}

		let secretInfoItem = new SecretInfoItem(result, collection);

		operationResponse.setParameter(GNParameterCode.SecretKey, secretInfoItem.getSecretKey());
		operationResponse.setParameter(GNParameterCode.GameId, secretInfoItem.getGameId());
		operationResponse.setParameter(GNParameterCode.Role, secretInfoItem.getRole());
		operationResponse.setParameter(GNParameterCode.TsCreate, secretInfoItem.getTsCreate());
		operationResponse.setParameter(GNParameterCode.CreatorId, secretInfoItem.getCreatorId());
		operationResponse.setParameter(GNParameterCode.Remove, secretInfoItem.getRemove());
		operationResponse.setParameter(GNParameterCode.TsExpire, secretInfoItem.getTsExpire());

		let gnPermission = GetSecretInfoInformationRequestHandler.getPermissionHashtable(secretInfoItem.getPermission());

		operationResponse.setParameter(GNParameterCode.Permission, gnPermission);

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetSecretInfoInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	public static getPermissionHashtable(permission: SecretPermissionItem): GNHashtable {
		let gnPermission = new GNHashtable();

		{
			let gnAuthenticate = new GNHashtable();
			let authenticate = permission.authenticate;

			{
				let permissionRules = authenticate.loginByAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByAccount, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByAndroidDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByAndroidDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByApple, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByCustomDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByCustomDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByCustomId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByCustomId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByFacebook, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByGenericService, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByGoogle, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByiOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByiOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByWindowsPhoneDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByWindowsPhoneDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.registerAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.RegisterAccount, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByEditorDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByEditorDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByLinuxDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByLinuxDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByMacOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByMacOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByWindowsDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.LoginByWindowsDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.refreshAuthToken;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(GNParameterCode.RefreshAuthToken, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.Authenticate, gnAuthenticate);
		}

		{
			let gnMasterPlayer = new GNHashtable();
			let masterPlayer = permission.masterPlayer;

			{
				let permissionRules = masterPlayer.linkAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkAndroidDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkAndroidDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkApple, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkCustomDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkCustomDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkCustomId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkCustomId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkEditorDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkEditorDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkFacebook, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkGenericService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkGoogle, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkiOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkiOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkLinuxDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkLinuxDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkMacOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkMacOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkWindowsDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkWindowsDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkWindowsPhoneDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkWindowsPhoneDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.LinkGameCenter, gnPermissionRules);
			}


			{
				let permissionRules = masterPlayer.unlinkAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkAndroidDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkAndroidDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkApple, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkCustomDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkCustomDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkCustomId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkCustomId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkEditorDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkEditorDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkFacebook, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkGenericService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkGoogle, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkiOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkiOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkLinuxDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkLinuxDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkMacOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkMacOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkWindowsDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkWindowsDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkWindowsPhoneDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkWindowsPhoneDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.UnlinkGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getIpAddressCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetIpAddressCreate, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.changeAccountPassword;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.ChangeAccountPassword, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.resetAccountPassword;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.ResetAccountPassword, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayerInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithApple, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithFacebook, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithGoogle, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithGenericService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getExternal;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetExternal, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setEmail;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.SetEmail, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getEmail;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetEmail, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getLastLoginLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(GNParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.MasterPlayer, gnMasterPlayer);
		}

		{
			let gnGamePlayer = new GNHashtable();
			let gamePlayer = permission.gamePlayer;

			{
				let permissionRules = gamePlayer.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getIpAddressCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetIpAddressCreate, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerInformation, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayersWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayersWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayersWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayersWithTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerCharacter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerCharacter, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerInventory;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerInventory, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removePlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.RemovePlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getOnlineStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetOnlineStatus, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.grantGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GrantGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.grantPlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GrantPlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.grantPlayerCharacter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GrantPlayerCharacter, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.addPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.AddPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removePlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.RemovePlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removePlayerCharacter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.RemovePlayerCharacter, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.joinGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.JoinGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.leaveGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.LeaveGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayersWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getFriendStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getFriendStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetFriendStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.sendSocketOperationEvent;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.SendSocketOperationEvent, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(GNParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.GamePlayer, gnGamePlayer);
		}

		{
			let gnCharacterPlayer = new GNHashtable();
			let characterPlayer = permission.characterPlayer;

			{
				let permissionRules = characterPlayer.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getIpAddressCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetIpAddressCreate, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerInformation, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayersWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayersWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayersWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayersWithTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCatalogId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetCatalogId, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetOwner, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerInventory;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayerInventory, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removePlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.RemovePlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.grantPlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GrantPlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.grantGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GrantGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.joinGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.JoinGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.leaveGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.LeaveGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetOwner, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.addPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.AddPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removePlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.RemovePlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayersWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getFriendStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getFriendStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetFriendStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(GNParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.CharacterPlayer, gnCharacterPlayer);
		}

		{
			let gnContent = new GNHashtable();
			let content = permission.content;

			{
				let permissionRules = content.getContentData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.GetContentData, gnPermissionRules);
			}

			{
				let permissionRules = content.setContentData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.SetContentData, gnPermissionRules);
			}

			{
				let permissionRules = content.createNewFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.CreateNewFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.getFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.GetFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.requestDownloadFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.RequestDownloadFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.removeFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.RemoveFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.getFileUploadInfoList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(GNParameterCode.GetFileUploadInfoList, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.Content, gnContent);
		}

		{
			let gnGroup = new GNHashtable();
			let group = permission.group;

			{
				let permissionRules = group.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = group.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = group.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = group.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = group.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = group.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = group.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = group.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = group.setGroupCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetGroupCurrency, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupCurrency, gnPermissionRules);
			}

			{
				let permissionRules = group.setGroupStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetGroupStatistics, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupStatistics, gnPermissionRules);
			}

			{
				let permissionRules = group.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = group.getStatisticsLeaderboardAroundGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetStatisticsLeaderboardAroundGroup, gnPermissionRules);
			}

			{
				let permissionRules = group.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = group.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = group.setGroupData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetGroupData, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupData, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupInformation, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupsWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupsWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupsWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupsWithTag, gnPermissionRules);
			}

			{
				let permissionRules = group.getCatalogId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetCatalogId, gnPermissionRules);
			}

			{
				let permissionRules = group.getRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupInventory;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupInventory, gnPermissionRules);
			}

			{
				let permissionRules = group.removeGroupItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.RemoveGroupItem, gnPermissionRules);
			}

			{
				let permissionRules = group.grantGroupItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GrantGroupItem, gnPermissionRules);
			}

			{
				let permissionRules = group.getMembers;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetMembers, gnPermissionRules);
			}

			{
				let permissionRules = group.addMember;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.AddMember, gnPermissionRules);
			}

			{
				let permissionRules = group.removeMember;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.RemoveMember, gnPermissionRules);
			}

			{
				let permissionRules = group.sendGroupMessage;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SendGroupMessage, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupMessage;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupMessage, gnPermissionRules);
			}

			{
				let permissionRules = group.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupsWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetGroupsWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = group.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = group.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = group.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = group.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(GNParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.Group, gnGroup);
		}

		{
			let gnInventory = new GNHashtable();
			let inventory = permission.inventory;

			{
				let permissionRules = inventory.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setItemStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetItemStatistics, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemStatistics, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getStatisticsLeaderboardAroundItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetStatisticsLeaderboardAroundItem, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setItemData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetItemData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemInformation, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemsWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemsWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemsWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemsWithTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getCatalogId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetCatalogId, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getClassId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetClassId, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemType;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemType, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getAmount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetAmount, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetOwner, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setAmount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetAmount, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetOwner, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemsWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetItemsWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(GNParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.Inventory, gnInventory);
		}

		{
			let gnStoreInventory = new GNHashtable();
			let storeInventory = permission.storeInventory;

			{
				let permissionRules = storeInventory.buyStoreItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.BuyStoreItem, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreItemInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.GetStoreItemInformation, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreItemsWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.GetStoreItemsWithTag, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.grantStoreItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.GrantStoreItem, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.setStoreItemInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.SetStoreItemInformation, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.validateAppleAppStoreReceipt;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.ValidateAppleAppStoreReceipt, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.validateGooglePlayStoreReceipt;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.ValidateGooglePlayStoreReceipt, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.validateFacebookStoreReceipt;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.ValidateFacebookStoreReceipt, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.presentStoreItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.PresentStoreItem, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(GNParameterCode.GetStoreLog, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.StoreInventory, gnStoreInventory);
		}

		{
			let gnMasterAdmin = new GNHashtable();
			let masterAdmin = permission.masterAdmin;

			{
				let permissionRules = masterAdmin.setMasterGameSettings;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.SetMasterGameSettings, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.grantAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GrantAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.removeAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.RemoveAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setPasswordAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.SetPasswordAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setSecretKeyAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.SetSecretKeyAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setGameInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.SetGameInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.grantGame;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GrantGame, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.changePasswordAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.ChangePasswordAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getAdminAccountList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetAdminAccountList, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getGameInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetGameInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getGameList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetGameList, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getMasterGameSettings;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetMasterGameSettings, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getServerLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetServerLog, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getSecretInfoInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetSecretInfoInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getSecretInfoList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetSecretInfoList, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.grantSecretInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GrantSecretInfo, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setSecretInfoInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.SetSecretInfoInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getUsernameAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetUsernameAdminAccount, gnPermissionRules);
			}
			
			{
				let permissionRules = masterAdmin.getAnalytics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetAnalytics, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getEventCallbackCloudScript;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetEventCallbackCloudScript, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setEventCallbackCloudScript;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.SetEventCallbackCloudScript, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.resetStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.ResetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getBackupStatisticsLeaderboardVersion;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetBackupStatisticsLeaderboardVersion, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getServerGameData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(GNParameterCode.GetServerGameData, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.MasterAdmin, gnMasterAdmin);
		}

		{
			let gnMultiplayer = new GNHashtable();
			let multiplayer = permission.multiplayer;

			{
				let permissionRules = multiplayer.cancelAllMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.CancelAllMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.cancelMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.CancelMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.createMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.CreateMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getMatch;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.GetMatch, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.GetMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getQueueStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.GetQueueStatistics, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.joinMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.JoinMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.listMatchmakingTicketsForPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.ListMatchmakingTicketsForPlayer, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getAllMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.GetAllMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getAllMatch;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(GNParameterCode.GetAllMatch, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.Multiplayer, gnMultiplayer);
		}

		{
			let gnCloudScript = new GNHashtable();
			let cloudScript = permission.cloudScript;

			{
				let permissionRules = cloudScript.addFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(GNParameterCode.AddFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.editFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(GNParameterCode.EditFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.executeFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(GNParameterCode.ExecuteFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.getFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(GNParameterCode.GetFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.getFunctions;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(GNParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(GNParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(GNParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(GNParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(GNParameterCode.GetFunctions, gnPermissionRules);
			}

			gnPermission.add(GNParameterCode.CloudScript, gnCloudScript);
		}

		return gnPermission;
	}

}
