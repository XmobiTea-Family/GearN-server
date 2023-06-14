import * as mongoDB from "mongodb";

import { BanItem } from "./BanItem";
import { DataItem } from "./DataItem";
import { DataObjectBase } from "./DataObjectBase";
import { CurrencyItem } from "./CurrencyItem";
import { StatisticsItem } from "./StatisticsItem";
import { CharacterItem } from "./CharacterItem";
import { InventoryItem } from "./InventoryItem";
import { GroupItem } from "./GroupItem";
import { FriendItem } from "./FriendItem";
import { DataValueType } from "./type/DataValueType";

export class PlayerBase extends DataObjectBase {
	private static readonly _role: string = "role";
	private static readonly _playerBan: string = "playerBan";

	private static readonly _playerDatas: string = "playerDatas";
	private static readonly _playerCurrencies: string = "playerCurrencies";
	private static readonly _playerStatistics: string = "playerStatistics";
	private static readonly _playerCharacters: string = "playerCharacters";
	private static readonly _playerInventories: string = "playerInventories";
	private static readonly _playerGroups: string = "playerGroups";
	private static readonly _playerFriends: string = "playerFriends";

	private static readonly _tsLastLogin: string = "tsLastLogin";
	protected static readonly _ipAddressCreate: string = "ipAddressCreate";
	protected static readonly _countryCode: string = "countryCode";
	
	private role: number;
	private playerBan: BanItem;

	private playerDatas: Array<DataItem>;
	private playerCurrencies: Array<CurrencyItem>;
	private playerStatistics: Array<StatisticsItem>;
	private playerCharacters: Array<CharacterItem>;
	private playerInventories: Array<InventoryItem>;
	private playerGroups: Array<GroupItem>;
	private playerFriends: Array<FriendItem>;

