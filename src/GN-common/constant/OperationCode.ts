export class OperationCode {
	public static readonly LoginByAdminAccount: number = -1;
	public static readonly ChangePasswordAdminAccount: number = -2;
	public static readonly GetGameList: number = -3;
	public static readonly GetMasterGameSettings: number = -4;
	public static readonly SetMasterGameSettings: number = -5;
	public static readonly GrantAdminAccount: number = -6;
	public static readonly RemoveAdminAccount: number = -7;
	public static readonly SetPasswordAdminAccount: number = -8;
	public static readonly SetSecretKeyAdminAccount: number = -9;
	public static readonly GetGameInformation: number = -10;
	public static readonly SetGameInformation: number = -11;
	public static readonly GetAdminAccountList: number = -12;
	public static readonly GrantGame: number = -13;
	public static readonly GetServerLog: number = -14;
	public static readonly GetSecretInfoInformation: number = -15;
	public static readonly GetSecretInfoList: number = -16;
	public static readonly GrantSecretInfo: number = -17;
	public static readonly SetSecretInfoInformation: number = -18;
	public static readonly GetUsernameAdminAccount: number = -19;
	public static readonly GetAnalytics: number = -20;
	public static readonly GetEventCallbackCloudScript: number = -21;
	public static readonly SetEventCallbackCloudScript: number = -22;
	public static readonly ResetStatisticsLeaderboard: number = -23;
	public static readonly GetBackupStatisticsLeaderboardVersion: number = -24;
	public static readonly GetServerGameData: number = -25;

	public static readonly LoginByAccount: number = 1;
	public static readonly LoginByAndroidDeviceId: number = 2;
	public static readonly LoginByApple: number = 3;
	public static readonly LoginByCustomDeviceId: number = 4;
	public static readonly LoginByCustomId: number = 5;
	public static readonly LoginByEditorDeviceId: number = 6;
	public static readonly LoginByFacebook: number = 7;
	public static readonly LoginByGenericService: number = 8;
	public static readonly LoginByGoogle: number = 9;
	public static readonly LoginByiOSDeviceId: number = 10;
	public static readonly LoginByLinuxDeviceId: number = 11;
	public static readonly LoginByMacOSDeviceId: number = 12;
	public static readonly LoginByWindowsDeviceId: number = 13;
	public static readonly LoginByWindowsPhoneDeviceId: number = 14;
	public static readonly RegisterAccount: number = 15;

	public static readonly LinkAccount: number = 16;
	public static readonly LinkAndroidDeviceId: number = 17;
	public static readonly LinkApple: number = 18;
	public static readonly LinkCustomDeviceId: number = 19;
	public static readonly LinkCustomId: number = 20;
	public static readonly LinkEditorDeviceId: number = 21;
	public static readonly LinkFacebook: number = 22;
	public static readonly LinkGenericService: number = 23;
	public static readonly LinkGoogle: number = 24;
	public static readonly LinkiOSDeviceId: number = 25;
	public static readonly LinkLinuxDeviceId: number = 26;
	public static readonly LinkMacOSDeviceId: number = 27;
	public static readonly LinkWindowsDeviceId: number = 28;
	public static readonly LinkWindowsPhoneDeviceId: number = 29;

	public static readonly UnlinkAccount: number = 30;
	public static readonly UnlinkAndroidDeviceId: number = 31;
	public static readonly UnlinkApple: number = 32;
	public static readonly UnlinkCustomDeviceId: number = 33;
	public static readonly UnlinkCustomId: number = 34;
	public static readonly UnlinkEditorDeviceId: number = 35;
	public static readonly UnlinkFacebook: number = 36;
	public static readonly UnlinkGenericService: number = 37;
	public static readonly UnlinkGoogle: number = 38;
	public static readonly UnlinkiOSDeviceId: number = 39;
	public static readonly UnlinkLinuxDeviceId: number = 40;
	public static readonly UnlinkMacOSDeviceId: number = 41;
	public static readonly UnlinkWindowsDeviceId: number = 42;
	public static readonly UnlinkWindowsPhoneDeviceId: number = 43;

	public static readonly AddSegment: number = 44;
	public static readonly RemoveSegment: number = 45;
	public static readonly GetSegment: number = 46;

	public static readonly SetTag: number = 47;
	public static readonly GetTag: number = 48;

	public static readonly SetDisplayName: number = 49;
	public static readonly GetDisplayName: number = 50;

	public static readonly GetTsCreate: number = 51;
	public static readonly GetIpAddressCreate: number = 52;
	public static readonly GetTsLastLogin: number = 53;

	public static readonly SetPlayerBan: number = 54;
	public static readonly GetPlayerBan: number = 55;

	public static readonly SetCountryCode: number = 56;
	public static readonly GetCountryCode: number = 57;

	public static readonly ChangeAccountPassword: number = 58;
	public static readonly ResetAccountPassword: number = 59;

	public static readonly SetAvatar: number = 60;
	public static readonly GetAvatar: number = 61;

	public static readonly SetPlayerCurrency: number = 62;
	public static readonly GetPlayerCurrency: number = 63;

	public static readonly SetPlayerStatistics: number = 64;
	public static readonly GetPlayerStatistics: number = 65;

	public static readonly GetStatisticsLeaderboard: number = 66;
	public static readonly GetStatisticsLeaderboardAroundPlayer: number = 67;

	public static readonly SetCustomData: number = 68;
	public static readonly GetCustomData: number = 69;

	public static readonly SetPlayerData: number = 70;
	public static readonly GetPlayerData: number = 71;

	public static readonly GetPlayerInformation: number = 72;

	public static readonly GetPlayersWithApple: number = 73;
	public static readonly GetPlayersWithFacebook: number = 74;
	public static readonly GetPlayersWithGoogle: number = 75;
	public static readonly GetPlayersWithGenericService: number = 76;
	public static readonly GetPlayersWithSegment: number = 77;
	public static readonly GetPlayersWithTag: number = 78;
	public static readonly GetExternal: number = 79;
	public static readonly GetCatalogId: number = 80;
	public static readonly GetOwnerInfo: number = 81;
	public static readonly GetOnlineStatus: number = 82;
	public static readonly RemovePlayerItem: number = 83;
	public static readonly RemovePlayerCharacter: number = 84;
	public static readonly AddPlayerFriend: number = 85;
	public static readonly RemovePlayerFriend: number = 86;
	public static readonly GetPlayerInventory: number = 87;
	public static readonly GetPlayerCharacter: number = 88;
	public static readonly GetPlayerFriend: number = 89;
	public static readonly GetPlayerGroup: number = 90;
	public static readonly GrantGroup: number = 91;
	public static readonly JoinGroup: number = 92;
	public static readonly GrantPlayerItem: number = 93;
	public static readonly GrantPlayerCharacter: number = 94;
	public static readonly GetOwner: number = 95;
	public static readonly GetRemoveStatus: number = 96;
	public static readonly SetGroupStatistics: number = 97;
	public static readonly SetGroupData: number = 98;
	public static readonly GetGroupCurrency: number = 99;
	public static readonly SetGroupCurrency: number = 100;
	public static readonly GrantGroupItem: number = 101;
	public static readonly GetStatisticsLeaderboardAroundGroup: number = 102;
	public static readonly GetGroupsWithTag: number = 103;
	public static readonly GetGroupsWithSegment: number = 104;
	public static readonly GetGroupStatistics: number = 105;
	public static readonly GetGroupInventory: number = 106;
	public static readonly GetGroupData: number = 107;
	public static readonly GetGroupInformation: number = 108;
	public static readonly GetMembers: number = 109;
	public static readonly SetItemStatistics: number = 110;
	public static readonly SetItemData: number = 111;
	public static readonly GetItemData: number = 112;
	public static readonly GetStatisticsLeaderboardAroundItem: number = 113;
	public static readonly GetItemsWithTag: number = 114;
	public static readonly GetItemsWithSegment: number = 115;
	public static readonly GetItemStatistics: number = 116;
	public static readonly GetItemInformation: number = 117;
	public static readonly GetAmount: number = 118;
	public static readonly GetItemType: number = 119;
	public static readonly SetTsLastLogin: number = 120;
	public static readonly SetRemoveStatus: number = 121;
	public static readonly SetAmount: number = 122;
	public static readonly RemoveGroup: number = 123;
	public static readonly LeaveGroup: number = 124;
	public static readonly AddMember: number = 125;
	public static readonly RemoveMember: number = 126;
	public static readonly GetContentData: number = 127;
	public static readonly SetContentData: number = 128;
	public static readonly GetGroupMessage: number = 129;
	public static readonly SendGroupMessage: number = 130;
	public static readonly GetPlayersWithDisplayName: number = 131;
	public static readonly GetItemsWithDisplayName: number = 132;
	public static readonly GetGroupsWithDisplayName: number = 133;
	public static readonly SetOwner: number = 134;
	public static readonly RemoveGroupItem: number = 135;
	public static readonly GetClassId: number = 136;

	public static readonly GetStoreItemInformation: number = 137;
	public static readonly GetStoreItemsWithTag: number = 138;
	public static readonly GrantStoreItem: number = 139;
	public static readonly RemoveTag: number = 140;
	public static readonly BuyStoreItem: number = 141;
	public static readonly ValidateAppleAppStoreReceipt: number = 142;
	public static readonly ValidateGooglePlayStoreReceipt: number = 143;
	public static readonly ValidateFacebookStoreReceipt: number = 144;
	public static readonly GetFriendStatisticsLeaderboardAroundPlayer: number = 145;
	public static readonly GetFriendStatisticsLeaderboard: number = 146;
	public static readonly SetEmail: number = 147;
	public static readonly GetEmail: number = 148;

	public static readonly CreateNewFileUploadInfo: number = 149;
	public static readonly GetFileUploadInfo: number = 150;
	public static readonly RequestDownloadFileUploadInfo: number = 151;
	public static readonly RemoveFileUploadInfo: number = 152;
	public static readonly GetFileUploadInfoList: number = 153;
	public static readonly SetStoreItemInformation: number = 154;
	public static readonly RefreshAuthToken: number = 155;

	public static readonly CancelAllMatchmakingTicket: number = 156;
	public static readonly CancelMatchmakingTicket: number = 157;
	public static readonly CreateMatchmakingTicket: number = 158;
	public static readonly GetMatch: number = 159;
	public static readonly GetMatchmakingTicket: number = 160;
	public static readonly GetQueueStatistics: number = 161;
	public static readonly JoinMatchmakingTicket: number = 162;
	public static readonly ListMatchmakingTicketsForPlayer: number = 163;

	public static readonly GetCurrencyLeaderboard: number = 164;

	public static readonly ExecuteFunction: number = 165;
	public static readonly GetFunctions: number = 166;
	public static readonly AddFunction: number = 167;
	public static readonly EditFunction: number = 168;
	public static readonly GetFunction: number = 169;

	public static readonly LoginByGooglePlayGameService: number = 170;
	public static readonly LoginByGameCenter: number = 171;
	public static readonly LinkGooglePlayGameService: number = 172;
	public static readonly LinkGameCenter: number = 173;
	public static readonly UnlinkGooglePlayGameService: number = 174;
	public static readonly UnlinkGameCenter: number = 175;
	public static readonly GetPlayersWithGooglePlayGameService: number = 176;
	public static readonly GetPlayersWithGameCenter: number = 177;
	public static readonly GetLastLoginLeaderboard: number = 178;
	public static readonly GetCreateLeaderboard: number = 179;

	public static readonly GetAllMatchmakingTicket: number = 180;
	public static readonly GetAllMatch: number = 181;

	public static readonly SendSocketOperationEvent: number = 182;
	public static readonly GetStatisticsLog: number = 183;
	public static readonly GetCurrencyLog: number = 184;
	
	public static readonly PresentStoreItem: number = 185;
	public static readonly GetStoreLog: number = 186;
	
}
