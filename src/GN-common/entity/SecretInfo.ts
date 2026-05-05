import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

export enum SecretRole {
	Admin = 1,
	Server = 2,
	Client = 3,
}

export interface PermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface GroupPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface InventoryPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface AuthenticatePermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface MasterPlayerPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface GamePlayerPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface CharacterPlayerPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface ContentPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface DashboardPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface MultiplayerPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface CloudScriptPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface StoreInventoryPermissionRules {
	// Indicates whether self enable.
	selfEnable: boolean;
	// Indicates whether other self enable.
	otherSelfEnable: boolean;
	// Indicates whether admin self enable.
	adminSelfEnable: boolean;
	// Indicates whether server self enable.
	serverSelfEnable: boolean;
}

export interface SecretPermissionItem {
	// Stores the authenticate value used by this contract.
	authenticate: {
		// Stores the login by account value used by this contract.
		loginByAccount: AuthenticatePermissionRules,
		// Stores the login by android device ID value used by this contract.
		loginByAndroidDeviceId: AuthenticatePermissionRules,
		// Stores the login by apple value used by this contract.
		loginByApple: AuthenticatePermissionRules,
		// Stores the login by custom device ID value used by this contract.
		loginByCustomDeviceId: AuthenticatePermissionRules,
		// Stores the login by custom ID value used by this contract.
		loginByCustomId: AuthenticatePermissionRules,
		// Stores the login by facebook value used by this contract.
		loginByFacebook: AuthenticatePermissionRules,
		// Stores the login by generic service value used by this contract.
		loginByGenericService: AuthenticatePermissionRules,
		// Stores the login by google value used by this contract.
		loginByGoogle: AuthenticatePermissionRules,
		// Stores the login by google play game service value used by this contract.
		loginByGooglePlayGameService: AuthenticatePermissionRules,
		// Stores the login by game center value used by this contract.
		loginByGameCenter: AuthenticatePermissionRules,
		// Stores the login byi OS device ID value used by this contract.
		loginByiOSDeviceId: AuthenticatePermissionRules,
		// Stores the login by windows phone device ID value used by this contract.
		loginByWindowsPhoneDeviceId: AuthenticatePermissionRules,
		// Stores the register account value used by this contract.
		registerAccount: AuthenticatePermissionRules,
		// Stores the login by editor device ID value used by this contract.
		loginByEditorDeviceId: AuthenticatePermissionRules,
		// Stores the login by linux device ID value used by this contract.
		loginByLinuxDeviceId: AuthenticatePermissionRules,
		// Stores the login by mac OS device ID value used by this contract.
		loginByMacOSDeviceId: AuthenticatePermissionRules,
		// Stores the login by windows device ID value used by this contract.
		loginByWindowsDeviceId: AuthenticatePermissionRules,
		// Stores the refresh auth token value used by this contract.
		refreshAuthToken: AuthenticatePermissionRules,
	},
	// Stores the master player value used by this contract.
	masterPlayer: {
		// Stores the link account value used by this contract.
		linkAccount: MasterPlayerPermissionRules,
		// Stores the link android device ID value used by this contract.
		linkAndroidDeviceId: MasterPlayerPermissionRules,
		// Stores the link apple value used by this contract.
		linkApple: MasterPlayerPermissionRules,
		// Stores the link custom device ID value used by this contract.
		linkCustomDeviceId: MasterPlayerPermissionRules,
		// Stores the link custom ID value used by this contract.
		linkCustomId: MasterPlayerPermissionRules,
		// Stores the link editor device ID value used by this contract.
		linkEditorDeviceId: MasterPlayerPermissionRules,
		// Stores the link facebook value used by this contract.
		linkFacebook: MasterPlayerPermissionRules,
		// Stores the link generic service value used by this contract.
		linkGenericService: MasterPlayerPermissionRules,
		// Stores the link google value used by this contract.
		linkGoogle: MasterPlayerPermissionRules,
		// Stores the linki OS device ID value used by this contract.
		linkiOSDeviceId: MasterPlayerPermissionRules,
		// Stores the link linux device ID value used by this contract.
		linkLinuxDeviceId: MasterPlayerPermissionRules,
		// Stores the link mac OS device ID value used by this contract.
		linkMacOSDeviceId: MasterPlayerPermissionRules,
		// Stores the link windows device ID value used by this contract.
		linkWindowsDeviceId: MasterPlayerPermissionRules,
		// Stores the link windows phone device ID value used by this contract.
		linkWindowsPhoneDeviceId: MasterPlayerPermissionRules,
		// Stores the link google play game service value used by this contract.
		linkGooglePlayGameService: MasterPlayerPermissionRules,
		// Stores the link game center value used by this contract.
		linkGameCenter: MasterPlayerPermissionRules,

		// Stores the unlink account value used by this contract.
		unlinkAccount: MasterPlayerPermissionRules,
		// Stores the unlink android device ID value used by this contract.
		unlinkAndroidDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink apple value used by this contract.
		unlinkApple: MasterPlayerPermissionRules,
		// Stores the unlink custom device ID value used by this contract.
		unlinkCustomDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink custom ID value used by this contract.
		unlinkCustomId: MasterPlayerPermissionRules,
		// Stores the unlink editor device ID value used by this contract.
		unlinkEditorDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink facebook value used by this contract.
		unlinkFacebook: MasterPlayerPermissionRules,
		// Stores the unlink generic service value used by this contract.
		unlinkGenericService: MasterPlayerPermissionRules,
		// Stores the unlink google value used by this contract.
		unlinkGoogle: MasterPlayerPermissionRules,
		// Stores the unlinki OS device ID value used by this contract.
		unlinkiOSDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink linux device ID value used by this contract.
		unlinkLinuxDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink mac OS device ID value used by this contract.
		unlinkMacOSDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink windows device ID value used by this contract.
		unlinkWindowsDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink windows phone device ID value used by this contract.
		unlinkWindowsPhoneDeviceId: MasterPlayerPermissionRules,
		// Stores the unlink google play game service value used by this contract.
		unlinkGooglePlayGameService: MasterPlayerPermissionRules,
		// Stores the unlink game center value used by this contract.
		unlinkGameCenter: MasterPlayerPermissionRules,

		// Stores the add segment value used by this contract.
		addSegment: MasterPlayerPermissionRules,
		// Stores the remove segment value used by this contract.
		removeSegment: MasterPlayerPermissionRules,
		// Stores the get segment value used by this contract.
		getSegment: MasterPlayerPermissionRules,

		// Stores the set tag value used by this contract.
		setTag: MasterPlayerPermissionRules,
		// Stores the remove tag value used by this contract.
		removeTag: MasterPlayerPermissionRules,
		// Stores the get tag value used by this contract.
		getTag: MasterPlayerPermissionRules,

		// Stores the get display name value used by this contract.
		getDisplayName: MasterPlayerPermissionRules,
		// Stores the set display name value used by this contract.
		setDisplayName: MasterPlayerPermissionRules,

		// Stores the get timestamp create value used by this contract.
		getTsCreate: MasterPlayerPermissionRules,
		// Stores the get IP address create value used by this contract.
		getIpAddressCreate: MasterPlayerPermissionRules,

		// Stores the set timestamp last login value used by this contract.
		updateTsLastLogin: MasterPlayerPermissionRules,
		// Stores the get timestamp last login value used by this contract.
		getTsLastLogin: MasterPlayerPermissionRules,

		// Stores the set player ban value used by this contract.
		setPlayerBan: MasterPlayerPermissionRules,
		// Stores the get player ban value used by this contract.
		getPlayerBan: MasterPlayerPermissionRules,

		// Stores the set country code value used by this contract.
		setCountryCode: MasterPlayerPermissionRules,
		// Stores the get country code value used by this contract.
		getCountryCode: MasterPlayerPermissionRules,

		// Stores the change account password value used by this contract.
		changeAccountPassword: MasterPlayerPermissionRules,
		// Stores the reset account password value used by this contract.
		resetAccountPassword: MasterPlayerPermissionRules,

		// Stores the set avatar value used by this contract.
		setAvatar: MasterPlayerPermissionRules,
		// Stores the get avatar value used by this contract.
		getAvatar: MasterPlayerPermissionRules,

		// Stores the change player currency value used by this contract.
		changePlayerCurrency: MasterPlayerPermissionRules,
		// Stores the get player currency value used by this contract.
		getPlayerCurrency: MasterPlayerPermissionRules,

		// Stores the change player statistics value used by this contract.
		changePlayerStatistics: MasterPlayerPermissionRules,
		// Stores the get player statistics value used by this contract.
		getPlayerStatistics: MasterPlayerPermissionRules,

		// Stores the get statistics leaderboard value used by this contract.
		getStatisticsLeaderboard: MasterPlayerPermissionRules,
		// Stores the get statistics leaderboard around player value used by this contract.
		getStatisticsLeaderboardAroundPlayer: MasterPlayerPermissionRules,

		// Stores the get custom data value used by this contract.
		getCustomData: MasterPlayerPermissionRules,
		// Stores the set custom data value used by this contract.
		setCustomData: MasterPlayerPermissionRules,

		// Stores the set player data value used by this contract.
		setPlayerData: MasterPlayerPermissionRules,
		// Stores the get player data value used by this contract.
		getPlayerData: MasterPlayerPermissionRules,

		// Stores the get player information value used by this contract.
		getPlayerInformation: MasterPlayerPermissionRules,

		// Stores the get players with apple value used by this contract.
		getPlayersWithApple: MasterPlayerPermissionRules,
		// Stores the get players with facebook value used by this contract.
		getPlayersWithFacebook: MasterPlayerPermissionRules,
		// Stores the get players with google value used by this contract.
		getPlayersWithGoogle: MasterPlayerPermissionRules,
		// Stores the get players with generic service value used by this contract.
		getPlayersWithGenericService: MasterPlayerPermissionRules,
		// Stores the get players with segment value used by this contract.
		getPlayersWithSegment: MasterPlayerPermissionRules,
		// Stores the get players with tag value used by this contract.
		getPlayersWithTag: MasterPlayerPermissionRules,
		// Stores the get players with google play game service value used by this contract.
		getPlayersWithGooglePlayGameService: MasterPlayerPermissionRules,
		// Stores the get players with game center value used by this contract.
		getPlayersWithGameCenter: MasterPlayerPermissionRules,

		// Stores the get external value used by this contract.
		getExternal: MasterPlayerPermissionRules,

		// Stores the get players with display name value used by this contract.
		getPlayersWithDisplayName: MasterPlayerPermissionRules,

		// Stores the set email value used by this contract.
		setEmail: MasterPlayerPermissionRules,
		// Stores the get email value used by this contract.
		getEmail: MasterPlayerPermissionRules,

		// Stores the get currency leaderboard value used by this contract.
		getCurrencyLeaderboard: MasterPlayerPermissionRules,
		// Stores the get create leaderboard value used by this contract.
		getCreateLeaderboard: MasterPlayerPermissionRules,
		// Stores the get last login leaderboard value used by this contract.
		getLastLoginLeaderboard: MasterPlayerPermissionRules,

		// Stores the get statistics log value used by this contract.
		getStatisticsLog: MasterPlayerPermissionRules,
		// Stores the get currency log value used by this contract.
		getCurrencyLog: MasterPlayerPermissionRules,

		// Stores the send socket operation event value used by this contract.
		sendSocketOperationEvent: MasterPlayerPermissionRules,
		// Stores the send email value used by this contract.
		sendEmail: MasterPlayerPermissionRules,
		// Stores the send push notification value used by this contract.
		sendPushNotification: MasterPlayerPermissionRules,
		// Stores the get push notification value used by this contract.
		getPushNotification: MasterPlayerPermissionRules,
		// Stores the add push notification value used by this contract.
		addPushNotification: MasterPlayerPermissionRules,
		// Stores the remove push notification value used by this contract.
		removePushNotification: MasterPlayerPermissionRules,

	},
	// Stores the game player value used by this contract.
	gamePlayer: {
		// Stores the add segment value used by this contract.
		addSegment: GamePlayerPermissionRules,
		// Stores the remove segment value used by this contract.
		removeSegment: GamePlayerPermissionRules,
		// Stores the get segment value used by this contract.
		getSegment: GamePlayerPermissionRules,

		// Stores the set tag value used by this contract.
		setTag: GamePlayerPermissionRules,
		// Stores the remove tag value used by this contract.
		removeTag: GamePlayerPermissionRules,
		// Stores the get tag value used by this contract.
		getTag: GamePlayerPermissionRules,

		// Stores the get display name value used by this contract.
		getDisplayName: GamePlayerPermissionRules,
		// Stores the set display name value used by this contract.
		setDisplayName: GamePlayerPermissionRules,

		// Stores the get timestamp create value used by this contract.
		getTsCreate: GamePlayerPermissionRules,
		// Stores the get IP address create value used by this contract.
		getIpAddressCreate: GamePlayerPermissionRules,
		// Stores the get timestamp last login value used by this contract.
		getTsLastLogin: GamePlayerPermissionRules,

		// Stores the set player ban value used by this contract.
		setPlayerBan: GamePlayerPermissionRules,
		// Stores the get player ban value used by this contract.
		getPlayerBan: GamePlayerPermissionRules,

		// Stores the set country code value used by this contract.
		setCountryCode: GamePlayerPermissionRules,
		// Stores the get country code value used by this contract.
		getCountryCode: GamePlayerPermissionRules,

		// Stores the set avatar value used by this contract.
		setAvatar: GamePlayerPermissionRules,
		// Stores the get avatar value used by this contract.
		getAvatar: GamePlayerPermissionRules,

		// Stores the change player currency value used by this contract.
		changePlayerCurrency: GamePlayerPermissionRules,
		// Stores the get player currency value used by this contract.
		getPlayerCurrency: GamePlayerPermissionRules,

		// Stores the change player statistics value used by this contract.
		changePlayerStatistics: GamePlayerPermissionRules,
		// Stores the get player statistics value used by this contract.
		getPlayerStatistics: GamePlayerPermissionRules,

		// Stores the get statistics leaderboard value used by this contract.
		getStatisticsLeaderboard: GamePlayerPermissionRules,
		// Stores the get statistics leaderboard around player value used by this contract.
		getStatisticsLeaderboardAroundPlayer: GamePlayerPermissionRules,

		// Stores the get custom data value used by this contract.
		getCustomData: GamePlayerPermissionRules,
		// Stores the set custom data value used by this contract.
		setCustomData: GamePlayerPermissionRules,

		// Stores the set player data value used by this contract.
		setPlayerData: GamePlayerPermissionRules,
		// Stores the get player data value used by this contract.
		getPlayerData: GamePlayerPermissionRules,

		// Stores the get player information value used by this contract.
		getPlayerInformation: GamePlayerPermissionRules,

		// Stores the get players with segment value used by this contract.
		getPlayersWithSegment: GamePlayerPermissionRules,
		// Stores the get players with tag value used by this contract.
		getPlayersWithTag: GamePlayerPermissionRules,

		// Stores the get player character value used by this contract.
		getPlayerCharacter: GamePlayerPermissionRules,
		// Stores the get player inventory value used by this contract.
		getPlayerInventory: GamePlayerPermissionRules,
		// Stores the get player group value used by this contract.
		getPlayerGroup: GamePlayerPermissionRules,
		// Stores the get player friend value used by this contract.
		getPlayerFriend: GamePlayerPermissionRules,

		// Stores the remove player item value used by this contract.
		removePlayerItem: GamePlayerPermissionRules,

		// Stores the get online status value used by this contract.
		getOnlineStatus: GamePlayerPermissionRules,
		// Stores the create group value used by this contract.
		createGroup: GamePlayerPermissionRules,
		// Stores the create player item value used by this contract.
		createPlayerItem: GamePlayerPermissionRules,
		// Stores the create player character value used by this contract.
		createPlayerCharacter: GamePlayerPermissionRules,

		// Stores the add player friend value used by this contract.
		addPlayerFriend: GamePlayerPermissionRules,
		// Stores the remove player friend value used by this contract.
		removePlayerFriend: GamePlayerPermissionRules,

		// Stores the remove player character value used by this contract.
		removePlayerCharacter: GamePlayerPermissionRules,

		// Stores the join group value used by this contract.
		joinGroup: GamePlayerPermissionRules,
		// Stores the leave group value used by this contract.
		leaveGroup: GamePlayerPermissionRules,

		// Stores the get players with display name value used by this contract.
		getPlayersWithDisplayName: GamePlayerPermissionRules,

		// Stores the get friend statistics leaderboard around player value used by this contract.
		getFriendStatisticsLeaderboardAroundPlayer: GamePlayerPermissionRules,
		// Stores the get friend statistics leaderboard value used by this contract.
		getFriendStatisticsLeaderboard: GamePlayerPermissionRules,

		// Stores the get currency leaderboard value used by this contract.
		getCurrencyLeaderboard: GamePlayerPermissionRules,
		// Stores the get create leaderboard value used by this contract.
		getCreateLeaderboard: GamePlayerPermissionRules,
		// Stores the get last login leaderboard value used by this contract.
		getLastLoginLeaderboard: GamePlayerPermissionRules,

		// Stores the get statistics log value used by this contract.
		getStatisticsLog: GamePlayerPermissionRules,
		// Stores the get currency log value used by this contract.
		getCurrencyLog: GamePlayerPermissionRules,
	},
	// Stores the character player value used by this contract.
	characterPlayer: {
		// Stores the add segment value used by this contract.
		addSegment: CharacterPlayerPermissionRules,
		// Stores the remove segment value used by this contract.
		removeSegment: CharacterPlayerPermissionRules,
		// Stores the get segment value used by this contract.
		getSegment: CharacterPlayerPermissionRules,

		// Stores the set tag value used by this contract.
		setTag: CharacterPlayerPermissionRules,
		// Stores the remove tag value used by this contract.
		removeTag: CharacterPlayerPermissionRules,
		// Stores the get tag value used by this contract.
		getTag: CharacterPlayerPermissionRules,

		// Stores the get display name value used by this contract.
		getDisplayName: CharacterPlayerPermissionRules,
		// Stores the set display name value used by this contract.
		setDisplayName: CharacterPlayerPermissionRules,

		// Stores the get timestamp create value used by this contract.
		getTsCreate: CharacterPlayerPermissionRules,
		// Stores the get IP address create value used by this contract.
		getIpAddressCreate: CharacterPlayerPermissionRules,
		// Stores the get timestamp last login value used by this contract.
		getTsLastLogin: CharacterPlayerPermissionRules,

		// Stores the set player ban value used by this contract.
		setPlayerBan: CharacterPlayerPermissionRules,
		// Stores the get player ban value used by this contract.
		getPlayerBan: CharacterPlayerPermissionRules,

		// Stores the set country code value used by this contract.
		setCountryCode: CharacterPlayerPermissionRules,
		// Stores the get country code value used by this contract.
		getCountryCode: CharacterPlayerPermissionRules,

		// Stores the set avatar value used by this contract.
		setAvatar: CharacterPlayerPermissionRules,
		// Stores the get avatar value used by this contract.
		getAvatar: CharacterPlayerPermissionRules,

		// Stores the change player currency value used by this contract.
		changePlayerCurrency: CharacterPlayerPermissionRules,
		// Stores the get player currency value used by this contract.
		getPlayerCurrency: CharacterPlayerPermissionRules,

		// Stores the change player statistics value used by this contract.
		changePlayerStatistics: CharacterPlayerPermissionRules,
		// Stores the get player statistics value used by this contract.
		getPlayerStatistics: CharacterPlayerPermissionRules,

		// Stores the get statistics leaderboard value used by this contract.
		getStatisticsLeaderboard: CharacterPlayerPermissionRules,
		// Stores the get statistics leaderboard around player value used by this contract.
		getStatisticsLeaderboardAroundPlayer: CharacterPlayerPermissionRules,

		// Stores the get custom data value used by this contract.
		getCustomData: CharacterPlayerPermissionRules,
		// Stores the set custom data value used by this contract.
		setCustomData: CharacterPlayerPermissionRules,

		// Stores the set player data value used by this contract.
		setPlayerData: CharacterPlayerPermissionRules,
		// Stores the get player data value used by this contract.
		getPlayerData: CharacterPlayerPermissionRules,

		// Stores the get player information value used by this contract.
		getPlayerInformation: CharacterPlayerPermissionRules,

		// Stores the get players with segment value used by this contract.
		getPlayersWithSegment: CharacterPlayerPermissionRules,
		// Stores the get players with tag value used by this contract.
		getPlayersWithTag: CharacterPlayerPermissionRules,

		// Stores the get catalog ID value used by this contract.
		getCatalogId: CharacterPlayerPermissionRules,
		// Stores the get owner value used by this contract.
		getOwner: CharacterPlayerPermissionRules,
		// Stores the get remove status value used by this contract.
		getRemoveStatus: CharacterPlayerPermissionRules,

		// Stores the get player friend value used by this contract.
		getPlayerFriend: CharacterPlayerPermissionRules,
		// Stores the get player group value used by this contract.
		getPlayerGroup: CharacterPlayerPermissionRules,
		// Stores the get player inventory value used by this contract.
		getPlayerInventory: CharacterPlayerPermissionRules,
		// Stores the remove player item value used by this contract.
		removePlayerItem: CharacterPlayerPermissionRules,
		// Stores the create player item value used by this contract.
		createPlayerItem: CharacterPlayerPermissionRules,

		// Stores the create group value used by this contract.
		createGroup: CharacterPlayerPermissionRules,
		// Stores the join group value used by this contract.
		joinGroup: CharacterPlayerPermissionRules,
		// Stores the leave group value used by this contract.
		leaveGroup: CharacterPlayerPermissionRules,

		// Stores the set owner value used by this contract.
		setOwner: CharacterPlayerPermissionRules,

		// Stores the add player friend value used by this contract.
		addPlayerFriend: CharacterPlayerPermissionRules,
		// Stores the remove player friend value used by this contract.
		removePlayerFriend: CharacterPlayerPermissionRules,

		// Stores the get players with display name value used by this contract.
		getPlayersWithDisplayName: CharacterPlayerPermissionRules,

		// Stores the set remove status value used by this contract.
		setRemoveStatus: CharacterPlayerPermissionRules,

		// Stores the get friend statistics leaderboard around player value used by this contract.
		getFriendStatisticsLeaderboardAroundPlayer: CharacterPlayerPermissionRules,
		// Stores the get friend statistics leaderboard value used by this contract.
		getFriendStatisticsLeaderboard: CharacterPlayerPermissionRules,

		// Stores the get currency leaderboard value used by this contract.
		getCurrencyLeaderboard: CharacterPlayerPermissionRules,
		// Stores the get create leaderboard value used by this contract.
		getCreateLeaderboard: CharacterPlayerPermissionRules,
		// Stores the get last login leaderboard value used by this contract.
		getLastLoginLeaderboard: CharacterPlayerPermissionRules,

		// Stores the get statistics log value used by this contract.
		getStatisticsLog: CharacterPlayerPermissionRules,
		// Stores the get currency log value used by this contract.
		getCurrencyLog: CharacterPlayerPermissionRules,
	},
	// Stores the content value used by this contract.
	content: {
		// Stores the get content data value used by this contract.
		getContentData: ContentPermissionRules,
		// Stores the set content data value used by this contract.
		setContentData: ContentPermissionRules,
		// Stores the create new file upload info value used by this contract.
		createNewFileUploadInfo: ContentPermissionRules,
		// Stores the get file upload info value used by this contract.
		getFileUploadInfo: ContentPermissionRules,
		// Stores the request download file upload info value used by this contract.
		requestDownloadFileUploadInfo: ContentPermissionRules,
		// Stores the remove file upload info value used by this contract.
		removeFileUploadInfo: ContentPermissionRules,
		// Stores the get file upload info list value used by this contract.
		getFileUploadInfoList: ContentPermissionRules,
	},
	// Stores the group value used by this contract.
	group: {
		// Stores the add segment value used by this contract.
		addSegment: GroupPermissionRules,
		// Stores the remove segment value used by this contract.
		removeSegment: GroupPermissionRules,
		// Stores the get segment value used by this contract.
		getSegment: GroupPermissionRules,

		// Stores the set tag value used by this contract.
		setTag: GroupPermissionRules,
		// Stores the remove tag value used by this contract.
		removeTag: GroupPermissionRules,
		// Stores the get tag value used by this contract.
		getTag: GroupPermissionRules,

		// Stores the get display name value used by this contract.
		getDisplayName: GroupPermissionRules,
		// Stores the set display name value used by this contract.
		setDisplayName: GroupPermissionRules,

		// Stores the get timestamp create value used by this contract.
		getTsCreate: GroupPermissionRules,

		// Stores the set avatar value used by this contract.
		setAvatar: GroupPermissionRules,
		// Stores the get avatar value used by this contract.
		getAvatar: GroupPermissionRules,

		// Stores the change group currency value used by this contract.
		changeGroupCurrency: GroupPermissionRules,
		// Stores the get group currency value used by this contract.
		getGroupCurrency: GroupPermissionRules,

		// Stores the change group statistics value used by this contract.
		changeGroupStatistics: GroupPermissionRules,
		// Stores the get group statistics value used by this contract.
		getGroupStatistics: GroupPermissionRules,

		// Stores the get statistics leaderboard value used by this contract.
		getStatisticsLeaderboard: GroupPermissionRules,
		// Stores the get statistics leaderboard around group value used by this contract.
		getStatisticsLeaderboardAroundGroup: GroupPermissionRules,

		// Stores the get custom data value used by this contract.
		getCustomData: GroupPermissionRules,
		// Stores the set custom data value used by this contract.
		setCustomData: GroupPermissionRules,

		// Stores the set group data value used by this contract.
		setGroupData: GroupPermissionRules,
		// Stores the get group data value used by this contract.
		getGroupData: GroupPermissionRules,

		// Stores the get group information value used by this contract.
		getGroupInformation: GroupPermissionRules,

		// Stores the get groups with segment value used by this contract.
		getGroupsWithSegment: GroupPermissionRules,
		// Stores the get groups with tag value used by this contract.
		getGroupsWithTag: GroupPermissionRules,

		// Stores the get catalog ID value used by this contract.
		getCatalogId: GroupPermissionRules,
		// Stores the get remove status value used by this contract.
		getRemoveStatus: GroupPermissionRules,

		// Stores the get group inventory value used by this contract.
		getGroupInventory: GroupPermissionRules,
		// Stores the remove group item value used by this contract.
		removeGroupItem: GroupPermissionRules,
		// Stores the create group item value used by this contract.
		createGroupItem: GroupPermissionRules,

		// Stores the get members value used by this contract.
		getMembers: GroupPermissionRules,

		// Stores the add member value used by this contract.
		addMember: GroupPermissionRules,
		// Stores the remove member value used by this contract.
		removeMember: GroupPermissionRules,
		// Stores the send group message value used by this contract.
		sendGroupMessage: GroupPermissionRules,
		// Stores the get group message value used by this contract.
		getGroupMessage: GroupPermissionRules,
		// Stores the set remove status value used by this contract.
		setRemoveStatus: GroupPermissionRules,

		// Stores the get groups with display name value used by this contract.
		getGroupsWithDisplayName: GroupPermissionRules,

		// Stores the get currency leaderboard value used by this contract.
		getCurrencyLeaderboard: GroupPermissionRules,
		// Stores the get create leaderboard value used by this contract.
		getCreateLeaderboard: GroupPermissionRules,

		// Stores the get statistics log value used by this contract.
		getStatisticsLog: GroupPermissionRules,
		// Stores the get currency log value used by this contract.
		getCurrencyLog: GroupPermissionRules,
	},
	// Stores the inventory value used by this contract.
	inventory: {
		// Stores the add segment value used by this contract.
		addSegment: InventoryPermissionRules,
		// Stores the remove segment value used by this contract.
		removeSegment: InventoryPermissionRules,
		// Stores the get segment value used by this contract.
		getSegment: InventoryPermissionRules,

		// Stores the set tag value used by this contract.
		setTag: InventoryPermissionRules,
		// Stores the remove tag value used by this contract.
		removeTag: InventoryPermissionRules,
		// Stores the get tag value used by this contract.
		getTag: InventoryPermissionRules,

		// Stores the get display name value used by this contract.
		getDisplayName: InventoryPermissionRules,
		// Stores the set display name value used by this contract.
		setDisplayName: InventoryPermissionRules,

		// Stores the get timestamp create value used by this contract.
		getTsCreate: InventoryPermissionRules,

		// Stores the set avatar value used by this contract.
		setAvatar: InventoryPermissionRules,
		// Stores the get avatar value used by this contract.
		getAvatar: InventoryPermissionRules,

		// Stores the change item statistics value used by this contract.
		changeItemStatistics: InventoryPermissionRules,
		// Stores the get item statistics value used by this contract.
		getItemStatistics: InventoryPermissionRules,

		// Stores the get statistics leaderboard value used by this contract.
		getStatisticsLeaderboard: InventoryPermissionRules,
		// Stores the get statistics leaderboard around item value used by this contract.
		getStatisticsLeaderboardAroundItem: InventoryPermissionRules,

		// Stores the get custom data value used by this contract.
		getCustomData: InventoryPermissionRules,
		// Stores the set custom data value used by this contract.
		setCustomData: InventoryPermissionRules,

		// Stores the set item data value used by this contract.
		setItemData: InventoryPermissionRules,
		// Stores the get item data value used by this contract.
		getItemData: InventoryPermissionRules,

		// Stores the get item information value used by this contract.
		getItemInformation: InventoryPermissionRules,

		// Stores the get items with segment value used by this contract.
		getItemsWithSegment: InventoryPermissionRules,
		// Stores the get items with tag value used by this contract.
		getItemsWithTag: InventoryPermissionRules,

		// Stores the get catalog ID value used by this contract.
		getCatalogId: InventoryPermissionRules,
		// Stores the get class ID value used by this contract.
		getClassId: InventoryPermissionRules,
		// Stores the get item type value used by this contract.
		getItemType: InventoryPermissionRules,
		// Stores the get amount value used by this contract.
		getAmount: InventoryPermissionRules,
		// Stores the get owner value used by this contract.
		getOwner: InventoryPermissionRules,
		// Stores the get remove status value used by this contract.
		getRemoveStatus: InventoryPermissionRules,

		// Stores the set amount value used by this contract.
		setAmount: InventoryPermissionRules,
		// Stores the set owner value used by this contract.
		setOwner: InventoryPermissionRules,

		// Stores the set remove status value used by this contract.
		setRemoveStatus: InventoryPermissionRules,

		// Stores the get items with display name value used by this contract.
		getItemsWithDisplayName: InventoryPermissionRules,
		// Stores the get create leaderboard value used by this contract.
		getCreateLeaderboard: InventoryPermissionRules,

		// Stores the get statistics log value used by this contract.
		getStatisticsLog: InventoryPermissionRules,
	},
	// Stores the store inventory value used by this contract.
	storeInventory: {
		// Stores the buy store item value used by this contract.
		buyStoreItem: StoreInventoryPermissionRules,
		// Stores the get store item information value used by this contract.
		getStoreItemInformation: StoreInventoryPermissionRules,
		// Stores the get store items with tag value used by this contract.
		getStoreItemsWithTag: StoreInventoryPermissionRules,
		// Stores the create store item value used by this contract.
		createStoreItem: StoreInventoryPermissionRules,
		// Stores the set remove status value used by this contract.
		setRemoveStatus: StoreInventoryPermissionRules,
		// Stores the set store item information value used by this contract.
		setStoreItemInformation: StoreInventoryPermissionRules,
		// Stores the validate apple app store receipt value used by this contract.
		validateAppleAppStoreReceipt: StoreInventoryPermissionRules,
		// Stores the validate google play store receipt value used by this contract.
		validateGooglePlayStoreReceipt: StoreInventoryPermissionRules,
		// Stores the validate facebook store receipt value used by this contract.
		validateFacebookStoreReceipt: StoreInventoryPermissionRules,
		// Stores the get create leaderboard value used by this contract.
		getCreateLeaderboard: StoreInventoryPermissionRules,
		// Stores the present store item value used by this contract.
		presentStoreItem: StoreInventoryPermissionRules,
		// Stores the get store log value used by this contract.
		getStoreLog: StoreInventoryPermissionRules,
		// Stores the get store used value used by this contract.
		getStoreUsed: StoreInventoryPermissionRules,
		// Stores the remove store used value used by this contract.
		removeStoreUsed: StoreInventoryPermissionRules,
	},
	// Stores the master admin value used by this contract.
	dashboard: {
		// Stores the set master game settings value used by this contract.
		setMasterGameSettings: DashboardPermissionRules,
		// Stores the create admin account value used by this contract.
		createAdminAccount: DashboardPermissionRules,
		// Stores the remove admin account value used by this contract.
		removeAdminAccount: DashboardPermissionRules,
		// Stores the set password admin account value used by this contract.
		setPasswordAdminAccount: DashboardPermissionRules,
		// Stores the set secret key admin account value used by this contract.
		setSecretKeyAdminAccount: DashboardPermissionRules,
		// Stores the set game information value used by this contract.
		setGameInformation: DashboardPermissionRules,
		// Stores the create game value used by this contract.
		createGame: DashboardPermissionRules,
		// Stores the change password admin account value used by this contract.
		changePasswordAdminAccount: DashboardPermissionRules,
		// Stores the get admin account list value used by this contract.
		getAdminAccountList: DashboardPermissionRules,
		// Stores the get game information value used by this contract.
		getGameInformation: DashboardPermissionRules,
		// Stores the get game list value used by this contract.
		getGameList: DashboardPermissionRules,
		// Stores the get master game settings value used by this contract.
		getMasterGameSettings: DashboardPermissionRules,
		// Stores the get server log value used by this contract.
		getServerLog: DashboardPermissionRules,
		// Stores the get secret info information value used by this contract.
		getSecretInfoInformation: DashboardPermissionRules,
		// Stores the get secret info list value used by this contract.
		getSecretInfoList: DashboardPermissionRules,
		// Stores the create secret info value used by this contract.
		createSecretInfo: DashboardPermissionRules,
		// Stores the set secret info information value used by this contract.
		setSecretInfoInformation: DashboardPermissionRules,
		// Stores the get username admin account value used by this contract.
		getUsernameAdminAccount: DashboardPermissionRules,
		// Stores the get analytics value used by this contract.
		getAnalytics: DashboardPermissionRules,
		// Stores the get event callback cloud script value used by this contract.
		getEventCallbackCloudScript: DashboardPermissionRules,
		// Stores the set event callback cloud script value used by this contract.
		setEventCallbackCloudScript: DashboardPermissionRules,
		// Stores the reset statistics leaderboard value used by this contract.
		resetStatisticsLeaderboard: DashboardPermissionRules,
		// Stores the get backup statistics leaderboard version value used by this contract.
		getBackupStatisticsLeaderboardVersion: DashboardPermissionRules,
		// Stores the get server game data value used by this contract.
		getServerGameData: DashboardPermissionRules,
		// Stores the delete in database value used by this contract.
		deleteInDatabase: DashboardPermissionRules,
	},
	// Stores the multiplayer value used by this contract.
	multiplayer: {
		// Indicates whether cel all matchmaking ticket can be performed.
		cancelAllMatchmakingTicket: MultiplayerPermissionRules,
		// Indicates whether cel matchmaking ticket can be performed.
		cancelMatchmakingTicket: MultiplayerPermissionRules,
		// Stores the create matchmaking ticket value used by this contract.
		createMatchmakingTicket: MultiplayerPermissionRules,
		// Stores the get match value used by this contract.
		getMatch: MultiplayerPermissionRules,
		// Stores the get matchmaking ticket value used by this contract.
		getMatchmakingTicket: MultiplayerPermissionRules,
		// Stores the get queue statistics value used by this contract.
		getQueueStatistics: MultiplayerPermissionRules,
		// Stores the join matchmaking ticket value used by this contract.
		joinMatchmakingTicket: MultiplayerPermissionRules,
		// Stores the list matchmaking tickets for player value used by this contract.
		listMatchmakingTicketsForPlayer: MultiplayerPermissionRules,
		// Stores the get all matchmaking ticket value used by this contract.
		getAllMatchmakingTicket: MultiplayerPermissionRules,
		// Stores the get all match value used by this contract.
		getAllMatch: MultiplayerPermissionRules,
	},
	// Stores the cloud script value used by this contract.
	cloudScript: {
		// Stores the execute function value used by this contract.
		executeFunction: CloudScriptPermissionRules,
		// Stores the get functions value used by this contract.
		getFunctions: CloudScriptPermissionRules,
		// Stores the add function value used by this contract.
		addFunction: CloudScriptPermissionRules,
		// Stores the edit function value used by this contract.
		editFunction: CloudScriptPermissionRules,
		// Stores the get function value used by this contract.
		getFunction: CloudScriptPermissionRules,
	},
}

