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
import { GNHashtable } from "./../../../../../GN-common/common/GNData";

class GetSecretInfoInformationOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
	public secretKey: string;

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

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let result = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.SecretInfoNotFound);
			return operationResponse;
		}

		let secretInfoItem = new SecretInfoItem(result, collection);

		operationResponse.setParameter(ParameterCode.SecretKey, secretInfoItem.getSecretKey());
		operationResponse.setParameter(ParameterCode.GameId, secretInfoItem.getGameId());
		operationResponse.setParameter(ParameterCode.Role, secretInfoItem.getRole());
		operationResponse.setParameter(ParameterCode.TsCreate, secretInfoItem.getTsCreate());
		operationResponse.setParameter(ParameterCode.CreatorId, secretInfoItem.getCreatorId());
		operationResponse.setParameter(ParameterCode.Remove, secretInfoItem.getRemove());
		operationResponse.setParameter(ParameterCode.TsExpire, secretInfoItem.getTsExpire());
		operationResponse.setParameter(ParameterCode.Description, secretInfoItem.getDescription());

		let gnPermission = GetSecretInfoInformationRequestHandler.getPermissionHashtable(secretInfoItem.getPermission());

		operationResponse.setParameter(ParameterCode.Permission, gnPermission);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

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

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByAccount, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByAndroidDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByAndroidDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByApple, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByCustomDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByCustomDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByCustomId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByCustomId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByFacebook, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByGenericService, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByGoogle, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByiOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByiOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByWindowsPhoneDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByWindowsPhoneDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.registerAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.RegisterAccount, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByEditorDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByEditorDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByLinuxDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByLinuxDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByMacOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByMacOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.loginByWindowsDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.LoginByWindowsDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = authenticate.refreshAuthToken;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnAuthenticate.add(ParameterCode.RefreshAuthToken, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.Authenticate, gnAuthenticate);
		}

		{
			let gnMasterPlayer = new GNHashtable();
			let masterPlayer = permission.masterPlayer;

			{
				let permissionRules = masterPlayer.linkAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkAndroidDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkAndroidDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkApple, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkCustomDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkCustomDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkCustomId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkCustomId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkEditorDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkEditorDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkFacebook, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkGenericService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkGoogle, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkiOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkiOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkLinuxDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkLinuxDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkMacOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkMacOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkWindowsDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkWindowsDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkWindowsPhoneDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkWindowsPhoneDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.linkGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.LinkGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkAndroidDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkAndroidDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkApple, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkCustomDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkCustomDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkCustomId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkCustomId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkEditorDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkEditorDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkFacebook, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkGenericService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkGoogle, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkiOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkiOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkLinuxDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkLinuxDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkMacOSDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkMacOSDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkWindowsDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkWindowsDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkWindowsPhoneDeviceId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkWindowsPhoneDeviceId, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.unlinkGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.UnlinkGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getIpAddressCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetIpAddressCreate, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.changeAccountPassword;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.ChangeAccountPassword, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.resetAccountPassword;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.ResetAccountPassword, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayerInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayerInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithApple;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithApple, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithFacebook;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithFacebook, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGoogle;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithGoogle, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGenericService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithGenericService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithTag, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGooglePlayGameService;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithGooglePlayGameService, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithGameCenter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithGameCenter, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getExternal;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetExternal, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPlayersWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.setEmail;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SetEmail, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getEmail;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetEmail, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getLastLoginLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.sendSocketOperationEvent;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SendSocketOperationEvent, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.sendEmail;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SendEmail, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.sendPushNotification;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.SendPushNotification, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.addPushNotification;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.AddPushNotification, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.removePushNotification;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.RemovePushNotification, gnPermissionRules);
			}

			{
				let permissionRules = masterPlayer.getPushNotification;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterPlayer.add(ParameterCode.GetPushNotification, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.MasterPlayer, gnMasterPlayer);
		}

		{
			let gnGamePlayer = new GNHashtable();
			let gamePlayer = permission.gamePlayer;

			{
				let permissionRules = gamePlayer.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getIpAddressCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetIpAddressCreate, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.setPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.SetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerInformation, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayersWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayersWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayersWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayersWithTag, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerCharacter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerCharacter, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerInventory;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerInventory, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removePlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.RemovePlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getOnlineStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetOnlineStatus, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.createGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.CreateGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.createPlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.CreatePlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.createPlayerCharacter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.CreatePlayerCharacter, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.addPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.AddPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removePlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.RemovePlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.removePlayerCharacter;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.RemovePlayerCharacter, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.joinGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.JoinGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.leaveGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.LeaveGroup, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getPlayersWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getFriendStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getFriendStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetFriendStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getLastLoginLeaderboard;
				if (permissionRules == null) {
					permissionRules = {
						selfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
						adminSelfEnable: false,
					}
				}
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = gamePlayer.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGamePlayer.add(ParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.GamePlayer, gnGamePlayer);
		}

		{
			let gnCharacterPlayer = new GNHashtable();
			let characterPlayer = permission.characterPlayer;

			{
				let permissionRules = characterPlayer.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getIpAddressCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetIpAddressCreate, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getTsLastLogin;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetTsLastLogin, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerBan;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerBan, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCountryCode;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetCountryCode, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerCurrency, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerStatistics, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerData, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerInformation, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayersWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayersWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayersWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayersWithTag, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCatalogId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetCatalogId, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetOwner, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayerInventory;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayerInventory, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removePlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.RemovePlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.createPlayerItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.CreatePlayerItem, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.createGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.CreateGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.joinGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.JoinGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.leaveGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.LeaveGroup, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetOwner, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.addPlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.AddPlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.removePlayerFriend;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.RemovePlayerFriend, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getPlayersWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getFriendStatisticsLeaderboardAroundPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getFriendStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetFriendStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getLastLoginLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = characterPlayer.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCharacterPlayer.add(ParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.CharacterPlayer, gnCharacterPlayer);
		}

		{
			let gnContent = new GNHashtable();
			let content = permission.content;

			{
				let permissionRules = content.getContentData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.GetContentData, gnPermissionRules);
			}

			{
				let permissionRules = content.setContentData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.SetContentData, gnPermissionRules);
			}

			{
				let permissionRules = content.createNewFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.CreateNewFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.getFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.GetFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.requestDownloadFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.RequestDownloadFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.removeFileUploadInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.RemoveFileUploadInfo, gnPermissionRules);
			}

			{
				let permissionRules = content.getFileUploadInfoList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnContent.add(ParameterCode.GetFileUploadInfoList, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.Content, gnContent);
		}

		{
			let gnGroup = new GNHashtable();
			let group = permission.group;

			{
				let permissionRules = group.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = group.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = group.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = group.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = group.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = group.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = group.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = group.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = group.setGroupCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetGroupCurrency, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupCurrency;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupCurrency, gnPermissionRules);
			}

			{
				let permissionRules = group.setGroupStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetGroupStatistics, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupStatistics, gnPermissionRules);
			}

			{
				let permissionRules = group.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = group.getStatisticsLeaderboardAroundGroup;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetStatisticsLeaderboardAroundGroup, gnPermissionRules);
			}

			{
				let permissionRules = group.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = group.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = group.setGroupData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetGroupData, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupData, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupInformation, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupsWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupsWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupsWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupsWithTag, gnPermissionRules);
			}

			{
				let permissionRules = group.getCatalogId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetCatalogId, gnPermissionRules);
			}

			{
				let permissionRules = group.getRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupInventory;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupInventory, gnPermissionRules);
			}

			{
				let permissionRules = group.removeGroupItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.RemoveGroupItem, gnPermissionRules);
			}

			{
				let permissionRules = group.createGroupItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.CreateGroupItem, gnPermissionRules);
			}

			{
				let permissionRules = group.getMembers;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetMembers, gnPermissionRules);
			}

			{
				let permissionRules = group.addMember;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.AddMember, gnPermissionRules);
			}

			{
				let permissionRules = group.removeMember;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.RemoveMember, gnPermissionRules);
			}

			{
				let permissionRules = group.sendGroupMessage;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SendGroupMessage, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupMessage;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupMessage, gnPermissionRules);
			}

			{
				let permissionRules = group.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = group.getGroupsWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetGroupsWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = group.getCurrencyLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = group.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = group.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			{
				let permissionRules = group.getCurrencyLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnGroup.add(ParameterCode.GetCurrencyLog, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.Group, gnGroup);
		}

		{
			let gnInventory = new GNHashtable();
			let inventory = permission.inventory;

			{
				let permissionRules = inventory.addSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.AddSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.removeSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.RemoveSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.removeTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.RemoveTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getTsCreate;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetTsCreate, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getAvatar;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetAvatar, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setItemStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetItemStatistics, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemStatistics, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getStatisticsLeaderboardAroundItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetStatisticsLeaderboardAroundItem, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setCustomData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetCustomData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setItemData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetItemData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemData, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemInformation, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemsWithSegment;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemsWithSegment, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemsWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemsWithTag, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getCatalogId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetCatalogId, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getClassId;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetClassId, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemType;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemType, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getAmount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetAmount, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetOwner, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setAmount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetAmount, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setOwner;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetOwner, gnPermissionRules);
			}

			{
				let permissionRules = inventory.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getItemsWithDisplayName;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetItemsWithDisplayName, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = inventory.getStatisticsLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnInventory.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.Inventory, gnInventory);
		}

		{
			let gnStoreInventory = new GNHashtable();
			let storeInventory = permission.storeInventory;

			{
				let permissionRules = storeInventory.buyStoreItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.BuyStoreItem, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreItemInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.GetStoreItemInformation, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreItemsWithTag;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.GetStoreItemsWithTag, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.createStoreItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.CreateStoreItem, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.setRemoveStatus;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.setStoreItemInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.SetStoreItemInformation, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.validateAppleAppStoreReceipt;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.ValidateAppleAppStoreReceipt, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.validateGooglePlayStoreReceipt;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.ValidateGooglePlayStoreReceipt, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.validateFacebookStoreReceipt;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.ValidateFacebookStoreReceipt, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getCreateLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.presentStoreItem;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.PresentStoreItem, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.GetStoreLog, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.getStoreUsed;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.GetStoreUsed, gnPermissionRules);
			}

			{
				let permissionRules = storeInventory.removeStoreUsed;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnStoreInventory.add(ParameterCode.RemoveStoreUsed, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.StoreInventory, gnStoreInventory);
		}

		{
			let gnMasterAdmin = new GNHashtable();
			let masterAdmin = permission.masterAdmin;

			{
				let permissionRules = masterAdmin.setMasterGameSettings;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.SetMasterGameSettings, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.createAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.CreateAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.removeAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.RemoveAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setPasswordAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.SetPasswordAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setSecretKeyAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.SetSecretKeyAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setGameInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.SetGameInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.createGame;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.CreateGame, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.changePasswordAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.ChangePasswordAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getAdminAccountList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetAdminAccountList, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getGameInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetGameInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getGameList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetGameList, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getMasterGameSettings;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetMasterGameSettings, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getServerLog;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetServerLog, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getSecretInfoInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetSecretInfoInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getSecretInfoList;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetSecretInfoList, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.createSecretInfo;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.CreateSecretInfo, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setSecretInfoInformation;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.SetSecretInfoInformation, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getUsernameAdminAccount;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetUsernameAdminAccount, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getAnalytics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetAnalytics, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getEventCallbackCloudScript;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetEventCallbackCloudScript, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.setEventCallbackCloudScript;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.SetEventCallbackCloudScript, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.resetStatisticsLeaderboard;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.ResetStatisticsLeaderboard, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getBackupStatisticsLeaderboardVersion;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetBackupStatisticsLeaderboardVersion, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.getServerGameData;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.GetServerGameData, gnPermissionRules);
			}

			{
				let permissionRules = masterAdmin.deleteInDatabase;
				if (permissionRules == null) {
					permissionRules = {
						selfEnable: false,
						otherSelfEnable: false,
						serverSelfEnable: false,
						adminSelfEnable: false,
					}
				}
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMasterAdmin.add(ParameterCode.DeleteInDatabase, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.MasterAdmin, gnMasterAdmin);
		}

		{
			let gnMultiplayer = new GNHashtable();
			let multiplayer = permission.multiplayer;

			{
				let permissionRules = multiplayer.cancelAllMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.CancelAllMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.cancelMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.CancelMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.createMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.CreateMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getMatch;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.GetMatch, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.GetMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getQueueStatistics;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.GetQueueStatistics, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.joinMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.JoinMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.listMatchmakingTicketsForPlayer;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.ListMatchmakingTicketsForPlayer, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getAllMatchmakingTicket;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.GetAllMatchmakingTicket, gnPermissionRules);
			}

			{
				let permissionRules = multiplayer.getAllMatch;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnMultiplayer.add(ParameterCode.GetAllMatch, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.Multiplayer, gnMultiplayer);
		}

		{
			let gnCloudScript = new GNHashtable();
			let cloudScript = permission.cloudScript;

			{
				let permissionRules = cloudScript.addFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(ParameterCode.AddFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.editFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(ParameterCode.EditFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.executeFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(ParameterCode.ExecuteFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.getFunction;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(ParameterCode.GetFunction, gnPermissionRules);
			}

			{
				let permissionRules = cloudScript.getFunctions;
				let gnPermissionRules = new GNHashtable();

				gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
				gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
				gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
				gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

				gnCloudScript.add(ParameterCode.GetFunctions, gnPermissionRules);
			}

			gnPermission.add(ParameterCode.CloudScript, gnCloudScript);
		}

		return gnPermission;
	}

}
