import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";

import { StoreInventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/StoreInventoryFindOptions";
import { RequestHandler } from "./../base/RequestHandler";
import { StoreInventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { Inventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";

export abstract class StoreItemBaseRequestHandler extends RequestHandler {
	/**
	 * Checks whether get all.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	private isGetAll(infoRequestParam: InfoRequestParam): boolean {
		return infoRequestParam.storeItems
			&& infoRequestParam.storeItemType
			&& infoRequestParam.storeCurrencies
			&& infoRequestParam.priceCurrencies
			&& infoRequestParam.inAppPurchase
			&& infoRequestParam.removeStatus

			&& infoRequestParam.displayName
			&& infoRequestParam.avatar
			&& infoRequestParam.tsCreate
			&& infoRequestParam.tags

			&& infoRequestParam.storeDatas;
	}

	/**
	 * Creates the item.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param itemType Provides the item type value used by this operation.
	 * @param id Provides the ID value used by this operation.
	 * @param type Provides the type value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	protected async createItem(catalogId: string, classId: string, amount: number, itemType: number, id: string, type: number, gameId: string): Promise<Inventory> {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// Stores the item ID value used in the current execution flow.
		let itemId = StringUtility.generateRandomString(12, this.gnServer.getIdTypeCase());

		// Stores the inventory value used in the current execution flow.
		let inventory = await this.gnServer.getDatabase().inventoryRepository.createInventoryAsync({
			_id: undefined,
			itemId: itemId,
			catalogId: catalogId,
			classId: classId,
			amount: amount,
			itemType: itemType,
			owner: { id: id, type: type },
			itemDatas: {},
			itemStatistics: {},
			removeStatus: { tsRemove: 0, reason: "" },
			segments: [],
			customDatas: {},
			tsCreate: currentMilliseconds,
			displayName: "",
			displayNameNormalize: "",
			avatar: { type: 0, value: "0" },
			tags: {},
		}, gameId);
		return inventory;
	}

	/**
	 * Converts the to store inventory find options.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected convertToStoreInventoryFindOptions(infoRequestParam: InfoRequestParam): StoreInventoryFindOptions {
		if (this.isGetAll(infoRequestParam)) return null;

		// Stores the answer value used in the current execution flow.
		let answer: StoreInventoryFindOptions = {};
		answer.storeId = true;

		if (infoRequestParam.storeItems) answer.storeItems = infoRequestParam.storeItems;
		if (infoRequestParam.storeItemType) answer.storeItemType = infoRequestParam.storeItemType;
		if (infoRequestParam.storeCurrencies) answer.storeCurrencies = infoRequestParam.storeCurrencies;
		if (infoRequestParam.priceCurrencies) answer.priceCurrencies = infoRequestParam.priceCurrencies;
		if (infoRequestParam.inAppPurchase) answer.inAppPurchase = infoRequestParam.inAppPurchase;
		if (infoRequestParam.removeStatus) answer.removeStatus = infoRequestParam.removeStatus;

		if (infoRequestParam.displayName) answer.displayName = infoRequestParam.displayName;
		if (infoRequestParam.avatar) answer.avatar = infoRequestParam.avatar;
		if (infoRequestParam.tsCreate) answer.tsCreate = infoRequestParam.tsCreate;
		if (infoRequestParam.tags) answer.tags = infoRequestParam.tags;

		if (infoRequestParam.storeDatas) answer.storeDatas = infoRequestParam.storeDatas;

		return answer;
	}

	/**
	 * Executes the generate info response parameters workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @param infoRequestParam Provides the info request parameter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateInfoResponseParameters(storeInventory: StoreInventory, infoRequestParam: InfoRequestParam, gameId: string): GNHashtable {
		// Stores the answer value used in the current execution flow.
		let answer = new GNHashtable();

		if (infoRequestParam.storeItems)
			answer.add(ParameterCode.StoreItems, this.generateStoreItems(storeInventory));

		if (infoRequestParam.storeItemType)
			answer.add(ParameterCode.StoreItemType, this.generateStoreItemType(storeInventory));

		if (infoRequestParam.storeCurrencies)
			answer.add(ParameterCode.StoreCurrencies, this.generateStoreCurrencies(storeInventory));

		if (infoRequestParam.priceCurrencies)
			answer.add(ParameterCode.PriceCurrencies, this.generatePriceCurrencies(storeInventory));

		if (infoRequestParam.inAppPurchase)
			answer.add(ParameterCode.InAppPurchase, this.generateInAppPurchase(storeInventory));

		if (infoRequestParam.removeStatus)
			answer.add(ParameterCode.RemoveStatus, this.generateRemoveStatus(storeInventory));

		if (infoRequestParam.displayName)
			answer.add(ParameterCode.DisplayName, this.generateDisplayName(storeInventory));

		if (infoRequestParam.avatar)
			answer.add(ParameterCode.Avatar, this.generateAvatar(storeInventory));

		if (infoRequestParam.tsCreate)
			answer.add(ParameterCode.TsCreate, this.generateTsCreate(storeInventory));

		if (infoRequestParam.tags)
			answer.add(ParameterCode.Tags, this.generateTags(storeInventory));

		if (infoRequestParam.storeDatas)
			answer.add(ParameterCode.StoreDatas, this.generateStoreDatas(storeInventory));

		return answer;
	}

	/**
	 * Executes the generate store items workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateStoreItems(storeInventory: StoreInventory): GNArray {
		// Stores the GearN store items value used in the current execution flow.
		let gnStoreItems = new GNArray();

		// Stores the complete store items collection used in the current execution flow.
		let allStoreItems = storeInventory.getAllStoreItems();

		for (let i = 0; i < allStoreItems.length; i++) {
			// Stores the store item value used in the current execution flow.
			let storeItem = allStoreItems[i];

			// Stores the GearN store item value used in the current execution flow.
			let gnStoreItem = new GNHashtable();

			gnStoreItem.add(ParameterCode.CatalogId, storeItem.catalogId);
			gnStoreItem.add(ParameterCode.ClassId, storeItem.classId);
			gnStoreItem.add(ParameterCode.Amount, storeItem.amount);

			gnStoreItems.add(gnStoreItem);
		}

		return gnStoreItems;
	}

	/**
	 * Executes the generate store item type workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateStoreItemType(storeInventory: StoreInventory): number {
		return storeInventory.getStoreItemType();
	}

	/**
	 * Executes the generate store currencies workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateStoreCurrencies(storeInventory: StoreInventory): GNArray {
		// Stores the GearN store currenciess value used in the current execution flow.
		let gnStoreCurrencies = new GNArray();

		// Stores the complete store currencies collection used in the current execution flow.
		let allStoreCurrencies = storeInventory.getAllStoreCurrencies();

		for (let i = 0; i < allStoreCurrencies.length; i++) {
			// Stores the store currency value used in the current execution flow.
			let storeCurrency = allStoreCurrencies[i];

			// Stores the GearN store currency value used in the current execution flow.
			let gnStoreCurrency = new GNHashtable();

			gnStoreCurrency.add(ParameterCode.Key, storeCurrency.key);
			gnStoreCurrency.add(ParameterCode.Value, storeCurrency.value);

			gnStoreCurrencies.add(gnStoreCurrency);
		}

		return gnStoreCurrencies;
	}

	/**
	 * Executes the generate price currencies workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generatePriceCurrencies(storeInventory: StoreInventory): GNArray {
		// Stores the GearN price currenciess value used in the current execution flow.
		let gnPriceCurrencies = new GNArray();

		// Stores the complete price currencies collection used in the current execution flow.
		let allPriceCurrencies = storeInventory.getAllPriceCurrencies();

		for (let i = 0; i < allPriceCurrencies.length; i++) {
			// Stores the price currency value used in the current execution flow.
			let priceCurrency = allPriceCurrencies[i];

			// Stores the GearN price currency value used in the current execution flow.
			let gnPriceCurrency = new GNHashtable();

			gnPriceCurrency.add(ParameterCode.Key, priceCurrency.key);
			gnPriceCurrency.add(ParameterCode.Value, priceCurrency.value);

			gnPriceCurrencies.add(gnPriceCurrency);
		}

		return gnPriceCurrencies;
	}

	/**
	 * Executes the generate in app purchase workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateInAppPurchase(storeInventory: StoreInventory): GNHashtable {
		// Stores the GearN in app purchase value used in the current execution flow.
		let gnInAppPurchase = new GNHashtable();

		// Stores the in app purchase value used in the current execution flow.
		let inAppPurchase = storeInventory.getInAppPurchase();

		gnInAppPurchase.add(ParameterCode.FacebookStoreId, inAppPurchase.facebookStoreId);
		gnInAppPurchase.add(ParameterCode.AppleAppStoreId, inAppPurchase.appleAppStoreId);
		gnInAppPurchase.add(ParameterCode.GooglePlayStoreId, inAppPurchase.googlePlayStoreId);
		gnInAppPurchase.add(ParameterCode.AnalyticsPrice, inAppPurchase.analyticsPrice);

		return gnInAppPurchase;
	}

	/**
	 * Executes the generate remove status workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateRemoveStatus(storeInventory: StoreInventory): GNHashtable {
		// Stores the remove status value used in the current execution flow.
		let removeStatus = storeInventory.getRemoveStatus();

		// Stores the GearN remove status value used in the current execution flow.
		let gnRemoveStatus = new GNHashtable();

		gnRemoveStatus.add(ParameterCode.TsRemove, removeStatus.tsRemove);
		gnRemoveStatus.add(ParameterCode.Reason, removeStatus.reason);

		return gnRemoveStatus;
	}

	/**
	 * Executes the generate display name workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateDisplayName(storeInventory: StoreInventory): string {
		return storeInventory.getDisplayName();
	}

	/**
	 * Executes the generate avatar workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateAvatar(storeInventory: StoreInventory): GNHashtable {
		// Stores the avatar value used in the current execution flow.
		let avatar = storeInventory.getAvatar();

		// Stores the GearN avatar value used in the current execution flow.
		let gnAvatar = new GNHashtable();

		gnAvatar.add(ParameterCode.Type, avatar.type);
		gnAvatar.add(ParameterCode.Value, avatar.value);

		return gnAvatar;
	}

	/**
	 * Executes the generate timestamp create workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTsCreate(storeInventory: StoreInventory): number {
		return storeInventory.getTsCreate();
	}

	/**
	 * Executes the generate tags workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateTags(storeInventory: StoreInventory): GNArray {
		// Stores the GearN tags value used in the current execution flow.
		let gnTags = new GNArray();

		// Stores the complete tags collection used in the current execution flow.
		let allTags = storeInventory.getAllTags();

		allTags.forEach((value: string, key: string) => {
			// Stores the GearN tag value used in the current execution flow.
			let gnTag = new GNHashtable();

			gnTag.add(ParameterCode.Key, key);
			gnTag.add(ParameterCode.Value, value);

			gnTags.add(gnTag);
		});

		return gnTags;
	}

	/**
	 * Executes the generate store datas workflow.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected generateStoreDatas(storeInventory: StoreInventory): GNArray {
		// Stores the GearN store datas value used in the current execution flow.
		let gnStoreDatas = new GNArray();

		// Stores the complete store datas collection used in the current execution flow.
		let allStoreDatas = storeInventory.getAllStoreDatas();

		allStoreDatas.forEach((value: DataValueType, key: string) => {
			// Stores the GearN store data value used in the current execution flow.
			let gnStoreData = new GNHashtable();

			gnStoreData.add(ParameterCode.Key, key);
			gnStoreData.add(ParameterCode.Value, value);

			gnStoreDatas.add(gnStoreData);
		});

		return gnStoreDatas;
	}
}
