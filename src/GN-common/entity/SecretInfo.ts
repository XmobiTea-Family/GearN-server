import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

export enum SecretRole {
	Admin = 0,
	Server = 1,
	Player = 2,
}

export interface PermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface GroupPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface InventoryPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface AuthenticatePermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface MasterPlayerPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface GamePlayerPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface CharacterPlayerPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface ContentPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface MasterAdminPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface MultiplayerPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface CloudScriptPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface StoreInventoryPermissionRules {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface SecretPermissionItem {
	authenticate: {
		loginByAccount: AuthenticatePermissionRules,
		loginByAndroidDeviceId: AuthenticatePermissionRules,
		loginByApple: AuthenticatePermissionRules,
		loginByCustomDeviceId: AuthenticatePermissionRules,
		loginByCustomId: AuthenticatePermissionRules,
		loginByFacebook: AuthenticatePermissionRules,
		loginByGenericService: AuthenticatePermissionRules,
		loginByGoogle: AuthenticatePermissionRules,
		loginByGooglePlayGameService: AuthenticatePermissionRules,
		loginByGameCenter: AuthenticatePermissionRules,
		loginByiOSDeviceId: AuthenticatePermissionRules,
		loginByWindowsPhoneDeviceId: AuthenticatePermissionRules,
		registerAccount: AuthenticatePermissionRules,
		loginByEditorDeviceId: AuthenticatePermissionRules,
		loginByLinuxDeviceId: AuthenticatePermissionRules,
		loginByMacOSDeviceId: AuthenticatePermissionRules,
		loginByWindowsDeviceId: AuthenticatePermissionRules,
		refreshAuthToken: AuthenticatePermissionRules,
	},
	masterPlayer: {
		linkAccount: MasterPlayerPermissionRules,
		linkAndroidDeviceId: MasterPlayerPermissionRules,
		linkApple: MasterPlayerPermissionRules,
		linkCustomDeviceId: MasterPlayerPermissionRules,
		linkCustomId: MasterPlayerPermissionRules,
		linkEditorDeviceId: MasterPlayerPermissionRules,
		linkFacebook: MasterPlayerPermissionRules,
		linkGenericService: MasterPlayerPermissionRules,
		linkGoogle: MasterPlayerPermissionRules,
		linkiOSDeviceId: MasterPlayerPermissionRules,
		linkLinuxDeviceId: MasterPlayerPermissionRules,
		linkMacOSDeviceId: MasterPlayerPermissionRules,
		linkWindowsDeviceId: MasterPlayerPermissionRules,
		linkWindowsPhoneDeviceId: MasterPlayerPermissionRules,
		linkGooglePlayGameService: MasterPlayerPermissionRules,
		linkGameCenter: MasterPlayerPermissionRules,

		unlinkAccount: MasterPlayerPermissionRules,
		unlinkAndroidDeviceId: MasterPlayerPermissionRules,
		unlinkApple: MasterPlayerPermissionRules,
		unlinkCustomDeviceId: MasterPlayerPermissionRules,
		unlinkCustomId: MasterPlayerPermissionRules,
		unlinkEditorDeviceId: MasterPlayerPermissionRules,
		unlinkFacebook: MasterPlayerPermissionRules,
		unlinkGenericService: MasterPlayerPermissionRules,
		unlinkGoogle: MasterPlayerPermissionRules,
		unlinkiOSDeviceId: MasterPlayerPermissionRules,
		unlinkLinuxDeviceId: MasterPlayerPermissionRules,
		unlinkMacOSDeviceId: MasterPlayerPermissionRules,
		unlinkWindowsDeviceId: MasterPlayerPermissionRules,
		unlinkWindowsPhoneDeviceId: MasterPlayerPermissionRules,
		unlinkGooglePlayGameService: MasterPlayerPermissionRules,
		unlinkGameCenter: MasterPlayerPermissionRules,

		addSegment: MasterPlayerPermissionRules,
		removeSegment: MasterPlayerPermissionRules,
		getSegment: MasterPlayerPermissionRules,

		setTag: MasterPlayerPermissionRules,
		removeTag: MasterPlayerPermissionRules,
		getTag: MasterPlayerPermissionRules,

		getDisplayName: MasterPlayerPermissionRules,
		setDisplayName: MasterPlayerPermissionRules,

		getTsCreate: MasterPlayerPermissionRules,
		getIpAddressCreate: MasterPlayerPermissionRules,

		setTsLastLogin: MasterPlayerPermissionRules,
		getTsLastLogin: MasterPlayerPermissionRules,

		setPlayerBan: MasterPlayerPermissionRules,
		getPlayerBan: MasterPlayerPermissionRules,

		setCountryCode: MasterPlayerPermissionRules,
		getCountryCode: MasterPlayerPermissionRules,

		changeAccountPassword: MasterPlayerPermissionRules,
		resetAccountPassword: MasterPlayerPermissionRules,

		setAvatar: MasterPlayerPermissionRules,
		getAvatar: MasterPlayerPermissionRules,

		setPlayerCurrency: MasterPlayerPermissionRules,
		getPlayerCurrency: MasterPlayerPermissionRules,

		setPlayerStatistics: MasterPlayerPermissionRules,
		getPlayerStatistics: MasterPlayerPermissionRules,

		getStatisticsLeaderboard: MasterPlayerPermissionRules,
		getStatisticsLeaderboardAroundPlayer: MasterPlayerPermissionRules,

		getCustomData: MasterPlayerPermissionRules,
		setCustomData: MasterPlayerPermissionRules,

		setPlayerData: MasterPlayerPermissionRules,
		getPlayerData: MasterPlayerPermissionRules,

		getPlayerInformation: MasterPlayerPermissionRules,

		getPlayersWithApple: MasterPlayerPermissionRules,
		getPlayersWithFacebook: MasterPlayerPermissionRules,
		getPlayersWithGoogle: MasterPlayerPermissionRules,
		getPlayersWithGenericService: MasterPlayerPermissionRules,
		getPlayersWithSegment: MasterPlayerPermissionRules,
		getPlayersWithTag: MasterPlayerPermissionRules,
		getPlayersWithGooglePlayGameService: MasterPlayerPermissionRules,
		getPlayersWithGameCenter: MasterPlayerPermissionRules,

		getExternal: MasterPlayerPermissionRules,

		getPlayersWithDisplayName: MasterPlayerPermissionRules,

		setEmail: MasterPlayerPermissionRules,
		getEmail: MasterPlayerPermissionRules,

		getCurrencyLeaderboard: MasterPlayerPermissionRules,
		getCreateLeaderboard: MasterPlayerPermissionRules,
		getLastLoginLeaderboard: MasterPlayerPermissionRules,

		getStatisticsLog: MasterPlayerPermissionRules,
		getCurrencyLog: MasterPlayerPermissionRules,

		sendSocketOperationEvent: MasterPlayerPermissionRules,
		sendEmail: MasterPlayerPermissionRules,
		sendPushNotification: MasterPlayerPermissionRules,
		getPushNotification: MasterPlayerPermissionRules,
		addPushNotification: MasterPlayerPermissionRules,
		removePushNotification: MasterPlayerPermissionRules,

	},
	gamePlayer: {
		addSegment: GamePlayerPermissionRules,
		removeSegment: GamePlayerPermissionRules,
		getSegment: GamePlayerPermissionRules,

		setTag: GamePlayerPermissionRules,
		removeTag: GamePlayerPermissionRules,
		getTag: GamePlayerPermissionRules,

		getDisplayName: GamePlayerPermissionRules,
		setDisplayName: GamePlayerPermissionRules,

		getTsCreate: GamePlayerPermissionRules,
		getIpAddressCreate: GamePlayerPermissionRules,
		getTsLastLogin: GamePlayerPermissionRules,

		setPlayerBan: GamePlayerPermissionRules,
		getPlayerBan: GamePlayerPermissionRules,

		setCountryCode: GamePlayerPermissionRules,
		getCountryCode: GamePlayerPermissionRules,

		setAvatar: GamePlayerPermissionRules,
		getAvatar: GamePlayerPermissionRules,

		setPlayerCurrency: GamePlayerPermissionRules,
		getPlayerCurrency: GamePlayerPermissionRules,

		setPlayerStatistics: GamePlayerPermissionRules,
		getPlayerStatistics: GamePlayerPermissionRules,

		getStatisticsLeaderboard: GamePlayerPermissionRules,
		getStatisticsLeaderboardAroundPlayer: GamePlayerPermissionRules,

		getCustomData: GamePlayerPermissionRules,
		setCustomData: GamePlayerPermissionRules,

		setPlayerData: GamePlayerPermissionRules,
		getPlayerData: GamePlayerPermissionRules,

		getPlayerInformation: GamePlayerPermissionRules,

		getPlayersWithSegment: GamePlayerPermissionRules,
		getPlayersWithTag: GamePlayerPermissionRules,

		getPlayerCharacter: GamePlayerPermissionRules,
		getPlayerInventory: GamePlayerPermissionRules,
		getPlayerGroup: GamePlayerPermissionRules,
		getPlayerFriend: GamePlayerPermissionRules,

		removePlayerItem: GamePlayerPermissionRules,

		getOnlineStatus: GamePlayerPermissionRules,
		grantGroup: GamePlayerPermissionRules,
		grantPlayerItem: GamePlayerPermissionRules,
		grantPlayerCharacter: GamePlayerPermissionRules,

		addPlayerFriend: GamePlayerPermissionRules,
		removePlayerFriend: GamePlayerPermissionRules,

		removePlayerCharacter: GamePlayerPermissionRules,

		joinGroup: GamePlayerPermissionRules,
		leaveGroup: GamePlayerPermissionRules,

		getPlayersWithDisplayName: GamePlayerPermissionRules,

		getFriendStatisticsLeaderboardAroundPlayer: GamePlayerPermissionRules,
		getFriendStatisticsLeaderboard: GamePlayerPermissionRules,

		getCurrencyLeaderboard: GamePlayerPermissionRules,
		getCreateLeaderboard: GamePlayerPermissionRules,
		getLastLoginLeaderboard: MasterPlayerPermissionRules,

		getStatisticsLog: GamePlayerPermissionRules,
		getCurrencyLog: GamePlayerPermissionRules,
	},
	characterPlayer: {
		addSegment: CharacterPlayerPermissionRules,
		removeSegment: CharacterPlayerPermissionRules,
		getSegment: CharacterPlayerPermissionRules,

		setTag: CharacterPlayerPermissionRules,
		removeTag: CharacterPlayerPermissionRules,
		getTag: CharacterPlayerPermissionRules,

		getDisplayName: CharacterPlayerPermissionRules,
		setDisplayName: CharacterPlayerPermissionRules,

		getTsCreate: CharacterPlayerPermissionRules,
		getIpAddressCreate: CharacterPlayerPermissionRules,
		getTsLastLogin: CharacterPlayerPermissionRules,

		setPlayerBan: CharacterPlayerPermissionRules,
		getPlayerBan: CharacterPlayerPermissionRules,

		setCountryCode: CharacterPlayerPermissionRules,
		getCountryCode: CharacterPlayerPermissionRules,

		setAvatar: CharacterPlayerPermissionRules,
		getAvatar: CharacterPlayerPermissionRules,

		setPlayerCurrency: CharacterPlayerPermissionRules,
		getPlayerCurrency: CharacterPlayerPermissionRules,

		setPlayerStatistics: CharacterPlayerPermissionRules,
		getPlayerStatistics: CharacterPlayerPermissionRules,

		getStatisticsLeaderboard: CharacterPlayerPermissionRules,
		getStatisticsLeaderboardAroundPlayer: CharacterPlayerPermissionRules,

		getCustomData: CharacterPlayerPermissionRules,
		setCustomData: CharacterPlayerPermissionRules,

		setPlayerData: CharacterPlayerPermissionRules,
		getPlayerData: CharacterPlayerPermissionRules,

		getPlayerInformation: CharacterPlayerPermissionRules,

		getPlayersWithSegment: CharacterPlayerPermissionRules,
		getPlayersWithTag: CharacterPlayerPermissionRules,

		getCatalogId: CharacterPlayerPermissionRules,
		getOwner: CharacterPlayerPermissionRules,
		getRemoveStatus: CharacterPlayerPermissionRules,

		getPlayerFriend: CharacterPlayerPermissionRules,
		getPlayerGroup: CharacterPlayerPermissionRules,
		getPlayerInventory: CharacterPlayerPermissionRules,
		removePlayerItem: CharacterPlayerPermissionRules,
		grantPlayerItem: CharacterPlayerPermissionRules,

		grantGroup: CharacterPlayerPermissionRules,
		joinGroup: CharacterPlayerPermissionRules,
		leaveGroup: CharacterPlayerPermissionRules,

		setOwner: CharacterPlayerPermissionRules,

		addPlayerFriend: CharacterPlayerPermissionRules,
		removePlayerFriend: CharacterPlayerPermissionRules,

		getPlayersWithDisplayName: CharacterPlayerPermissionRules,

		setRemoveStatus: CharacterPlayerPermissionRules,

		getFriendStatisticsLeaderboardAroundPlayer: CharacterPlayerPermissionRules,
		getFriendStatisticsLeaderboard: CharacterPlayerPermissionRules,

		getCurrencyLeaderboard: CharacterPlayerPermissionRules,
		getCreateLeaderboard: CharacterPlayerPermissionRules,
        getLastLoginLeaderboard: CharacterPlayerPermissionRules,

		getStatisticsLog: CharacterPlayerPermissionRules,
		getCurrencyLog: CharacterPlayerPermissionRules,
	},
	content: {
		getContentData: ContentPermissionRules,
		setContentData: ContentPermissionRules,
		createNewFileUploadInfo: ContentPermissionRules,
		getFileUploadInfo: ContentPermissionRules,
		requestDownloadFileUploadInfo: ContentPermissionRules,
		removeFileUploadInfo: ContentPermissionRules,
		getFileUploadInfoList: ContentPermissionRules,
	},
	group: {
		addSegment: GroupPermissionRules,
		removeSegment: GroupPermissionRules,
		getSegment: GroupPermissionRules,

		setTag: GroupPermissionRules,
		removeTag: GroupPermissionRules,
		getTag: GroupPermissionRules,

		getDisplayName: GroupPermissionRules,
		setDisplayName: GroupPermissionRules,

		getTsCreate: GroupPermissionRules,

		setAvatar: GroupPermissionRules,
		getAvatar: GroupPermissionRules,

		setGroupCurrency: GroupPermissionRules,
		getGroupCurrency: GroupPermissionRules,

		setGroupStatistics: GroupPermissionRules,
		getGroupStatistics: GroupPermissionRules,

		getStatisticsLeaderboard: GroupPermissionRules,
		getStatisticsLeaderboardAroundGroup: GroupPermissionRules,

		getCustomData: GroupPermissionRules,
		setCustomData: GroupPermissionRules,

		setGroupData: GroupPermissionRules,
		getGroupData: GroupPermissionRules,

		getGroupInformation: GroupPermissionRules,

		getGroupsWithSegment: GroupPermissionRules,
		getGroupsWithTag: GroupPermissionRules,

		getCatalogId: GroupPermissionRules,
		getRemoveStatus: GroupPermissionRules,

		getGroupInventory: GroupPermissionRules,
		removeGroupItem: GroupPermissionRules,
		grantGroupItem: GroupPermissionRules,

		getMembers: GroupPermissionRules,

		addMember: GroupPermissionRules,
		removeMember: GroupPermissionRules,
		sendGroupMessage: GroupPermissionRules,
		getGroupMessage: GroupPermissionRules,
		setRemoveStatus: GroupPermissionRules,

		getGroupsWithDisplayName: GroupPermissionRules,

		getCurrencyLeaderboard: GroupPermissionRules,
		getCreateLeaderboard: GroupPermissionRules,

		getStatisticsLog: GroupPermissionRules,
		getCurrencyLog: GroupPermissionRules,
	},
	inventory: {
		addSegment: InventoryPermissionRules,
		removeSegment: InventoryPermissionRules,
		getSegment: InventoryPermissionRules,

		setTag: InventoryPermissionRules,
		removeTag: InventoryPermissionRules,
		getTag: InventoryPermissionRules,

		getDisplayName: InventoryPermissionRules,
		setDisplayName: InventoryPermissionRules,

		getTsCreate: InventoryPermissionRules,

		setAvatar: InventoryPermissionRules,
		getAvatar: InventoryPermissionRules,

		setItemStatistics: InventoryPermissionRules,
		getItemStatistics: InventoryPermissionRules,

		getStatisticsLeaderboard: InventoryPermissionRules,
		getStatisticsLeaderboardAroundItem: InventoryPermissionRules,

		getCustomData: InventoryPermissionRules,
		setCustomData: InventoryPermissionRules,

		setItemData: InventoryPermissionRules,
		getItemData: InventoryPermissionRules,

		getItemInformation: InventoryPermissionRules,

		getItemsWithSegment: InventoryPermissionRules,
		getItemsWithTag: InventoryPermissionRules,

		getCatalogId: InventoryPermissionRules,
		getClassId: InventoryPermissionRules,
		getItemType: InventoryPermissionRules,
		getAmount: InventoryPermissionRules,
		getOwner: InventoryPermissionRules,
		getRemoveStatus: InventoryPermissionRules,

		setAmount: InventoryPermissionRules,
		setOwner: InventoryPermissionRules,

		setRemoveStatus: InventoryPermissionRules,

		getItemsWithDisplayName: InventoryPermissionRules,
		getCreateLeaderboard: InventoryPermissionRules,

		getStatisticsLog: InventoryPermissionRules,
	},
	storeInventory: {
		buyStoreItem: StoreInventoryPermissionRules,
		getStoreItemInformation: StoreInventoryPermissionRules,
		getStoreItemsWithTag: StoreInventoryPermissionRules,
		grantStoreItem: StoreInventoryPermissionRules,
		setRemoveStatus: StoreInventoryPermissionRules,
		setStoreItemInformation: StoreInventoryPermissionRules,
		validateAppleAppStoreReceipt: StoreInventoryPermissionRules,
		validateGooglePlayStoreReceipt: StoreInventoryPermissionRules,
		validateFacebookStoreReceipt: StoreInventoryPermissionRules,
		getCreateLeaderboard: StoreInventoryPermissionRules,
		presentStoreItem: StoreInventoryPermissionRules,
		getStoreLog: StoreInventoryPermissionRules,
        getStoreUsed: StoreInventoryPermissionRules,
        removeStoreUsed: StoreInventoryPermissionRules,
	},
	masterAdmin: {
		setMasterGameSettings: MasterAdminPermissionRules,
		grantAdminAccount: MasterAdminPermissionRules,
		removeAdminAccount: MasterAdminPermissionRules,
		setPasswordAdminAccount: MasterAdminPermissionRules,
		setSecretKeyAdminAccount: MasterAdminPermissionRules,
		setGameInformation: MasterAdminPermissionRules,
		grantGame: MasterAdminPermissionRules,
		changePasswordAdminAccount: MasterAdminPermissionRules,
		getAdminAccountList: MasterAdminPermissionRules,
		getGameInformation: MasterAdminPermissionRules,
		getGameList: MasterAdminPermissionRules,
		getMasterGameSettings: MasterAdminPermissionRules,
		getServerLog: MasterAdminPermissionRules,
		getSecretInfoInformation: MasterAdminPermissionRules,
		getSecretInfoList: MasterAdminPermissionRules,
		grantSecretInfo: MasterAdminPermissionRules,
		setSecretInfoInformation: MasterAdminPermissionRules,
		getUsernameAdminAccount: MasterAdminPermissionRules,
		getAnalytics: MasterAdminPermissionRules,
		getEventCallbackCloudScript: MasterAdminPermissionRules,
		setEventCallbackCloudScript: MasterAdminPermissionRules,
		resetStatisticsLeaderboard: MasterAdminPermissionRules,
		getBackupStatisticsLeaderboardVersion: MasterAdminPermissionRules,
		getServerGameData: MasterAdminPermissionRules,
		deleteInDatabase: MasterAdminPermissionRules,
	},
	multiplayer: {
		cancelAllMatchmakingTicket: MultiplayerPermissionRules,
		cancelMatchmakingTicket: MultiplayerPermissionRules,
		createMatchmakingTicket: MultiplayerPermissionRules,
		getMatch: MultiplayerPermissionRules,
		getMatchmakingTicket: MultiplayerPermissionRules,
		getQueueStatistics: MultiplayerPermissionRules,
		joinMatchmakingTicket: MultiplayerPermissionRules,
		listMatchmakingTicketsForPlayer: MultiplayerPermissionRules,
		getAllMatchmakingTicket: MultiplayerPermissionRules,
		getAllMatch: MultiplayerPermissionRules,
	},
	cloudScript: {
		executeFunction: CloudScriptPermissionRules,
		getFunctions: CloudScriptPermissionRules,
		addFunction: CloudScriptPermissionRules,
		editFunction: CloudScriptPermissionRules,
		getFunction: CloudScriptPermissionRules,
	},
}

abstract class BuilderBase {
	protected secretKey: string;
	protected role: number;
	protected remove: boolean;
	protected tsExpire: number;
	protected permission: SecretPermissionItem;
	protected gameId: string;
	protected isDefault: boolean;
	protected onlyMasterAdmin: boolean;

