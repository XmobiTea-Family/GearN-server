import * as mongodb from "mongodb";

import { PlayerBase } from "./PlayerBase";
import { CharacterItem } from "./CharacterItem";
import { InventoryItem } from "./InventoryItem";
import { GroupItem } from "./GroupItem";
import { FriendItem } from "./FriendItem";

export class GamePlayerBase extends PlayerBase {
	// Defines the internal field key for player characters.
	private static readonly _playerCharacters: string = "playerCharacters";
	// Defines the internal field key for player inventories.
	private static readonly _playerInventories: string = "playerInventories";
	// Defines the internal field key for player groups.
	private static readonly _playerGroups: string = "playerGroups";
	// Defines the internal field key for player friends.
	private static readonly _playerFriends: string = "playerFriends";

	// Stores the player characters value used by this instance.
	private playerCharacters: Array<CharacterItem>;
	// Stores the player inventories value used by this instance.
	private playerInventories: Array<InventoryItem>;
	// Stores the player groups value used by this instance.
	private playerGroups: Array<GroupItem>;
	// Stores the player friends value used by this instance.
	private playerFriends: Array<FriendItem>;

	/**
	 * Initializes a new game player base instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.setDocumentGamePlayerBase(result);
	}

	/**
	 * Sets the document game player base.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentGamePlayerBase(result: mongodb.WithId<mongodb.Document>) {
		this.playerCharacters = result[GamePlayerBase._playerCharacters];
		this.playerInventories = result[GamePlayerBase._playerInventories];
		this.playerGroups = result[GamePlayerBase._playerGroups];
		this.playerFriends = result[GamePlayerBase._playerFriends];
	}

	/**
	 * Returns all player characters.
	 * @returns Returns all player characters.
	 */
	public getAllPlayerCharacters(): Array<CharacterItem> {
		return this.playerCharacters;
	}

	/**
	 * Returns the player character.
	 * @param characterId Provides the character ID value used by this operation.
	 * @returns Returns the player character.
	 */
	public getPlayerCharacter(characterId: string): CharacterItem {
		return this.playerCharacters.find(x => x.characterId == characterId);
	}

	/**
	 * Sets the player character.
	 * @param characterId Provides the character ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 */
	public setPlayerCharacter(characterId: string, catalogId: string): void {
		// Stores the player character item value used in the current execution flow.
		let playerCharacterItem = this.playerCharacters.find(x => x.characterId == characterId);
		if (playerCharacterItem == null) {
			playerCharacterItem = {
				catalogId: catalogId,
				characterId: characterId
			}

			this.playerCharacters.push(playerCharacterItem);
		}
		else {
			playerCharacterItem.catalogId = catalogId;
		}

		this.set(GamePlayerBase._playerCharacters, this.playerCharacters);
	}

	/**
	 * Removes the player character.
	 * @param characterId Provides the character ID value used by this operation.
	 */
	public removePlayerCharacter(characterId: string): void {
		// Stores the player character item value used in the current execution flow.
		let playerCharacterItem = this.playerCharacters.find(x => x.characterId == characterId);
		if (playerCharacterItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.playerCharacters.indexOf(playerCharacterItem);
			if (indexOf != -1) {
				this.playerCharacters.splice(indexOf, 1);

				return this.set(GamePlayerBase._playerCharacters, this.playerCharacters);
			}
		}

		throw Error("can not found the characterId to remove");
	}

	/**
	 * Checks whether player character exists.
	 * @param characterId Provides the character ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerCharacter(characterId: string): boolean {
		return this.playerCharacters.find(x => x.characterId == characterId) != null;
	}

	/**
	 * Returns all player inventories.
	 * @returns Returns all player inventories.
	 */
	public getAllPlayerInventories(): Array<InventoryItem> {
		return this.playerInventories;
	}

	/**
	 * Returns the player inventory.
	 * @param itemId Provides the item ID value used by this operation.
	 * @returns Returns the player inventory.
	 */
	public getPlayerInventory(itemId: string): InventoryItem {
		return this.playerInventories.find(x => x.itemId == itemId);
	}

	/**
	 * Sets the player inventory.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 */
	public setPlayerInventory(itemId: string, catalogId: string, classId: string): void {
		// Stores the player inventory item value used in the current execution flow.
		let playerInventoryItem = this.playerInventories.find(x => x.itemId == itemId);
		if (playerInventoryItem == null) {
			playerInventoryItem = {
				itemId: itemId,
				catalogId: catalogId,
				classId: classId,
			}

			this.playerInventories.push(playerInventoryItem);
		}
		else {
			playerInventoryItem.catalogId = catalogId;
			playerInventoryItem.classId = classId;
		}

		this.set(GamePlayerBase._playerInventories, this.playerInventories);
	}

