import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNData, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { StoreDataParam } from "./model/StoreDataParam";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { StoreItemParam } from "./model/StoreItemParam";
import { CurrencyParam } from "./model/CurrencyParam";
import { AvatarParam } from "./model/AvatarParam";
import { TagParam } from "./model/TagParam";
import { InAppPurchaseParam } from "./model/InAppPurchaseParam";

class SetStoreItemInformationOperationRequest extends OperationRequest {

	// Stores the store ID value used by this instance.
	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
	public storeId: string;

	// Stores the store item type value used by this instance.
	@NumberDataMember({ code: ParameterCode.StoreItemType, minValue: 1, maxValue: 2, mustInt: true, isOptional: true, })
	public storeItemType?: number;

	// Stores the store datas value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.StoreDatas, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: StoreDataParam })
	public storeDatas?: Array<StoreDataParam>;

	// Stores the store items value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.StoreItems, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: StoreItemParam })
	public storeItems?: Array<StoreItemParam>;

	// Stores the store currencies value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.StoreCurrencies, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: CurrencyParam })
	public storeCurrencies?: Array<CurrencyParam>;

	// Stores the price currencies value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PriceCurrencies, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: CurrencyParam })
	public priceCurrencies?: Array<CurrencyParam>;

	// Stores the in app purchase value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InAppPurchase, mustNonNull: true, isOptional: true, })
	public inAppPurchase?: InAppPurchaseParam;

	// Stores the display name value used by this instance.
	@StringDataMember({ code: ParameterCode.DisplayName, mustNonNull: true, isOptional: true, })
	public displayName?: string;

	// Stores the avatar value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.Avatar, mustNonNull: true, isOptional: true, })
	public avatar?: AvatarParam;

	// Stores the tags value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.Tags, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: TagParam })
	public tags?: Array<TagParam>;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetStoreItemInformationOperationRequest extends SetStoreItemInformationOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetStoreItemInformationOperationRequest extends ServerSetStoreItemInformationOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetStoreItemInformationRequestHandler extends StoreItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetStoreItemInformation;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetStoreItemInformationOperationRequest;
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

		if (!secretInfo.getPermission().storeInventory.setStoreItemInformation.otherSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			storeItemType: request.storeItemType,
			storeDatas: request.storeDatas,
			storeItems: request.storeItems,
			storeCurrencies: request.storeCurrencies,
			priceCurrencies: request.priceCurrencies,
			inAppPurchase: request.inAppPurchase,
			displayName: request.displayName,
			avatar: request.avatar,
			tags: request.tags,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetStoreItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.setStoreItemInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			storeItemType: request.storeItemType,
			storeDatas: request.storeDatas,
			storeItems: request.storeItems,
			storeCurrencies: request.storeCurrencies,
			priceCurrencies: request.priceCurrencies,
			inAppPurchase: request.inAppPurchase,
			displayName: request.displayName,
			avatar: request.avatar,
			tags: request.tags,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetStoreItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.setStoreItemInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			storeItemType: request.storeItemType,
			storeDatas: request.storeDatas,
			storeItems: request.storeItems,
			storeCurrencies: request.storeCurrencies,
			priceCurrencies: request.priceCurrencies,
			inAppPurchase: request.inAppPurchase,
			displayName: request.displayName,
			avatar: request.avatar,
			tags: request.tags,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { storeId: string, storeItemType: number, storeDatas: Array<StoreDataParam>, storeItems: Array<StoreItemParam>, storeCurrencies: Array<CurrencyParam>, priceCurrencies: Array<CurrencyParam>, inAppPurchase: InAppPurchaseParam, displayName: string, avatar: AvatarParam, tags: Array<TagParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_SetStoreItemInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the store inventory value used in the current execution flow.
		let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(request.storeId, secretInfo.getGameId(), null);

		if (storeInventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemNotFound);
			return operationResponse;
		}

		if (request.storeDatas) {
			storeInventory.clearStoreDatas();
			for (let i = 0; i < request.storeDatas.length; i++) {
				// Stores the store data parameter value used in the current execution flow.
				let storeDataParam = request.storeDatas[i];

				// Stores the value value used in the current execution flow.
				let value = storeDataParam.value;

				if (value != null && value instanceof GNData) {
					value = (value as GNData).toData();
				}

				storeInventory.setStoreData(storeDataParam.key, value as DataValueType);
			}
		}

		if (request.storeItems != null) {
			storeInventory.clearStoreItems();
			for (let i = 0; i < request.storeItems.length; i++) {
				// Stores the store item parameter value used in the current execution flow.
				let storeItemParam = request.storeItems[i];
				storeInventory.setStoreItem(storeItemParam.catalogId, storeItemParam.classId, storeItemParam.amount);
			}
		}

		if (request.storeCurrencies != null) {
			storeInventory.clearStoreCurrencies();
			for (let i = 0; i < request.storeCurrencies.length; i++) {
				// Stores the store currency parameter value used in the current execution flow.
				let storeCurrencyParam = request.storeCurrencies[i];
				storeInventory.setStoreCurrency(storeCurrencyParam.key, storeCurrencyParam.value);
			}
		}

		if (request.priceCurrencies != null) {
			storeInventory.clearPriceCurrencies();
			for (let i = 0; i < request.priceCurrencies.length; i++) {
				// Stores the price currency parameter value used in the current execution flow.
				let priceCurrencyParam = request.priceCurrencies[i];
				storeInventory.setPriceCurrency(priceCurrencyParam.key, priceCurrencyParam.value);
			}
		}

		if (request.inAppPurchase != null) {
			// Stores the in app purchase value used in the current execution flow.
			let inAppPurchase = storeInventory.getInAppPurchase();

			let appleAppStoreId = request.inAppPurchase.appleAppStoreId;
			let facebookStoreId = request.inAppPurchase.facebookStoreId;
			let googlePlayStoreId = request.inAppPurchase.googlePlayStoreId;

			if (appleAppStoreId) {
				const storeStoreInventory = await this.gnServer.getDatabase().loadStoreInventoryByAppleAppStoreAsync(appleAppStoreId, secretInfo.getGameId(), { storeId: true });

				if (storeStoreInventory != null && storeStoreInventory.getStoreId() != request.storeId) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreInvalid);
					operationResponse.setDebugMessage("Apple productId had use " + appleAppStoreId);

					return operationResponse;
				}
			}

