/**
 * Enumerates raw operation-code strings understood by the GearN backend.
 *
 * These constants are the canonical operation identifiers embedded in request routes,
 * request/response models, logs, and event-driven workflows. Grouping in this file
 * follows backend capability areas rather than SDK wrapper class names.
 */
export class OperationCode {
	/**
	 * Dashboard and administrative maintenance operations.
	 */
	public static readonly LoginByAdminAccount: string = "loginByAdminAccount";
	public static readonly ChangePasswordAdminAccount: string = "changePasswordAdminAccount";
	public static readonly GetGameList: string = "getGameList";
	public static readonly GetMasterGameSettings: string = "getMasterGameSettings";
	public static readonly SetMasterGameSettings: string = "setMasterGameSettings";
	public static readonly CreateAdminAccount: string = "createAdminAccount";
	public static readonly RemoveAdminAccount: string = "removeAdminAccount";
	public static readonly SetPasswordAdminAccount: string = "setPasswordAdminAccount";
	public static readonly SetSecretKeyAdminAccount: string = "setSecretKeyAdminAccount";
	public static readonly GetGameInformation: string = "getGameInformation";
	public static readonly SetGameInformation: string = "setGameInformation";
	public static readonly GetAdminAccountList: string = "getAdminAccountList";
	public static readonly CreateGame: string = "createGame";
	public static readonly GetServerLog: string = "getServerLog";
	public static readonly GetSecretInfoInformation: string = "getSecretInfoInformation";
	public static readonly GetSecretInfoList: string = "getSecretInfoList";
	public static readonly CreateSecretInfo: string = "createSecretInfo";
	public static readonly SetSecretInfoInformation: string = "setSecretInfoInformation";
	public static readonly GetUsernameAdminAccount: string = "getUsernameAdminAccount";
	public static readonly GetAnalytics: string = "getAnalytics";
	public static readonly GetEventCallbackCloudScript: string = "getEventCallbackCloudScript";
	public static readonly SetEventCallbackCloudScript: string = "setEventCallbackCloudScript";
	public static readonly ResetStatisticsLeaderboard: string = "resetStatisticsLeaderboard";
	public static readonly GetBackupStatisticsLeaderboardVersion: string = "getBackupStatisticsLeaderboardVersion";
	public static readonly GetServerGameData: string = "getServerGameData";
	public static readonly DeleteInDatabase: string = "deleteInDatabase";

	/**
	 * Client authentication and account-bootstrap operations.
	 */
	public static readonly LoginByAccount: string = "loginByAccount";
	public static readonly LoginByAndroidDeviceId: string = "loginByAndroidDeviceId";
	public static readonly LoginByApple: string = "loginByApple";
	public static readonly LoginByCustomDeviceId: string = "loginByCustomDeviceId";
	public static readonly LoginByCustomId: string = "loginByCustomId";
	public static readonly LoginByEditorDeviceId: string = "loginByEditorDeviceId";
	public static readonly LoginByFacebook: string = "loginByFacebook";
	public static readonly LoginByGenericService: string = "loginByGenericService";
	public static readonly LoginByGoogle: string = "loginByGoogle";
	public static readonly LoginByiOSDeviceId: string = "loginByiOSDeviceId";
	public static readonly LoginByLinuxDeviceId: string = "loginByLinuxDeviceId";
	public static readonly LoginByMacOSDeviceId: string = "loginByMacOSDeviceId";
	public static readonly LoginByWindowsDeviceId: string = "loginByWindowsDeviceId";
	public static readonly LoginByWindowsPhoneDeviceId: string = "loginByWindowsPhoneDeviceId";
	public static readonly RegisterAccount: string = "registerAccount";

	/**
	 * External identity link operations for existing accounts.
	 */
	public static readonly LinkAccount: string = "linkAccount";
	public static readonly LinkAndroidDeviceId: string = "linkAndroidDeviceId";
	public static readonly LinkApple: string = "linkApple";
	public static readonly LinkCustomDeviceId: string = "linkCustomDeviceId";
	public static readonly LinkCustomId: string = "linkCustomId";
	public static readonly LinkEditorDeviceId: string = "linkEditorDeviceId";
	public static readonly LinkFacebook: string = "linkFacebook";
	public static readonly LinkGenericService: string = "linkGenericService";
	public static readonly LinkGoogle: string = "linkGoogle";
	public static readonly LinkiOSDeviceId: string = "linkiOSDeviceId";
	public static readonly LinkLinuxDeviceId: string = "linkLinuxDeviceId";
	public static readonly LinkMacOSDeviceId: string = "linkMacOSDeviceId";
	public static readonly LinkWindowsDeviceId: string = "linkWindowsDeviceId";
	public static readonly LinkWindowsPhoneDeviceId: string = "linkWindowsPhoneDeviceId";

