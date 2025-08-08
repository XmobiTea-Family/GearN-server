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
import { GroupCurrencyParam } from "./model/GroupCurrencyParam";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";

class SetGroupCurrenciesOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	public groupId: string;

	@GNArrayDataMember({ code: ParameterCode.GroupCurrencies, minLength: 1, maxLength: 32, mustNonNull: true, elementCls: GroupCurrencyParam })
	public groupCurrencyParams: Array<GroupCurrencyParam>;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetGroupCurrenciesOperationRequest extends SetGroupCurrenciesOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetGroupCurrenciesOperationRequest extends ServerSetGroupCurrenciesOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetGroupCurrencyRequestHandler extends GroupBaseRequestHandler {

	public override getCode() {
		return OperationCode.SetGroupCurrency;
	}

	public override getCommonOperationRequest() {
		return SetGroupCurrenciesOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.groupId, secretInfo.getGameId(), secretInfo.getPermission().group.setGroupCurrency);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupCurrencyParams: request.groupCurrencyParams
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetGroupCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setGroupCurrency.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupCurrencyParams: request.groupCurrencyParams
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetGroupCurrenciesOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.setGroupCurrency.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			groupId: request.groupId,
			groupCurrencyParams: request.groupCurrencyParams
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, groupCurrencyParams: Array<GroupCurrencyParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_SetGroupCurrency", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions: GroupFindOptions = {
			groupCurrencies: true,
		}

		let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

		let gnInfoResponseParameters = new GNHashtable();
		let gnGroupCurrencies = new GNArray();

		for (let i = 0; i < request.groupCurrencyParams.length; i++) {
			let groupCurrencyParam = request.groupCurrencyParams[i];

			let key = groupCurrencyParam.key;

			let groupCurrencySettingsItem = groupSettings.groupCurrencySettings.find(x => x.key == key);
			if (groupCurrencySettingsItem == null) continue;

			let initialValue = groupCurrencySettingsItem.initialValue;

			let amount = groupCurrencyParam.amount;
			let serverValue = 0;

			if (!group.hasGroupCurrency(key)) {
				serverValue = initialValue;
			}
			else {
				serverValue = group.getGroupCurrency(key).value;
			}

			serverValue += amount;
			if (serverValue <= 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.NotEnoughCurrency);
				return operationResponse;
			}

			let gnGroupCurrency = new GNHashtable();

			gnGroupCurrency.add(ParameterCode.Key, key);
			gnGroupCurrency.add(ParameterCode.Value, serverValue);

			gnGroupCurrencies.add(gnGroupCurrency);

			group.setGroupCurrency(key, serverValue);
		}

		group.saveAsync();

		gnInfoResponseParameters.add(ParameterCode.GroupCurrencies, gnGroupCurrencies);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_SetGroupCurrency", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
