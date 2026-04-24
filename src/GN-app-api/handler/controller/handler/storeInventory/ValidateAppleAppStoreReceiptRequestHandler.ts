import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { StoreItemBaseRequestHandler } from "./StoreItemBaseRequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { Md5Generate } from "./../../../../../GN-common/helper/Md5Generate";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { StoreReceiveType } from "./../../../../../GN-common/constant/enumType/StoreReceiveType";
import { StoreItemType } from "./../../../../../GN-common/constant/enumType/StoreItemType";

class ValidateAppleAppStoreReceiptOperationRequest extends OperationRequest {

	// Stores the receipt value used by this instance.
	@StringDataMember({ code: ParameterCode.Receipt, minLength: 10, maxLength: 2048, mustNonNull: true })
	public receipt: string;

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

class ServerValidateAppleAppStoreReceiptOperationRequest extends ValidateAppleAppStoreReceiptOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminValidateAppleAppStoreReceiptOperationRequest extends ServerValidateAppleAppStoreReceiptOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ValidateAppleAppStoreReceiptRequestHandler extends StoreItemBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.ValidateAppleAppStoreReceipt;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return ValidateAppleAppStoreReceiptOperationRequest;
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

		if (secretInfo.getPermission().storeInventory.validateAppleAppStoreReceipt.otherSelfEnable) {
			allowMethod = true;
		}
		else if (secretInfo.getPermission().storeInventory.validateAppleAppStoreReceipt.selfEnable) {
			if (request.type == OwnerType.CharacterPlayer) {
				// Stores the game player value used in the current execution flow.
				let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

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
				let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

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
			receipt: request.receipt,
			id: request.id,
			type: request.type,
			log: request.log,
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerValidateAppleAppStoreReceiptOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (request.type != OwnerType.CharacterPlayer && request.type != OwnerType.GamePlayer && request.type != OwnerType.Group) {
			return this.newInvalidRequestParameters(request, "can not found the type parameter " + request.type);
		}

		if (!secretInfo.getPermission().storeInventory.validateAppleAppStoreReceipt.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			receipt: request.receipt,
			id: request.id,
			type: request.type,
			log: request.log,
		}, SecretRole.Server, secretInfo, operationRequest);
	}

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminValidateAppleAppStoreReceiptOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (request.type != OwnerType.CharacterPlayer && request.type != OwnerType.GamePlayer && request.type != OwnerType.Group) {
			return this.newInvalidRequestParameters(request, "can not found the type parameter " + request.type);
		}

		if (!secretInfo.getPermission().storeInventory.validateAppleAppStoreReceipt.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			receipt: request.receipt,
			id: request.id,
			type: request.type,
			log: request.log,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { receipt: string, id: string, type: number, log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("storeInventory_ValidateAppleAppStoreReceipt", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the product ID value used in the current execution flow.
		let productId: string;
		// Stores the payload value used in the current execution flow.
		let payload: string;
		// Stores the transaction ID value used in the current execution flow.
		let transactionId: string;

		try {
			// Stores the receipt JSON value used in the current execution flow.
			let receiptJson = JSON.parse(request.receipt);

			// Stores the store value used in the current execution flow.
			let store = receiptJson["Store"];
			if (store != "AppleAppStore") {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreInvalid);
				return operationResponse;
			}

			payload = receiptJson["Payload"];

			// Stores the receipt result value used in the current execution flow.
			let receiptResult = await this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", secretInfo.getGameId()).findOne({
				payloadMd5: Md5Generate.getMd5(payload)
			});

			if (receiptResult != null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ReceiptInvalid);
				return operationResponse;
			}

			transactionId = receiptJson["TransactionID"];

