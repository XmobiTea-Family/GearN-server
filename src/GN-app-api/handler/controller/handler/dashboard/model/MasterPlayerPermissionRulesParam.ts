import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterPlayerPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.LinkAccount, isOptional: true })
	linkAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkAndroidDeviceId, isOptional: true })
	linkAndroidDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkApple, isOptional: true })
	linkApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkCustomDeviceId, isOptional: true })
	linkCustomDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkCustomId, isOptional: true })
	linkCustomId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkEditorDeviceId, isOptional: true })
	linkEditorDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkFacebook, isOptional: true })
	linkFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGenericService, isOptional: true })
	linkGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGoogle, isOptional: true })
	linkGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGooglePlayGameService, isOptional: true })
	linkGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkGameCenter, isOptional: true })
	linkGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkiOSDeviceId, isOptional: true })
	linkiOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkLinuxDeviceId, isOptional: true })
	linkLinuxDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkMacOSDeviceId, isOptional: true })
	linkMacOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkWindowsDeviceId, isOptional: true })
	linkWindowsDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LinkWindowsPhoneDeviceId, isOptional: true })
	linkWindowsPhoneDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkAccount, isOptional: true })
	unlinkAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkAndroidDeviceId, isOptional: true })
	unlinkAndroidDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkApple, isOptional: true })
	unlinkApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkCustomDeviceId, isOptional: true })
	unlinkCustomDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkCustomId, isOptional: true })
	unlinkCustomId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkEditorDeviceId, isOptional: true })
	unlinkEditorDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkFacebook, isOptional: true })
	unlinkFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGenericService, isOptional: true })
	unlinkGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGoogle, isOptional: true })
	unlinkGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGooglePlayGameService, isOptional: true })
	unlinkGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkGameCenter, isOptional: true })
	unlinkGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkiOSDeviceId, isOptional: true })
	unlinkiOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkLinuxDeviceId, isOptional: true })
	unlinkLinuxDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkMacOSDeviceId, isOptional: true })
	unlinkMacOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkWindowsDeviceId, isOptional: true })
	unlinkWindowsDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.UnlinkWindowsPhoneDeviceId, isOptional: true })
	unlinkWindowsPhoneDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddSegment, isOptional: true })
	addSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveSegment, isOptional: true })
	removeSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSegment, isOptional: true })
	getSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetTag, isOptional: true })
	setTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveTag, isOptional: true })
	removeTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTag, isOptional: true })
	getTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetDisplayName, isOptional: true })
	getDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetDisplayName, isOptional: true })
	setDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsCreate, isOptional: true })
	getTsCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetIpAddressCreate, isOptional: true })
	getIpAddressCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetTsLastLogin, isOptional: true })
	setTsLastLogin?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsLastLogin, isOptional: true })
	getTsLastLogin?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerBan, isOptional: true })
	setPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerBan, isOptional: true })
	getPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCountryCode, isOptional: true })
	setCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCountryCode, isOptional: true })
	getCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ChangeAccountPassword, isOptional: true })
	changeAccountPassword?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ResetAccountPassword, isOptional: true })
	resetAccountPassword?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	setAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	getAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerCurrency, isOptional: true })
	setPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerCurrency, isOptional: true })
	getPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerStatistics, isOptional: true })
	setPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerStatistics, isOptional: true })
	getPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
	getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerData, isOptional: true })
	setPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerData, isOptional: true })
	getPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInformation, isOptional: true })
	getPlayerInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithApple, isOptional: true })
	getPlayersWithApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithFacebook, isOptional: true })
	getPlayersWithFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGoogle, isOptional: true })
	getPlayersWithGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGenericService, isOptional: true })
	getPlayersWithGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithSegment, isOptional: true })
	getPlayersWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithTag, isOptional: true })
	getPlayersWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGooglePlayGameService, isOptional: true })
	getPlayersWithGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithGameCenter, isOptional: true })
	getPlayersWithGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetExternal, isOptional: true })
	getExternal?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithDisplayName, isOptional: true })
	getPlayersWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetEmail, isOptional: true })
	getEmail?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetEmail, isOptional: true })
	setEmail?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	getCurrencyLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetLastLoginLeaderboard, isOptional: true })
	getLastLoginLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	getStatisticsLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	getCurrencyLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendSocketOperationEvent, isOptional: true })
	sendSocketOperationEvent?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendEmail, isOptional: true })
	sendEmail?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendPushNotification, isOptional: true })
	sendPushNotification?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddPushNotification, isOptional: true })
	addPushNotification?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemovePushNotification, isOptional: true })
	removePushNotification?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPushNotification, isOptional: true })
	getPushNotification?: PermissionRulesParam;

}
