import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterPlayerPermissionRulesParam {

	// Stores the link account value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkAccount, isOptional: true })
	public linkAccount?: PermissionRulesParam;

	// Stores the link android device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkAndroidDeviceId, isOptional: true })
	public linkAndroidDeviceId?: PermissionRulesParam;

	// Stores the link apple value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkApple, isOptional: true })
	public linkApple?: PermissionRulesParam;

	// Stores the link custom device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkCustomDeviceId, isOptional: true })
	public linkCustomDeviceId?: PermissionRulesParam;

	// Stores the link custom ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkCustomId, isOptional: true })
	public linkCustomId?: PermissionRulesParam;

	// Stores the link editor device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkEditorDeviceId, isOptional: true })
	public linkEditorDeviceId?: PermissionRulesParam;

	// Stores the link facebook value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkFacebook, isOptional: true })
	public linkFacebook?: PermissionRulesParam;

	// Stores the link generic service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkGenericService, isOptional: true })
	public linkGenericService?: PermissionRulesParam;

	// Stores the link google value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkGoogle, isOptional: true })
	public linkGoogle?: PermissionRulesParam;

	// Stores the link google play game service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkGooglePlayGameService, isOptional: true })
	public linkGooglePlayGameService?: PermissionRulesParam;

	// Stores the link game center value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkGameCenter, isOptional: true })
	public linkGameCenter?: PermissionRulesParam;

	// Stores the linki OS device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkiOSDeviceId, isOptional: true })
	public linkiOSDeviceId?: PermissionRulesParam;

	// Stores the link linux device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkLinuxDeviceId, isOptional: true })
	public linkLinuxDeviceId?: PermissionRulesParam;

	// Stores the link mac OS device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkMacOSDeviceId, isOptional: true })
	public linkMacOSDeviceId?: PermissionRulesParam;

	// Stores the link windows device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkWindowsDeviceId, isOptional: true })
	public linkWindowsDeviceId?: PermissionRulesParam;

	// Stores the link windows phone device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinkWindowsPhoneDeviceId, isOptional: true })
	public linkWindowsPhoneDeviceId?: PermissionRulesParam;

	// Stores the unlink account value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkAccount, isOptional: true })
	public unlinkAccount?: PermissionRulesParam;

	// Stores the unlink android device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkAndroidDeviceId, isOptional: true })
	public unlinkAndroidDeviceId?: PermissionRulesParam;

	// Stores the unlink apple value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkApple, isOptional: true })
	public unlinkApple?: PermissionRulesParam;

	// Stores the unlink custom device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkCustomDeviceId, isOptional: true })
	public unlinkCustomDeviceId?: PermissionRulesParam;

	// Stores the unlink custom ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkCustomId, isOptional: true })
	public unlinkCustomId?: PermissionRulesParam;

	// Stores the unlink editor device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkEditorDeviceId, isOptional: true })
	public unlinkEditorDeviceId?: PermissionRulesParam;

	// Stores the unlink facebook value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkFacebook, isOptional: true })
	public unlinkFacebook?: PermissionRulesParam;

	// Stores the unlink generic service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkGenericService, isOptional: true })
	public unlinkGenericService?: PermissionRulesParam;

	// Stores the unlink google value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkGoogle, isOptional: true })
	public unlinkGoogle?: PermissionRulesParam;

	// Stores the unlink google play game service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkGooglePlayGameService, isOptional: true })
	public unlinkGooglePlayGameService?: PermissionRulesParam;

	// Stores the unlink game center value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkGameCenter, isOptional: true })
	public unlinkGameCenter?: PermissionRulesParam;

	// Stores the unlinki OS device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkiOSDeviceId, isOptional: true })
	public unlinkiOSDeviceId?: PermissionRulesParam;

	// Stores the unlink linux device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkLinuxDeviceId, isOptional: true })
	public unlinkLinuxDeviceId?: PermissionRulesParam;

	// Stores the unlink mac OS device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkMacOSDeviceId, isOptional: true })
	public unlinkMacOSDeviceId?: PermissionRulesParam;

	// Stores the unlink windows device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkWindowsDeviceId, isOptional: true })
	public unlinkWindowsDeviceId?: PermissionRulesParam;

	// Stores the unlink windows phone device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.UnlinkWindowsPhoneDeviceId, isOptional: true })
	public unlinkWindowsPhoneDeviceId?: PermissionRulesParam;

	// Stores the add segment value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.AddSegment, isOptional: true })
	public addSegment?: PermissionRulesParam;

	// Stores the remove segment value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RemoveSegment, isOptional: true })
	public removeSegment?: PermissionRulesParam;

	// Stores the get segment value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetSegment, isOptional: true })
	public getSegment?: PermissionRulesParam;

	// Stores the set tag value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetTag, isOptional: true })
	public setTag?: PermissionRulesParam;

	// Stores the remove tag value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RemoveTag, isOptional: true })
	public removeTag?: PermissionRulesParam;

	// Stores the get tag value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetTag, isOptional: true })
	public getTag?: PermissionRulesParam;

	// Stores the get display name value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetDisplayName, isOptional: true })
	public getDisplayName?: PermissionRulesParam;

	// Stores the set display name value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetDisplayName, isOptional: true })
	public setDisplayName?: PermissionRulesParam;

	// Stores the get timestamp create value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetTsCreate, isOptional: true })
	public getTsCreate?: PermissionRulesParam;

	// Stores the get IP address create value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetIpAddressCreate, isOptional: true })
	public getIpAddressCreate?: PermissionRulesParam;

	// Stores the set timestamp last login value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetTsLastLogin, isOptional: true })
	public setTsLastLogin?: PermissionRulesParam;

	// Stores the get timestamp last login value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetTsLastLogin, isOptional: true })
	public getTsLastLogin?: PermissionRulesParam;

	// Stores the set player ban value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetPlayerBan, isOptional: true })
	public setPlayerBan?: PermissionRulesParam;

	// Stores the get player ban value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayerBan, isOptional: true })
	public getPlayerBan?: PermissionRulesParam;

	// Stores the set country code value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetCountryCode, isOptional: true })
	public setCountryCode?: PermissionRulesParam;

	// Stores the get country code value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCountryCode, isOptional: true })
	public getCountryCode?: PermissionRulesParam;

	// Stores the change account password value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ChangeAccountPassword, isOptional: true })
	public changeAccountPassword?: PermissionRulesParam;

	// Stores the reset account password value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ResetAccountPassword, isOptional: true })
	public resetAccountPassword?: PermissionRulesParam;

	// Stores the set avatar value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	public setAvatar?: PermissionRulesParam;

	// Stores the get avatar value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	public getAvatar?: PermissionRulesParam;

	// Stores the change player currency value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ChangePlayerCurrency, isOptional: true })
	public changePlayerCurrency?: PermissionRulesParam;

	// Stores the get player currency value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayerCurrency, isOptional: true })
	public getPlayerCurrency?: PermissionRulesParam;

	// Stores the change player statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ChangePlayerStatistics, isOptional: true })
	public changePlayerStatistics?: PermissionRulesParam;

	// Stores the get player statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayerStatistics, isOptional: true })
	public getPlayerStatistics?: PermissionRulesParam;

	// Stores the get statistics leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	// Stores the get statistics leaderboard around player value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
	public getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	// Stores the get custom data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	// Stores the set custom data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	// Stores the set player data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetPlayerData, isOptional: true })
	public setPlayerData?: PermissionRulesParam;

	// Stores the get player data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayerData, isOptional: true })
	public getPlayerData?: PermissionRulesParam;

	// Stores the get player information value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInformation, isOptional: true })
	public getPlayerInformation?: PermissionRulesParam;

	// Stores the get players with apple value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithApple, isOptional: true })
	public getPlayersWithApple?: PermissionRulesParam;

	// Stores the get players with facebook value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithFacebook, isOptional: true })
	public getPlayersWithFacebook?: PermissionRulesParam;

	// Stores the get players with google value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGoogle, isOptional: true })
	public getPlayersWithGoogle?: PermissionRulesParam;

	// Stores the get players with generic service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGenericService, isOptional: true })
	public getPlayersWithGenericService?: PermissionRulesParam;

	// Stores the get players with segment value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithSegment, isOptional: true })
	public getPlayersWithSegment?: PermissionRulesParam;

	// Stores the get players with tag value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithTag, isOptional: true })
	public getPlayersWithTag?: PermissionRulesParam;

	// Stores the get players with google play game service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGooglePlayGameService, isOptional: true })
	public getPlayersWithGooglePlayGameService?: PermissionRulesParam;

	// Stores the get players with game center value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGameCenter, isOptional: true })
	public getPlayersWithGameCenter?: PermissionRulesParam;

	// Stores the get external value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetExternal, isOptional: true })
	public getExternal?: PermissionRulesParam;

	// Stores the get players with display name value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithDisplayName, isOptional: true })
	public getPlayersWithDisplayName?: PermissionRulesParam;

	// Stores the get email value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetEmail, isOptional: true })
	public getEmail?: PermissionRulesParam;

	// Stores the set email value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetEmail, isOptional: true })
	public setEmail?: PermissionRulesParam;

	// Stores the get currency leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	public getCurrencyLeaderboard?: PermissionRulesParam;

	// Stores the get last login leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetLastLoginLeaderboard, isOptional: true })
	public getLastLoginLeaderboard?: PermissionRulesParam;

	// Stores the get create leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	// Stores the get statistics log value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

	// Stores the get currency log value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	public getCurrencyLog?: PermissionRulesParam;

	// Stores the send socket operation event value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SendSocketOperationEvent, isOptional: true })
	public sendSocketOperationEvent?: PermissionRulesParam;

	// Stores the send email value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SendEmail, isOptional: true })
	public sendEmail?: PermissionRulesParam;

	// Stores the send push notification value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SendPushNotification, isOptional: true })
	public sendPushNotification?: PermissionRulesParam;

	// Stores the add push notification value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.AddPushNotification, isOptional: true })
	public addPushNotification?: PermissionRulesParam;

	// Stores the remove push notification value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RemovePushNotification, isOptional: true })
	public removePushNotification?: PermissionRulesParam;

	// Stores the get push notification value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetPushNotification, isOptional: true })
	public getPushNotification?: PermissionRulesParam;

}