	/**
	 * External identity unlink operations for existing accounts.
	 */
	public static readonly UnlinkAccount: string = "unlinkAccount";
	public static readonly UnlinkAndroidDeviceId: string = "unlinkAndroidDeviceId";
	public static readonly UnlinkApple: string = "unlinkApple";
	public static readonly UnlinkCustomDeviceId: string = "unlinkCustomDeviceId";
	public static readonly UnlinkCustomId: string = "unlinkCustomId";
	public static readonly UnlinkEditorDeviceId: string = "unlinkEditorDeviceId";
	public static readonly UnlinkFacebook: string = "unlinkFacebook";
	public static readonly UnlinkGenericService: string = "unlinkGenericService";
	public static readonly UnlinkGoogle: string = "unlinkGoogle";
	public static readonly UnlinkiOSDeviceId: string = "unlinkiOSDeviceId";
	public static readonly UnlinkLinuxDeviceId: string = "unlinkLinuxDeviceId";
	public static readonly UnlinkMacOSDeviceId: string = "unlinkMacOSDeviceId";
	public static readonly UnlinkWindowsDeviceId: string = "unlinkWindowsDeviceId";
	public static readonly UnlinkWindowsPhoneDeviceId: string = "unlinkWindowsPhoneDeviceId";

	/**
	 * Shared profile metadata operations reused across player-like entities.
	 */
	public static readonly AddSegment: string = "addSegment";
	public static readonly RemoveSegment: string = "removeSegment";
	public static readonly GetSegment: string = "getSegment";

	public static readonly SetTag: string = "setTag";
	public static readonly GetTag: string = "getTag";

	public static readonly SetDisplayName: string = "setDisplayName";
	public static readonly GetDisplayName: string = "getDisplayName";

	public static readonly GetTsCreate: string = "getTsCreate";
	public static readonly GetIpAddressCreate: string = "getIpAddressCreate";
	public static readonly GetTsLastLogin: string = "getTsLastLogin";

	public static readonly SetPlayerBan: string = "setPlayerBan";
	public static readonly GetPlayerBan: string = "getPlayerBan";

	public static readonly SetCountryCode: string = "setCountryCode";
	public static readonly GetCountryCode: string = "getCountryCode";

	public static readonly ChangeAccountPassword: string = "changeAccountPassword";
	public static readonly ResetAccountPassword: string = "resetAccountPassword";

	public static readonly SetAvatar: string = "setAvatar";
	public static readonly GetAvatar: string = "getAvatar";

	public static readonly ChangePlayerCurrency: string = "changePlayerCurrency";
	public static readonly GetPlayerCurrency: string = "getPlayerCurrency";

	public static readonly ChangePlayerStatistics: string = "changePlayerStatistics";
	public static readonly GetPlayerStatistics: string = "getPlayerStatistics";

	public static readonly GetStatisticsLeaderboard: string = "getStatisticsLeaderboard";
	public static readonly GetStatisticsLeaderboardAroundPlayer: string = "getStatisticsLeaderboardAroundPlayer";

	public static readonly SetCustomData: string = "setCustomData";
	public static readonly GetCustomData: string = "getCustomData";

	public static readonly SetPlayerData: string = "setPlayerData";
	public static readonly GetPlayerData: string = "getPlayerData";

	/**
	 * Composite profile and search operations.
	 */
	public static readonly GetPlayerInformation: string = "getPlayerInformation";

