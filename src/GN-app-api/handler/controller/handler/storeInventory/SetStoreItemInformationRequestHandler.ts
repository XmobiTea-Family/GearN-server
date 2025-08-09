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

	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
	public storeId: string;

	@NumberDataMember({ code: ParameterCode.StoreItemType, minValue: 1, maxValue: 2, mustInt: true, isOptional: true, })
	public storeItemType?: number;

	@GNArrayDataMember({ code: ParameterCode.StoreDatas, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: StoreDataParam })
	public storeDatas?: Array<StoreDataParam>;

	@GNArrayDataMember({ code: ParameterCode.StoreItems, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: StoreItemParam })
	public storeItems?: Array<StoreItemParam>;

	@GNArrayDataMember({ code: ParameterCode.StoreCurrencies, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: CurrencyParam })
	public storeCurrencies?: Array<CurrencyParam>;

	@GNArrayDataMember({ code: ParameterCode.PriceCurrencies, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: CurrencyParam })
	public priceCurrencies?: Array<CurrencyParam>;

	@GNHashtableDataMember({ code: ParameterCode.InAppPurchase, mustNonNull: true, isOptional: true, })
	public inAppPurchase?: InAppPurchaseParam;

	@StringDataMember({ code: ParameterCode.DisplayName, mustNonNull: true, isOptional: true, })
	public displayName?: string;

	@GNHashtableDataMember({ code: ParameterCode.Avatar, mustNonNull: true, isOptional: true, })
	public avatar?: AvatarParam;

	@GNArrayDataMember({ code: ParameterCode.Tags, minLength: 0, maxLength: 32, mustNonNull: true, isOptional: true, elementCls: TagParam })
	public tags?: Array<TagParam>;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerSetStoreItemInformationOperationRequest extends SetStoreItemInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminSetStoreItemInformationOperationRequest extends ServerSetStoreItemInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetStoreItemInformationRequestHandler extends StoreItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.SetStoreItemInformation;
	}

	public override getCommonOperationRequest() {
		return SetStoreItemInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
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

	private async execute(request: { storeId: string, storeItemType: number, storeDatas: Array<StoreDataParam>, storeItems: Array<StoreItemParam>, storeCurrencies: Array<CurrencyParam>, priceCurrencies: Array<CurrencyParam>, inAppPurchase: InAppPurchaseParam, displayName: string, avatar: AvatarParam, tags: Array<TagParam> }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_SetStoreItemInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(request.storeId, secretInfo.getGameId(), null);

		if (storeInventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemNotFound);
			return operationResponse;
		}

		if (request.storeDatas) {
			storeInventory.clearStoreDatas();
			for (let i = 0; i < request.storeDatas.length; i++) {
				let storeDataParam = request.storeDatas[i];

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
				let storeItemParam = request.storeItems[i];
				storeInventory.setStoreItem(storeItemParam.catalogId, storeItemParam.classId, storeItemParam.amount);
			}
		}

		if (request.storeCurrencies != null) {
			storeInventory.clearStoreCurrencies();
			for (let i = 0; i < request.storeCurrencies.length; i++) {
				let storeCurrencyParam = request.storeCurrencies[i];
				storeInventory.setStoreCurrency(storeCurrencyParam.key, storeCurrencyParam.value);
			}
		}

		if (request.priceCurrencies != null) {
			storeInventory.clearPriceCurrencies();
			for (let i = 0; i < request.priceCurrencies.length; i++) {
				let priceCurrencyParam = request.priceCurrencies[i];
				storeInventory.setPriceCurrency(priceCurrencyParam.key, priceCurrencyParam.value);
			}
		}

		if (request.inAppPurchase != null) {
			let inAppPurchase = storeInventory.getInAppPurchase();

			storeInventory.setInAppPurchase({
				appleAppStoreId: request.inAppPurchase.appleAppStoreId ?? inAppPurchase.appleAppStoreId,
				facebookStoreId: request.inAppPurchase.facebookStoreId ?? inAppPurchase.facebookStoreId,
				googlePlayStoreId: request.inAppPurchase.googlePlayStoreId ?? inAppPurchase.googlePlayStoreId,
				analyticsPrice: request.inAppPurchase.analyticsPrice ?? inAppPurchase.analyticsPrice,
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
