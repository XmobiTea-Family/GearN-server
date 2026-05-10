import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";

class GetGroupsWithSegmentOperationRequest extends OperationRequest {
    // Stores the value value used by this instance.
    @StringDataMember({ code: ParameterCode.Value, minLength: 2, maxLength: 32, mustNonNull: true })
    public value: string;

    // Stores the info request parameter value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
    public infoRequestParam: InfoRequestParam;

    // Stores the skip value used by this instance.
    @NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
    public skip?: number;

    // Stores the limit value used by this instance.
    @NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
    public limit?: number;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGetGroupsWithSegmentOperationRequest extends GetGroupsWithSegmentOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGetGroupsWithSegmentOperationRequest extends ServerGetGroupsWithSegmentOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetGroupsWithSegmentRequestHandler extends GroupBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.GetGroupsWithSegment;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return GetGroupsWithSegmentOperationRequest;
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

        if (!secretInfo.getPermission().group.getGroupsWithSegment.otherSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                segment: request.value,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetGroupsWithSegmentOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getGroupsWithSegment.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                segment: request.value,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
            },
            SecretRole.Server,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetGroupsWithSegmentOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().group.getGroupsWithSegment.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

        return this.execute(
            {
                segment: request.value,
                skip: request.skip,
                limit: request.limit,
                infoRequestParam: request.infoRequestParam,
            },
            SecretRole.Admin,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { segment: string; skip: number; limit: number; infoRequestParam: InfoRequestParam }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetGroupsWithSegment", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the group find options value used in the current execution flow.
        let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

        // Stores the GearN results value used in the current execution flow.
        let gnResults = new GNArray();

        // Stores the groups value used in the current execution flow.
        let groups = await this.gnServer.getDatabase().groupRepository.loadGroupsWithSegmentAsync(request.segment, request.skip, request.limit, secretInfo.getGameId(), groupFindOptions);

        for (let i = 0; i < groups.length; i++) {
            // Stores the group value used in the current execution flow.
            let group = groups[i];

            // Stores the GearN result value used in the current execution flow.
            let gnResult = new GNHashtable();

            gnResult.add(ParameterCode.GroupId, group.getGroupId());
            gnResult.add(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

            gnResults.add(gnResult);
        }

        operationResponse.setParameter(ParameterCode.Results, gnResults);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("group_GetGroupsWithSegment", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