	private tsLastLogin: number;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentPlayerBase(result);
	}

	private setDocumentPlayerBase(result: mongoDB.WithId<mongoDB.Document>): void {
		this.role = result[PlayerBase._role];
		this.playerBan = result[PlayerBase._playerBan];

		this.playerDatas = result[PlayerBase._playerDatas];
		this.playerCurrencies = result[PlayerBase._playerCurrencies];
		this.playerStatistics = result[PlayerBase._playerStatistics];
		this.playerCharacters = result[PlayerBase._playerCharacters];
		this.playerInventories = result[PlayerBase._playerInventories];
		this.playerGroups = result[PlayerBase._playerGroups];
		this.playerFriends = result[PlayerBase._playerFriends];

		this.tsLastLogin = result[PlayerBase._tsLastLogin];
	}

	public getRole(): number {
		return this.role;
	}

	public setRole(role: number): void {
		this.role = role;

		this.set(PlayerBase._role, this.role);
	}

    public getPlayerBan(): BanItem {
        return this.playerBan;
    }

    public setPlayerBan(tsExpire: number, reason: string): void {
        this.playerBan = {
			reason: reason,
			tsExpire: tsExpire
		}

		this.set(PlayerBase._playerBan, this.playerBan);
    }

    public getAllPlayerDatas(): Array<DataItem> {
        return this.playerDatas;
    }

    public hasPlayerData(key: string): boolean {
		return this.playerDatas.find(x => x.key == key) != null;
	}

    public getPlayerData(key: string): DataItem {
		return this.playerDatas.find(x => x.key == key);
	}

    public setPlayerData(key: string, value: DataValueType, permission: number): void {
        let playerDataItem = this.playerDatas.find(x => x.key == key);
		if (playerDataItem == null) {
			playerDataItem = {
				key: key,
				value: value,
				permission: permission,
			}

			this.playerDatas.push(playerDataItem);
		}
		else {
			playerDataItem.value = value;
			playerDataItem.permission = permission;
		}
		
		this.set(PlayerBase._playerDatas, this.playerDatas);
	}

    public removePlayerData(key: string): void {
        let playerDataItem = this.playerDatas.find(x => x.key == key);
		if (playerDataItem != null) {
			let indexOf = this.playerDatas.indexOf(playerDataItem);
			if (indexOf != -1) {
				this.playerDatas.splice(indexOf, 1);

				return this.set(PlayerBase._playerDatas, this.playerDatas);
			}
		}

		throw Error("can not found the key to remove");
    }

	public getAllPlayerCurrencies(): Array<CurrencyItem> {
        return this.playerCurrencies;
    }

    public hasPlayerCurrency(key: string): boolean {
		return this.getPlayerCurrency(key) != null;
	}

    public getPlayerCurrency(key: string): CurrencyItem {
		return this.playerCurrencies.find(x => x.key == key);
	}

    public setPlayerCurrency(key: string, value: number): void {
        let playerCurrencyItem = this.playerCurrencies.find(x => x.key == key);
		if (playerCurrencyItem == null) {
			playerCurrencyItem = {
				key: key,
				value: value
			}

			this.playerCurrencies.push(playerCurrencyItem);
		}
		else {
			playerCurrencyItem.value = value;
		}
		
		this.set(PlayerBase._playerCurrencies, this.playerCurrencies);
	}

    public removePlayerCurrency(key: string): void {
        let playerCurrencyItem = this.playerCurrencies.find(x => x.key == key);
		if (playerCurrencyItem != null) {
			let indexOf = this.playerCurrencies.indexOf(playerCurrencyItem);
			if (indexOf != -1) {
				this.playerCurrencies.splice(indexOf, 1);

				return this.set(PlayerBase._playerCurrencies, this.playerCurrencies);
			}
		}

		throw Error("can not found the key to remove");
    }

	public getAllPlayerStatistics(): Array<StatisticsItem> {
        return this.playerStatistics;
    }

    public hasPlayerStatistics(key: string): boolean {
		return this.getPlayerStatistics(key) != null;
	}

    public getPlayerStatistics(key: string): StatisticsItem {
		return this.playerStatistics.find(x => x.key == key);
	}

    public setPlayerStatistics(key: string, value: number, tsLastUpdate: number): void {
        let playerStatisticsItem = this.playerStatistics.find(x => x.key == key);
		if (playerStatisticsItem == null) {
			playerStatisticsItem = {
				key: key,
				value: value,
				tsLastUpdate: tsLastUpdate
			}

			this.playerStatistics.push(playerStatisticsItem);
		}
		else {
			playerStatisticsItem.value = value;
			playerStatisticsItem.tsLastUpdate = tsLastUpdate;
		}
		
		this.set(PlayerBase._playerStatistics, this.playerStatistics);
	}

    public removePlayerStatistics(key: string): void {
        let playerStatisticsItem = this.playerStatistics.find(x => x.key == key);
		if (playerStatisticsItem != null) {
			let indexOf = this.playerStatistics.indexOf(playerStatisticsItem);
			if (indexOf != -1) {
				this.playerStatistics.splice(indexOf, 1);

				return this.set(PlayerBase._playerStatistics, this.playerStatistics);
			}
		}

		throw Error("can not found the key to remove");
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

		this.set(PlayerBase._playerCharacters, this.playerCharacters);
	}

    public removePlayerCharacter(characterId: string): void {
        let playerCharacterItem = this.playerCharacters.find(x => x.characterId == characterId);
		if (playerCharacterItem != null) {
			let indexOf = this.playerCharacters.indexOf(playerCharacterItem);
			if (indexOf != -1) {
				this.playerCharacters.splice(indexOf, 1);
		
				return this.set(PlayerBase._playerCharacters, this.playerCharacters);
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

		this.set(PlayerBase._playerInventories, this.playerInventories);
	}

    public removePlayerInventory(itemId: string): void {
        let playerInventoryItem = this.playerInventories.find(x => x.itemId == itemId);
		if (playerInventoryItem != null) {
			let indexOf = this.playerInventories.indexOf(playerInventoryItem);
			if (indexOf != -1) {
				this.playerInventories.splice(indexOf, 1);
		
				return this.set(PlayerBase._playerInventories, this.playerInventories);
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
		
		this.set(PlayerBase._playerGroups, this.playerGroups);
	}

    public removePlayerGroup(groupId: string): void {
        let playerGroupItem = this.playerGroups.find(x => x.groupId == groupId);
		if (playerGroupItem != null) {
			let indexOf = this.playerGroups.indexOf(playerGroupItem);
			if (indexOf != -1) {
				this.playerGroups.splice(indexOf, 1);
		
				return this.set(PlayerBase._playerGroups, this.playerGroups);
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

    public setPlayerFriend(friendId: string, friendCatalogId: string, status: number, tsLastStatusUpdate: number, scriptData: Map<string, DataValueType>, privateData: Map<string, DataValueType>): void {
        let playerFriendItem = this.playerFriends.find(x => x.friendId == friendId);
		if (playerFriendItem == null) {
			playerFriendItem = {
				friendId: friendId,
				friendCatalogId: friendCatalogId,
				status: status,
				tsLastStatusUpdate: tsLastStatusUpdate,
				scriptData: scriptData,
				privateData: privateData,
			}

			this.playerFriends.push(playerFriendItem);
		}
		else {
			playerFriendItem.status = status;
			playerFriendItem.friendCatalogId = friendCatalogId;
			playerFriendItem.scriptData = scriptData;
			playerFriendItem.privateData = privateData;
		}

		this.set(PlayerBase._playerFriends, this.playerFriends);
	}

    public removePlayerFriend(friendId: string): void {
        let playerFriendItem = this.playerFriends.find(x => x.friendId == friendId);
		if (playerFriendItem != null) {
			let indexOf = this.playerFriends.indexOf(playerFriendItem);
			if (indexOf != -1) {
				this.playerFriends.splice(indexOf, 1);
		
				return this.set(PlayerBase._playerFriends, this.playerFriends);
			}
		}

		throw Error("can not found the friendId to remove");
    }

	public getTsLastLogin(): number {
		return this.tsLastLogin;
	}

	public setTsLastLogin(tsLastLogin: number): void {
		this.tsLastLogin = tsLastLogin;

		this.set(PlayerBase._tsLastLogin, this.tsLastLogin);
	}
}