abstract class BuilderBase {
	// Stores the secret key value used by this instance.
	protected secretKey: string;
	// Indicates whether remove.
	protected remove: boolean;
	// Stores the timestamp expire value used by this instance.
	protected tsExpire: number;
	// Stores the description value used by this instance.
	protected description: string;
	// Stores the permission value used by this instance.
	protected permission: SecretPermissionItem;
	// Stores the game ID value used by this instance.
	protected gameId: string;
	// Indicates whether default.
	protected isDefault: boolean;
	// Indicates whether only master admin should be allowed.
	protected onlyMasterAdmin: boolean;

	/**
	 * Returns the secret key.
	 * @returns Returns the secret key.
	 */
	public getSecretKey(): string {
		return this.secretKey;
	}

	/**
	 * Returns the permission.
	 * @returns Returns the permission.
	 */
	public getPermission(): SecretPermissionItem {
		return this.permission;
	}

	/**
	 * Checks whether remove.
	 * @returns Returns the operation result.
	 */
	public isRemove(): boolean {
		return this.remove;
	}

	/**
	 * Returns the timestamp expire.
	 * @returns Returns the timestamp expire.
	 */
	public getTsExpire(): number {
		return this.tsExpire;
	}

	/**
	 * Returns the description.
	 * @returns Returns the description.
	 */
	public getDescription(): string {
		return this.description;
	}

