import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { Group } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { Inventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { StoreInventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";

class DeleteInDatabaseOperationRequest extends OperationRequest {

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	// Stores the ID value used by this instance.
	@StringDataMember({ code: ParameterCode.Id, minLength: 2, maxLength: 32 })
	public id: string;

	// Stores the game ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

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

export class DeleteInDatabaseRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.DeleteInDatabase;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return DeleteInDatabaseOperationRequest;
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

		if (!secretInfo.getPermission().masterAdmin.deleteInDatabase.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			id: request.id,
			type: request.type,
			gameId: request.gameId,
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
	private async execute(request: { id: string, type: number, gameId: string, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_DeleteInDatabase", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		if (request.type == OwnerType.MasterPlayer) {
			// Xoa toan bo du lieu nguoi choi, gom data co trong game data
			let masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerAsync(request.id);

			if (masterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			// Stores the result value used in the current execution flow.
			let result = {
				type: "MasterPlayer",
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: await this.deleteMasterPlayer(masterPlayer),
			}

			this.gnServer.getDatabase().systemCollection("MasterPlayer").deleteOne({ userId: masterPlayer.getUserId() });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
		}
		else if (request.type == OwnerType.GamePlayer) {
			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.id, request.gameId);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			// Stores the result value used in the current execution flow.
			let result = {
				type: "GamePlayer",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: await this.deleteGamePlayer(gamePlayer, request.gameId),
			}

			this.gnServer.getDatabase().systemGameCollection("GamePlayer", request.gameId).deleteOne({ userId: gamePlayer.getUserId() });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
		}
		else if (request.type == OwnerType.CharacterPlayer) {
			// Stores the character player value used in the current execution flow.
			let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.id, request.gameId);

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			// Stores the result value used in the current execution flow.
			let result = {
				type: "CharacterPlayer",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: await this.deleteCharacterPlayer(characterPlayer, request.gameId),
			}

			this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", request.gameId).deleteOne({ characterId: characterPlayer.getCharacterId() });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);

			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(characterPlayer.getOwner().id, request.gameId);
			if (gamePlayer != null) {
				if (gamePlayer.hasPlayerCharacter(characterPlayer.getCharacterId())) {
					gamePlayer.removePlayerCharacter(characterPlayer.getCharacterId());
					gamePlayer.saveAsync();
				}
			}
		}
		else if (request.type == OwnerType.Inventory) {
			// Stores the inventory value used in the current execution flow.
			let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(request.id, request.gameId);

			if (inventory == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			// Stores the result value used in the current execution flow.
			let result = {
				type: "Inventory",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: await this.deleteInventory(inventory, request.gameId),
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", request.gameId).deleteOne({ itemId: inventory.getItemId() });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);

			// Stores the owner value used in the current execution flow.
			let owner = inventory.getOwner();
			if (owner.type == OwnerType.GamePlayer) {
				// Stores the game player value used in the current execution flow.
				let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(inventory.getOwner().id, request.gameId);
				if (gamePlayer != null) {
					if (gamePlayer.hasPlayerInventory(inventory.getItemId())) {
						gamePlayer.removePlayerInventory(inventory.getItemId());
						gamePlayer.saveAsync();
					}
				}
			}
			else if (owner.type == OwnerType.CharacterPlayer) {
				// Stores the character player value used in the current execution flow.
				let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(inventory.getOwner().id, request.gameId);
				if (characterPlayer != null) {
					if (characterPlayer.hasPlayerInventory(inventory.getItemId())) {
						characterPlayer.removePlayerInventory(inventory.getItemId());
						characterPlayer.saveAsync();
					}
				}
			}
			else if (owner.type == OwnerType.Group) {
				// Stores the group value used in the current execution flow.
				let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(inventory.getOwner().id, request.gameId);
				if (group != null) {
					if (group.hasGroupInventory(inventory.getItemId())) {
						group.removeGroupInventory(inventory.getItemId());
						group.saveAsync();
					}
				}
			}
		}
		else if (request.type == OwnerType.Group) {
			// Stores the group value used in the current execution flow.
			let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(request.id, request.gameId);

			if (group == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			// Stores the group ID value used in the current execution flow.
			let groupId = group.getGroupId();

			// Stores the objs value used in the current execution flow.
			let objs = await this.deleteGroup(group, request.gameId);

			// Stores the complete members collection used in the current execution flow.
			let allMembers = group.getAllMembers();
			for (let i = 0; i < allMembers.length; i++) {
				// Stores the member value used in the current execution flow.
				let member = allMembers[i];
				// Stores the member ID value used in the current execution flow.
				let memberId = member.memberId;

				if (memberId.length == 11) {
					// Stores the character player value used in the current execution flow.
					let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(memberId, request.gameId);
					if (characterPlayer != null) {
						if (characterPlayer.hasPlayerGroup(groupId)) {
							characterPlayer.removePlayerGroup(groupId);
							characterPlayer.saveAsync();
						}
					}
				}
				else if (memberId.length == 10) {
					// Stores the game player value used in the current execution flow.
					let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(memberId, request.gameId);
					if (gamePlayer != null) {
						if (gamePlayer.hasPlayerGroup(groupId)) {
							gamePlayer.removePlayerGroup(groupId);
							gamePlayer.saveAsync();
						}
					}
				}
			}

			// Stores the result value used in the current execution flow.
			let result = {
				type: "Group",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: objs,
			}

			this.gnServer.getDatabase().systemGameCollection("Group", request.gameId).deleteOne({ groupId: groupId });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
		}
		else if (request.type == OwnerType.StoreInventory) {
			// Stores the store inventory value used in the current execution flow.
			let storeInventory = await this.gnServer.getDatabase().storeInventoryRepository.loadStoreInventoryAsync(request.id, request.gameId);

			if (storeInventory == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			// Stores the store ID value used in the current execution flow.
			let storeId = storeInventory.getStoreId();

			// Stores the objs value used in the current execution flow.
			let objs = await this.deleteStoreInventory(storeInventory, request.gameId);

			// Stores the result value used in the current execution flow.
			let result = {
				type: "StoreInventory",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: objs,
			}

			this.gnServer.getDatabase().systemGameCollection("StoreInventory", request.gameId).deleteOne({ storeId: storeId });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
		}
		else {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_DeleteInDatabase", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}

	/**
	 * Deletes the master player.
	 * @param masterPlayer Provides the master player value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteMasterPlayer(masterPlayer: MasterPlayer): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "MasterPlayer",
			obj: masterPlayer.getOriginResult()
		});

		// Stores the game IDs value used in the current execution flow.
		let gameIds = this.gnServer.getGameIds();

		// Tracks whether r ID should be used.
		let userId = masterPlayer.getUserId();

		for (let i = 0; i < gameIds.length; i++) {
			// Stores the game ID value used in the current execution flow.
			let gameId = gameIds[i];

			// Stores the game player value used in the current execution flow.
			let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(userId, gameId);
			if (gamePlayer != null) {
				// Stores the results value used in the current execution flow.
				let results = await this.deleteGamePlayer(gamePlayer, gameId);

				answer.push({
					type: "GamePlayer",
					gameId: gameId,
					objs: results
				});

				this.gnServer.getDatabase().systemGameCollection("GamePlayer", gameId).deleteOne({ userId: userId });
			}
		}

		{
			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.CurrencyLog");
			// Stores the results value used in the current execution flow.
			let results = await currencyLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "MasterPlayer.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ userId: userId });
		}

		{
			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.StatisticsLog");
			// Stores the results value used in the current execution flow.
			let results = await statisticsLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "MasterPlayer.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ userId: userId });
		}

		{
			// Stores the backup statistics collection value used in the current execution flow.
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");
			// Stores the results value used in the current execution flow.
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the backup results value used in the current execution flow.
				let backupResults = result.results as { userId: string, position: number, }[];

				// Stores the backup result value used in the current execution flow.
				let backupResult = backupResults.find(x => x.userId == userId);
				if (backupResult != null) {
					backupResults.splice(backupResult.position, 1);

					for (let i = backupResult.position; i < backupResults.length; i++) {
						backupResults[i].position -= 1;
					}

					backupStatisticsCollection.updateOne({ _id: result._id }, { $set: { results: backupResults } });

					answer.push({
						type: "MasterPlayer.StatisticsBackup",
						obj: {
							key: result.key,
							version: result.version,
							result: backupResult
						},
					});
				}
			}
		}

		return answer;
	}

	/**
	 * Deletes the game player.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteGamePlayer(gamePlayer: GamePlayer, gameId: string): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "GamePlayer",
			obj: gamePlayer.getOriginResult()
		});

		// Tracks whether r ID should be used.
		let userId = gamePlayer.getUserId();

		{
			// Stores the player characters value used in the current execution flow.
			let playerCharacters = gamePlayer.getAllPlayerCharacters();

			for (let i = 0; i < playerCharacters.length; i++) {
				// Stores the player character value used in the current execution flow.
				let playerCharacter = playerCharacters[i];

				// Stores the character player value used in the current execution flow.
				let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(playerCharacter.characterId, gameId);

				if (characterPlayer != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteCharacterPlayer(characterPlayer, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId).deleteMany({ "owner.id": userId });
		}

		{
			// Stores the player friends value used in the current execution flow.
			let playerFriends = gamePlayer.getAllPlayerFriends();

			for (let i = 0; i < playerFriends.length; i++) {
				// Stores the player friend value used in the current execution flow.
				let playerFriend = playerFriends[i];

				// Stores the friend player value used in the current execution flow.
				let friendPlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(playerFriend.friendId, gameId);
				if (friendPlayer != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteFriendPlayerInGamePlayer(gamePlayer, gameId, friendPlayer);
					answer.push(...results);

					friendPlayer.saveAsync();
				}
			}
		}

		{
			// Stores the group message collection value used in the current execution flow.
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);

			// Stores the results value used in the current execution flow.
			let results = await groupMessageCollection.find({ senderId: userId });
			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "Group.Message",
					obj: result,
				});
			}

			await groupMessageCollection.deleteMany({ senderId: userId });

			// Stores the player groups value used in the current execution flow.
			let playerGroups = gamePlayer.getAllPlayerGroups();

			for (let i = 0; i < playerGroups.length; i++) {
				// Stores the player group value used in the current execution flow.
				let playerGroup = playerGroups[i];

				// Stores the group value used in the current execution flow.
				let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(playerGroup.groupId, gameId);

				if (group != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteGroupInGamePlayer(gamePlayer, gameId, group);
					answer.push(...results);

					group.saveAsync();
				}
			}
		}

		{
			// Stores the player inventories value used in the current execution flow.
			let playerInventories = gamePlayer.getAllPlayerInventories();

			for (let i = 0; i < playerInventories.length; i++) {
				// Stores the player inventory value used in the current execution flow.
				let playerInventory = playerInventories[i];

				// Stores the inventory value used in the current execution flow.
				let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(playerInventory.itemId, gameId);

				if (inventory != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteInventory(inventory, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": userId });
		}

		{
			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await currencyLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "GamePlayer.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ userId: userId });
		}

		{
			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await statisticsLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "GamePlayer.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ userId: userId });
		}

		{
			// Stores the backup statistics collection value used in the current execution flow.
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the backup results value used in the current execution flow.
				let backupResults = result.results as { userId: string, position: number, }[];

				// Stores the backup result value used in the current execution flow.
				let backupResult = backupResults.find(x => x.userId == userId);
				if (backupResult != null) {
					backupResults.splice(backupResult.position, 1);

					for (let i = backupResult.position; i < backupResults.length; i++) {
						backupResults[i].position -= 1;
					}

					backupStatisticsCollection.updateOne({ _id: result._id }, { $set: { results: backupResults } });

					answer.push({
						type: "GamePlayer.StatisticsBackup",
						obj: {
							key: result.key,
							version: result.version,
							result: backupResult
						},
					});
				}
			}
		}

		{
			// Stores the backup store log collection value used in the current execution flow.
			let backupStoreLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStoreLogCollection.find({ id: userId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "StoreInventory.StoreLog",
					obj: result,
				});
			}

			backupStoreLogCollection.deleteMany({ id: userId });
		}

		return answer;
	}

	/**
	 * Deletes the character player.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "CharacterPlayer",
			obj: characterPlayer.getOriginResult()
		});

		// Stores the character ID value used in the current execution flow.
		let characterId = characterPlayer.getCharacterId();

		{
			// Stores the player friends value used in the current execution flow.
			let playerFriends = characterPlayer.getAllPlayerFriends();

			for (let i = 0; i < playerFriends.length; i++) {
				// Stores the player friend value used in the current execution flow.
				let playerFriend = playerFriends[i];

				// Stores the friend player value used in the current execution flow.
				let friendPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(playerFriend.friendId, gameId);
				if (friendPlayer != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteFriendPlayerInCharacterPlayer(characterPlayer, gameId, friendPlayer);
					answer.push(...results);

					friendPlayer.saveAsync();
				}
			}
		}

		{
			// Stores the group message collection value used in the current execution flow.
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);

			// Stores the results value used in the current execution flow.
			let results = await groupMessageCollection.find({ senderId: characterId });
			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "Group.Message",
					obj: result,
				});
			}

			await groupMessageCollection.deleteMany({ senderId: characterId });

			// Stores the player groups value used in the current execution flow.
			let playerGroups = characterPlayer.getAllPlayerGroups();

			for (let i = 0; i < playerGroups.length; i++) {
				// Stores the player group value used in the current execution flow.
				let playerGroup = playerGroups[i];

				// Stores the group value used in the current execution flow.
				let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(playerGroup.groupId, gameId);

				if (group != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteGroupInCharacterPlayer(characterPlayer, gameId, group);
					answer.push(...results);

					group.saveAsync();
				}
			}
		}

		{
			// Stores the player inventories value used in the current execution flow.
			let playerInventories = characterPlayer.getAllPlayerInventories();

			for (let i = 0; i < playerInventories.length; i++) {
				// Stores the player inventory value used in the current execution flow.
				let playerInventory = playerInventories[i];

				// Stores the inventory value used in the current execution flow.
				let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(playerInventory.itemId, gameId);

				if (inventory != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteInventory(inventory, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": characterId });
		}

		{
			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await currencyLogCollection.find({ characterId: characterId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "CharacterPlayer.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ characterId: characterId });
		}

		{
			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await statisticsLogCollection.find({ characterId: characterId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "CharacterPlayer.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ characterId: characterId });
		}

		{
			// Stores the backup statistics collection value used in the current execution flow.
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the backup results value used in the current execution flow.
				let backupResults = result.results as { characterId: string, position: number, }[];

				// Stores the backup result value used in the current execution flow.
				let backupResult = backupResults.find(x => x.characterId == characterId);
				if (backupResult != null) {
					backupResults.splice(backupResult.position, 1);

					for (let i = backupResult.position; i < backupResults.length; i++) {
						backupResults[i].position -= 1;
					}

					backupStatisticsCollection.updateOne({ _id: result._id }, { $set: { results: backupResults } });

					answer.push({
						type: "CharacterPlayer.StatisticsBackup",
						obj: {
							key: result.key,
							version: result.version,
							result: backupResult
						},
					});
				}
			}
		}

		{
			// Stores the backup store log collection value used in the current execution flow.
			let backupStoreLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStoreLogCollection.find({ id: characterId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "StoreInventory.StoreLog",
					obj: result,
				});
			}

			backupStoreLogCollection.deleteMany({ id: characterId });
		}

		return answer;
	}

	/**
	 * Deletes the inventory.
	 * @param inventory Provides the inventory value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteInventory(inventory: Inventory, gameId: string): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "Inventory",
			obj: inventory.getOriginResult()
		});

		// Stores the item ID value used in the current execution flow.
		let itemId = inventory.getItemId();

		{
			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await statisticsLogCollection.find({ itemId: itemId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "Inventory.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ itemId: itemId });
		}

		{
			// Stores the backup statistics collection value used in the current execution flow.
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the backup results value used in the current execution flow.
				let backupResults = result.results as { itemId: string, position: number, }[];

				// Stores the backup result value used in the current execution flow.
				let backupResult = backupResults.find(x => x.itemId == itemId);
				if (backupResult != null) {
					backupResults.splice(backupResult.position, 1);

					for (let i = backupResult.position; i < backupResults.length; i++) {
						backupResults[i].position -= 1;
					}

					backupStatisticsCollection.updateOne({ _id: result._id }, { $set: { results: backupResults } });

					answer.push({
						type: "Inventory.StatisticsBackup",
						obj: {
							key: result.key,
							version: result.version,
							result: backupResult
						},
					});
				}
			}
		}

		return answer;
	}

	/**
	 * Deletes the group.
	 * @param group Provides the group value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteGroup(group: Group, gameId: string): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "Group",
			obj: group.getOriginResult()
		});

		// Stores the group ID value used in the current execution flow.
		let groupId = group.getGroupId();

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(gameId);

		{
			// Stores the group message collection value used in the current execution flow.
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);

			// Stores the results value used in the current execution flow.
			let results = await groupMessageCollection.find({ groupId: groupId });
			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "Group.Message",
					obj: result,
				});
			}

			await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).deleteMany({ groupId: groupId });
			cacheData.removeData("GroupMessages_" + groupId);
		}

		{
			// Stores the group inventories value used in the current execution flow.
			let groupInventories = group.getAllGroupInventories();

			for (let i = 0; i < groupInventories.length; i++) {
				// Stores the group inventory value used in the current execution flow.
				let groupInventory = groupInventories[i];

				// Stores the inventory value used in the current execution flow.
				let inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(groupInventory.itemId, gameId);

				if (inventory != null) {
					// Stores the results value used in the current execution flow.
					let results = await this.deleteInventory(inventory, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": groupId });
		}

		{
			// Stores the currency log collection value used in the current execution flow.
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await currencyLogCollection.find({ groupId: groupId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "Group.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ groupId: groupId });
		}

		{
			// Stores the statistics log collection value used in the current execution flow.
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await statisticsLogCollection.find({ groupId: groupId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "Group.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ groupId: groupId });
		}

		{
			// Stores the backup statistics collection value used in the current execution flow.
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				// Stores the backup results value used in the current execution flow.
				let backupResults = result.results as { groupId: string, position: number, }[];

				// Stores the backup result value used in the current execution flow.
				let backupResult = backupResults.find(x => x.groupId == groupId);
				if (backupResult != null) {
					backupResults.splice(backupResult.position, 1);

					for (let i = backupResult.position; i < backupResults.length; i++) {
						backupResults[i].position -= 1;
					}

					backupStatisticsCollection.updateOne({ _id: result._id }, { $set: { results: backupResults } });

					answer.push({
						type: "Group.StatisticsBackup",
						obj: {
							key: result.key,
							version: result.version,
							result: backupResult
						},
					});
				}
			}
		}

		{
			// Stores the backup store log collection value used in the current execution flow.
			let backupStoreLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			// Stores the results value used in the current execution flow.
			let results = await backupStoreLogCollection.find({ id: groupId });

			while (await results.hasNext()) {
				// Stores the result value used in the current execution flow.
				let result = await results.next();

				answer.push({
					type: "StoreInventory.StoreLog",
					obj: result,
				});
			}

			backupStoreLogCollection.deleteMany({ id: groupId });
		}

		return answer;
	}

	/**
	 * Deletes the friend player in game player.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param friendPlayer Provides the friend player value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteFriendPlayerInGamePlayer(gamePlayer: GamePlayer, gameId: string, friendPlayer: GamePlayer): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		// Tracks whether r ID should be used.
		let userId = gamePlayer.getUserId();

		if (friendPlayer.hasPlayerFriend(userId)) {
			friendPlayer.removePlayerGroup(userId);
		}

		return answer;
	}

	/**
	 * Deletes the friend player in character player.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param friendPlayer Provides the friend player value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteFriendPlayerInCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string, friendPlayer: CharacterPlayer): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		// Stores the character ID value used in the current execution flow.
		let characterId = characterPlayer.getCharacterId();

		if (friendPlayer.hasPlayerFriend(characterId)) {
			friendPlayer.removePlayerGroup(characterId);
		}

		return answer;
	}

	/**
	 * Deletes the group in game player.
	 * @param gamePlayer Provides the game player value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param group Provides the group value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteGroupInGamePlayer(gamePlayer: GamePlayer, gameId: string, group: Group): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		// Tracks whether r ID should be used.
		let userId = gamePlayer.getUserId();

		if (group.hasMember(userId)) {
			group.removeMember(userId);
		}

		// Stores the group ID value used in the current execution flow.
		let groupId = group.getGroupId();

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(gameId);
		cacheData.removeData("GroupMessages_" + groupId);

		return answer;
	}

	/**
	 * Deletes the group in character player.
	 * @param characterPlayer Provides the character player value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param group Provides the group value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteGroupInCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string, group: Group): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		// Stores the character ID value used in the current execution flow.
		let characterId = characterPlayer.getCharacterId();

		if (group.hasMember(characterId)) {
			group.removeMember(characterId);
		}

		// Stores the group ID value used in the current execution flow.
		let groupId = group.getGroupId();

		// Stores the cache data value used in the current execution flow.
		let cacheData = this.gnServer.getCacheService(gameId);
		cacheData.removeData("GroupMessages_" + groupId);

		return answer;
	}

	/**
	 * Deletes the store inventory.
	 * @param storeInventory Provides the store inventory value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async deleteStoreInventory(storeInventory: StoreInventory, gameId: string): Promise<Array<{ [key: string]: any }>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "StoreInventory",
			obj: storeInventory.getOriginResult()
		});

		return answer;
	}

}
