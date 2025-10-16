import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { StoreReceiveType } from "./../../../../../GN-common/constant/enumType/StoreReceiveType";
import { StoreItemType } from "./../../../../../GN-common/constant/enumType/StoreItemType";

class PresentStoreItemOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
	public storeId: string;

	@StringDataMember({ code: ParameterCode.Id, minLength: 10, maxLength: 11, mustNonNull: true })
	public id: string;

	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerPresentStoreItemOperationRequest extends PresentStoreItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminPresentStoreItemOperationRequest extends ServerPresentStoreItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class PresentStoreItemRequestHandler extends StoreItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.PresentStoreItem;
	}

	public override getCommonOperationRequest() {
		return PresentStoreItemOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let allowMethod = false;

		if (secretInfo.getPermission().storeInventory.presentStoreItem.otherSelfEnable) {
			allowMethod = true;
		}
		else if (secretInfo.getPermission().storeInventory.presentStoreItem.selfEnable) {
			if (request.type == <number>OwnerType.CharacterPlayer) {
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

				if (gamePlayer != null) {
					if (gamePlayer.hasPlayerCharacter(request.id)) {
						allowMethod = true;
					}
				}
			}
			else if (request.type == <number>OwnerType.GamePlayer) {
				if (request.id == authInfo.getUserId()) {
					allowMethod = true;
				}
			}
			else if (request.type == <number>OwnerType.Group) {
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

				if (gamePlayer != null) {
					let groupItem = gamePlayer.getPlayerGroup(request.id);

					if (groupItem != null && groupItem.status == <number>GroupStatus.Member) {
						allowMethod = true;
					}
				}
			}
		}

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			id: request.id,
			type: request.type,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerPresentStoreItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.presentStoreItem.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			id: request.id,
			type: request.type,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminPresentStoreItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().storeInventory.presentStoreItem.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			storeId: request.storeId,
			id: request.id,
			type: request.type,
			log: request.log,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { storeId: string, id: string, type: number, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_PresentStoreItem", request, secretInfo, operationRequest);
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

		if (storeInventory.getRemoveStatus().tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemHadBeenRemove);
			return operationResponse;
		}

		if (storeInventory.getStoreItemType() == StoreItemType.NonConsumable) {
			let purchaseCount = await this.gnServer.getDatabase().getCountStoreInventoryUsedAsync(request.storeId, secretInfo.getGameId(), request.id);

			if (purchaseCount != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemHadPurchaseAndNonConsumable);
				return operationResponse;
			}
		}

		let priceCurrencyStartValues: {
			key: string,
			value: number,
		}[] = [];

		let priceCurrencyAmountValues: {
			key: string,
			value: number,
		}[] = [];

		let priceCurrencyFinalValues: {
			key: string,
			value: number,
		}[] = [];

		let storeCurrencyStartValues: {
			key: string,
			value: number,
		}[] = [];

		let storeCurrencyAmountValues: {
			key: string,
			value: number,
		}[] = [];

		let storeCurrencyFinalValues: {
			key: string,
			value: number,
		}[] = [];

		let storeItemFinalValues: {
			catalogId: string,
			classId: string,
			itemId: string,
		}[] = [];

		let allStoreCurrencies = storeInventory.getAllStoreCurrencies();
		let allStoreItems = storeInventory.getAllStoreItems();

		if (request.type == <number>OwnerType.CharacterPlayer) {
			let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.id, secretInfo.getGameId(), {
				playerCurrencies: true,
				playerInventories: true,
			});

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.BuyerNotFound);
				return operationResponse;
			}

			let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

			let gnInfoResponseParameters = new GNHashtable();

			let gnPlayerCurrencies = new GNArray();
			let gnPlayerInventories = new GNArray();

			{
				for (let i = 0; i < allStoreItems.length; i++) {
					let storeItem = allStoreItems[i];

					let playerItemCatalogSettingsItem = characterPlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

					if (playerItemCatalogSettingsItem != null) {
						let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
						if (itemClassSettingsItem != null) {
							let inventory = await this.createItem(storeItem.catalogId, storeItem.classId, storeItem.amount, playerItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
							characterPlayer.setPlayerInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

							let gnPlayerInventory = new GNHashtable();

							gnPlayerInventory.add(ParameterCode.ItemId, inventory.getItemId());
							gnPlayerInventory.add(ParameterCode.CatalogId, inventory.getCatalogId());
							gnPlayerInventory.add(ParameterCode.ClassId, inventory.getClassId());

							gnPlayerInventories.add(gnPlayerInventory);

							storeItemFinalValues.push({
								catalogId: inventory.getCatalogId(),
								classId: inventory.getClassId(),
								itemId: inventory.getItemId(),
							});
						}
					}
				}
			}

			{
				for (let i = 0; i < allStoreCurrencies.length; i++) {
					let storeCurrency = allStoreCurrencies[i];

					storeCurrencyAmountValues.push({
						key: storeCurrency.key,
						value: storeCurrency.value,
					});

					let useSetPlayerCurrency = false;
					if (!characterPlayer.hasPlayerCurrency(storeCurrency.key)) {
						useSetPlayerCurrency = true;

						let playerCurrenciesSettingsItem = characterPlayerSettings.playerCurrenciesSettings.find(x => x.key == storeCurrency.key);
						if (playerCurrenciesSettingsItem != null) {
							characterPlayer.setPlayerCurrency(storeCurrency.key, playerCurrenciesSettingsItem.initialValue);
						}
						else {
							characterPlayer.setPlayerCurrency(storeCurrency.key, 0);
						}
					}

					let playerCurrency = characterPlayer.getPlayerCurrency(storeCurrency.key);

					storeCurrencyStartValues.push({
						key: storeCurrency.key,
						value: playerCurrency.value,
					});

					let oldValue = playerCurrency.value;
					let serverValue = playerCurrency.value + storeCurrency.value;

					if (useSetPlayerCurrency) {
						characterPlayer.setPlayerCurrency(storeCurrency.key, serverValue);
					}
					else {
						characterPlayer.changePlayerCurrency(storeCurrency.key, storeCurrency.value);
					}

					let gnPlayerCurrency = new GNHashtable();

					gnPlayerCurrency.add(ParameterCode.Key, storeCurrency.key);
					gnPlayerCurrency.add(ParameterCode.Value, serverValue);

					storeCurrencyFinalValues.push({
						key: storeCurrency.key,
						value: serverValue,
					});

					gnPlayerCurrencies.add(gnPlayerCurrency);

					this.gnServer.getDatabase().insertCharacterPlayerCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "BuyStoreItem " + storeInventory.getStoreId() + ", log: " + request.log);
				}
			}

			characterPlayer.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnPlayerCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnPlayerInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}
		else if (request.type == <number>OwnerType.GamePlayer) {
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.id, secretInfo.getGameId(), {
				playerCurrencies: true,
				playerInventories: true,
			});

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.BuyerNotFound);
				return operationResponse;
			}

			let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

			let gnInfoResponseParameters = new GNHashtable();

			let gnPlayerCurrencies = new GNArray();
			let gnPlayerInventories = new GNArray();

			{
				for (let i = 0; i < allStoreItems.length; i++) {
					let storeItem = allStoreItems[i];

					let playerItemCatalogSettingsItem = gamePlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

					if (playerItemCatalogSettingsItem != null) {
						let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
						if (itemClassSettingsItem != null) {
							let inventory = await this.createItem(storeItem.catalogId, storeItem.classId, storeItem.amount, playerItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
							gamePlayer.setPlayerInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

							let gnPlayerInventory = new GNHashtable();

							gnPlayerInventory.add(ParameterCode.ItemId, inventory.getItemId());
							gnPlayerInventory.add(ParameterCode.CatalogId, inventory.getCatalogId());
							gnPlayerInventory.add(ParameterCode.ClassId, inventory.getClassId());

							gnPlayerInventories.add(gnPlayerInventory);

							storeItemFinalValues.push({
								catalogId: inventory.getCatalogId(),
								classId: inventory.getClassId(),
								itemId: inventory.getItemId(),
							});
						}
					}
				}
			}

			{
				for (let i = 0; i < allStoreCurrencies.length; i++) {
					let storeCurrency = allStoreCurrencies[i];

					storeCurrencyAmountValues.push({
						key: storeCurrency.key,
						value: storeCurrency.value,
					});

					let useSetPlayerCurrency = false;
					if (!gamePlayer.hasPlayerCurrency(storeCurrency.key)) {
						useSetPlayerCurrency = true;

						let playerCurrenciesSettingsItem = gamePlayerSettings.playerCurrenciesSettings.find(x => x.key == storeCurrency.key);
						if (playerCurrenciesSettingsItem != null) {
							gamePlayer.setPlayerCurrency(storeCurrency.key, playerCurrenciesSettingsItem.initialValue);
						}
						else {
							gamePlayer.setPlayerCurrency(storeCurrency.key, 0);
						}
					}

					let playerCurrency = gamePlayer.getPlayerCurrency(storeCurrency.key);

					storeCurrencyStartValues.push({
						key: storeCurrency.key,
						value: playerCurrency.value,
					});

					let oldValue = playerCurrency.value;
					let serverValue = playerCurrency.value + storeCurrency.value;

					if (useSetPlayerCurrency) {
						gamePlayer.setPlayerCurrency(storeCurrency.key, serverValue);
					}
					else {
						gamePlayer.changePlayerCurrency(storeCurrency.key, storeCurrency.value);
					}

					let gnPlayerCurrency = new GNHashtable();

					gnPlayerCurrency.add(ParameterCode.Key, storeCurrency.key);
					gnPlayerCurrency.add(ParameterCode.Value, serverValue);

					storeCurrencyFinalValues.push({
						key: storeCurrency.key,
						value: serverValue,
					});

					gnPlayerCurrencies.add(gnPlayerCurrency);

					this.gnServer.getDatabase().insertGamePlayerCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "BuyStoreItem " + storeInventory.getStoreId() + ", log: " + request.log);
				}
			}

			gamePlayer.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnPlayerCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnPlayerInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}
		else if (request.type == <number>OwnerType.Group) {
			let group = await this.gnServer.getDatabase().loadGroupAsync(request.id, secretInfo.getGameId(), {
				groupCurrencies: true,
				groupInventories: true,
			});

			if (group == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.BuyerNotFound);
				return operationResponse;
			}

			let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

			let gnInfoResponseParameters = new GNHashtable();

			let gnCurrencies = new GNArray();
			let gnInventories = new GNArray();

			{
				for (let i = 0; i < allStoreItems.length; i++) {
					let storeItem = allStoreItems[i];

					let groupItemCatalogSettingsItem = groupSettings.groupItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

					if (groupItemCatalogSettingsItem != null) {
						let itemClassSettingsItem = groupItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
						if (itemClassSettingsItem != null) {
							let inventory = await this.createItem(storeItem.catalogId, storeItem.classId, storeItem.amount, groupItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
							group.setGroupInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

							let gnGroupInventory = new GNHashtable();

							gnGroupInventory.add(ParameterCode.ItemId, inventory.getItemId());
							gnGroupInventory.add(ParameterCode.CatalogId, inventory.getCatalogId());
							gnGroupInventory.add(ParameterCode.ClassId, inventory.getClassId());

							gnInventories.add(gnGroupInventory);

							storeItemFinalValues.push({
								catalogId: inventory.getCatalogId(),
								classId: inventory.getClassId(),
								itemId: inventory.getItemId(),
							});
						}
					}
				}
			}

			{
				for (let i = 0; i < allStoreCurrencies.length; i++) {
					let storeCurrency = allStoreCurrencies[i];

					storeCurrencyAmountValues.push({
						key: storeCurrency.key,
						value: storeCurrency.value,
					});

					let useSetGroupCurrency = false;
					if (!group.hasGroupCurrency(storeCurrency.key)) {
						useSetGroupCurrency = true;

						let groupCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings.find(x => x.key == storeCurrency.key);
						if (groupCurrenciesSettingsItem != null) {
							group.setGroupCurrency(storeCurrency.key, groupCurrenciesSettingsItem.initialValue);
						}
						else {
							group.setGroupCurrency(storeCurrency.key, 0);
						}
					}

					let groupCurrency = group.getGroupCurrency(storeCurrency.key);

					storeCurrencyStartValues.push({
						key: storeCurrency.key,
						value: groupCurrency.value,
					});

					let oldValue = groupCurrency.value;
					let serverValue = groupCurrency.value + storeCurrency.value;

					if (useSetGroupCurrency) {
						group.setGroupCurrency(storeCurrency.key, serverValue);
					}
					else {
						group.changeGroupCurrency(storeCurrency.key, storeCurrency.value);
					}

					let gnPlayerCurrency = new GNHashtable();

					gnPlayerCurrency.add(ParameterCode.Key, storeCurrency.key);
					gnPlayerCurrency.add(ParameterCode.Value, serverValue);

					storeCurrencyFinalValues.push({
						key: storeCurrency.key,
						value: serverValue,
					});

					gnCurrencies.add(gnPlayerCurrency);
					this.gnServer.getDatabase().insertGroupCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "BuyStoreItem " + storeInventory.getStoreId() + ", log: " + request.log);
				}
			}

			group.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}

		this.gnServer.getDatabase().insertStoreInventoryLogAsync(request.storeId, secretInfo.getGameId(), request.id, request.type, priceCurrencyStartValues, priceCurrencyAmountValues, priceCurrencyFinalValues, storeCurrencyStartValues, storeCurrencyAmountValues, storeCurrencyFinalValues, storeItemFinalValues, null, <number>StoreReceiveType.Present, request.log);

		if (storeInventory.getStoreItemType() == StoreItemType.NonConsumable) this.gnServer.getDatabase().insertStoreInventoryUsedAsync(request.storeId, secretInfo.getGameId(), request.id, request.type);

		operationResponse.setParameter(ParameterCode.StoreCurrencies, this.generateStoreCurrencies(storeInventory));
		operationResponse.setParameter(ParameterCode.StoreItems, this.generateStoreItems(storeInventory));
		operationResponse.setParameter(ParameterCode.PriceCurrencies, this.generatePriceCurrencies(storeInventory));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_PresentStoreItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