	/**
	 * Returns the game ID.
	 * @returns Returns the game ID.
	 */
	public getGameId(): string {
		return this.gameId;
	}

	/**
	 * Returns whether default.
	 * @returns Returns whether default.
	 */
	public getIsDefault(): boolean {
		return this.isDefault;
	}

	/**
	 * Returns whether only master admin.
	 * @returns Returns whether only master admin.
	 */
	public getIsOnlyMasterAdmin(): boolean {
		return this.onlyMasterAdmin;
	}

	/**
	 * Sets the secret key.
	 * @param secretKey Provides the secret key value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSecretKey(secretKey: string): Builder {
		return this as Builder;
	}

	/**
	 * Sets the permission.
	 * @param permission Provides the permission value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setPermission(permission: SecretPermissionItem): Builder {
		return this as Builder;
	}

	/**
	 * Sets the game ID.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setGameId(gameId: string): Builder {
		return this as Builder;
	}

	/**
	 * Sets whether remove.
	 * @param remove Provides the remove value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setIsRemove(remove: boolean): Builder {
		this.remove = remove;
		return this as Builder;
	}

	/**
	 * Sets whether default.
	 * @param isDefault Indicates whether default.
	 * @returns Returns the current builder instance.
	 */
	public setIsDefault(isDefault: boolean): Builder {
		this.isDefault = isDefault;
		return this as Builder;
	}