	public static readonly GetPlayersWithApple: string = "getPlayersWithApple";
	public static readonly GetPlayersWithFacebook: string = "getPlayersWithFacebook";
	public static readonly GetPlayersWithGoogle: string = "getPlayersWithGoogle";
	public static readonly GetPlayersWithGenericService: string = "getPlayersWithGenericService";
	public static readonly GetPlayersWithSegment: string = "getPlayersWithSegment";
	public static readonly GetPlayersWithTag: string = "getPlayersWithTag";
	public static readonly GetExternal: string = "getExternal";
	public static readonly GetCatalogId: string = "getCatalogId";
	public static readonly GetOwnerInfo: string = "getOwnerInfo";
	public static readonly GetOnlineStatus: string = "getOnlineStatus";
	public static readonly RemovePlayerItem: string = "removePlayerItem";
	public static readonly RemovePlayerCharacter: string = "removePlayerCharacter";
	public static readonly AddPlayerFriend: string = "addPlayerFriend";
	public static readonly RemovePlayerFriend: string = "removePlayerFriend";
	public static readonly GetPlayerInventory: string = "getPlayerInventory";
	public static readonly GetPlayerCharacter: string = "getPlayerCharacter";
	public static readonly GetPlayerFriend: string = "getPlayerFriend";
	public static readonly GetPlayerGroup: string = "getPlayerGroup";
	public static readonly CreateGroup: string = "createGroup";
	public static readonly JoinGroup: string = "joinGroup";
	public static readonly CreatePlayerItem: string = "createPlayerItem";
	public static readonly CreatePlayerCharacter: string = "createPlayerCharacter";
	public static readonly GetOwner: string = "getOwner";
	public static readonly GetRemoveStatus: string = "getRemoveStatus";
	public static readonly ChangeGroupStatistics: string = "changeGroupStatistics";
	public static readonly SetGroupData: string = "setGroupData";
	public static readonly GetGroupCurrency: string = "getGroupCurrency";
	public static readonly ChangeGroupCurrency: string = "changeGroupCurrency";
	public static readonly CreateGroupItem: string = "createGroupItem";
	public static readonly GetStatisticsLeaderboardAroundGroup: string = "getStatisticsLeaderboardAroundGroup";
	public static readonly GetGroupsWithTag: string = "getGroupsWithTag";
	public static readonly GetGroupsWithSegment: string = "getGroupsWithSegment";
	public static readonly GetGroupStatistics: string = "getGroupStatistics";
	public static readonly GetGroupInventory: string = "getGroupInventory";
	public static readonly GetGroupData: string = "getGroupData";
	public static readonly GetGroupInformation: string = "getGroupInformation";
	public static readonly GetMembers: string = "getMembers";
	public static readonly ChangeItemStatistics: string = "changeItemStatistics";
	public static readonly SetItemData: string = "setItemData";
	public static readonly GetItemData: string = "getItemData";
	public static readonly GetStatisticsLeaderboardAroundItem: string = "getStatisticsLeaderboardAroundItem";
	public static readonly GetItemsWithTag: string = "getItemsWithTag";
	public static readonly GetItemsWithSegment: string = "getItemsWithSegment";
	public static readonly GetItemStatistics: string = "getItemStatistics";
	public static readonly GetItemInformation: string = "getItemInformation";
	public static readonly GetAmount: string = "getAmount";
	public static readonly GetItemType: string = "getItemType";
	public static readonly SetTsLastLogin: string = "setTsLastLogin";
	public static readonly SetRemoveStatus: string = "setRemoveStatus";
	public static readonly SetAmount: string = "setAmount";
	public static readonly RemoveGroup: string = "removeGroup";
	public static readonly LeaveGroup: string = "leaveGroup";
	public static readonly AddMember: string = "addMember";
	public static readonly RemoveMember: string = "removeMember";
	public static readonly GetContentData: string = "getContentData";
	public static readonly SetContentData: string = "setContentData";
	public static readonly GetGroupMessage: string = "getGroupMessage";
	public static readonly SendGroupMessage: string = "sendGroupMessage";
	public static readonly GetPlayersWithDisplayName: string = "getPlayersWithDisplayName";
	public static readonly GetItemsWithDisplayName: string = "getItemsWithDisplayName";
	public static readonly GetGroupsWithDisplayName: string = "getGroupsWithDisplayName";
	public static readonly SetOwner: string = "setOwner";
	public static readonly RemoveGroupItem: string = "removeGroupItem";
	public static readonly GetClassId: string = "getClassId";

	/**
	 * Store catalog and commerce operations.
	 */
	public static readonly GetStoreItemInformation: string = "getStoreItemInformation";
	public static readonly GetStoreItemsWithTag: string = "getStoreItemsWithTag";
	public static readonly CreateStoreItem: string = "createStoreItem";
	public static readonly RemoveTag: string = "removeTag";
	public static readonly BuyStoreItem: string = "buyStoreItem";
	public static readonly ValidateAppleAppStoreReceipt: string = "validateAppleAppStoreReceipt";
	public static readonly ValidateGooglePlayStoreReceipt: string = "validateGooglePlayStoreReceipt";
	public static readonly ValidateFacebookStoreReceipt: string = "validateFacebookStoreReceipt";
	public static readonly GetFriendStatisticsLeaderboardAroundPlayer: string = "getFriendStatisticsLeaderboardAroundPlayer";
	public static readonly GetFriendStatisticsLeaderboard: string = "getFriendStatisticsLeaderboard";
	public static readonly SetEmail: string = "setEmail";
	public static readonly GetEmail: string = "getEmail";

