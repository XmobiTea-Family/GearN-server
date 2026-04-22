import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import {
	DataMember,
	BooleanDataMember,
	NumberDataMember,
	StringDataMember,
	GNHashtableDataMember,
	GNArrayDataMember,
} from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import * as mongoDB from "mongodb";

class GetStoreLogOperationRequest extends OperationRequest {

	// Stores the store ID value used by this instance.
	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true, isOptional: true })
	public storeId?: string;

	// Stores the store receive types value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.StoreReceiveTypes, minLength: 1, maxLength: 10, mustNonNull: true, elementCls: Number, isOptional: true })
	public storeReceiveTypes?: Array<number>;

	// Stores the ID value used by this instance.
	@StringDataMember({ code: ParameterCode.Id, minLength: 10, maxLength: 11, mustNonNull: true, isOptional: true })
	public id?: string;

	// Stores the limit value used by this instance.
	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	// Stores the token value used by this instance.
	@StringDataMember({ code: ParameterCode.Token, minLength: 24, maxLength: 24, mustNonNull: true, isOptional: true })
	public token?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetStoreLogOperationRequest extends GetStoreLogOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetStoreLogOperationRequest extends ServerGetStoreLogOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetStoreLogRequestHandler extends StoreItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetStoreLog;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetStoreLogOperationRequest;
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { storeId: string; storeReceiveTypes: Array<number>; id: string; limit: number; token: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_GetStoreLog", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the filter value used in the current execution flow.
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

		if (request.token && mongoDB.ObjectId.isValid(request.token)) {
			$filter["_id"] = { $lt: new mongoDB.ObjectId(request.token) };
		}

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		// Stores the results value used in the current execution flow.
		let results = await this.gnServer.getDatabase().storeInventoryRepository.getStoreInventoryLogAsync($filter, secretInfo.getGameId(), request.limit);

		// Stores the token value used in the current execution flow.
		let token: string;

		while (await results.hasNext()) {
			// Stores the result value used in the current execution flow.
			let result = await results.next();

			// Stores the GearN result value used in the current execution flow.
			let gnResult = new GNHashtable();

			gnResult.add(ParameterCode.StoreId, result["storeId"]);
			gnResult.add(ParameterCode.OwnerId, result["id"]);
			gnResult.add(ParameterCode.OwnerType, result["type"]);
			gnResult.add(ParameterCode.TransactionId, result["transactionId"]);
			gnResult.add(ParameterCode.StoreReceiveType, result["storeReceiveType"]);

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["priceCurrencyStartValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.Key, arrValue["key"]);
					gnData.add(ParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.PriceCurrencyStartValues, gnArr);
			}

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["priceCurrencyAmountValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.Key, arrValue["key"]);
					gnData.add(ParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.PriceCurrencyAmountValues, gnArr);
			}

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["priceCurrencyFinalValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.Key, arrValue["key"]);
					gnData.add(ParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.PriceCurrencyFinalValues, gnArr);
			}

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["storeCurrencyStartValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.Key, arrValue["key"]);
					gnData.add(ParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.StoreCurrencyStartValues, gnArr);
			}

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["storeCurrencyAmountValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.Key, arrValue["key"]);
					gnData.add(ParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.StoreCurrencyAmountValues, gnArr);
			}

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["storeCurrencyFinalValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.Key, arrValue["key"]);
					gnData.add(ParameterCode.Value, arrValue["value"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.StoreCurrencyFinalValues, gnArr);
			}

			{
				// Stores the GearN arr value used in the current execution flow.
				let gnArr = new GNArray();
				// Stores the arr values value used in the current execution flow.
				let arrValues = result["storeItemFinalValues"];
				for (let i = 0; i < arrValues.length; i++) {
					// Stores the arr value value used in the current execution flow.
					let arrValue = arrValues[i];

					// Stores the GearN data value used in the current execution flow.
					let gnData = new GNHashtable();
					gnData.add(ParameterCode.CatalogId, arrValue["catalogId"]);
					gnData.add(ParameterCode.ClassId, arrValue["classId"]);
					gnData.add(ParameterCode.ItemId, arrValue["itemId"]);
					gnArr.add(gnData);
				}

				gnResult.add(ParameterCode.StoreItemFinalValues, gnArr);
			}

			gnResult.add(ParameterCode.TsCreate, result["tsCreate"]);
			gnResult.add(ParameterCode.Log, result["log"]);

			gnResults.add(gnResult);

			token = result["_id"].toString();
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);

		if (token) {
			operationResponse.setParameter(ParameterCode.Token, token);
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_GetStoreLog", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