	/**
	 * Sets whether only master admin.
	 * @param onlyMasterAdmin Indicates whether only master admin should be allowed.
	 * @returns Returns the current builder instance.
	 */
	public setIsOnlyMasterAdmin(onlyMasterAdmin: boolean): Builder {
		this.onlyMasterAdmin = onlyMasterAdmin;
		return this as Builder;
	}

	/**
	 * Sets the timestamp expire.
	 * @param tsExpire Provides the timestamp expire value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setTsExpire(tsExpire: number): Builder {
		//this.tsExpire = tsExpire;
		return this as Builder;
	}

	/**
	 * Sets the description.
	 * @param description Provides the description value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setDescription(description: string): Builder {
		return this as Builder;
	}

	/**
	 * Builds the configured instance.
	 * @returns Returns the built secret info.
	 */
	public build(): SecretInfo {
		return null;
	}

	/**
	 * Initializes a new builder base instance.
	 */
	constructor() {

	}

}

class Builder extends BuilderBase implements IBuilder<SecretInfo> {
	/**
	 * Sets the secret key.
	 * @param secretKey Provides the secret key value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSecretKey(secretKey: string): Builder {
		this.secretKey = secretKey;
		return this;
	}

	/**
	 * Sets the timestamp expire.
	 * @param tsExpire Provides the timestamp expire value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setTsExpire(tsExpire: number): Builder {
		this.tsExpire = tsExpire;
		return this;
	}

	/**
	 * Sets the description.
	 * @param description Provides the description value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setDescription(description: string): Builder {
		this.description = description;
		return this;
	}

	/**
	 * Sets the permission.
	 * @param permission Provides the permission value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setPermission(permission: SecretPermissionItem): Builder {
		this.permission = permission;
		return this;
	}

	/**
	 * Sets the game ID.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setGameId(gameId: string): Builder {
		this.gameId = gameId;
		return this as Builder;
	}

	/**
	 * Builds the configured instance.
	 * @returns Returns the built secret info.
	 */
	public build(): SecretInfo {
		return new SecretInfo(this);
	}

