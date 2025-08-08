import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterPlayerPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.LinkAccount, isOptional: true })
	public linkAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkAndroidDeviceId, isOptional: true })
	public linkAndroidDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkApple, isOptional: true })
	public linkApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkCustomDeviceId, isOptional: true })
	public linkCustomDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkCustomId, isOptional: true })
	public linkCustomId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkEditorDeviceId, isOptional: true })
	public linkEditorDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkFacebook, isOptional: true })
	public linkFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGenericService, isOptional: true })
	public linkGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGoogle, isOptional: true })
	public linkGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGooglePlayGameService, isOptional: true })
	public linkGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGameCenter, isOptional: true })
	public linkGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkiOSDeviceId, isOptional: true })
	public linkiOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkLinuxDeviceId, isOptional: true })
	public linkLinuxDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkMacOSDeviceId, isOptional: true })
	public linkMacOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkWindowsDeviceId, isOptional: true })
	public linkWindowsDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkWindowsPhoneDeviceId, isOptional: true })
	public linkWindowsPhoneDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkAccount, isOptional: true })
	public unlinkAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkAndroidDeviceId, isOptional: true })
	public unlinkAndroidDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkApple, isOptional: true })
	public unlinkApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkCustomDeviceId, isOptional: true })
	public unlinkCustomDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkCustomId, isOptional: true })
	public unlinkCustomId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkEditorDeviceId, isOptional: true })
	public unlinkEditorDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkFacebook, isOptional: true })
	public unlinkFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGenericService, isOptional: true })
	public unlinkGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGoogle, isOptional: true })
	public unlinkGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGooglePlayGameService, isOptional: true })
	public unlinkGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGameCenter, isOptional: true })
	public unlinkGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkiOSDeviceId, isOptional: true })
	public unlinkiOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkLinuxDeviceId, isOptional: true })
	public unlinkLinuxDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkMacOSDeviceId, isOptional: true })
	public unlinkMacOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkWindowsDeviceId, isOptional: true })
	public unlinkWindowsDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkWindowsPhoneDeviceId, isOptional: true })
	public unlinkWindowsPhoneDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddSegment, isOptional: true })
	public addSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveSegment, isOptional: true })
	public removeSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSegment, isOptional: true })
	public getSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetTag, isOptional: true })
	public setTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveTag, isOptional: true })
	public removeTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTag, isOptional: true })
	public getTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetDisplayName, isOptional: true })
	public getDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetDisplayName, isOptional: true })
	public setDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsCreate, isOptional: true })
	public getTsCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetIpAddressCreate, isOptional: true })
	public getIpAddressCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetTsLastLogin, isOptional: true })
	public setTsLastLogin?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsLastLogin, isOptional: true })
	public getTsLastLogin?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerBan, isOptional: true })
	public setPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerBan, isOptional: true })
	public getPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCountryCode, isOptional: true })
	public setCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCountryCode, isOptional: true })
	public getCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ChangeAccountPassword, isOptional: true })
	public changeAccountPassword?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ResetAccountPassword, isOptional: true })
	public resetAccountPassword?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	public setAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	public getAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerCurrency, isOptional: true })
	public setPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerCurrency, isOptional: true })
	public getPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerStatistics, isOptional: true })
	public setPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerStatistics, isOptional: true })
	public getPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
	public getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerData, isOptional: true })
	public setPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerData, isOptional: true })
	public getPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInformation, isOptional: true })
	public getPlayerInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithApple, isOptional: true })
	public getPlayersWithApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithFacebook, isOptional: true })
	public getPlayersWithFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGoogle, isOptional: true })
	public getPlayersWithGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGenericService, isOptional: true })
	public getPlayersWithGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithSegment, isOptional: true })
	public getPlayersWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithTag, isOptional: true })
	public getPlayersWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGooglePlayGameService, isOptional: true })
	public getPlayersWithGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGameCenter, isOptional: true })
	public getPlayersWithGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetExternal, isOptional: true })
	public getExternal?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithDisplayName, isOptional: true })
	public getPlayersWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetEmail, isOptional: true })
	public getEmail?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetEmail, isOptional: true })
	public setEmail?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	public getCurrencyLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetLastLoginLeaderboard, isOptional: true })
	public getLastLoginLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	public getCurrencyLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendSocketOperationEvent, isOptional: true })
	public sendSocketOperationEvent?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendEmail, isOptional: true })
	public sendEmail?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendPushNotification, isOptional: true })
	public sendPushNotification?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddPushNotification, isOptional: true })
	public addPushNotification?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemovePushNotification, isOptional: true })
	public removePushNotification?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPushNotification, isOptional: true })
	public getPushNotification?: PermissionRulesParam;

}
