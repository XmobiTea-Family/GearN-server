import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { StoreInventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/StoreInventoryFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class SetRemoveStatusOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
	public storeId: string;

	@StringDataMember({ code: ParameterCode.Reason, isOptional: true, defaultValue: "" })
	public reason?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetRemoveStatusOperationRequest extends SetRemoveStatusOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetRemoveStatusOperationRequest extends ServerSetRemoveStatusOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetRemoveStatusRequestHandler extends StoreItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.SetRemoveStatus;
	}

	public override getCommonOperationRequest() {
		return SetRemoveStatusOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.setRemoveStatus.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			reason: request.reason,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetRemoveStatusOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.setRemoveStatus.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			reason: request.reason,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetRemoveStatusOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.setRemoveStatus.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			reason: request.reason,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { storeId: string, reason: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_SetRemoveStatus", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let storeInventoryFindOptions: StoreInventoryFindOptions = {
			removeStatus: true,
		}

		let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(request.storeId, secretInfo.getGameId(), storeInventoryFindOptions);

		if (storeInventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemNotFound);
			return operationResponse;
		}

		let removeStatus = storeInventory.getRemoveStatus();
		if (removeStatus.tsRemove == 0) {
			storeInventory.setRemoveStatus(xDatetime.getCurrentMilliseconds(), request.reason);
			storeInventory.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_SetRemoveStatus", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