	public getSecretKey(): string {
		return this.secretKey;
	}

	public getPermission(): SecretPermissionItem {
		return this.permission;
	}

	public getRole(): number {
		return this.role;
	}

	public isRemove(): boolean {
		return this.remove;
	}

	public getTsExpire(): number {
		return this.tsExpire;
	}

	public getGameId(): string {
		return this.gameId;
	}

	public getIsDefault(): boolean {
		return this.isDefault;
	}

	public getIsOnlyMasterAdmin(): boolean {
		return this.onlyMasterAdmin;
	}

	public setSecretKey(secretKey: string): Builder {
		return this as Builder;
	}

	public setPermission(permission: SecretPermissionItem): Builder {
		return this as Builder;
	}

	public setGameId(gameId: string): Builder {
		return this as Builder;
	}

	public setRole(role: number): Builder {
		return this as Builder;
	}

	public setIsRemove(remove: boolean): Builder {
		this.remove = remove;
		return this as Builder;
	}

	public setIsDefault(isDefault: boolean): Builder {
		this.isDefault = isDefault;
		return this as Builder;
	}

	public setIsOnlyMasterAdmin(onlyMasterAdmin: boolean): Builder {
		this.onlyMasterAdmin = onlyMasterAdmin;
		return this as Builder;
	}

