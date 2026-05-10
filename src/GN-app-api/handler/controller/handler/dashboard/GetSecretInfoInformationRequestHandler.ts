import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo, SecretPermissionItem, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { SecretInfoItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { GNHashtable } from "./../../../../../GN-common/common/GNData";

class GetSecretInfoInformationOperationRequest extends OperationRequest {
    // Stores the secret key value used by this instance.
    @StringDataMember({ code: ParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
    public secretKey: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetSecretInfoInformationRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetSecretInfoInformation;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetSecretInfoInformationOperationRequest;
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

        if (!secretInfo.getPermission().dashboard.getSecretInfoInformation.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({ secretKey: request.secretKey }, SecretRole.Client, secretInfo, operationRequest);
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { secretKey: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GetSecretInfoInformation", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the collection value used in the current execution flow.
        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

        if (result == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.SecretInfoNotFound);
            return operationResponse;
        }

        // Stores the secret info item value used in the current execution flow.
        let secretInfoItem = new SecretInfoItem(result, collection);

        operationResponse.setParameter(ParameterCode.SecretKey, secretInfoItem.getSecretKey());
        operationResponse.setParameter(ParameterCode.GameId, secretInfoItem.getGameId());
        operationResponse.setParameter(ParameterCode.TsCreate, secretInfoItem.getTsCreate());
        operationResponse.setParameter(ParameterCode.CreatorId, secretInfoItem.getCreatorId());
        operationResponse.setParameter(ParameterCode.Remove, secretInfoItem.getRemove());
        operationResponse.setParameter(ParameterCode.TsExpire, secretInfoItem.getTsExpire());
        operationResponse.setParameter(ParameterCode.Description, secretInfoItem.getDescription());

        // Stores the GearN permission parameter value used in the current execution flow.
        let gnPermissionParam = GetSecretInfoInformationRequestHandler.getPermissionParam(secretInfoItem.getPermission());

        operationResponse.setParameter(ParameterCode.PermissionParam, gnPermissionParam);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GetSecretInfoInformation", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }

    /**
     * Returns the permission parameter.
     * @param permission Provides the permission value used by this operation.
     * @returns Returns the permission parameter.
     */
    public static getPermissionParam(permission: SecretPermissionItem): GNHashtable {
        // Stores the GearN permission value used in the current execution flow.
        let gnPermission = new GNHashtable();

        {
            // Stores the GearN authenticate value used in the current execution flow.
            let gnAuthenticate = new GNHashtable();
            // Stores the authenticate value used in the current execution flow.
            let authenticate = permission.authenticate;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByAndroidDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByAndroidDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByApple;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByApple, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByCustomDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByCustomDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByCustomId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByCustomId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByFacebook;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByFacebook, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByGenericService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByGenericService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByGoogle;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByGoogle, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByGooglePlayGameService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByGooglePlayGameService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByGameCenter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByGameCenter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByiOSDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByiOSDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByWindowsPhoneDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByWindowsPhoneDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.registerAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.RegisterAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByEditorDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByEditorDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByLinuxDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByLinuxDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByMacOSDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByMacOSDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.loginByWindowsDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnAuthenticate.add(ParameterCode.LoginByWindowsDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = authenticate.refreshAuthToken;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN master player value used in the current execution flow.
            let gnMasterPlayer = new GNHashtable();
            // Stores the master player value used in the current execution flow.
            let masterPlayer = permission.masterPlayer;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkAndroidDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkAndroidDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkApple;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkApple, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkCustomDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkCustomDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkCustomId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkCustomId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkEditorDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkEditorDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkFacebook;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkFacebook, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkGenericService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkGenericService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkGoogle;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkGoogle, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkiOSDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkiOSDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkLinuxDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkLinuxDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkMacOSDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkMacOSDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkWindowsDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkWindowsDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkWindowsPhoneDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkWindowsPhoneDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkGooglePlayGameService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkGooglePlayGameService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.linkGameCenter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.LinkGameCenter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkAndroidDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkAndroidDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkApple;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkApple, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkCustomDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkCustomDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkCustomId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkCustomId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkEditorDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkEditorDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkFacebook;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkFacebook, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkGenericService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkGenericService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkGoogle;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkGoogle, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkiOSDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkiOSDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkLinuxDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkLinuxDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkMacOSDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkMacOSDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkWindowsDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkWindowsDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkWindowsPhoneDeviceId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkWindowsPhoneDeviceId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkGooglePlayGameService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkGooglePlayGameService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.unlinkGameCenter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UnlinkGameCenter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.addSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.AddSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.removeSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.RemoveSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.removeTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.RemoveTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getTsCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetTsCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getIpAddressCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetIpAddressCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.updateTsLastLogin;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.UpdateTsLastLogin, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getTsLastLogin;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetTsLastLogin, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setPlayerBan;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetPlayerBan, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayerBan;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayerBan, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setCountryCode;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetCountryCode, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getCountryCode;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetCountryCode, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.changeAccountPassword;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.ChangeAccountPassword, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.resetAccountPassword;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.ResetAccountPassword, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.changePlayerCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.ChangePlayerCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayerCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayerCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.changePlayerStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.ChangePlayerStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayerStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayerStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getStatisticsLeaderboardAroundPlayer;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setPlayerData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetPlayerData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayerData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayerData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayerInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayerInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithApple;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithApple, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithFacebook;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithFacebook, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithGoogle;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithGoogle, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithGenericService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithGenericService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithGooglePlayGameService;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithGooglePlayGameService, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithGameCenter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithGameCenter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getExternal;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetExternal, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPlayersWithDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.setEmail;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SetEmail, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getEmail;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetEmail, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getCurrencyLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getCreateLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getLastLoginLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getStatisticsLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getCurrencyLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.GetCurrencyLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.sendSocketOperationEvent;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SendSocketOperationEvent, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.sendEmail;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SendEmail, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.sendPushNotification;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.SendPushNotification, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.addPushNotification;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.AddPushNotification, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.removePushNotification;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMasterPlayer.add(ParameterCode.RemovePushNotification, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = masterPlayer.getPushNotification;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN game player value used in the current execution flow.
            let gnGamePlayer = new GNHashtable();
            // Stores the game player value used in the current execution flow.
            let gamePlayer = permission.gamePlayer;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.addSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.AddSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.removeSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.RemoveSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.removeTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.RemoveTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getTsCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetTsCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getIpAddressCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetIpAddressCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getTsLastLogin;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetTsLastLogin, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setPlayerBan;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetPlayerBan, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerBan;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerBan, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setCountryCode;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetCountryCode, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getCountryCode;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetCountryCode, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.changePlayerCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.ChangePlayerCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.changePlayerStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.ChangePlayerStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getStatisticsLeaderboardAroundPlayer;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.setPlayerData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.SetPlayerData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayersWithSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayersWithSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayersWithTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayersWithTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerCharacter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerCharacter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerInventory;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerInventory, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayerFriend;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayerFriend, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.removePlayerItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.RemovePlayerItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getOnlineStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetOnlineStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.createGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.CreateGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.createPlayerItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.CreatePlayerItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.createPlayerCharacter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.CreatePlayerCharacter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.addPlayerFriend;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.AddPlayerFriend, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.removePlayerFriend;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.RemovePlayerFriend, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.removePlayerCharacter;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.RemovePlayerCharacter, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.joinGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.JoinGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.leaveGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.LeaveGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getPlayersWithDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getFriendStatisticsLeaderboardAroundPlayer;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getFriendStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetFriendStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getCurrencyLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getCreateLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getLastLoginLeaderboard;
                if (permissionRules == null) {
                    permissionRules = {
                        selfEnable: false,
                        otherSelfEnable: false,
                        serverSelfEnable: false,
                        adminSelfEnable: false,
                    };
                }
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getStatisticsLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGamePlayer.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = gamePlayer.getCurrencyLog;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN character player value used in the current execution flow.
            let gnCharacterPlayer = new GNHashtable();
            // Stores the character player value used in the current execution flow.
            let characterPlayer = permission.characterPlayer;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.addSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.AddSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.removeSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.RemoveSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.removeTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.RemoveTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getTsCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetTsCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getIpAddressCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetIpAddressCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getTsLastLogin;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetTsLastLogin, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setPlayerBan;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetPlayerBan, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerBan;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerBan, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setCountryCode;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetCountryCode, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getCountryCode;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetCountryCode, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.changePlayerCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.ChangePlayerCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.changePlayerStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.ChangePlayerStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getStatisticsLeaderboardAroundPlayer;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetStatisticsLeaderboardAroundPlayer, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setPlayerData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetPlayerData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayersWithSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayersWithSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayersWithTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayersWithTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getCatalogId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetCatalogId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getOwner;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetOwner, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerFriend;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerFriend, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayerInventory;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayerInventory, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.removePlayerItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.RemovePlayerItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.createPlayerItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.CreatePlayerItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.createGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.CreateGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.joinGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.JoinGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.leaveGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.LeaveGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setOwner;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetOwner, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.addPlayerFriend;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.AddPlayerFriend, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.removePlayerFriend;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.RemovePlayerFriend, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getPlayersWithDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetPlayersWithDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.setRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getFriendStatisticsLeaderboardAroundPlayer;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getFriendStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetFriendStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getCurrencyLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getCreateLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getLastLoginLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetLastLoginLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getStatisticsLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCharacterPlayer.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = characterPlayer.getCurrencyLog;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN content value used in the current execution flow.
            let gnContent = new GNHashtable();
            // Stores the content value used in the current execution flow.
            let content = permission.content;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.getContentData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnContent.add(ParameterCode.GetContentData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.setContentData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnContent.add(ParameterCode.SetContentData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.createNewFileUploadInfo;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnContent.add(ParameterCode.CreateNewFileUploadInfo, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.getFileUploadInfo;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnContent.add(ParameterCode.GetFileUploadInfo, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.requestDownloadFileUploadInfo;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnContent.add(ParameterCode.RequestDownloadFileUploadInfo, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.removeFileUploadInfo;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnContent.add(ParameterCode.RemoveFileUploadInfo, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = content.getFileUploadInfoList;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN group value used in the current execution flow.
            let gnGroup = new GNHashtable();
            // Stores the group value used in the current execution flow.
            let group = permission.group;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.addSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.AddSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.removeSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.RemoveSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.setTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.removeTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.RemoveTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.setDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getTsCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetTsCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.setAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.changeGroupCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.ChangeGroupCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupCurrency;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupCurrency, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.changeGroupStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.ChangeGroupStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getStatisticsLeaderboardAroundGroup;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetStatisticsLeaderboardAroundGroup, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.setCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.setGroupData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SetGroupData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupsWithSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupsWithSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupsWithTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupsWithTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getCatalogId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetCatalogId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupInventory;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupInventory, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.removeGroupItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.RemoveGroupItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.createGroupItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.CreateGroupItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getMembers;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetMembers, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.addMember;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.AddMember, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.removeMember;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.RemoveMember, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.sendGroupMessage;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SendGroupMessage, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupMessage;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupMessage, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.setRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getGroupsWithDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetGroupsWithDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getCurrencyLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetCurrencyLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getCreateLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getStatisticsLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnGroup.add(ParameterCode.GetStatisticsLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = group.getCurrencyLog;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN inventory value used in the current execution flow.
            let gnInventory = new GNHashtable();
            // Stores the inventory value used in the current execution flow.
            let inventory = permission.inventory;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.addSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.AddSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.removeSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.RemoveSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.removeTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.RemoveTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getTsCreate;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetTsCreate, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getAvatar;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetAvatar, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.changeItemStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.ChangeItemStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getStatisticsLeaderboardAroundItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetStatisticsLeaderboardAroundItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setCustomData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetCustomData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setItemData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetItemData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemsWithSegment;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemsWithSegment, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemsWithTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemsWithTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getCatalogId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetCatalogId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getClassId;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetClassId, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemType;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemType, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getAmount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetAmount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getOwner;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetOwner, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setAmount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetAmount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setOwner;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetOwner, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.setRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getItemsWithDisplayName;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetItemsWithDisplayName, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getCreateLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnInventory.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = inventory.getStatisticsLog;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN store inventory value used in the current execution flow.
            let gnStoreInventory = new GNHashtable();
            // Stores the store inventory value used in the current execution flow.
            let storeInventory = permission.storeInventory;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.buyStoreItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.BuyStoreItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.getStoreItemInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.GetStoreItemInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.getStoreItemsWithTag;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.GetStoreItemsWithTag, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.createStoreItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.CreateStoreItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.setRemoveStatus;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.SetRemoveStatus, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.setStoreItemInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.SetStoreItemInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.validateAppleAppStoreReceipt;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.ValidateAppleAppStoreReceipt, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.validateGooglePlayStoreReceipt;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.ValidateGooglePlayStoreReceipt, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.validateFacebookStoreReceipt;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.ValidateFacebookStoreReceipt, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.getCreateLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.GetCreateLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.presentStoreItem;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.PresentStoreItem, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.getStoreLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.GetStoreLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.getStoreUsed;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnStoreInventory.add(ParameterCode.GetStoreUsed, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = storeInventory.removeStoreUsed;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN dashboard value used in the current execution flow.
            let gnDashboard = new GNHashtable();
            // Stores the dashboard value used in the current execution flow.
            let dashboard = permission.dashboard;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.setMasterGameSettings;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.SetMasterGameSettings, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.createAdminAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.CreateAdminAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.removeAdminAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.RemoveAdminAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.setPasswordAdminAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.SetPasswordAdminAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.setSecretKeyAdminAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.SetSecretKeyAdminAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.setGameInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.SetGameInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.createGame;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.CreateGame, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.changePasswordAdminAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.ChangePasswordAdminAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getAdminAccountList;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetAdminAccountList, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getGameInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetGameInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getGameList;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetGameList, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getMasterGameSettings;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetMasterGameSettings, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getServerLog;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetServerLog, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getSecretInfoInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetSecretInfoInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getSecretInfoList;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetSecretInfoList, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.createSecretInfo;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.CreateSecretInfo, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.setSecretInfoInformation;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.SetSecretInfoInformation, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getUsernameAdminAccount;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetUsernameAdminAccount, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getAnalytics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetAnalytics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getEventCallbackCloudScript;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetEventCallbackCloudScript, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.setEventCallbackCloudScript;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.SetEventCallbackCloudScript, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.resetStatisticsLeaderboard;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.ResetStatisticsLeaderboard, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getBackupStatisticsLeaderboardVersion;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetBackupStatisticsLeaderboardVersion, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.getServerGameData;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.GetServerGameData, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = dashboard.deleteInDatabase;
                if (permissionRules == null) {
                    permissionRules = {
                        selfEnable: false,
                        otherSelfEnable: false,
                        serverSelfEnable: false,
                        adminSelfEnable: false,
                    };
                }
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnDashboard.add(ParameterCode.DeleteInDatabase, gnPermissionRules);
            }

            gnPermission.add(ParameterCode.Dashboard, gnDashboard);
        }

        {
            // Stores the GearN multiplayer value used in the current execution flow.
            let gnMultiplayer = new GNHashtable();
            // Stores the multiplayer value used in the current execution flow.
            let multiplayer = permission.multiplayer;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.cancelAllMatchmakingTicket;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.CancelAllMatchmakingTicket, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.cancelMatchmakingTicket;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.CancelMatchmakingTicket, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.createMatchmakingTicket;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.CreateMatchmakingTicket, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.getMatch;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.GetMatch, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.getMatchmakingTicket;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.GetMatchmakingTicket, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.getQueueStatistics;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.GetQueueStatistics, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.joinMatchmakingTicket;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.JoinMatchmakingTicket, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.listMatchmakingTicketsForPlayer;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.ListMatchmakingTicketsForPlayer, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.getAllMatchmakingTicket;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnMultiplayer.add(ParameterCode.GetAllMatchmakingTicket, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = multiplayer.getAllMatch;
                // Stores the GearN permission rules value used in the current execution flow.
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
            // Stores the GearN cloud script value used in the current execution flow.
            let gnCloudScript = new GNHashtable();
            // Stores the cloud script value used in the current execution flow.
            let cloudScript = permission.cloudScript;

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = cloudScript.addFunction;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCloudScript.add(ParameterCode.AddFunction, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = cloudScript.editFunction;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCloudScript.add(ParameterCode.EditFunction, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = cloudScript.executeFunction;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCloudScript.add(ParameterCode.ExecuteFunction, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = cloudScript.getFunction;
                // Stores the GearN permission rules value used in the current execution flow.
                let gnPermissionRules = new GNHashtable();

                gnPermissionRules.add(ParameterCode.SelfEnable, permissionRules.selfEnable);
                gnPermissionRules.add(ParameterCode.OtherSelfEnable, permissionRules.otherSelfEnable);
                gnPermissionRules.add(ParameterCode.ServerSelfEnable, permissionRules.serverSelfEnable);
                gnPermissionRules.add(ParameterCode.AdminSelfEnable, permissionRules.adminSelfEnable);

                gnCloudScript.add(ParameterCode.GetFunction, gnPermissionRules);
            }

            {
                // Stores the permission rules value used in the current execution flow.
                let permissionRules = cloudScript.getFunctions;
                // Stores the GearN permission rules value used in the current execution flow.
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