			if (facebookStoreId) {
				const storeStoreInventory = await this.gnServer.getDatabase().loadStoreInventoryByFacebookStoreAsync(facebookStoreId, secretInfo.getGameId(), { storeId: true });

				if (storeStoreInventory != null && storeStoreInventory.getStoreId() != request.storeId) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreInvalid);
					operationResponse.setDebugMessage("Facebook productId had use " + facebookStoreId);

					return operationResponse;
				}
			}

			if (googlePlayStoreId) {
				const storeStoreInventory = await this.gnServer.getDatabase().loadStoreInventoryByGooglePlayStoreAsync(googlePlayStoreId, secretInfo.getGameId(), { storeId: true });

				if (storeStoreInventory != null && storeStoreInventory.getStoreId() != request.storeId) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreInvalid);
					operationResponse.setDebugMessage("Google productId had use " + googlePlayStoreId);

					return operationResponse;
				}
			}

			storeInventory.setInAppPurchase({
				appleAppStoreId: appleAppStoreId,
				facebookStoreId: facebookStoreId,
				googlePlayStoreId: googlePlayStoreId,
				analyticsPrice: request.inAppPurchase.analyticsPrice,
			});
		}

		if (request.displayName != null) {
			storeInventory.setDisplayName(request.displayName);
		}

		if (request.avatar != null) {
			storeInventory.setAvatar(request.avatar.type, request.avatar.value);
		}

		if (request.storeItemType != null) {
			storeInventory.setStoreItemType(request.storeItemType);
		}

		if (request.tags != null) {
			storeInventory.clearTags();
			for (let i = 0; i < request.tags.length; i++) {
				// Stores the tag parameter value used in the current execution flow.
				let tagParam = request.tags[i];
				storeInventory.setTag(tagParam.key, tagParam.value);
			}
		}

		storeInventory.saveAsync();

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(storeInventory, {
			storeItems: true,
			storeItemType: true,
			storeCurrencies: true,
			priceCurrencies: true,
			inAppPurchase: true,
			removeStatus: true,
			displayName: true,
			avatar: true,
			tsCreate: true,
			tags: true,
			storeDatas: true,
		}, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_SetStoreItemInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
