import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GroupFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GroupFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class SetDisplayNameOperationRequest extends OperationRequest {

	// Stores the group ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	// Stores the display name value used by this instance.
	@StringDataMember({ code: ParameterCode.DisplayName, minLength: 5, maxLength: 32, mustNonNull: true })
	public displayName: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetDisplayNameOperationRequest extends SetDisplayNameOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetDisplayNameOperationRequest extends ServerSetDisplayNameOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetDisplayNameRequestHandler extends GroupBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetDisplayName;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetDisplayNameOperationRequest;
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

		// Tracks whether method is allowed.
		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setDisplayName);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			displayName: request.displayName
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setDisplayName.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			displayName: request.displayName
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setDisplayName.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			displayName: request.displayName
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { groupId: string, displayName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetDisplayName", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			displayName: true,
		}

		// Stores the group value used in the current execution flow.
		let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		group.setDisplayName(request.displayName);
		group.saveAsync();

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_SetDisplayName", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
