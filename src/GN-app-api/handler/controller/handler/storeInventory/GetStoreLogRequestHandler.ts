import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import {
	DataMember,
	BooleanDataMember,
	NumberDataMember,
	StringDataMember,
	GNHashtableDataMember,
	GNArrayDataMember,
} from "../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { GNErrorCode } from "../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";

class GetStoreLogOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true, isOptional: true })
	storeId?: string;

	@GNArrayDataMember({ code: GNParameterCode.StoreReceiveTypes, minLength: 1, maxLength: 10, mustNonNull: true, elementCls: Number, isOptional: true })
	storeReceiveTypes?: Array<number>;

	@StringDataMember({ code: GNParameterCode.OwnerId, minLength: 10, maxLength: 11, mustNonNull: true, isOptional: true })
	id?: string;

	@NumberDataMember({ code: GNParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	limit?: number;

	@StringDataMember({ code: GNParameterCode.Token, minLength: 24, maxLength: 24, mustNonNull: true, isOptional: true })
	token?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStoreLogOperationRequest extends GetStoreLogOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStoreLogOperationRequest extends ServerGetStoreLogOperationRequest {
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStoreLogRequestHandler extends StoreItemBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetStoreLog;
	}

	public override getCommonOperationRequest() {
		return GetStoreLogOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreLog.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute(
			{
				storeId: request.storeId,
				storeReceiveTypes: request.storeReceiveTypes,
				id: request.id,
				limit: request.limit,
				token: request.token,
			},
			secretInfo,
			operationRequest
		);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetStoreLogOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreLog.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute(
			{
				storeId: request.storeId,
				storeReceiveTypes: request.storeReceiveTypes,
				id: request.id,
				limit: request.limit,
				token: request.token,
			},
			secretInfo,
			operationRequest
		);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetStoreLogOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.getStoreLog.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute(
			{
				storeId: request.storeId,
				storeReceiveTypes: request.storeReceiveTypes,
				id: request.id,
				limit: request.limit,
				token: request.token,
			},
			secretInfo,
			operationRequest
		);
	}

	private async execute(request: { storeId: string; storeReceiveTypes: Array<number>; id: string; limit: number; token: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetStoreLog", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let $filter = {} as any;

		if (request.storeId) {
			$filter["storeId"] = request.storeId;
		}

		if (request.id) {
			$filter["id"] = request.id;
		}

		if (request.storeReceiveTypes) {
			if (request.storeReceiveTypes.length != 0) {
				if (request.storeReceiveTypes.length == 1) $filter["storeReceiveType"] = request.storeReceiveTypes[0];
				else $filter["storeReceiveType"] = { $in: request.storeReceiveTypes };
			}
		}

		if (request.token) {
			$filter["_id"] = { $lt: request.token };
		}

		let gnResults = new GNArray();

		let results = await this.gnServer.getDatabase().getStoreInventoryLogAsync($filter, secretInfo.getGameId(), request.limit);

		let token: string;

		while (await results.hasNext()) {
			let result = await results.next();

			let gnResult = new GNHashtable();

			gnResult.add(GNParameterCode.StoreId, result["storeId"]);
			gnResult.add(GNParameterCode.OwnerId, result["id"]);
			gnResult.add(GNParameterCode.OwnerType, result["type"]);
			gnResult.add(GNParameterCode.TransactionId, result["transactionId"]);
			gnResult.add(GNParameterCode.StoreReceiveType, result["storeReceiveType"]);

			{
				let gnArr = new GNArray();
				let arrValues = result["priceCurrencyStartValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.Key, arrValue["key"]);
					gnData.add(GNParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.PriceCurrencyStartValues, gnArr);
			}

			{
				let gnArr = new GNArray();
				let arrValues = result["priceCurrencyAmountValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.Key, arrValue["key"]);
					gnData.add(GNParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.PriceCurrencyAmountValues, gnArr);
			}

			{
				let gnArr = new GNArray();
				let arrValues = result["priceCurrencyFinalValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.Key, arrValue["key"]);
					gnData.add(GNParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.PriceCurrencyFinalValues, gnArr);
			}

			{
				let gnArr = new GNArray();
				let arrValues = result["storeCurrencyStartValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.Key, arrValue["key"]);
					gnData.add(GNParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.StoreCurrencyStartValues, gnArr);
			}

			{
				let gnArr = new GNArray();
				let arrValues = result["storeCurrencyAmountValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.Key, arrValue["key"]);
					gnData.add(GNParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.StoreCurrencyAmountValues, gnArr);
			}

			{
				let gnArr = new GNArray();
				let arrValues = result["storeCurrencyFinalValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.Key, arrValue["key"]);
					gnData.add(GNParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.StoreCurrencyFinalValues, gnArr);
			}

			{
				let gnArr = new GNArray();
				let arrValues = result["storeItemFinalValues"];
				for (let i = 0; i < arrValues.length; i++) {
					let arrValue = arrValues[i];

					let gnData = new GNHashtable();
					gnData.add(GNParameterCode.CatalogId, arrValue["catalogId"]);
					gnData.add(GNParameterCode.ClassId, arrValue["classId"]);
					gnData.add(GNParameterCode.ItemId, arrValue["itemId"]);
					gnArr.add(gnData);
				}

				gnResult.add(GNParameterCode.StoreItemFinalValues, gnArr);
			}

			gnResult.add(GNParameterCode.TsCreate, result["tsCreate"]);
			gnResult.add(GNParameterCode.Log, result["log"]);

			gnResults.add(gnResult);

			token = result["_id"].toString();
		}

		operationResponse.setParameter(GNParameterCode.Results, gnResults);

		if (token) {
			operationResponse.setParameter(GNParameterCode.Token, token);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetStoreLog", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
