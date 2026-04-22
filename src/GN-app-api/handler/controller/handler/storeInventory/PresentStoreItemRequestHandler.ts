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

	// Stores the store ID value used by this instance.
	@StringDataMember({ code: ParameterCode.StoreId, minLength: 10, maxLength: 32, mustNonNull: true })
	public storeId: string;

	// Stores the ID value used by this instance.
	@StringDataMember({ code: ParameterCode.Id, minLength: 10, maxLength: 11, mustNonNull: true })
	public id: string;

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	// Stores the log value used by this instance.
	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerPresentStoreItemOperationRequest extends PresentStoreItemOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminPresentStoreItemOperationRequest extends ServerPresentStoreItemOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class PresentStoreItemRequestHandler extends StoreItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.PresentStoreItem;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return PresentStoreItemOperationRequest;
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

		if (request.type != OwnerType.CharacterPlayer && request.type != OwnerType.GamePlayer && request.type != OwnerType.Group) {
			return this.newInvalidRequestParameters(request, "can not found the type parameter " + request.type);
		}

		// Tracks whether method is allowed.
		let allowMethod = false;

		if (secretInfo.getPermission().storeInventory.presentStoreItem.otherSelfEnable) {
			allowMethod = true;
		}
		else if (secretInfo.getPermission().storeInventory.presentStoreItem.selfEnable) {
			if (request.type == OwnerType.CharacterPlayer) {
				// Stores the game player value used in the current execution flow.
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

				if (gamePlayer != null) {
					if (gamePlayer.hasPlayerCharacter(request.id)) {
						allowMethod = true;
					}
				}
			}
			else if (request.type == OwnerType.GamePlayer) {
				if (request.id == authInfo.getUserId()) {
					allowMethod = true;
				}
			}
			else if (request.type == OwnerType.Group) {
				// Stores the game player value used in the current execution flow.
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

				if (gamePlayer != null) {
					// Stores the group item value used in the current execution flow.
					let groupItem = gamePlayer.getPlayerGroup(request.id);

					if (groupItem != null && groupItem.status == GroupStatus.Member) {
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerPresentStoreItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (request.type != OwnerType.CharacterPlayer && request.type != OwnerType.GamePlayer && request.type != OwnerType.Group) {
			return this.newInvalidRequestParameters(request, "can not found the type parameter " + request.type);
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminPresentStoreItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (request.type != OwnerType.CharacterPlayer && request.type != OwnerType.GamePlayer && request.type != OwnerType.Group) {
			return this.newInvalidRequestParameters(request, "can not found the type parameter " + request.type);
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { storeId: string, id: string, type: number, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_PresentStoreItem", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the store inventory value used in the current execution flow.
		let storeInventory = await this.gnServer.getDatabase().storeInventoryRepository.loadStoreInventoryAsync(request.storeId, secretInfo.getGameId(), null);

		if (storeInventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemNotFound);
			return operationResponse;
		}

		if (storeInventory.getRemoveStatus().tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemHadBeenRemove);
			return operationResponse;
		}

		if (storeInventory.getStoreItemType() == StoreItemType.NonConsumable) {
			// Stores the purchase count value used in the current execution flow.
			let purchaseCount = await this.gnServer.getDatabase().storeInventoryRepository.getCountStoreInventoryUsedAsync(request.storeId, secretInfo.getGameId(), request.id);

			if (purchaseCount != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemHadPurchaseAndNonConsumable);
				return operationResponse;
			}
		}

		// Stores the price currency start values value used in the current execution flow.
		let priceCurrencyStartValues: {
			// Stores the key value used by this contract.
			key: string,
			// Stores the value value used by this contract.
			value: number,
		}[] = [];

		// Stores the price currency amount values value used in the current execution flow.
		let priceCurrencyAmountValues: {
			// Stores the key value used by this contract.
			key: string,
			// Stores the value value used by this contract.
			value: number,
		}[] = [];

		// Stores the price currency final values value used in the current execution flow.
		let priceCurrencyFinalValues: {
			// Stores the key value used by this contract.
			key: string,
			// Stores the value value used by this contract.
			value: number,
		}[] = [];

		// Stores the store currency start values value used in the current execution flow.
		let storeCurrencyStartValues: {
			// Stores the key value used by this contract.
			key: string,
			// Stores the value value used by this contract.
			value: number,
		}[] = [];

		// Stores the store currency amount values value used in the current execution flow.
		let storeCurrencyAmountValues: {
			// Stores the key value used by this contract.
			key: string,
			// Stores the value value used by this contract.
			value: number,
		}[] = [];

		// Stores the store currency final values value used in the current execution flow.
		let storeCurrencyFinalValues: {
			// Stores the key value used by this contract.
			key: string,
			// Stores the value value used by this contract.
			value: number,
		}[] = [];

		// Stores the store item final values value used in the current execution flow.
		let storeItemFinalValues: {
			// Stores the catalog ID value used by this contract.
			catalogId: string,
			// Stores the class ID value used by this contract.
			classId: string,
			// Stores the item ID value used by this contract.
			itemId: string,
		}[] = [];

		// Stores the complete store currencies collection used in the current execution flow.
		let allStoreCurrencies = storeInventory.getAllStoreCurrencies();
		// Stores the complete store items collection used in the current execution flow.
		let allStoreItems = storeInventory.getAllStoreItems();

		if (request.type == OwnerType.CharacterPlayer) {
			// Stores the character player value used in the current execution flow.
			let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.id, secretInfo.getGameId(), {
				playerCurrencies: true,
				playerInventories: true,
			});

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.BuyerNotFound);
				return operationResponse;
			}

			// Stores the resolved character player settings instance for the current execution flow.
			let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());

			// Stores the GearN info response parameters value used in the current execution flow.
			let gnInfoResponseParameters = new GNHashtable();

			// Stores the GearN player currencies value used in the current execution flow.
			let gnPlayerCurrencies = new GNArray();
			// Stores the GearN player inventories value used in the current execution flow.
			let gnPlayerInventories = new GNArray();

			{
				for (let i = 0; i < allStoreItems.length; i++) {
					// Stores the store item value used in the current execution flow.
					let storeItem = allStoreItems[i];

					// Stores the player item catalog settings item value used in the current execution flow.
					let playerItemCatalogSettingsItem = characterPlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

					if (playerItemCatalogSettingsItem != null) {
						// Stores the item class settings item value used in the current execution flow.
						let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
						if (itemClassSettingsItem != null) {
							// Stores the inventory value used in the current execution flow.
							let inventory = await this.createItem(storeItem.catalogId, storeItem.classId, storeItem.amount, playerItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
							characterPlayer.setPlayerInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

							// Stores the GearN player inventory value used in the current execution flow.
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
					// Stores the store currency value used in the current execution flow.
					let storeCurrency = allStoreCurrencies[i];

					storeCurrencyAmountValues.push({
						key: storeCurrency.key,
						value: storeCurrency.value,
					});

					// Tracks whether set player currency should be used.
					let useSetPlayerCurrency = false;
					if (!characterPlayer.hasPlayerCurrency(storeCurrency.key)) {
						useSetPlayerCurrency = true;

						// Stores the player currencies settings item value used in the current execution flow.
						let playerCurrenciesSettingsItem = characterPlayerSettings.playerCurrenciesSettings.find(x => x.key == storeCurrency.key);
						if (playerCurrenciesSettingsItem != null) {
							characterPlayer.setPlayerCurrency(storeCurrency.key, playerCurrenciesSettingsItem.initialValue);
						}
						else {
							characterPlayer.setPlayerCurrency(storeCurrency.key, 0);
						}
					}

					// Stores the player currency value used in the current execution flow.
					let playerCurrency = characterPlayer.getPlayerCurrency(storeCurrency.key);

					storeCurrencyStartValues.push({
						key: storeCurrency.key,
						value: playerCurrency.value,
					});

					// Stores the old value value used in the current execution flow.
					let oldValue = playerCurrency.value;
					// Stores the server value value used in the current execution flow.
					let serverValue = playerCurrency.value + storeCurrency.value;

					if (useSetPlayerCurrency) {
						characterPlayer.setPlayerCurrency(storeCurrency.key, serverValue);
					}
					else {
						characterPlayer.changePlayerCurrency(storeCurrency.key, storeCurrency.value);
					}

					// Stores the GearN player currency value used in the current execution flow.
					let gnPlayerCurrency = new GNHashtable();

					gnPlayerCurrency.add(ParameterCode.Key, storeCurrency.key);
					gnPlayerCurrency.add(ParameterCode.Value, serverValue);

					storeCurrencyFinalValues.push({
						key: storeCurrency.key,
						value: serverValue,
					});

					gnPlayerCurrencies.add(gnPlayerCurrency);

					this.gnServer.getDatabase().insertCharacterPlayerCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "PresentStoreItem " + storeInventory.getStoreId() + ", log: " + request.log);
				}
			}

			characterPlayer.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnPlayerCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnPlayerInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}
		else if (request.type == OwnerType.GamePlayer) {
			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.id, secretInfo.getGameId(), {
				playerCurrencies: true,
				playerInventories: true,
			});

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.BuyerNotFound);
				return operationResponse;
			}

			// Stores the resolved game player settings instance for the current execution flow.
			let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());

			// Stores the GearN info response parameters value used in the current execution flow.
			let gnInfoResponseParameters = new GNHashtable();

			// Stores the GearN player currencies value used in the current execution flow.
			let gnPlayerCurrencies = new GNArray();
			// Stores the GearN player inventories value used in the current execution flow.
			let gnPlayerInventories = new GNArray();

			{
				for (let i = 0; i < allStoreItems.length; i++) {
					// Stores the store item value used in the current execution flow.
					let storeItem = allStoreItems[i];

					// Stores the player item catalog settings item value used in the current execution flow.
					let playerItemCatalogSettingsItem = gamePlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

					if (playerItemCatalogSettingsItem != null) {
						// Stores the item class settings item value used in the current execution flow.
						let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
						if (itemClassSettingsItem != null) {
							// Stores the inventory value used in the current execution flow.
							let inventory = await this.createItem(storeItem.catalogId, storeItem.classId, storeItem.amount, playerItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
							gamePlayer.setPlayerInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

							// Stores the GearN player inventory value used in the current execution flow.
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
					// Stores the store currency value used in the current execution flow.
					let storeCurrency = allStoreCurrencies[i];

					storeCurrencyAmountValues.push({
						key: storeCurrency.key,
						value: storeCurrency.value,
					});

					// Tracks whether set player currency should be used.
					let useSetPlayerCurrency = false;
					if (!gamePlayer.hasPlayerCurrency(storeCurrency.key)) {
						useSetPlayerCurrency = true;

						// Stores the player currencies settings item value used in the current execution flow.
						let playerCurrenciesSettingsItem = gamePlayerSettings.playerCurrenciesSettings.find(x => x.key == storeCurrency.key);
						if (playerCurrenciesSettingsItem != null) {
							gamePlayer.setPlayerCurrency(storeCurrency.key, playerCurrenciesSettingsItem.initialValue);
						}
						else {
							gamePlayer.setPlayerCurrency(storeCurrency.key, 0);
						}
					}

					// Stores the player currency value used in the current execution flow.
					let playerCurrency = gamePlayer.getPlayerCurrency(storeCurrency.key);

					storeCurrencyStartValues.push({
						key: storeCurrency.key,
						value: playerCurrency.value,
					});

					// Stores the old value value used in the current execution flow.
					let oldValue = playerCurrency.value;
					// Stores the server value value used in the current execution flow.
					let serverValue = playerCurrency.value + storeCurrency.value;

					if (useSetPlayerCurrency) {
						gamePlayer.setPlayerCurrency(storeCurrency.key, serverValue);
					}
					else {
						gamePlayer.changePlayerCurrency(storeCurrency.key, storeCurrency.value);
					}

					// Stores the GearN player currency value used in the current execution flow.
					let gnPlayerCurrency = new GNHashtable();

					gnPlayerCurrency.add(ParameterCode.Key, storeCurrency.key);
					gnPlayerCurrency.add(ParameterCode.Value, serverValue);

					storeCurrencyFinalValues.push({
						key: storeCurrency.key,
						value: serverValue,
					});

					gnPlayerCurrencies.add(gnPlayerCurrency);

					this.gnServer.getDatabase().insertGamePlayerCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "PresentStoreItem " + storeInventory.getStoreId() + ", log: " + request.log);
				}
			}

			gamePlayer.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnPlayerCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnPlayerInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}
		else if (request.type == OwnerType.Group) {
			// Stores the group value used in the current execution flow.
			let group = await this.gnServer.getDatabase().loadGroupAsync(request.id, secretInfo.getGameId(), {
				groupCurrencies: true,
				groupInventories: true,
			});

			if (group == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.BuyerNotFound);
				return operationResponse;
			}

			// Stores the resolved group settings instance for the current execution flow.
			let groupSettings = this.gnServer.getGNSettings().getGroupSettings(secretInfo.getGameId());

			// Stores the GearN info response parameters value used in the current execution flow.
			let gnInfoResponseParameters = new GNHashtable();

			// Stores the GearN currencies value used in the current execution flow.
			let gnCurrencies = new GNArray();
			// Stores the GearN inventories value used in the current execution flow.
			let gnInventories = new GNArray();

			{
				for (let i = 0; i < allStoreItems.length; i++) {
					// Stores the store item value used in the current execution flow.
					let storeItem = allStoreItems[i];

					// Stores the group item catalog settings item value used in the current execution flow.
					let groupItemCatalogSettingsItem = groupSettings.groupItemCatalogSettings.find(x => x.catalogId == storeItem.catalogId);

					if (groupItemCatalogSettingsItem != null) {
						// Stores the item class settings item value used in the current execution flow.
						let itemClassSettingsItem = groupItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == storeItem.classId);
						if (itemClassSettingsItem != null) {
							// Stores the inventory value used in the current execution flow.
							let inventory = await this.createItem(storeItem.catalogId, storeItem.classId, storeItem.amount, groupItemCatalogSettingsItem.itemType, request.id, request.type, secretInfo.getGameId());
							group.setGroupInventory(inventory.getItemId(), storeItem.catalogId, storeItem.classId);

							// Stores the GearN group inventory value used in the current execution flow.
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
					// Stores the store currency value used in the current execution flow.
					let storeCurrency = allStoreCurrencies[i];

					storeCurrencyAmountValues.push({
						key: storeCurrency.key,
						value: storeCurrency.value,
					});

					// Tracks whether set group currency should be used.
					let useSetGroupCurrency = false;
					if (!group.hasGroupCurrency(storeCurrency.key)) {
						useSetGroupCurrency = true;

						// Stores the group currencies settings item value used in the current execution flow.
						let groupCurrenciesSettingsItem = groupSettings.groupCurrenciesSettings.find(x => x.key == storeCurrency.key);
						if (groupCurrenciesSettingsItem != null) {
							group.setGroupCurrency(storeCurrency.key, groupCurrenciesSettingsItem.initialValue);
						}
						else {
							group.setGroupCurrency(storeCurrency.key, 0);
						}
					}

					// Stores the group currency value used in the current execution flow.
					let groupCurrency = group.getGroupCurrency(storeCurrency.key);

					storeCurrencyStartValues.push({
						key: storeCurrency.key,
						value: groupCurrency.value,
					});

					// Stores the old value value used in the current execution flow.
					let oldValue = groupCurrency.value;
					// Stores the server value value used in the current execution flow.
					let serverValue = groupCurrency.value + storeCurrency.value;

					if (useSetGroupCurrency) {
						group.setGroupCurrency(storeCurrency.key, serverValue);
					}
					else {
						group.changeGroupCurrency(storeCurrency.key, storeCurrency.value);
					}

					// Stores the GearN player currency value used in the current execution flow.
					let gnPlayerCurrency = new GNHashtable();

					gnPlayerCurrency.add(ParameterCode.Key, storeCurrency.key);
					gnPlayerCurrency.add(ParameterCode.Value, serverValue);

					storeCurrencyFinalValues.push({
						key: storeCurrency.key,
						value: serverValue,
					});

					gnCurrencies.add(gnPlayerCurrency);
					this.gnServer.getDatabase().insertGroupCurrencyLogAsync(request.id, secretInfo.getGameId(), storeCurrency.key, storeCurrency.value, oldValue, serverValue, "PresentStoreItem " + storeInventory.getStoreId() + ", log: " + request.log);
				}
			}

			group.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}

		this.gnServer.getDatabase().storeInventoryRepository.insertStoreInventoryLogAsync(request.storeId, secretInfo.getGameId(), request.id, request.type, priceCurrencyStartValues, priceCurrencyAmountValues, priceCurrencyFinalValues, storeCurrencyStartValues, storeCurrencyAmountValues, storeCurrencyFinalValues, storeItemFinalValues, null, StoreReceiveType.Present, request.log);

		if (storeInventory.getStoreItemType() == StoreItemType.NonConsumable) this.gnServer.getDatabase().storeInventoryRepository.insertStoreInventoryUsedAsync(request.storeId, secretInfo.getGameId(), request.id, request.type);

		operationResponse.setParameter(ParameterCode.StoreCurrencies, this.generateStoreCurrencies(storeInventory));
		operationResponse.setParameter(ParameterCode.StoreItems, this.generateStoreItems(storeInventory));
		operationResponse.setParameter(ParameterCode.PriceCurrencies, this.generatePriceCurrencies(storeInventory));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_PresentStoreItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
