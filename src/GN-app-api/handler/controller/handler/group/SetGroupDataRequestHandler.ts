import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { PermissionDataItem } from "./../../../../../GN-common/constant/enumType/PermissionDataItem";
import { GroupDataParam } from "./model/GroupDataParam";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class SetGroupDataOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
    groupId: string;

    @GNArrayDataMember({ code: GNParameterCode.GroupDatas, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupDataParam })
    groupDataParams: Array<GroupDataParam>;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetGroupDataOperationRequest extends SetGroupDataOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetGroupDataOperationRequest extends ServerSetGroupDataOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetGroupDataRequestHandler extends GroupBaseRequestHandler {
    public override getCode() {
        return OperationCode.SetGroupData;
    }

    public override getCommonOperationRequest() {
        return SetGroupDataOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setGroupData);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            groupDataParams: request.groupDataParams
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetGroupDataOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.setGroupData.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            groupDataParams: request.groupDataParams
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetGroupDataOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.setGroupData.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            groupId: request.groupId,
            groupDataParams: request.groupDataParams
        }, secretInfo, operationRequest);
    }

    private async execute(request: { groupId: string, groupDataParams: Array<GroupDataParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetGroupData", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let groupFindOptions: GroupFindOptions = {
            groupDatas: true,
        }

        let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

        if (group == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GroupNotFound);
            return operationResponse;
        }

        let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

        let gnInfoResponseParameters = new GNHashtable();
        let gnGroupDatas = new GNArray();

        for (let i = 0; i < request.groupDataParams.length; i++) {
            let groupDataParam = request.groupDataParams[i];

            let key = groupDataParam.key;
            let groupDatasSettingsItem = groupSettings.groupDatasSettings.find(x => x.key == key);
            if (groupDatasSettingsItem == null) continue;

            let value = groupDataParam.value;
            let permission = <PermissionDataItem>groupDatasSettingsItem.permission;

            if (permission == PermissionDataItem.ReadOnly && <SecretRole>secretInfo.getRole() == SecretRole.Player) {

            }
            else {
                if (value != null && value instanceof GNData) {
                    value = (value as GNData).toData();
                }
                
                group.setGroupData(key, value as DataValueType);

                let gnGroupData = new GNHashtable();
                gnGroupData.add(GNParameterCode.Key, key);
                gnGroupData.add(GNParameterCode.Value, groupDataParam.value);

                gnGroupDatas.add(gnGroupData);
            }
        }

        group.saveAsync();

        gnInfoResponseParameters.add(GNParameterCode.GroupDatas, gnGroupDatas);

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);
        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_SetGroupData", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