	public setTsExpire(tsExpire: number): Builder {
		//this.tsExpire = tsExpire;
		return this as Builder;
	}

	public build(): SecretInfo {
		return null;
	}

	constructor() {

	}

}

class Builder extends BuilderBase implements IBuilder<SecretInfo> {
	public setSecretKey(secretKey: string): Builder {
		this.secretKey = secretKey;
		return this;
	}

	public setRole(role: number): Builder {
		this.role = role;
		return this;
	}

	public setTsExpire(tsExpire: number): Builder {
		this.tsExpire = tsExpire;
		return this;
	}

	public setPermission(permission: SecretPermissionItem): Builder {
		this.permission = permission;
		return this;
	}

	public setGameId(gameId: string): Builder {
		this.gameId = gameId;
		return this as Builder;
	}

	public build(): SecretInfo {
		return new SecretInfo(this);
	}

	constructor() {
		super();
	}

}

export class SecretInfo extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.secretKey = builder.getSecretKey();
		this.role = builder.getRole();
		this.remove = builder.isRemove();
		this.tsExpire = builder.getTsExpire();
		this.permission = builder.getPermission();
		this.gameId = builder.getGameId();
		this.isDefault = builder.getIsDefault();
		this.onlyMasterAdmin = builder.getIsOnlyMasterAdmin();
	}

	public setGameId(gameId: string): Builder {
		this.gameId = gameId;
		return this as Builder;
	}

	public toDocumentData() {
		let doc = {
			"secretKey": this.secretKey,
			"role": this.role,
			"isRemove": this.remove,
			"tsExpire": this.tsExpire,
			"permission": this.permission,
			"gameId": this.gameId,
		} as any;

		if (this.isDefault) doc["isDefault"] = true;
		if (this.onlyMasterAdmin) doc["onlyMasterAdmin"] = true;

		return doc;
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