	/**
	 * Initializes a new builder instance.
	 */
	constructor() {
		super();
	}

}

export class SecretInfo extends BuilderBase {
	/**
	 * Initializes a new secret info instance.
	 * @param builder Provides the builder state copied into this instance.
	 */
	constructor(builder: Builder) {
		super();

		this.secretKey = builder.getSecretKey();
		this.remove = builder.isRemove();
		this.tsExpire = builder.getTsExpire();
		this.description = builder.getDescription();
		this.permission = builder.getPermission();
		this.gameId = builder.getGameId();
		this.isDefault = builder.getIsDefault();
		this.onlyMasterAdmin = builder.getIsOnlyMasterAdmin();
	}

	/**
	 * Sets the game ID.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setGameId(gameId: string): Builder {
		this.gameId = gameId;
		return this as Builder;
	}

	/**
	 * Executes the to document data workflow.
	 */
	public toDocumentData() {
		// Stores the doc value used in the current execution flow.
		let doc = {
			"secretKey": this.secretKey,
			"isRemove": this.remove,
			"tsExpire": this.tsExpire,
			"description": this.description,
			"permission": this.permission,
			"gameId": this.gameId,
		} as any;

		if (this.isDefault) doc["isDefault"] = true;
		if (this.onlyMasterAdmin) doc["onlyMasterAdmin"] = true;

		return doc;
	}

	/**
	 * Creates a new builder instance.
	 * @returns Returns a new builder instance.
	 */
	public static Builder(): Builder {
		return new Builder();
	}

}