	/**
	 * Removes the player inventory.
	 * @param itemId Provides the item ID value used by this operation.
	 */
	public removePlayerInventory(itemId: string): void {
		// Stores the player inventory item value used in the current execution flow.
		let playerInventoryItem = this.playerInventories.find(x => x.itemId == itemId);
		if (playerInventoryItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.playerInventories.indexOf(playerInventoryItem);
			if (indexOf != -1) {
				this.playerInventories.splice(indexOf, 1);

				return this.set(GamePlayerBase._playerInventories, this.playerInventories);
			}
		}

		throw Error("can not found the itemId to remove");
	}

	/**
	 * Checks whether player inventory exists.
	 * @param itemId Provides the item ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerInventory(itemId: string): boolean {
		return this.playerInventories.find(x => x.itemId == itemId) != null;
	}

	/**
	 * Returns all player groups.
	 * @returns Returns all player groups.
	 */
	public getAllPlayerGroups(): Array<GroupItem> {
		return this.playerGroups;
	}

	/**
	 * Checks whether player group exists.
	 * @param groupId Provides the group ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerGroup(groupId: string): boolean {
		return this.playerGroups.find(x => x.groupId == groupId) != null;
	}

	/**
	 * Returns the player group.
	 * @param groupId Provides the group ID value used by this operation.
	 * @returns Returns the player group.
	 */
	public getPlayerGroup(groupId: string): GroupItem {
		return this.playerGroups.find(x => x.groupId == groupId);
	}

	/**
	 * Sets the player group.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param status Provides the status value used by this operation.
	 * @param tsLastStatusUpdate Provides the timestamp last status update value used by this operation.
	 */
	public setPlayerGroup(groupId: string, catalogId: string, status: number, tsLastStatusUpdate: number): void {
		// Stores the player group item value used in the current execution flow.
		let playerGroupItem = this.playerGroups.find(x => x.groupId == groupId);
		if (playerGroupItem == null) {
			playerGroupItem = {
				groupId: groupId,
				catalogId: catalogId,
				status: status,
				tsLastStatusUpdate: tsLastStatusUpdate
			}

			this.playerGroups.push(playerGroupItem);
		}
		else {
			playerGroupItem.catalogId = catalogId;
			playerGroupItem.status = status;
			playerGroupItem.tsLastStatusUpdate = tsLastStatusUpdate;
		}

		this.set(GamePlayerBase._playerGroups, this.playerGroups);
	}

	/**
	 * Removes the player group.
	 * @param groupId Provides the group ID value used by this operation.
	 */
	public removePlayerGroup(groupId: string): void {
		// Stores the player group item value used in the current execution flow.
		let playerGroupItem = this.playerGroups.find(x => x.groupId == groupId);
		if (playerGroupItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.playerGroups.indexOf(playerGroupItem);
			if (indexOf != -1) {
				this.playerGroups.splice(indexOf, 1);

				return this.set(GamePlayerBase._playerGroups, this.playerGroups);
			}
		}

		throw Error("can not found the groupId to remove");
	}


	/**
	 * Returns all player friends.
	 * @returns Returns all player friends.
	 */
	public getAllPlayerFriends(): Array<FriendItem> {
		return this.playerFriends;
	}

	/**
	 * Checks whether player friend exists.
	 * @param friendId Provides the friend ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerFriend(friendId: string): boolean {
		return this.playerFriends.find(x => x.friendId == friendId) != null;
	}

	/**
	 * Returns the player friend.
	 * @param friendId Provides the friend ID value used by this operation.
	 * @returns Returns the player friend.
	 */
	public getPlayerFriend(friendId: string): FriendItem {
		return this.playerFriends.find(x => x.friendId == friendId);
	}

	/**
	 * Sets the player friend.
	 * @param friendId Provides the friend ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param status Provides the status value used by this operation.
	 * @param tsLastStatusUpdate Provides the timestamp last status update value used by this operation.
	 */
	public setPlayerFriend(friendId: string, catalogId: string, status: number, tsLastStatusUpdate: number): void {
		// Stores the player friend item value used in the current execution flow.
		let playerFriendItem = this.playerFriends.find(x => x.friendId == friendId);
		if (playerFriendItem == null) {
			playerFriendItem = {
				friendId: friendId,
				catalogId: catalogId,
				status: status,
				tsLastStatusUpdate: tsLastStatusUpdate
			}

			this.playerFriends.push(playerFriendItem);
		}
		else {
			playerFriendItem.status = status;
			playerFriendItem.catalogId = catalogId;
			playerFriendItem.tsLastStatusUpdate = tsLastStatusUpdate;
		}

		this.set(GamePlayerBase._playerFriends, this.playerFriends);
	}

	/**
	 * Removes the player friend.
	 * @param friendId Provides the friend ID value used by this operation.
	 */
	public removePlayerFriend(friendId: string): void {
		// Stores the player friend item value used in the current execution flow.
		let playerFriendItem = this.playerFriends.find(x => x.friendId == friendId);
		if (playerFriendItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.playerFriends.indexOf(playerFriendItem);
			if (indexOf != -1) {
				this.playerFriends.splice(indexOf, 1);

				return this.set(GamePlayerBase._playerFriends, this.playerFriends);
			}
		}

		throw Error("can not found the friendId to remove");
	}
}