			// Stores the transaction result value used in the current execution flow.
			let transactionResult = await this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", secretInfo.getGameId()).findOne({
				transactionId: transactionId
			});

			if (transactionResult != null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ReceiptInvalid);
				return operationResponse;
			}

			// Stores the receipt status value used in the current execution flow.
			let receiptStatus = await this.gnServer.getAppleService().validateReceipt(payload, transactionId);
			if (!receiptStatus.success) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ReceiptInvalid);
				return operationResponse;
			}

			productId = receiptStatus.productId;
		}
		catch (err) {
			Debug.logException(err);

			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ExceptionWhenValidateReceipt);
			return operationResponse;
		}

		// Stores the store inventory value used in the current execution flow.
		let storeInventory = await this.gnServer.getDatabase().storeInventoryRepository.loadStoreInventoryByAppleAppStoreAsync(productId, secretInfo.getGameId(), null);

		if (storeInventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemNotFound);
			return operationResponse;
		}

		if (storeInventory.getRemoveStatus().tsRemove != 0) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemRemoved);
			return operationResponse;
		}

		if (storeInventory.getStoreItemType() == StoreItemType.NonConsumable) {
			// Stores the purchase count value used in the current execution flow.
			let purchaseCount = await this.gnServer.getDatabase().storeInventoryRepository.getCountStoreInventoryUsedAsync(storeInventory.getStoreId(), secretInfo.getGameId(), request.id);

			if (purchaseCount != 0) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.StoreItemPurchasedAndNonConsumable);
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

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		if (request.type == OwnerType.CharacterPlayer) {
			// Stores the character player value used in the current execution flow.
			let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.id, secretInfo.getGameId(), {
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

			let logs: { characterId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

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

					logs.push({
						characterId: request.id,
						key: storeCurrency.key,
						amount: storeCurrency.value,
						startValue: oldValue,
						finalValue: serverValue,
						tsCreate: currentMilliseconds,
						log: "ValidateAppleAppStore " + storeInventory.getStoreId() + ", log: " + request.log,
					});
				}
			}

			this.gnServer.getDatabase().characterPlayerRepository.insertCharacterPlayerCurrencyLogsAsync(logs, secretInfo.getGameId());

			characterPlayer.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnPlayerCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnPlayerInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}
		else if (request.type == OwnerType.GamePlayer) {
			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.id, secretInfo.getGameId(), {
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

			let logs: { userId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

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

					logs.push({
						userId: request.id,
						key: storeCurrency.key,
						amount: storeCurrency.value,
						startValue: oldValue,
						finalValue: serverValue,
						tsCreate: currentMilliseconds,
						log: "ValidateAppleAppStore " + storeInventory.getStoreId() + ", log: " + request.log
					});
				}
			}


			this.gnServer.getDatabase().gamePlayerRepository.insertGamePlayerCurrencyLogsAsync(logs, secretInfo.getGameId());

			gamePlayer.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnPlayerCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnPlayerInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}
		else if (request.type == OwnerType.Group) {
			// Stores the group value used in the current execution flow.
			let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.id, secretInfo.getGameId(), {
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

			let logs: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[] = [];

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

					logs.push({
						groupId: request.id,
						key: storeCurrency.key,
						amount: storeCurrency.value,
						startValue: oldValue,
						finalValue: serverValue,
						tsCreate: currentMilliseconds,
						log: "ValidateAppleAppStore " + storeInventory.getStoreId() + ", log: " + request.log
					});

					gnCurrencies.add(gnPlayerCurrency);
				}
			}

			this.gnServer.getDatabase().groupRepository.insertGroupCurrencyLogsAsync(logs, secretInfo.getGameId());

			group.saveAsync();

			gnInfoResponseParameters.add(ParameterCode.Currencies, gnCurrencies);
			gnInfoResponseParameters.add(ParameterCode.Inventories, gnInventories);

			operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);
		}

		this.gnServer.getDatabase().systemGameCollection("ReceiptIAP", secretInfo.getGameId()).insertOne({
			payloadMd5: Md5Generate.getMd5(payload),
			transactionId: transactionId,
			payload: payload,
			buyer: {
				id: request.id,
				type: request.type
			},
			tsCreate: currentMilliseconds,
			productId: productId,
			store: "AppleAppStore",
		});

		this.gnServer.getDatabase().storeInventoryRepository.insertStoreInventoryLogAsync(storeInventory.getStoreId(), secretInfo.getGameId(), request.id, request.type, priceCurrencyStartValues, priceCurrencyAmountValues, priceCurrencyFinalValues, storeCurrencyStartValues, storeCurrencyAmountValues, storeCurrencyFinalValues, storeItemFinalValues, transactionId, StoreReceiveType.AppleAppStore, request.log);

		if (storeInventory.getStoreItemType() == StoreItemType.NonConsumable) this.gnServer.getDatabase().storeInventoryRepository.insertStoreInventoryUsedAsync(storeInventory.getStoreId(), secretInfo.getGameId(), request.id, request.type);

		// Stores the in app purchase value used in the current execution flow.
		let inAppPurchase = storeInventory.getInAppPurchase();
		if (inAppPurchase.analyticsPrice) {
			this.gnServer.getDatabase().systemCollection("StoreAnalytics").insertOne({
				tsCreate: currentMilliseconds,
				price: inAppPurchase.analyticsPrice,
				storeId: storeInventory.getStoreId(),
			});
		}

		operationResponse.setParameter(ParameterCode.StoreCurrencies, this.generateStoreCurrencies(storeInventory));
		operationResponse.setParameter(ParameterCode.StoreItems, this.generateStoreItems(storeInventory));
		operationResponse.setParameter(ParameterCode.PriceCurrencies, this.generatePriceCurrencies(storeInventory));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("storeInventory_ValidateAppleAppStoreReceipt", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
