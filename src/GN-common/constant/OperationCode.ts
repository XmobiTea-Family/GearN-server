export class OperationCode {
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

	public static readonly SetScriptData: number = 68;
	public static readonly GetScriptData: number = 69;

	public static readonly SetPrivateData: number = 70;
	public static readonly GetPrivateData: number = 71;

	public static readonly SetPlayerData: number = 72;
	public static readonly GetPlayerData: number = 73;

	public static readonly GetPlayerInformation: number = 74;

	public static readonly GetPlayersWithApple: number = 75;
	public static readonly GetPlayersWithFacebook: number = 76;
	public static readonly GetPlayersWithGoogle: number = 77;
	public static readonly GetPlayersWithGenericService: number = 78;
	public static readonly GetPlayersWithSegment: number = 79;
	public static readonly GetPlayersWithTag: number = 80;
	public static readonly GetExternal: number = 81;
	public static readonly GetCategoryId: number = 82;
	public static readonly GetOwnerInfo: number = 82;
}