	/**
	 * Content/file metadata upload and download operations.
	 */
	public static readonly CreateNewFileUploadInfo: string = "createNewFileUploadInfo";
	public static readonly GetFileUploadInfo: string = "getFileUploadInfo";
	public static readonly RequestDownloadFileUploadInfo: string = "requestDownloadFileUploadInfo";
	public static readonly RemoveFileUploadInfo: string = "removeFileUploadInfo";
	public static readonly GetFileUploadInfoList: string = "getFileUploadInfoList";
	public static readonly SetStoreItemInformation: string = "setStoreItemInformation";
	public static readonly RefreshAuthToken: string = "refreshAuthToken";

	/**
	 * Multiplayer matchmaking and match-query operations.
	 */
	public static readonly CancelAllMatchmakingTicket: string = "cancelAllMatchmakingTicket";
	public static readonly CancelMatchmakingTicket: string = "cancelMatchmakingTicket";
	public static readonly CreateMatchmakingTicket: string = "createMatchmakingTicket";
	public static readonly GetMatch: string = "getMatch";
	public static readonly GetMatchmakingTicket: string = "getMatchmakingTicket";
	public static readonly GetQueueStatistics: string = "getQueueStatistics";
	public static readonly JoinMatchmakingTicket: string = "joinMatchmakingTicket";
	public static readonly ListMatchmakingTicketsForPlayer: string = "listMatchmakingTicketsForPlayer";

	public static readonly GetCurrencyLeaderboard: string = "getCurrencyLeaderboard";

	/**
	 * CloudScript management and execution operations.
	 */
	public static readonly ExecuteFunction: string = "executeFunction";
	public static readonly GetFunctions: string = "getFunctions";
	public static readonly AddFunction: string = "addFunction";
	public static readonly EditFunction: string = "editFunction";
	public static readonly GetFunction: string = "getFunction";

	/**
	 * Provider-specific platform login/link/unlink and lookup operations.
	 */
	public static readonly LoginByGooglePlayGameService: string = "loginByGooglePlayGameService";
	public static readonly LoginByGameCenter: string = "loginByGameCenter";
	public static readonly LinkGooglePlayGameService: string = "linkGooglePlayGameService";
	public static readonly LinkGameCenter: string = "linkGameCenter";
	public static readonly UnlinkGooglePlayGameService: string = "unlinkGooglePlayGameService";
	public static readonly UnlinkGameCenter: string = "unlinkGameCenter";
	public static readonly GetPlayersWithGooglePlayGameService: string = "getPlayersWithGooglePlayGameService";
	public static readonly GetPlayersWithGameCenter: string = "getPlayersWithGameCenter";
	public static readonly GetLastLoginLeaderboard: string = "getLastLoginLeaderboard";
	public static readonly GetCreateLeaderboard: string = "getCreateLeaderboard";

	/**
	 * Administrative multiplayer inspection operations.
	 */
	public static readonly GetAllMatchmakingTicket: string = "getAllMatchmakingTicket";
	public static readonly GetAllMatch: string = "getAllMatch";

	/**
	 * Event-delivery, audit-log, and realtime utility operations.
	 */
	public static readonly SendSocketOperationEvent: string = "sendSocketOperationEvent";
	public static readonly GetStatisticsLog: string = "getStatisticsLog";
	public static readonly GetCurrencyLog: string = "getCurrencyLog";

	/**
	 * Store gifting and store-log inspection operations.
	 */
	public static readonly PresentStoreItem: string = "presentStoreItem";
	public static readonly GetStoreLog: string = "getStoreLog";

	/**
	 * Outbound email and push-notification operations.
	 */
	public static readonly SendEmail: string = "sendEmail";
	public static readonly SendPushNotification: string = "sendPushNotification";
	public static readonly AddPushNotification: string = "addPushNotification";
	public static readonly RemovePushNotification: string = "removePushNotification";
	public static readonly GetPushNotification: string = "getPushNotification";

	/**
	 * Post-purchase store-usage tracking operations.
	 */
	public static readonly GetStoreUsed: string = "getStoreUsed";
	public static readonly RemoveStoreUsed: string = "removeStoreUsed";

}
