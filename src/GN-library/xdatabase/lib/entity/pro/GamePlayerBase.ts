import * as mongoDB from "mongodb";

import { PlayerBase } from "./PlayerBase";
import { CharacterItem } from "./CharacterItem";
import { InventoryItem } from "./InventoryItem";
import { GroupItem } from "./GroupItem";
import { FriendItem } from "./FriendItem";

export class GamePlayerBase extends PlayerBase {
	private static readonly _playerCharacters: string = "playerCharacters";
	private static readonly _playerInventories: string = "playerInventories";
	private static readonly _playerGroups: string = "playerGroups";
	private static readonly _playerFriends: string = "playerFriends";

	private playerCharacters: Array<CharacterItem>;
	private playerInventories: Array<InventoryItem>;
	private playerGroups: Array<GroupItem>;
	private playerFriends: Array<FriendItem>;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentGamePlayerBase(result);
	}

	private setDocumentGamePlayerBase(result: mongoDB.WithId<mongoDB.Document>) {
		this.playerCharacters = result[GamePlayerBase._playerCharacters];
		this.playerInventories = result[GamePlayerBase._playerInventories];
		this.playerGroups = result[GamePlayerBase._playerGroups];
		this.playerFriends = result[GamePlayerBase._playerFriends];
	}

	public getAllPlayerCharacters(): Array<CharacterItem> {
        return this.playerCharacters;
    }

    public getPlayerCharacter(characterId: string): CharacterItem {
		return this.playerCharacters.find(x => x.characterId == characterId);
	}

    public setPlayerCharacter(characterId: string, characterCatalogId: string): void {
        let playerCharacterItem = this.playerCharacters.find(x => x.characterId == characterId);
		if (playerCharacterItem == null) {
			playerCharacterItem = {
				characterCatalogId: characterCatalogId,
				characterId: characterId
			}

			this.playerCharacters.push(playerCharacterItem);
		}
		else {
			playerCharacterItem.characterCatalogId = characterCatalogId;
		}

		this.set(GamePlayerBase._playerCharacters, this.playerCharacters);
	}

    public removePlayerCharacter(characterId: string): void {
        let playerCharacterItem = this.playerCharacters.find(x => x.characterId == characterId);
		if (playerCharacterItem != null) {
			let indexOf = this.playerCharacters.indexOf(playerCharacterItem);
			if (indexOf != -1) {
				this.playerCharacters.splice(indexOf, 1);
		
				return this.set(GamePlayerBase._playerCharacters, this.playerCharacters);
			}
		}

		throw Error("can not found the characterId to remove");
    }

	public getAllPlayerInventories(): Array<InventoryItem> {
        return this.playerInventories;
    }

    public getPlayerInventory(itemId: string): InventoryItem {
		return this.playerInventories.find(x => x.itemId == itemId);
	}

    public setPlayerInventory(itemId: string, itemCatalogId: string): void {
        let playerInventoryItem = this.playerInventories.find(x => x.itemId == itemId);
		if (playerInventoryItem == null) {
			playerInventoryItem = {
				itemId: itemId,
				itemCatalogId: itemCatalogId,
			}

			this.playerInventories.push(playerInventoryItem);
		}
		else {
			playerInventoryItem.itemCatalogId = itemCatalogId;
		}

		this.set(GamePlayerBase._playerInventories, this.playerInventories);
	}

    public removePlayerInventory(itemId: string): void {
        let playerInventoryItem = this.playerInventories.find(x => x.itemId == itemId);
		if (playerInventoryItem != null) {
			let indexOf = this.playerInventories.indexOf(playerInventoryItem);
			if (indexOf != -1) {
				this.playerInventories.splice(indexOf, 1);
		
				return this.set(GamePlayerBase._playerInventories, this.playerInventories);
			}
		}

		throw Error("can not found the itemId to remove");
    }

	public getAllPlayerGroups(): Array<GroupItem> {
        return this.playerGroups;
    }

    public getPlayerGroup(groupId: string): GroupItem {
		return this.playerGroups.find(x => x.groupId == groupId);
	}

    public setPlayerGroup(groupId: string, groupCatalogId: string, status: number, tsLastStatusUpdate: number): void {
        let playerGroupItem = this.playerGroups.find(x => x.groupId == groupId);
		if (playerGroupItem == null) {
			playerGroupItem = {
				groupId: groupId,
				groupCatalogId: groupCatalogId,
				status: status,
				tsLastStatusUpdate: tsLastStatusUpdate
			}

			this.playerGroups.push(playerGroupItem);
		}
		else {
			playerGroupItem.groupCatalogId = groupCatalogId;
			playerGroupItem.status = status;
			playerGroupItem.tsLastStatusUpdate = tsLastStatusUpdate;
		}
		
		this.set(GamePlayerBase._playerGroups, this.playerGroups);
	}

    public removePlayerGroup(groupId: string): void {
        let playerGroupItem = this.playerGroups.find(x => x.groupId == groupId);
		if (playerGroupItem != null) {
			let indexOf = this.playerGroups.indexOf(playerGroupItem);
			if (indexOf != -1) {
				this.playerGroups.splice(indexOf, 1);
		
				return this.set(GamePlayerBase._playerGroups, this.playerGroups);
			}
		}

		throw Error("can not found the groupId to remove");
    }


	public getAllPlayerFriends(): Array<FriendItem> {
        return this.playerFriends;
    }

	public hasPlayerFriend(friendId: string): boolean {
		return this.playerFriends.find(x => x.friendId == friendId) != null;
	}

    public getPlayerFriend(friendId: string): FriendItem {
		return this.playerFriends.find(x => x.friendId == friendId);
	}

    public setPlayerFriend(friendId: string, friendCatalogId: string, status: number, tsLastStatusUpdate: number): void {
        let playerFriendItem = this.playerFriends.find(x => x.friendId == friendId);
		if (playerFriendItem == null) {
			playerFriendItem = {
				friendId: friendId,
				friendCatalogId: friendCatalogId,
				status: status,
				tsLastStatusUpdate: tsLastStatusUpdate
			}

			this.playerFriends.push(playerFriendItem);
		}
		else {
			playerFriendItem.status = status;
			playerFriendItem.friendCatalogId = friendCatalogId;
			playerFriendItem.tsLastStatusUpdate = tsLastStatusUpdate;
		}

		this.set(GamePlayerBase._playerFriends, this.playerFriends);
	}

    public removePlayerFriend(friendId: string): void {
        let playerFriendItem = this.playerFriends.find(x => x.friendId == friendId);
		if (playerFriendItem != null) {
			let indexOf = this.playerFriends.indexOf(playerFriendItem);
			if (indexOf != -1) {
				this.playerFriends.splice(indexOf, 1);
		
				return this.set(GamePlayerBase._playerFriends, this.playerFriends);
			}
		}

		throw Error("can not found the friendId to remove");
    }
}
