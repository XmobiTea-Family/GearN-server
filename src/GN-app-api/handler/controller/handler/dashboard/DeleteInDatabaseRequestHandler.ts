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

	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	@StringDataMember({ code: ParameterCode.Id, minLength: 2, maxLength: 32 })
	public id: string;

	@StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
	public gameId: string;

	@StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
	public log?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class DeleteInDatabaseRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.DeleteInDatabase;
	}

	public override getCommonOperationRequest() {
		return DeleteInDatabaseOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
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

	private async execute(request: { id: string, type: number, gameId: string, log: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_DeleteInDatabase", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		if (request.type == OwnerType.MasterPlayer) {
			// Xoa toan bo du lieu nguoi choi, gom data co trong game data
			let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(request.id);

			if (masterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

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
			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.id, request.gameId);

			if (gamePlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

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
			let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.id, request.gameId);

			if (characterPlayer == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			let result = {
				type: "CharacterPlayer",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: await this.deleteCharacterPlayer(characterPlayer, request.gameId),
			}

			this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", request.gameId).deleteOne({ characterId: characterPlayer.getCharacterId() });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);

			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(characterPlayer.getOwner().id, request.gameId);
			if (gamePlayer != null) {
				if (gamePlayer.hasPlayerCharacter(characterPlayer.getCharacterId())) {
					gamePlayer.removePlayerCharacter(characterPlayer.getCharacterId());
					gamePlayer.saveAsync();
				}
			}
		}
		else if (request.type == OwnerType.Inventory) {
			let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.id, request.gameId);

			if (inventory == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			let result = {
				type: "Inventory",
				gameId: request.gameId,
				log: request.log,
				tsCreate: xDatetime.getCurrentMilliseconds(),
				objs: await this.deleteInventory(inventory, request.gameId),
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", request.gameId).deleteOne({ itemId: inventory.getItemId() });
			this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);

			let owner = inventory.getOwner();
			if (owner.type == OwnerType.GamePlayer) {
				let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(inventory.getOwner().id, request.gameId);
				if (gamePlayer != null) {
					if (gamePlayer.hasPlayerInventory(inventory.getItemId())) {
						gamePlayer.removePlayerInventory(inventory.getItemId());
						gamePlayer.saveAsync();
					}
				}
			}
			else if (owner.type == OwnerType.CharacterPlayer) {
				let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(inventory.getOwner().id, request.gameId);
				if (characterPlayer != null) {
					if (characterPlayer.hasPlayerInventory(inventory.getItemId())) {
						characterPlayer.removePlayerInventory(inventory.getItemId());
						characterPlayer.saveAsync();
					}
				}
			}
			else if (owner.type == OwnerType.Group) {
				let group = await this.gnServer.getDatabase().loadGroupAsync(inventory.getOwner().id, request.gameId);
				if (group != null) {
					if (group.hasGroupInventory(inventory.getItemId())) {
						group.removeGroupInventory(inventory.getItemId());
						group.saveAsync();
					}
				}
			}
		}
		else if (request.type == OwnerType.Group) {
			let group = await this.gnServer.getDatabase().loadGroupAsync(request.id, request.gameId);

			if (group == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			let groupId = group.getGroupId();

			let objs = await this.deleteGroup(group, request.gameId);

			let allMembers = group.getAllMembers();
			for (let i = 0; i < allMembers.length; i++) {
				let member = allMembers[i];
				let memberId = member.memberId;

				if (memberId.length == 11) {
					let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(memberId, request.gameId);
					if (characterPlayer != null) {
						if (characterPlayer.hasPlayerGroup(groupId)) {
							characterPlayer.removePlayerGroup(groupId);
							characterPlayer.saveAsync();
						}
					}
				}
				else if (memberId.length == 10) {
					let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(memberId, request.gameId);
					if (gamePlayer != null) {
						if (gamePlayer.hasPlayerGroup(groupId)) {
							gamePlayer.removePlayerGroup(groupId);
							gamePlayer.saveAsync();
						}
					}
				}
			}

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
			let storeInventory = await this.gnServer.getDatabase().loadStoreInventoryAsync(request.id, request.gameId);

			if (storeInventory == null) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
				return operationResponse;
			}

			let storeId = storeInventory.getStoreId();

			let objs = await this.deleteStoreInventory(storeInventory, request.gameId);

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

	private async deleteMasterPlayer(masterPlayer: MasterPlayer): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "MasterPlayer",
			obj: masterPlayer.getOriginResult()
		});

		let gameIds = this.gnServer.getGameIds();

		let userId = masterPlayer.getUserId();

		for (let i = 0; i < gameIds.length; i++) {
			let gameId = gameIds[i];

			let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId);
			if (gamePlayer != null) {
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
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.CurrencyLog");
			let results = await currencyLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "MasterPlayer.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ userId: userId });
		}

		{
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.StatisticsLog");
			let results = await statisticsLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "MasterPlayer.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ userId: userId });
		}

		{
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup");
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let backupResults = result.results as { userId: string, position: number, }[];

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

	private async deleteGamePlayer(gamePlayer: GamePlayer, gameId: string): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "GamePlayer",
			obj: gamePlayer.getOriginResult()
		});

		let userId = gamePlayer.getUserId();

		{
			let playerCharacters = gamePlayer.getAllPlayerCharacters();

			for (let i = 0; i < playerCharacters.length; i++) {
				let playerCharacter = playerCharacters[i];

				let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(playerCharacter.characterId, gameId);

				if (characterPlayer != null) {
					let results = await this.deleteCharacterPlayer(characterPlayer, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId).deleteMany({ "owner.id": userId });
		}

		{
			let playerFriends = gamePlayer.getAllPlayerFriends();

			for (let i = 0; i < playerFriends.length; i++) {
				let playerFriend = playerFriends[i];

				let friendPlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(playerFriend.friendId, gameId);
				if (friendPlayer != null) {
					let results = await this.deleteFriendPlayerInGamePlayer(gamePlayer, gameId, friendPlayer);
					answer.push(...results);

					friendPlayer.saveAsync();
				}
			}
		}

		{
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);

			let results = await groupMessageCollection.find({ senderId: userId });
			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "Group.Message",
					obj: result,
				});
			}

			await groupMessageCollection.deleteMany({ senderId: userId });

			let playerGroups = gamePlayer.getAllPlayerGroups();

			for (let i = 0; i < playerGroups.length; i++) {
				let playerGroup = playerGroups[i];

				let group = await this.gnServer.getDatabase().loadGroupAsync(playerGroup.groupId, gameId);

				if (group != null) {
					let results = await this.deleteGroupInGamePlayer(gamePlayer, gameId, group);
					answer.push(...results);

					group.saveAsync();
				}
			}
		}

		{
			let playerInventories = gamePlayer.getAllPlayerInventories();

			for (let i = 0; i < playerInventories.length; i++) {
				let playerInventory = playerInventories[i];

				let inventory = await this.gnServer.getDatabase().loadInventoryAsync(playerInventory.itemId, gameId);

				if (inventory != null) {
					let results = await this.deleteInventory(inventory, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": userId });
		}

		{
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId);
			let results = await currencyLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "GamePlayer.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ userId: userId });
		}

		{
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId);
			let results = await statisticsLogCollection.find({ userId: userId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "GamePlayer.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ userId: userId });
		}

		{
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId);
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let backupResults = result.results as { userId: string, position: number, }[];

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
			let backupStoreLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			let results = await backupStoreLogCollection.find({ id: userId });

			while (await results.hasNext()) {
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

	private async deleteCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "CharacterPlayer",
			obj: characterPlayer.getOriginResult()
		});

		let characterId = characterPlayer.getCharacterId();

		{
			let playerFriends = characterPlayer.getAllPlayerFriends();

			for (let i = 0; i < playerFriends.length; i++) {
				let playerFriend = playerFriends[i];

				let friendPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(playerFriend.friendId, gameId);
				if (friendPlayer != null) {
					let results = await this.deleteFriendPlayerInCharacterPlayer(characterPlayer, gameId, friendPlayer);
					answer.push(...results);

					friendPlayer.saveAsync();
				}
			}
		}

		{
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);

			let results = await groupMessageCollection.find({ senderId: characterId });
			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "Group.Message",
					obj: result,
				});
			}

			await groupMessageCollection.deleteMany({ senderId: characterId });

			let playerGroups = characterPlayer.getAllPlayerGroups();

			for (let i = 0; i < playerGroups.length; i++) {
				let playerGroup = playerGroups[i];

				let group = await this.gnServer.getDatabase().loadGroupAsync(playerGroup.groupId, gameId);

				if (group != null) {
					let results = await this.deleteGroupInCharacterPlayer(characterPlayer, gameId, group);
					answer.push(...results);

					group.saveAsync();
				}
			}
		}

		{
			let playerInventories = characterPlayer.getAllPlayerInventories();

			for (let i = 0; i < playerInventories.length; i++) {
				let playerInventory = playerInventories[i];

				let inventory = await this.gnServer.getDatabase().loadInventoryAsync(playerInventory.itemId, gameId);

				if (inventory != null) {
					let results = await this.deleteInventory(inventory, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": characterId });
		}

		{
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId);
			let results = await currencyLogCollection.find({ characterId: characterId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "CharacterPlayer.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ characterId: characterId });
		}

		{
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId);
			let results = await statisticsLogCollection.find({ characterId: characterId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "CharacterPlayer.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ characterId: characterId });
		}

		{
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId);
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let backupResults = result.results as { characterId: string, position: number, }[];

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
			let backupStoreLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			let results = await backupStoreLogCollection.find({ id: characterId });

			while (await results.hasNext()) {
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

	private async deleteInventory(inventory: Inventory, gameId: string): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "Inventory",
			obj: inventory.getOriginResult()
		});

		let itemId = inventory.getItemId();

		{
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId);
			let results = await statisticsLogCollection.find({ itemId: itemId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "Inventory.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ itemId: itemId });
		}

		{
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId);
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let backupResults = result.results as { itemId: string, position: number, }[];

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

	private async deleteGroup(group: Group, gameId: string): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "Group",
			obj: group.getOriginResult()
		});

		let groupId = group.getGroupId();

		let cacheData = this.gnServer.getCacheService(gameId);

		{
			let groupMessageCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId);

			let results = await groupMessageCollection.find({ groupId: groupId });
			while (await results.hasNext()) {
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
			let groupInventories = group.getAllGroupInventories();

			for (let i = 0; i < groupInventories.length; i++) {
				let groupInventory = groupInventories[i];

				let inventory = await this.gnServer.getDatabase().loadInventoryAsync(groupInventory.itemId, gameId);

				if (inventory != null) {
					let results = await this.deleteInventory(inventory, gameId);
					answer.push(...results);
				}
			}

			this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": groupId });
		}

		{
			let currencyLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId);
			let results = await currencyLogCollection.find({ groupId: groupId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "Group.CurrencyLog",
					obj: result,
				});
			}

			currencyLogCollection.deleteMany({ groupId: groupId });
		}

		{
			let statisticsLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId);
			let results = await statisticsLogCollection.find({ groupId: groupId });

			while (await results.hasNext()) {
				let result = await results.next();

				answer.push({
					type: "Group.StatisticsLog",
					obj: result,
				});
			}

			statisticsLogCollection.deleteMany({ groupId: groupId });
		}

		{
			let backupStatisticsCollection = this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId);
			let results = await backupStatisticsCollection.find({});

			while (await results.hasNext()) {
				let result = await results.next();

				let backupResults = result.results as { groupId: string, position: number, }[];

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
			let backupStoreLogCollection = this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId);
			let results = await backupStoreLogCollection.find({ id: groupId });

			while (await results.hasNext()) {
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

	private async deleteFriendPlayerInGamePlayer(gamePlayer: GamePlayer, gameId: string, friendPlayer: GamePlayer): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		let userId = gamePlayer.getUserId();

		if (friendPlayer.hasPlayerFriend(userId)) {
			friendPlayer.removePlayerGroup(userId);
		}

		return answer;
	}

	private async deleteFriendPlayerInCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string, friendPlayer: CharacterPlayer): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		let characterId = characterPlayer.getCharacterId();

		if (friendPlayer.hasPlayerFriend(characterId)) {
			friendPlayer.removePlayerGroup(characterId);
		}

		return answer;
	}

	private async deleteGroupInGamePlayer(gamePlayer: GamePlayer, gameId: string, group: Group): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		let userId = gamePlayer.getUserId();

		if (group.hasMember(userId)) {
			group.removeMember(userId);
		}

		let groupId = group.getGroupId();

		let cacheData = this.gnServer.getCacheService(gameId);
		cacheData.removeData("GroupMessages_" + groupId);

		return answer;
	}

	private async deleteGroupInCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string, group: Group): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		let characterId = characterPlayer.getCharacterId();

		if (group.hasMember(characterId)) {
			group.removeMember(characterId);
		}

		let groupId = group.getGroupId();

		let cacheData = this.gnServer.getCacheService(gameId);
		cacheData.removeData("GroupMessages_" + groupId);

		return answer;
	}

	private async deleteStoreInventory(storeInventory: StoreInventory, gameId: string): Promise<Array<{ [key: string]: any }>> {
		let answer: Array<{ [key: string]: any }> = [];

		answer.push({
			type: "StoreInventory",
			obj: storeInventory.getOriginResult()
		});

		return answer;
	}

}
